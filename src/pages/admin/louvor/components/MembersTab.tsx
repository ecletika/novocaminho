import { Search, Plus, Edit, Trash2, Phone } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { WorshipMember } from "@/hooks/useWorship";
import logoImage from "@/assets/logos/10 - Fresh Sky.png";

interface MembersTabProps {
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  filteredMembers: WorshipMember[];
  isAdmin: boolean;
  setIsNewMemberDialogOpen: (open: boolean) => void;
  openEditMemberDialog: (member: WorshipMember) => void;
  openDeleteDialog: (id: string, type: "member") => void;
}

export function MembersTab({
  searchTerm,
  setSearchTerm,
  filteredMembers,
  isAdmin,
  setIsNewMemberDialogOpen,
  openEditMemberDialog,
  openDeleteDialog
}: MembersTabProps) {
  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar integrantes..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        {isAdmin && (
          <Button onClick={() => setIsNewMemberDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Novo Integrante
          </Button>
        )}
      </div>

      {filteredMembers.length === 0 ? (
        <div className="text-center py-8 text-muted-foreground">Nenhum integrante encontrado</div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
          {filteredMembers.map((member) => (
            <div key={member.id} className="bg-card rounded-xl shadow-soft p-4 hover:shadow-card transition-all text-center group relative">
              <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
                {isAdmin && (
                  <>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openEditMemberDialog(member); }}
                    >
                      <Edit className="w-4 h-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8"
                      onClick={(e) => { e.stopPropagation(); openDeleteDialog(member.id, "member"); }}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </>
                )}
              </div>
              <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3 overflow-hidden border-2 border-primary/20">
                {member.photo_url ? (
                  <img src={member.photo_url} alt={member.name} className="w-full h-full object-cover" />
                ) : (
                  <img src={logoImage} alt="Logo" className="w-full h-full object-cover opacity-50" />
                )}
              </div>
              <h3 className="font-semibold text-foreground text-sm truncate">{member.name}</h3>
              <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                {[
                  member.primary_function?.name,
                  ...(member.secondary_functions?.map(sf => sf.function?.name) || [])
                ].filter(Boolean).join(", ") || "Sem função"}
              </p>
              {member.phone && (
                <a href={`https://wa.me/${member.phone.replace(/\D/g, '')}`} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs text-primary mt-1 hover:underline">
                  <Phone className="w-3 h-3" />
                  {member.phone}
                </a>
              )}
              <span className={`inline-block w-2 h-2 rounded-full mt-2 ${member.active ? 'bg-green-500' : 'bg-muted'}`} />
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
