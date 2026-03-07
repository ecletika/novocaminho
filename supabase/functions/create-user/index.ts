import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Verify the caller is an admin
    const authHeader = req.headers.get("Authorization");
    if (!authHeader) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const token = authHeader.replace("Bearer ", "");
    const { data: { user: caller } } = await supabase.auth.getUser(token);
    if (!caller) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Check admin role
    const { data: roleData } = await supabase
      .from("user_roles")
      .select("role")
      .eq("user_id", caller.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: "Sem permissão de administrador" }), {
        status: 403,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const body = await req.json();
    const { action = "create", user_id, email, password, full_name, role, ministry_ids } = body;

    if (action === "create") {
      if (!email || !password) {
        return new Response(JSON.stringify({ error: "Email e senha são obrigatórios para criação" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Create user
      const { data, error } = await supabase.auth.admin.createUser({
        email,
        password,
        email_confirm: true,
        user_metadata: { full_name: full_name || email },
      });

      if (error) throw error;

      const newUserId = data.user.id;

      // Add role
      await supabase.from("user_roles").insert({
        user_id: newUserId,
        role: role || "member",
      });

      // Add profile - use insert with on conflict since trigger may have already created it
      const { error: profileError } = await supabase.from("profiles").upsert({
        user_id: newUserId,
        full_name: full_name || email,
        email: email,
      }, { onConflict: "user_id" });
      
      if (profileError) {
        console.error("Profile upsert error:", profileError);
      }

      // Add ministry associations
      if (ministry_ids && Array.isArray(ministry_ids) && ministry_ids.length > 0) {
        const rows = ministry_ids.map((mid: string) => ({
          user_id: newUserId,
          ministry_id: mid,
        }));
        await supabase.from("user_ministries").insert(rows);
      }

      return new Response(JSON.stringify({ success: true, user_id: newUserId }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "update") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id é obrigatório para atualização" }), {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      const updateData: any = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;
      if (full_name) updateData.user_metadata = { full_name };

      // Update Auth
      if (Object.keys(updateData).length > 0) {
        const { error: authError } = await supabase.auth.admin.updateUserById(user_id, updateData);
        if (authError) throw authError;
      }

      // Update Profile if name or email changed
      if (full_name || email) {
        const profileUpdate: any = {};
        if (full_name) profileUpdate.full_name = full_name;
        if (email) profileUpdate.email = email;

        const { error: profileError } = await supabase.from("profiles").update(profileUpdate).eq("user_id", user_id);
        if (profileError) {
          console.error("Profile update error:", profileError);
        }
      }

      return new Response(JSON.stringify({ success: true }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Ação inválida" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });

  } catch (err: unknown) {
    console.error("Edge function error:", err);
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
