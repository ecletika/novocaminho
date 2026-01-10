import { useState, useRef, useEffect } from "react";
import { Play, Pause, Volume2, VolumeX, Radio } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";

const RADIO_STREAM_URL = "https://s08.maxcast.com.br:8608/live";

export default function RadioPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [volume, setVolume] = useState(0.7);
  const [isMuted, setIsMuted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (audioRef.current) {
      audioRef.current.volume = isMuted ? 0 : volume;
    }
  }, [volume, isMuted]);

  const togglePlay = async () => {
    if (!audioRef.current) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      setIsLoading(true);
      try {
        await audioRef.current.play();
        setIsPlaying(true);
      } catch (error) {
        console.error("Error playing audio:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };

  const toggleMute = () => {
    setIsMuted(!isMuted);
  };

  const handleVolumeChange = (value: number[]) => {
    setVolume(value[0]);
    if (value[0] > 0 && isMuted) {
      setIsMuted(false);
    }
  };

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 border border-border">
      <audio ref={audioRef} src={RADIO_STREAM_URL} preload="none" />
      
      <div className="flex items-center gap-4">
        {/* Radio Icon */}
        <div className="w-16 h-16 rounded-xl gradient-hero flex items-center justify-center shrink-0">
          <Radio className={`w-8 h-8 text-primary-foreground ${isPlaying ? "animate-pulse" : ""}`} />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-display text-lg font-semibold text-foreground truncate">
            Rádio Um Novo Caminho
          </h3>
          <p className="text-sm text-muted-foreground">
            {isPlaying ? (
              <span className="flex items-center gap-2">
                <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                Ao vivo
              </span>
            ) : (
              "Clique para ouvir"
            )}
          </p>
        </div>

        {/* Controls */}
        <div className="flex items-center gap-3">
          {/* Volume */}
          <div className="hidden sm:flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleMute}
              className="text-muted-foreground hover:text-foreground"
            >
              {isMuted || volume === 0 ? (
                <VolumeX className="w-5 h-5" />
              ) : (
                <Volume2 className="w-5 h-5" />
              )}
            </Button>
            <Slider
              value={[isMuted ? 0 : volume]}
              max={1}
              step={0.1}
              onValueChange={handleVolumeChange}
              className="w-24"
            />
          </div>

          {/* Play/Pause */}
          <Button
            onClick={togglePlay}
            disabled={isLoading}
            size="lg"
            className="w-12 h-12 rounded-full gradient-hero hover:opacity-90"
          >
            {isLoading ? (
              <div className="w-5 h-5 border-2 border-primary-foreground border-t-transparent rounded-full animate-spin" />
            ) : isPlaying ? (
              <Pause className="w-5 h-5" />
            ) : (
              <Play className="w-5 h-5 ml-0.5" />
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}
