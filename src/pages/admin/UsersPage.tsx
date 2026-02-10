import { useState, useEffect } from "react";
import { Users, Shield, Loader2, Save, Search, Plus, Eye, EyeOff, Church } from "lucide-react";
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
  email: string;
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
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const [selectedMinistries, setSelectedMinistries] = useState<string[]>([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [newName, setNewName] = useState("");
  const [newMinistries, setNewMinistries] = useState<string[]>([]);
  const [showPassword, setShowPassword] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [userMinistries, setUserMinistries] = useState<UserMinistry[]>([]);

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
      const { data: profiles, error } = await supabase
        .from("profiles")
        .select("user_id, full_name");
      if (error) throw error;

      const { data: roles, error: rolesError } = await supabase
        .from("user_roles")
        .select("user_id, role");
      if (rolesError) throw rolesError;

      const userList: UserWithRole[] = (profiles || []).map((p) => {
        const role = roles?.find((r) => r.user_id === p.user_id);
        return {
          id: p.user_id,
          email: p.full_name || p.user_id.substring(0, 8),
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

  const startEditing = (userId: string) => {
    setEditingUser(userId);
    setSelectedPermissions(getUserPermissions(userId));
    setSelectedMinistries(getUserMinistryIds(userId));
  };

  const handleSave = async () => {
    if (!editingUser) return;
    try {
      await setPerms.mutateAsync({ userId: editingUser, permissions: selectedPermissions });

      // Save ministries
      await supabase.from("user_ministries").delete().eq("user_id", editingUser);
      if (selectedMinistries.length > 0) {
        await supabase.from("user_ministries").insert(
          selectedMinistries.map((mid) => ({ user_id: editingUser, ministry_id: mid }))
        );
      }

      loadUserMinistries();
      toast.success("Permissões e ministérios atualizados!");
      setEditingUser(null);
    } catch (err) {
      toast.error("Erro ao atualizar");
    }
  };

  const handleCreateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsCreating(true);
    try {
      const { data, error } = await supabase.functions.invoke("create-user", {
        body: { email: newEmail, password: newPassword, full_name: newName, ministry_ids: newMinistries },
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
    (u) => u.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading || permsLoading || ministriesLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

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
            placeholder="Pesquisar utilizadores..."
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
                      {user.email.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <h3 className="font-semibold text-foreground">{user.email}</h3>
                    <div className="flex items-center gap-2">
                      <Shield className="w-3 h-3 text-muted-foreground" />
                      <span className="text-xs text-muted-foreground capitalize">{user.role}</span>
                    </div>
                  </div>
                </div>
                {!isAdmin && (
                  <div className="flex gap-2">
                    {isEditing ? (
                      <Button size="sm" onClick={handleSave} disabled={setPerms.isPending}>
                        {setPerms.isPending ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : <Save className="w-4 h-4 mr-1" />}
                        Salvar
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" onClick={() => startEditing(user.id)}>
                        Editar
                      </Button>
                    )}
                  </div>
                )}
              </div>

              {isAdmin ? (
                <p className="text-sm text-muted-foreground">Administrador — acesso total a todas as áreas.</p>
              ) : (
                <div className="space-y-4">
                  {/* Ministries */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2 flex items-center gap-2">
                      <Church className="w-4 h-4" /> Ministérios
                    </h4>
                    {isEditing ? (
                      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                        {ministries.filter(m => m.is_active).map((m) => (
                          <div key={m.id} className="flex items-center gap-2">
                            <Checkbox
                              id={`min-${user.id}-${m.id}`}
                              checked={userMins.includes(m.id)}
                              onCheckedChange={() => toggleMinistry(m.id, selectedMinistries, setSelectedMinistries)}
                            />
                            <Label htmlFor={`min-${user.id}-${m.id}`} className="text-sm cursor-pointer">
                              {m.title}
                            </Label>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-wrap gap-1">
                        {userMins.length === 0 ? (
                          <span className="text-xs text-muted-foreground">Nenhum ministério atribuído</span>
                        ) : (
                          userMins.map((mid) => {
                            const m = ministries.find((x) => x.id === mid);
                            return m ? <Badge key={mid} variant="secondary" className="text-xs">{m.title}</Badge> : null;
                          })
                        )}
                      </div>
                    )}
                  </div>

                  {/* Permissions */}
                  <div>
                    <h4 className="text-sm font-medium text-foreground mb-2">Permissões</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                      {ALL_PERMISSIONS.map((perm) => (
                        <div key={perm.key} className="flex items-center gap-2">
                          <Checkbox
                            id={`${user.id}-${perm.key}`}
                            checked={userPerms.includes(perm.key)}
                            onCheckedChange={() => isEditing && togglePermission(perm.key)}
                            disabled={!isEditing}
                          />
                          <Label htmlFor={`${user.id}-${perm.key}`} className="text-sm cursor-pointer">
                            {perm.label}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}

        {filteredUsers.length === 0 && (
          <div className="text-center py-12 text-muted-foreground">
            <Users className="w-12 h-12 mx-auto mb-4 opacity-50" />
            <p>Nenhum utilizador encontrado.</p>
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
              <Label>Nome</Label>
              <Input
                value={newName}
                onChange={(e) => setNewName(e.target.value)}
                placeholder="Nome completo"
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
              <Label>Senha *</Label>
              <div className="relative">
                <Input
                  type={showPassword ? "text" : "password"}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Senha de acesso"
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
              <Label>Ministérios</Label>
              <div className="grid grid-cols-2 gap-2 border rounded-lg p-3">
                {ministries.filter(m => m.is_active).map((m) => (
                  <div key={m.id} className="flex items-center gap-2">
                    <Checkbox
                      id={`new-min-${m.id}`}
                      checked={newMinistries.includes(m.id)}
                      onCheckedChange={() => toggleMinistry(m.id, newMinistries, setNewMinistries)}
                    />
                    <Label htmlFor={`new-min-${m.id}`} className="text-sm cursor-pointer">
                      {m.title}
                    </Label>
                  </div>
                ))}
              </div>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" className="flex-1" onClick={() => setIsCreateOpen(false)}>
                Cancelar
              </Button>
              <Button type="submit" className="flex-1" disabled={isCreating}>
                {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Criar
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
