import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
}

const placeholderData = {
    data: [
      { id: "1", link: "#", images: [{ source: "https://images.unsplash.com/photo-1438232992991-995b7058bbb3?w=800" }] },
      { id: "2", link: "#", images: [{ source: "https://images.unsplash.com/photo-1470229722913-7c0e2dbbafd3?w=800" }] },
      { id: "3", link: "#", images: [{ source: "https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?w=800" }] },
      { id: "4", link: "#", images: [{ source: "https://images.unsplash.com/photo-1473280025148-643f9b0cbac2?w=800" }] },
      { id: "5", link: "#", images: [{ source: "https://images.unsplash.com/photo-1544062831-419b671a5ff6?w=800" }] },
      { id: "6", link: "#", images: [{ source: "https://images.unsplash.com/photo-1540822607994-43632cf4b628?w=800" }] },
        ],
    placeholder: true
}

Deno.serve(async (req) => {
    if (req.method === 'OPTIONS') {
          return new Response(null, { headers: corsHeaders })
    }

             try {
                   const supabase = createClient(
                           Deno.env.get('SUPABASE_URL')!,
                           Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
                         )

      // Get Page ID from DB or env
      let pageId = Deno.env.get('FACEBOOK_PAGE_ID')
                   const { data: configPageId } = await supabase
                     .from('site_config')
                     .select('value')
                     .eq('key', 'facebook_page_id')
                     .maybeSingle()
                   if (configPageId?.value) pageId = configPageId.value

      // Get Access Token from DB or env
      let userAccessToken = Deno.env.get('FACEBOOK_ACCESS_TOKEN')
                   const { data: configToken } = await supabase
                     .from('site_config')
                     .select('value')
                     .eq('key', 'facebook_access_token')
                     .maybeSingle()
                   if (configToken?.value) userAccessToken = configToken.value

      // Clean pageId if it's a full URL
      if (pageId && (pageId.includes('facebook.com') || pageId.includes('http'))) {
              const parts = pageId.split('/')
              pageId = parts.filter((p: string) => p.length > 0).pop() || pageId
      }

      if (!pageId || !userAccessToken) {
              console.log('Missing pageId or access token, returning placeholder')
              return new Response(JSON.stringify(placeholderData), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
              })
      }

      // Step 1: Exchange User Token for Page Token
      let pageAccessToken = userAccessToken
                   try {
                           const accountsUrl = `https://graph.facebook.com/v19.0/me/accounts?access_token=${userAccessToken}`
                           const accountsRes = await fetch(accountsUrl)
                           if (accountsRes.ok) {
                                     const accountsData = await accountsRes.json()
                                     console.log(`Found ${accountsData.data?.length || 0} pages managed by this user`)
                                     const matchingPage = accountsData.data?.find((p: any) => p.id === pageId || p.name?.toLowerCase().includes(pageId?.toLowerCase() ?? ''))
                                     if (matchingPage?.access_token) {
                                                 pageAccessToken = matchingPage.access_token
                                                 pageId = matchingPage.id
                                                 console.log(`Got Page Access Token for page: ${matchingPage.name} (${matchingPage.id})`)
                                     } else if (accountsData.data?.length > 0) {
                                                 const firstPage = accountsData.data[0]
                                                 pageAccessToken = firstPage.access_token
                                                 pageId = firstPage.id
                                                 console.log(`Using first available page: ${firstPage.name} (${firstPage.id})`)
                                     } else {
                                                 console.log('No pages found for this user token')
                                     }
                           } else {
                                     const errText = await accountsRes.text()
                                     console.log(`Failed to get /me/accounts: ${errText}`)
                           }
                   } catch (e) {
                           console.log(`Error getting page token: ${(e as Error).message}`)
                   }

      // Step 2: Try multiple endpoints to get photos — ordered by newest first
      const endpoints = [
              // Photos uploaded directly (best for galleries)
              `https://graph.facebook.com/v19.0/${pageId}/photos?fields=images,link,name,created_time,message&type=uploaded&limit=20&order=reverse_chronological&access_token=${pageAccessToken}`,
              // Posts with photo attachments
              `https://graph.facebook.com/v19.0/${pageId}/posts?fields=attachments{media,subattachments},link,message,created_time&limit=20&access_token=${pageAccessToken}`,
              // Feed (fallback)
              `https://graph.facebook.com/v19.0/${pageId}/feed?fields=full_picture,link,message,created_time&limit=20&access_token=${pageAccessToken}`,
            ]

      for (const fbUrl of endpoints) {
              try {
                        const response = await fetch(fbUrl)
                        if (response.ok) {
                                    const data = await response.json()
                                    if (data.data && data.data.length > 0) {
                                                  // For posts endpoint, filter only those with photo attachments
                                      if (fbUrl.includes('/posts?')) {
                                                      const withPhotos = data.data.filter((post: any) =>
                                                                        post.attachments?.data?.[0]?.media?.image?.src ||
                                                                        post.attachments?.data?.[0]?.subattachments?.data?.[0]?.media?.image?.src
                                                                                                        )
                                                      if (withPhotos.length > 0) {
                                                                        console.log(`Success via posts! Got ${withPhotos.length} posts with photos`)
                                                                        return new Response(JSON.stringify({ data: withPhotos }), {
                                                                                            headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                                                                        })
                                                      }
                                      } else {
                                                      console.log(`Success! Got ${data.data.length} items`)
                                                      return new Response(JSON.stringify(data), {
                                                                        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                                                      })
                                      }
                                    }
                        }
                        const errBody = await response.text()
                        console.log(`Endpoint failed: ${errBody}`)
              } catch (e) {
                        console.log(`Fetch error: ${(e as Error).message}`)
              }
      }

      console.log('All endpoints failed, returning placeholder')
                   return new Response(JSON.stringify(placeholderData), {
                           headers: { ...corsHeaders, 'Content-Type': 'application/json' }
                   })

             } catch (error: unknown) {
    console.error('Edge function error:', error)
                   return new Response(JSON.stringify({ error: (error as Error).message }), {
                           headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                           status: 400
                   })
             }
})
