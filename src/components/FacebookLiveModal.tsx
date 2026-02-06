import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { useSiteConfig } from "@/hooks/useSiteConfig";

interface FacebookLiveModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function FacebookLiveModal({ open, onOpenChange }: FacebookLiveModalProps) {
  const { data: facebookPageId } = useSiteConfig("facebook_page_id");

  if (!facebookPageId) {
    return (
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle className="font-display">Transmissão ao Vivo</DialogTitle>
          </DialogHeader>
          <div className="text-center py-8">
            <p className="text-muted-foreground">
              Nenhuma transmissão ao vivo disponível no momento.
            </p>
          </div>
        </DialogContent>
      </Dialog>
    );
  }

  const embedUrl = `https://www.facebook.com/plugins/video.php?href=https://www.facebook.com/${facebookPageId}/live&show_text=false&width=560&autoplay=true`;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="font-display">Transmissão ao Vivo</DialogTitle>
        </DialogHeader>
        <div className="aspect-video w-full">
          <iframe
            src={embedUrl}
            className="w-full h-full rounded-lg"
            style={{ border: "none", overflow: "hidden" }}
            allowFullScreen
            allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share"
          />
        </div>
      </DialogContent>
    </Dialog>
  );
}
