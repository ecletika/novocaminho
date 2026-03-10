import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import RadioPlayer from "./RadioPlayer";

interface RadioModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export default function RadioModal({ open, onOpenChange }: RadioModalProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center font-display">Rádio Igreja Novo Caminho</DialogTitle>
        </DialogHeader>
        <div className="py-4">
          <RadioPlayer />
        </div>
      </DialogContent>
    </Dialog>
  );
}
