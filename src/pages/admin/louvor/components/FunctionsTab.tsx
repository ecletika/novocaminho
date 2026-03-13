import { Plus, Settings, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { WorshipFunction } from "@/hooks/useWorship";

interface FunctionsTabProps {
  setIsNewFunctionDialogOpen: (open: boolean) => void;
  functionsLoading: boolean;
  functions: WorshipFunction[];
  openDeleteDialog: (id: string, type: "function") => void;
}

export function FunctionsTab({
  setIsNewFunctionDialogOpen,
  functionsLoading,
  functions,
  openDeleteDialog
}: FunctionsTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4 justify-between">
        <h2 className="font-display text-xl font-semibold text-foreground">Funções</h2>
        <Button onClick={() => setIsNewFunctionDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nova Função
        </Button>
      </div>

      {functionsLoading ? (
        <div className="text-center py-8 text-muted-foreground">Carregando...</div>
      ) : functions.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhuma função registada</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
          {functions.map((func) => (
            <div key={func.id} className="bg-card rounded-xl shadow-soft p-4 hover:shadow-card transition-all text-center group relative">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8"
                  onClick={() => openDeleteDialog(func.id, "function")}
                >
                  <Trash2 className="w-4 h-4 text-destructive" />
                </Button>
              </div>
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Settings className="w-5 h-5 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground text-sm">{func.name}</h3>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
