import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const body = await req.json();
    const { woman_name, man_name, photo_url, birthday_date, birthday_type, phone, email, address, ministry_ids, woman_birthday, man_birthday, leader_name } = body;

    if (!birthday_date || !birthday_type) {
      return new Response(JSON.stringify({ error: "Data e tipo são obrigatórios" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (birthday_type === "personal" && !woman_name && !man_name) {
      return new Response(JSON.stringify({ error: "Nome é obrigatório" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const { data: birthday, error } = await supabase
      .from("birthdays")
      .insert({
        woman_name: woman_name || null,
        man_name: man_name || null,
        photo_url: photo_url || null,
        birthday_date,
        birthday_type,
        phone: phone || null,
        email: email || null,
        address: address || null,
        woman_birthday: woman_birthday || null,
        man_birthday: man_birthday || null,
        leader_name: leader_name || null,
      })
      .select()
      .single();

    if (error) throw error;

    if (ministry_ids && ministry_ids.length > 0) {
      const relationships = ministry_ids.map((ministry_id: string) => ({
        birthday_id: birthday.id,
        ministry_id,
      }));
      await supabase.from("birthday_ministries").insert(relationships);
    }

    return new Response(JSON.stringify({ success: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err: unknown) {
    return new Response(JSON.stringify({ error: (err as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
