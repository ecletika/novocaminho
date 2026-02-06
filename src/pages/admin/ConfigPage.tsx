import { useState, useRef, useEffect } from "react";
import { Download, Upload, Loader2, Shield, Database, AlertTriangle, Video, Save } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { exportBackup, importBackup } from "@/hooks/useBackup";
import { useSiteConfig, useUpdateSiteConfig } from "@/hooks/useSiteConfig";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

export default function ConfigPage() {
  const [isExporting, setIsExporting] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [showImportConfirm, setShowImportConfirm] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { data: facebookPageId } = useSiteConfig("facebook_page_id");
  const updateConfig = useUpdateSiteConfig();
  const [fbPageId, setFbPageId] = useState("");

  useEffect(() => {
    if (facebookPageId) setFbPageId(facebookPageId);
  }, [facebookPageId]);

  const handleSaveFacebook = async () => {
    try {
      await updateConfig.mutateAsync({ key: "facebook_page_id", value: fbPageId });
      toast.success("Link do Facebook salvo!");
    } catch {
      toast.error("Erro ao salvar");
    }
  };

  const handleExport = async () => {
    setIsExporting(true);
    try {
      await exportBackup();
    } finally {
      setIsExporting(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setSelectedFile(file);
      setShowImportConfirm(true);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleImportConfirm = async () => {
    if (!selectedFile) return;

    setIsImporting(true);
    setShowImportConfirm(false);
    try {
      await importBackup(selectedFile);
      window.location.reload();
    } finally {
      setIsImporting(false);
      setSelectedFile(null);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="font-display text-3xl font-bold text-foreground">Configurações</h1>
        <p className="text-muted-foreground mt-1">
          Gerencie as configurações do sistema
        </p>
      </div>

      {/* Backup Section */}
      <div className="bg-card rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Database className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Backup e Restauração</h2>
            <p className="text-sm text-muted-foreground">Exporte ou restaure todos os dados do sistema</p>
          </div>
        </div>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Export */}
          <div className="p-4 border border-border rounded-xl">
            <h3 className="font-semibold text-foreground mb-2">Exportar Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Baixe um arquivo JSON com todos os dados do sistema: inventário, aniversários, ministérios, escalas e mais.
            </p>
            <Button onClick={handleExport} disabled={isExporting} className="w-full">
              {isExporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Exportando...
                </>
              ) : (
                <>
                  <Download className="w-4 h-4 mr-2" />
                  Exportar Backup
                </>
              )}
            </Button>
          </div>

          {/* Import */}
          <div className="p-4 border border-border rounded-xl">
            <h3 className="font-semibold text-foreground mb-2">Restaurar Backup</h3>
            <p className="text-sm text-muted-foreground mb-4">
              Restaure os dados de um arquivo de backup. <span className="text-destructive font-medium">Atenção: isso substituirá todos os dados atuais.</span>
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleFileSelect}
              className="hidden"
            />
            <Button
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isImporting}
              className="w-full"
            >
              {isImporting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Restaurando...
                </>
              ) : (
                <>
                  <Upload className="w-4 h-4 mr-2" />
                  Selecionar Arquivo
                </>
              )}
            </Button>
          </div>
        </div>
      </div>

      {/* Facebook Live Section */}
      <div className="bg-card rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
            <Video className="w-6 h-6 text-blue-600" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Transmissão ao Vivo</h2>
            <p className="text-sm text-muted-foreground">Configure o ID da página do Facebook para o player ao vivo</p>
          </div>
        </div>
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="fb-page-id">ID ou nome da página do Facebook</Label>
            <Input
              id="fb-page-id"
              value={fbPageId}
              onChange={(e) => setFbPageId(e.target.value)}
              placeholder="Ex: IgrejaNovoCAminhoPortugal"
            />
            <p className="text-xs text-muted-foreground">
              O ID aparece na URL da sua página: facebook.com/<strong>SeuID</strong>
            </p>
          </div>
          <Button onClick={handleSaveFacebook} disabled={updateConfig.isPending}>
            {updateConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
            Salvar
          </Button>
        </div>
      </div>

      {/* Security Section */}
      <div className="bg-card rounded-xl shadow-soft p-6">
        <div className="flex items-center gap-3 mb-6">
          <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
            <Shield className="w-6 h-6 text-green-600" />
          </div>
          <div>
            <h2 className="font-display text-xl font-semibold text-foreground">Segurança</h2>
            <p className="text-sm text-muted-foreground">Informações sobre a segurança do sistema</p>
          </div>
        </div>

        <div className="space-y-4">
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">Autenticação ativa e funcionando</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">Políticas de segurança (RLS) configuradas</span>
          </div>
          <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
            <Shield className="w-5 h-5 text-green-600" />
            <span className="text-sm text-green-800">Dados criptografados em trânsito (HTTPS)</span>
          </div>
        </div>
      </div>

      {/* Import Confirmation Dialog */}
      <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-destructive" />
              Confirmar Restauração
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação irá <strong>substituir todos os dados atuais</strong> pelos dados do backup selecionado. Esta ação não pode ser desfeita.
              <br /><br />
              Arquivo: <strong>{selectedFile?.name}</strong>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleImportConfirm} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Restaurar
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
