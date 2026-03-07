import { useState, useEffect } from "react";
import { Users, Shield, Loader2, Save, Search, Plus, Eye, EyeOff, Church, Mail, Key, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
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
import { supabase } from "@/integrations/supabase/client";
import {
  useAllUserPermissions,
  useSetUserPermissions,
  ALL_PERMISSIONS,
} from "@/hooks/useUserPermissions";
import { useMinistries } from "@/hooks/useMinistries";
import { toast } from "sonner";

interface UserWithRole {
  id: string;
  name: string;
  email: string | null;
  role: string | null;
}

interface UserMinistry {
  user_id: string;
  ministry_id: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<UserWithRole[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [editingUser, setEditingUser] = useState<string | null>(null);
  const [editingName, setEditingName] = useState("");
  const [editingEmail, setEditingEmail] = useState("");
  const [editingPassword, setEditingPassword] = useState("");
  const [showEditPassword, setShowEditPassword] = useState(false);
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [editingRole, setEditingRole] = useState<string>("member");
  const [isSaving, setIsSaving] = useState(false);

  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newRole, setNewRole] = useState<string>("member");
  const [newMinistries, setNewMinistries] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userMinistries, setUserMinistries] = useState<UserMinistry[]>([]);
  const [deleteUserId, setDeleteUserId] = useState<string | null>(null);

  const { data: allPermissions = [], isLoading: permsLoading } = useAllUserPermissions();
  const setPerms = useSetUserPermissions();
  const { data: ministries = [], isLoading: ministriesLoading } = useMinistries();

  useEffect(() => {
    loadUsers();
    loadUserMinistries();
  }, []);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name, email");
      if (error) throw error;

      const { data: permsData } = await supabase.from("user_permissions").select("user_id");

      const allUserIds = Array.from(new Set([
        ...(roles?.map(r => r.user_id) || []),
        ...(profiles?.map(p => p.user_id) || []),
        ...(permsData?.map(pd => pd.user_id) || [])
      ]));

      const userList: UserWithRole[] = allUserIds.map((uid) => {
        const role = roles?.find((r) => r.user_id === uid);
        const profile = profiles?.find((p) => p.user_id === uid);
        return {
          id: uid,
          name: profile?.full_name || `Utilizador ${uid.substring(0, 5)}`,
          email: profile?.email || null,
          role: role?.role || "member",
        };
      });

      setUsers(userList);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  const loadUserMinistries = async () => {
    const { data, error } = await supabase
      .from("user_ministries")
      .select("user_id, ministry_id");
    if (!error && data) {
      setUserMinistries(data);
    }
  };

  const getUserPermissions = (userId: string) => {
    return allPermissions.filter((p) => p.user_id === userId).map((p) => p.permission);
  };

  const getUserMinistryIds = (userId: string) => {
    return userMinistries.filter((m) => m.user_id === userId).map((m) => m.ministry_id);
  };

  const startEditing = (user: UserWithRole) => {
    setEditingUser(user.id);
    setEditingName(user.name);
    setEditingEmail(user.email || "");
    setEditingPassword("");
    setEditingRole(user.role || "member");
    setSelectedPermissions(getUserPermissions(user.id));
    setSelectedMinistries(getUserMinistryIds(user.id));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    setIsSaving(true);
    try {
      // 1. Update Auth and Profile via Edge Function (for email/password/name)
      const { data: authData, error: authError } = await supabase.functions.invoke("create-user", {
        body: {
          action: "update",
          user_id: editingUser,
          email: editingEmail,
          password: editingPassword || undefined,
          full_name: editingName
        },
      });
      if (authError || authData?.error) throw new Error(authError?.message || authData?.error);

      // 2. Update Role
      await supabase.from("user_roles").upsert({
        user_id: editingUser,
        role: editingRole as any
      }, { onConflict: "user_id,role" });

      // 3. Update Permissions
      await setPerms.mutateAsync({ userId: editingUser, permissions: selectedPermissions });

      // 4. Save ministries
      await supabase.from("user_ministries").delete().eq("user_id", editingUser);
      if (selectedMinistries.length > 0) {
        await supabase.from("user_ministries").insert(
          selectedMinistries.map((mid) => ({ user_id: editingUser, ministry_id: mid }))
        );
      }

      toast.success("Dados atualizados com sucesso!");
      setEditingUser(null);
      loadUsers();
      loadUserMinistries();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao atualizar");
    } finally {
      setIsSaving(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteUserId) return;
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "delete",
          user_id: deleteUserId
        },
      });
      if (error || data?.error) throw new Error(error?.message || data?.error);

      toast.success("Utilizador excluído com sucesso!");
      setDeleteUserId(null);
      loadUsers();
    } catch (err: any) {
      console.error(err);
      toast.error(err.message || "Erro ao excluir utilizador");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: {
          action: "create",
          email: newEmail,
          password: newPassword,
          full_name: newName,
          ministry_ids: newMinistries,
          role: newRole
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      toast.success("Utilizador criado com sucesso!");
      setIsCreateOpen(false);
      setNewEmail("");
      setNewPassword("");
      setNewName("");
      setNewMinistries([]);
      loadUsers();
      loadUserMinistries();
    } catch (err: any) {
      toast.error(err.message || "Erro ao criar utilizador");
    } finally {
      setIsCreating(false);
    }
  };

  const togglePermission = (perm: string) => {
    setSelectedPermissions((prev) =>
      prev.includes(perm) ? prev.filter((p) => p !== perm) : [...prev, perm]
    );
  };

  const toggleMinistry = (id: string, list: string[], setter: (v: string[]) => void) => {
    setter(list.includes(id) ? list.filter((m) => m !== id) : [...list, id]);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (u.email?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground flex items-center gap-3">
            <Users className="w-8 h-8 text-primary" />
            Utilizadores e Permissões
          </h1>
          <p className="text-muted-foreground mt-1">Gerencie permissões e ministérios de cada utilizador</p>
        </div>
        <Button onClick={() => setIsCreateOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Novo Utilizador
        </Button>
      </div>

      <div className="bg-card rounded-xl shadow-soft p-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar por nome ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="grid gap-4">
        {filteredUsers.map((user) => {
          const isEditing = editingUser === user.id;
          const userPerms = isEditing ? selectedPermissions : getUserPermissions(user.id);
          const userMins = isEditing ? selectedMinistries : getUserMinistryIds(user.id);
          const isAdmin = user.role === "admin";

          return (
            <div key={user.id} className="bg-card rounded-xl p-6 shadow-soft">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-full bg-primary flex items-center justify-center">
                    <span className="text-primary-foreground font-medium">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="flex-1">
                    {isEditing ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-1">
                          <Label className="text-xs">Nome Completo</Label>
                          <Input
                            value={editingName}
                            onChange={(e) => setEditingName(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1">
                          <Label className="text-xs">Email de Acesso</Label>
                          <Input
                            value={editingEmail}
                            onChange={(e) => setEditingEmail(e.target.value)}
                            className="h-9"
                          />
                        </div>
                        <div className="space-y-1 md:col-span-2">
                          <Label className="text-xs">Nova Senha (deixe em branco para não alterar)</Label>
                          <div className="relative">
                            <Input
                              type={showEditPassword ? "text" : "password"}
                              value={editingPassword}
                              onChange={(e) => setEditingPassword(e.target.value)}
                              className="h-9 pr-10"
                              placeholder="••••••••"
                            />
                            <button
                              type="button"
                              onClick={() => setShowEditPassword(!showEditPassword)}
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground"
                            >
                              {showEditPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                            </button>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <>
                        <h3 className="font-semibold text-foreground">{user.name}</h3>
                        <div className="flex items-center gap-4">
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Mail className="w-3 h-3" />
                            {user.email || "Sem email"}
                          </div>
                          <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                            <Shield className="w-3 h-3" />
                            <span className="capitalize">{user.role}</span>
                          </div>
                        </div>
                      </>
                    )}
                  </div>
                </div>
                <div className="flex gap-2 ml-4">
                  {isEditing ? (
                    <div className="flex items-center gap-2">
                      <Select value={editingRole} onValueChange={setEditingRole}>
                        <SelectTrigger className="w-32 h-9">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="member">Membro</SelectItem>
                          <SelectItem value="admin">Admin</SelectItem>
                        </SelectContent>
                      </Select>
                      <Button size="sm" onClick={handleSave} disabled={isSaving}>
                        {isSaving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Salvar
                      </Button>
                      <Button size="sm" variant="ghost" onClick={() => setEditingUser(null)} disabled={isSaving}>
                        Cancelar
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-2">
                      <Button size="sm" variant="outline" onClick={() => startEditing(user)}>
                        Editar Perfil
                      </Button>
                      <Button size="sm" variant="ghost" className="text-destructive hover:bg-destructive/10" onClick={() => setDeleteUserId(user.id)}>
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4 pt-4 border-t border-border">
                {isAdmin && !isEditing && (
                  <div className="bg-primary/5 p-3 rounded-lg border border-primary/20 mb-2">
                    <p className="text-sm text-primary font-medium flex items-center gap-2">
                      <Shield className="w-4 h-4" /> Administrador — acesso total a todas as áreas.
                    </p>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {/* Ministries */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Church className="w-4 h-4 text-primary" /> Ministérios Atribuídos
                    </h4>
                    {isEditing ? (
                      <div className="grid grid-cols-2 gap-2 p-3 border rounded-lg bg-muted/20">
                        {ministries.filter(m => m.is_active).map((m) => (
                          <div key={m.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`min-${user.id}-${m.id}`}
                              checked={userMins.includes(m.id)}
                              onCheckedChange={() => toggleMinistry(m.id, selectedMinistries, setSelectedMinistries)}
                            />
                            <Label htmlFor={`min-${user.id}-${m.id}`} className="text-sm cursor-pointer truncate">
                              {m.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {userMins.length === 0 ? (
                          <span className="text-xs text-muted-foreground italic">Nenhum ministério atribuído</span>
                        ) : (
                          userMins.map((mid) => {
                            const m = ministries.find((x) => x.id === mid);
                            return m ? <Badge key={mid} variant="secondary" className="text-[10px] px-2 py-0">{m.title}</Badge> : null;
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-3 flex items-center gap-2">
                      <Shield className="w-4 h-4 text-primary" /> Permissões de Acesso
                    </h4>
                    <div className={`grid grid-cols-2 gap-3 p-3 border rounded-lg ${isEditing ? 'bg-muted/20' : 'bg-transparent'}`}>
                      {ALL_PERMISSIONS.map((perm) => (
                        <div key={perm.key} className="flex items-center gap-2">
                          <Checkbox
                            id={`${user.id}-${perm.key}`}
                            checked={userPerms.includes(perm.key)}
                            onCheckedChange={() => isEditing && togglePermission(perm.key)}
                            disabled={!isEditing}
                          />
                          <Label htmlFor={`${user.id}-${perm.key}`} className="text-sm cursor-pointer whitespace-nowrap">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground bg-card rounded-xl border border-dashed">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-20" />
            <p>Nenhum utilizador encontrado com estes termos.</p>
          </div>
        )}
      </div>

      {/* Create User Dialog */}
      <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
        <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="font-display text-xl">Novo Utilizador</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleCreateUser} className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Ex: João Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>Email *</Label>
              <Input
                type="email"
                value={newEmail}
                onChange={(e) => setNewEmail(e.target.value)}
                placeholder="email@exemplo.com"
                required
              />
            </div>
            <div className="space-y-2">
              <Label>Cargo no Sistema</Label>
              <Select value={newRole} onValueChange={setNewRole}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="member">Membro / Utilizador Comum</SelectItem>
                  <SelectItem value="admin">Administrador Geral</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Senha Temporária *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </Button>
              </div>
            </div>

            {/* Ministry selection */}
            <div className="space-y-2">
              <Label>Atribuir Ministérios</Label>
              <div className="grid grid-cols-2 gap-2 border rounded-lg p-3 bg-muted/10 max-h-40 overflow-y-auto">
                {ministries.filter(m => m.is_active).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`new-min-${m.id}`}
                      checked={newMinistries.includes(m.id)}
                      onCheckedChange={() => toggleMinistry(m.id, newMinistries, setNewMinistries)}
                    />
                    <Label htmlFor={`new-min-${m.id}`} className="text-sm cursor-pointer truncate">
                      {m.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4 border-t mt-6">
              <Button type="button" variant="outline" className="flex-1" onClick={() => { setIsCreateOpen(false); }}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar Utilizador
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      {/* Delete User Confirmation */}
      <AlertDialog open={!!deleteUserId} onOpenChange={(open) => !open && setDeleteUserId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Utilizador?</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este utilizador? Esta ação removerá o acesso dele ao sistema e não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteUser} className="bg-destructive hover:bg-destructive/90">
              Excluir permanentemente
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
