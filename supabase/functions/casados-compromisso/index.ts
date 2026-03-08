
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
    // Handle CORS preflight
    if (req.method === "OPTIONS") {
        return new Response("ok", { headers: corsHeaders });
    }

    try {
        // Supabase client com variáveis de ambiente — sem expor credenciais no frontend
        const supabase = createClient(
            Deno.env.get("SUPABASE_URL")!,
            Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
        );

        const body = await req.json();

        const { nome_marido, assinatura_marido, nome_esposa, assinatura_esposa, data_compromisso, user_id } = body;

        // Validação básica
        if (!nome_marido || !assinatura_marido || !nome_esposa || !assinatura_esposa || !data_compromisso) {
            return new Response(
                JSON.stringify({ error: "Todos os campos são obrigatórios." }),
                { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
            );
        }

        // Inserir na tabela
        const { error } = await supabase
            .from("compromissos_casais")
            .insert([{
                nome_marido,
                assinatura_marido,
                nome_esposa,
                assinatura_esposa,
                data_compromisso,
                user_id, // Adicionando user_id se fornecido no body
                created_at: new Date().toISOString(),
            }]);

        if (error) throw error;

        return new Response(
            JSON.stringify({ success: true, message: "Compromisso guardado com sucesso!" }),
            { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );

    } catch (err) {
        return new Response(
            JSON.stringify({ error: err.message || "Erro interno." }),
            { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
    }
});
