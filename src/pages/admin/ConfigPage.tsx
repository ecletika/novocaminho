import { useState, useRef, useEffect } from "react";
import { Download, Upload, Loader2, Shield, Database, AlertTriangle, Video, Save, Eye, EyeOff } from "lucide-react";
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
    const [showToken, setShowToken] = useState(false);
    const fileInputRef = useRef<HTMLInputElement>(null);

  const { data: facebookPageId } = useSiteConfig("facebook_page_id");
    const { data: facebookAccessToken } = useSiteConfig("facebook_access_token");
    const { data: discipuladoPass } = useSiteConfig("discipulado_password");
    const updateConfig = useUpdateSiteConfig();

  const [fbPageId, setFbPageId] = useState("");
    const [fbToken, setFbToken] = useState("");
    const [discPass, setDiscPass] = useState("");

  useEffect(() => {
        if (facebookPageId) setFbPageId(facebookPageId);
        if (facebookAccessToken) setFbToken(facebookAccessToken);
        if (discipuladoPass) setDiscPass(discipuladoPass);
  }, [facebookPageId, facebookAccessToken, discipuladoPass]);

  const handleSaveFacebook = async () => {
        try {
                if (fbPageId) {
                          await updateConfig.mutateAsync({ key: "facebook_page_id", value: fbPageId });
                }
                if (fbToken) {
                          await updateConfig.mutateAsync({ key: "facebook_access_token", value: fbToken });
                }
                toast.success("Configurações do Facebook guardadas!");
        } catch {
                toast.error("Erro ao guardar configurações do Facebook");
        }
  };

  const handleSaveDiscipuladoPass = async () => {
        try {
                await updateConfig.mutateAsync({ key: "discipulado_password", value: discPass });
                toast.success("Palavra-passe do acompanhamento salva!");
        } catch {
                toast.error("Erro ao guardar palavra-passe");
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
                      <h1 className="font-display text-3xl font-bold text-foreground">Configurações</h1>h1>
                      <p className="text-muted-foreground mt-1">
                                Gerencie as configurações do sistema
                      </p>p>
              </div>div>
        
          {/* Backup Section */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                      <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
                                            <Database className="w-6 h-6 text-primary" />
                                </div>div>
                                <div>
                                            <h2 className="font-display text-xl font-semibold text-foreground">Backup e Restauração</h2>h2>
                                            <p className="text-sm text-muted-foreground">Exporte ou restaure todos os dados do sistema</p>p>
                                </div>div>
                      </div>div>
                      <div className="grid md:grid-cols-2 gap-6">
                        {/* Export */}
                                <div className="p-4 border border-border rounded-xl">
                                            <h3 className="font-semibold text-foreground mb-2">Exportar Backup</h3>h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                          Baixe um arquivo JSON com todos os dados do sistema: inventário, aniversários, ministérios, escalas e mais.
                                            </p>p>
                                            <Button onClick={handleExport} disabled={isExporting} className="w-full">
                                              {isExporting ? (
                          <>
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            Exportando...
                          </>>
                        ) : (
                          <>
                                            <Download className="w-4 h-4 mr-2" />
                                            Exportar Backup
                          </>>
                        )}
                                            </Button>Button>
                                </div>div>
                        {/* Import */}
                                <div className="p-4 border border-border rounded-xl">
                                            <h3 className="font-semibold text-foreground mb-2">Restaurar Backup</h3>h3>
                                            <p className="text-sm text-muted-foreground mb-4">
                                                          Restaure os dados de um arquivo de backup.{" "}
                                                          <span className="text-destructive font-medium">Atenção: isso substituirá todos os dados atuais.</span>span>
                                            </p>p>
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
                                                                            </>>
                                                                          ) : (
                                                                            <>
                                                                                              <Upload className="w-4 h-4 mr-2" />
                                                                                              Selecionar Arquivo
                                                                            </>>
                                                                          )}
                                            </Button>Button>
                                </div>div>
                      </div>div>
              </div>div>
        
          {/* Facebook Integration Section */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                      <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-blue-100 flex items-center justify-center">
                                            <Video className="w-6 h-6 text-blue-600" />
                                </div>div>
                                <div>
                                            <h2 className="font-display text-xl font-semibold text-foreground">Integração Facebook</h2>h2>
                                            <p className="text-sm text-muted-foreground">
                                                          Configure o ID da página e o Access Token para o player ao vivo e galeria de fotos automática
                                            </p>p>
                                </div>div>
                      </div>div>
              
                      <div className="space-y-5">
                        {/* Page ID */}
                                <div className="space-y-2">
                                            <Label htmlFor="fb-page-id">ID ou Nome de utilizador da Página</Label>Label>
                                            <Input
                                                            id="fb-page-id"
                                                            value={fbPageId}
                                                            onChange={(e) => setFbPageId(e.target.value)}
                                                            placeholder="Ex: IgrejaNovoCAminhoPortugal"
                                                          />
                                            <p className="text-xs text-muted-foreground">
                                                          O ID aparece na URL da sua página: facebook.com/<strong>SeuID</strong>strong>
                                            </p>p>
                                </div>div>
                      
                        {/* Access Token */}
                                <div className="space-y-2">
                                            <Label htmlFor="fb-access-token">Access Token do Facebook</Label>Label>
                                            <div className="flex gap-2">
                                                          <Input
                                                                            id="fb-access-token"
                                                                            type={showToken ? "text" : "password"}
                                                                            value={fbToken}
                                                                            onChange={(e) => setFbToken(e.target.value)}
                                                                            placeholder="EAAxxxxxxxx..."
                                                                            className="font-mono text-sm"
                                                                          />
                                                          <Button
                                                                            type="button"
                                                                            variant="outline"
                                                                            size="icon"
                                                                            onClick={() => setShowToken(!showToken)}
                                                                            title={showToken ? "Ocultar token" : "Mostrar token"}
                                                                          >
                                                            {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                          </Button>Button>
                                            </div>div>
                                            <div className="text-xs text-muted-foreground space-y-1">
                                                          <p>
                                                                          Como obter o token:{" "}
                                                                          <a
                                                                                              href="https://developers.facebook.com/tools/explorer/"
                                                                                              target="_blank"
                                                                                              rel="noopener noreferrer"
                                                                                              className="text-blue-600 underline"
                                                                                            >
                                                                                            Facebook Graph API Explorer
                                                                          </a>a>
                                                            {" "}→ gera um User Token com permissões{" "}
                                                                          <code className="bg-muted px-1 rounded">pages_read_engagement</code>code>,{" "}
                                                                          <code className="bg-muted px-1 rounded">pages_show_list</code>code>
                                                          </p>p>
                                                          <p className="text-amber-600">
                                                                          ⚠️ Para que o token não expire, gere um <strong>Page Access Token de longa duração</strong>strong> através da API.
                                                          </p>p>
                                            </div>div>
                                </div>div>
                      
                                <Button onClick={handleSaveFacebook} disabled={updateConfig.isPending}>
                                  {updateConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                            Guardar Configurações Facebook
                                </Button>Button>
                      
                        {/* Status indicator */}
                        {facebookPageId && facebookAccessToken && (
                      <div className="flex items-center gap-2 p-3 bg-green-50 rounded-lg border border-green-200">
                                    <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                                    <span className="text-sm text-green-800 font-medium">
                                                    Integração configurada — galeria sincronizará automaticamente com o Facebook
                                    </span>span>
                      </div>div>
                                )}
                        {facebookPageId && !facebookAccessToken && (
                      <div className="flex items-center gap-2 p-3 bg-amber-50 rounded-lg border border-amber-200">
                                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                                    <span className="text-sm text-amber-800">
                                                    ID da página configurado, mas falta o Access Token para ativar a galeria
                                    </span>span>
                      </div>div>
                                )}
                      </div>div>
              </div>div>
        
          {/* Discipulado Security Section */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                      <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-amber-100 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-amber-600" />
                                </div>div>
                                <div>
                                            <h2 className="font-display text-xl font-semibold text-foreground">Acompanhamento (Discipulado)</h2>h2>
                                            <p className="text-sm text-muted-foreground">Senha de acesso confidencial para o sistema de acompanhamento</p>p>
                                </div>div>
                      </div>div>
                      <div className="space-y-4">
                                <div className="space-y-2">
                                            <Label htmlFor="disc-pass">Chave de Acesso Confidencial</Label>Label>
                                            <div className="flex gap-2">
                                                          <Input
                                                                            id="disc-pass"
                                                                            type="text"
                                                                            value={discPass}
                                                                            onChange={(e) => setDiscPass(e.target.value)}
                                                                            placeholder="Ex: discipulado2024"
                                                                            className="max-w-xs"
                                                                          />
                                                          <Button onClick={handleSaveDiscipuladoPass} disabled={updateConfig.isPending}>
                                                            {updateConfig.isPending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                                                                          Guardar Chave
                                                          </Button>Button>
                                            </div>div>
                                            <p className="text-xs text-muted-foreground">
                                                          Esta é a chave que será pedida para entrar no módulo de Acompanhamento.
                                            </p>p>
                                </div>div>
                      </div>div>
              </div>div>
        
          {/* Security Section */}
              <div className="bg-card rounded-xl shadow-soft p-6">
                      <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center">
                                            <Shield className="w-6 h-6 text-green-600" />
                                </div>div>
                                <div>
                                            <h2 className="font-display text-xl font-semibold text-foreground">Segurança</h2>h2>
                                            <p className="text-sm text-muted-foreground">Informações sobre a segurança do sistema</p>p>
                                </div>div>
                      </div>div>
                      <div className="space-y-4">
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-800">Autenticação ativa e funcionando</span>span>
                                </div>div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-800">Políticas de segurança (RLS) configuradas</span>span>
                                </div>div>
                                <div className="flex items-center gap-3 p-3 bg-green-50 rounded-lg">
                                            <Shield className="w-5 h-5 text-green-600" />
                                            <span className="text-sm text-green-800">Dados criptografados em trânsito (HTTPS)</span>span>
                                </div>div>
                      </div>div>
              </div>div>
        
          {/* Import Confirmation Dialog */}
              <AlertDialog open={showImportConfirm} onOpenChange={setShowImportConfirm}>
                      <AlertDialogContent>
                                <AlertDialogHeader>
                                            <AlertDialogTitle className="flex items-center gap-2">
                                                          <AlertTriangle className="w-5 h-5 text-destructive" />
                                                          Confirmar Restauração
                                            </AlertDialogTitle>AlertDialogTitle>
                                            <AlertDialogDescription>
                                                          Esta ação irá <strong>substituir todos os dados atuais</strong>strong> pelos dados do backup selecionado.
                                                          Esta ação não pode ser desfeita.
                                                          <br /><br />
                                                          Arquivo: <strong>{selectedFile?.name}</strong>strong>
                                            </AlertDialogDescription>AlertDialogDescription>
                                </AlertDialogHeader>AlertDialogHeader>
                                <AlertDialogFooter>
                                            <AlertDialogCancel onClick={() => setSelectedFile(null)}>Cancelar</AlertDialogCancel>AlertDialogCancel>
                                            <AlertDialogAction
                                                            onClick={handleImportConfirm}
                                                            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                                                          >
                                                          Restaurar
                                            </AlertDialogAction>AlertDialogAction>
                                </AlertDialogFooter>AlertDialogFooter>
                      </AlertDialogContent>AlertDialogContent>
              </AlertDialog>AlertDialog>
        </div>div>
      );
}</></></></></div>
