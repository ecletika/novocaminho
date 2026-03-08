import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { Camera, ExternalLink } from "lucide-react";

interface FacebookPhoto {
    id: string;
    source: string;
}

interface FacebookPost {
    id: string;
    link: string;
    images: FacebookPhoto[];
    name?: string;
}

export default function PhotoGallery() {
    const [photos, setPhotos] = useState<FacebookPost[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchPhotos = async () => {
            try {
                const { data, error } = await supabase.functions.invoke("facebook-gallery");

                if (error) throw error;

                if (data && data.data) {
                    setPhotos(data.data);
                }
            } catch (err) {
                console.error("Erro ao carregar galeria:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPhotos();
    }, []);

    if (loading) {
        return (
            <div className="flex justify-center items-center py-20">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
            </div>
        );
    }

    if (photos.length === 0) {
        return null; // Return nothing if no photos loaded
    }

    return (
        <div className="w-full">
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                {photos.map((post: any, index) => {
                    // Extract image from attachments (new API format) or fallback to old format
                    let mainImage = null;
                    if (post.attachments?.data?.[0]?.media?.image?.src) {
                        mainImage = post.attachments.data[0].media.image.src;
                    } else if (post.images && post.images.length > 0) {
                        mainImage = post.images[0].source;
                    }

                    if (!mainImage) return null;

                    return (
                        <a
                            key={post.id}
                            href={post.link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className={`group relative overflow-hidden rounded-xl shadow-soft hover:shadow-card transition-all duration-500 animate-fade-up delay-${(index % 4 + 1) * 100}`}
                            title={post.message || post.name || "Ver no Facebook"}
                        >
                            <div className="aspect-square bg-muted">
                                <img
                                    src={mainImage}
                                    alt={post.message || post.name || "Foto da congregação"}
                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                                    loading="lazy"
                                />
                            </div>
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex flex-col justify-end p-4">
                                <div className="w-10 h-10 rounded-full bg-primary/90 flex items-center justify-center text-primary-foreground mb-3 backdrop-blur-md transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
                                    <ExternalLink className="w-5 h-5" />
                                </div>
                                <p className="text-white text-xs font-medium line-clamp-2 transform translate-y-4 group-hover:translate-y-0 transition-transform duration-500 delay-75">
                                    {post.message || post.name || "Acompanhe nossos momentos"}
                                </p>
                            </div>
                        </a>
                    );
                })}
            </div>

            <div className="mt-12 text-center">
                <a
                    href="https://www.facebook.com/igrejanovocaminhoportugal/photos"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center justify-center gap-2 px-6 py-3 border border-border rounded-lg text-sm font-medium hover:bg-muted transition-colors uppercase tracking-widest text-xs font-semibold"
                >
                    <Camera className="w-4 h-4" />
                    Ver todas no Facebook
                </a>
            </div>
        </div>
    );
}
