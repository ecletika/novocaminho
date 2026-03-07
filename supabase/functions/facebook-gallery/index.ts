import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const supabase = createClient(
            Deno.env.get('SUPABASE_URL')!,
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
        )

        // Try to get Page ID from DB first
        let pageId = Deno.env.get('FACEBOOK_PAGE_ID')
        const { data: configData } = await supabase
            .from('site_config')
            .select('value')
            .eq('key', 'facebook_page_id')
            .maybeSingle()

        if (configData?.value) {
            pageId = configData.value
        }

        const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN')

        // If variables aren't configured, return placeholder data
        if (!pageId || !accessToken) {
            console.log('Using placeholder data (missing config in DB/Env or FACEBOOK_ACCESS_TOKEN secret)')
            return new Response(
                JSON.stringify({
                    data: [
                        { id: "1", link: "#", images: [{ source: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800" }] },
                        { id: "2", link: "#", images: [{ source: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" }] },
                        { id: "3", link: "#", images: [{ source: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800" }] },
                        { id: "4", link: "#", images: [{ source: "https://images.unsplash.com/photo-1473280025148-643f9b0cbac2?w=800" }] },
                        { id: "5", link: "#", images: [{ source: "https://images.unsplash.com/photo-1544062831-419b671a5ff6?w=800" }] },
                        { id: "6", link: "#", images: [{ source: "https://images.unsplash.com/photo-1540822607994-43632cf4b628?w=800" }] },
                    ],
                    placeholder: true
                }),
                { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
            )
        }

        // Fetch from Facebook Graph API
        // fields: images contains the different sizes, link is the post link
        const fbUrl = `https://graph.facebook.com/v19.0/${pageId}/photos?type=uploaded&fields=images,link,name,created_time&limit=8&access_token=${accessToken}`
        const response = await fetch(fbUrl);

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Facebook API Error');
        }

        const data = await response.json();

        return new Response(
            JSON.stringify(data),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 200 }
        )
    } catch (error: unknown) {
        return new Response(
            JSON.stringify({ error: (error as Error).message }),
            { headers: { ...corsHeaders, 'Content-Type': 'application/json' }, status: 400 }
        )
    }
})
