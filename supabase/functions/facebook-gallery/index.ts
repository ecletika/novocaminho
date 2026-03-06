import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        const pageId = Deno.env.get('FACEBOOK_PAGE_ID')
        const accessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN')

        // If variables aren't configured in Supabase Secrets, return placeholder data
        if (!pageId || !accessToken) {
            console.log('Using placeholder data (missing FACEBOOK_PAGE_ID or FACEBOOK_ACCESS_TOKEN secrets)')
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
        const response = await fetch(
            `https://graph.facebook.com/v19.0/${pageId}/photos?type=uploaded&fields=images,link,name,created_time&limit=6&access_token=${accessToken}`
        );

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error?.message || 'Failed to fetch Facebook API');
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
