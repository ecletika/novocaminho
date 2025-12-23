import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import {
  Plus,
  Search,
  FileText,
  FolderOpen,
  Clock,
  User,
  Eye,
  Edit,
  Trash2,
  ArrowLeft,
  Save,
  BookOpen,
  Tv,
  Music,
  Settings,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import RichTextEditor from "@/components/editor/RichTextEditor";

const categories = [
  { id: "all", name: "Todas", icon: FolderOpen },
  { id: "som", name: "Mesa de Som", icon: Tv },
  { id: "transmissao", name: "Transmissão", icon: Tv },
  { id: "louvor", name: "Louvor", icon: Music },
  { id: "configuracoes", name: "Configurações", icon: Settings },
  { id: "geral", name: "Geral", icon: HelpCircle },
];

const mockArticles = [
  {
    id: 1,
    title: "Como ligar a mesa de som",
    category: "som",
    content: `<h2>Procedimento para ligar a mesa de som</h2>
<p>Este guia explica passo a passo como ligar corretamente a mesa de som Behringer X32 do templo principal.</p>
<h3>1. Verificação inicial</h3>
<p>Antes de ligar, verifique se todos os cabos estão conectados corretamente:</p>
<ul>
<li>Cabos de microfone nos canais 1-8</li>
<li>Cabos de instrumentos nos canais 9-16</li>
<li>Retornos de palco conectados</li>
</ul>
<h3>2. Sequência de ligação</h3>
<ol>
<li>Ligue primeiro a régua de energia principal</li>
<li>Aguarde 5 segundos</li>
<li>Ligue a mesa de som pelo botão traseiro</li>
<li>Aguarde o boot completo (cerca de 30 segundos)</li>
<li>Ligue as caixas amplificadas</li>
</ol>
<blockquote><p><strong>Importante:</strong> Nunca ligue as caixas antes da mesa!</p></blockquote>`,
    author: "Carlos Silva",
    createdAt: "2024-12-15",
    updatedAt: "2024-12-18",
    views: 45,
  },
  {
    id: 2,
    title: "Como iniciar a live no Facebook",
    category: "transmissao",
    content: `<h2>Transmissão ao vivo no Facebook</h2>
<p>Guia completo para iniciar a transmissão ao vivo dos cultos.</p>
<h3>Preparação</h3>
<p>Antes de iniciar a live, certifique-se de:</p>
<ul>
<li>Computador ligado e OBS aberto</li>
<li>Câmera posicionada corretamente</li>
<li>Áudio da mesa configurado</li>
</ul>`,
    author: "Ana Oliveira",
    createdAt: "2024-12-10",
    updatedAt: "2024-12-10",
    views: 32,
  },
  {
    id: 3,
    title: "Configuração do espelhamento de telas",
    category: "transmissao",
    content: `<h2>Espelhamento de telas</h2>
<p>Como configurar o espelhamento para projeção das letras.</p>`,
    author: "Pedro Costa",
    createdAt: "2024-12-08",
    updatedAt: "2024-12-12",
    views: 28,
  },
  {
    id: 4,
    title: "Escalas do ministério de louvor",
    category: "louvor",
    content: `<h2>Como funcionam as escalas</h2>
<p>Entenda o processo de criação e distribuição das escalas do louvor.</p>`,
    author: "João Silva",
    createdAt: "2024-12-05",
    updatedAt: "2024-12-05",
    views: 56,
  },
  {
    id: 5,
    title: "Botões principais da mesa X32",
    category: "som",
    content: `<h2>Guia dos botões da Behringer X32</h2>
<p>Conheça os principais botões e suas funções.</p>`,
    author: "Carlos Silva",
    createdAt: "2024-12-01",
    updatedAt: "2024-12-15",
    views: 89,
  },
];

export default function DocsPage() {
  const { toast } = useToast();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [articles, setArticles] = useState(mockArticles);
  const [isNewArticleDialogOpen, setIsNewArticleDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<typeof mockArticles[0] | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [editTitle, setEditTitle] = useState("");
  const [editCategory, setEditCategory] = useState("");

  const filteredArticles = articles.filter((article) => {
    const matchesSearch =
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.content.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory =
      categoryFilter === "all" || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleCreateArticle = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newArticle = {
      id: articles.length + 1,
      title: formData.get("title") as string,
      category: formData.get("category") as string,
      content: "<p>Comece a escrever seu artigo aqui...</p>",
      author: "Admin",
      createdAt: new Date().toISOString().split("T")[0],
      updatedAt: new Date().toISOString().split("T")[0],
      views: 0,
    };
    setArticles([newArticle, ...articles]);
    setIsNewArticleDialogOpen(false);
    setSelectedArticle(newArticle);
    setIsEditing(true);
    setEditTitle(newArticle.title);
    setEditCategory(newArticle.category);
    setEditContent(newArticle.content);
    toast({
      title: "Artigo criado!",
      description: "Agora você pode editar o conteúdo.",
    });
  };

  const handleViewArticle = (article: typeof mockArticles[0]) => {
    setSelectedArticle(article);
    setIsEditing(false);
  };

  const handleEditArticle = (article: typeof mockArticles[0]) => {
    setSelectedArticle(article);
    setIsEditing(true);
    setEditTitle(article.title);
    setEditCategory(article.category);
    setEditContent(article.content);
  };

  const handleSaveArticle = () => {
    if (!selectedArticle) return;

    setArticles(
      articles.map((a) =>
        a.id === selectedArticle.id
          ? {
              ...a,
              title: editTitle,
              category: editCategory,
              content: editContent,
              updatedAt: new Date().toISOString().split("T")[0],
            }
          : a
      )
    );

    setSelectedArticle({
      ...selectedArticle,
      title: editTitle,
      category: editCategory,
      content: editContent,
    });

    setIsEditing(false);
    toast({
      title: "Artigo salvo!",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const handleDeleteArticle = (id: number) => {
    if (window.confirm("Tem certeza que deseja excluir este artigo?")) {
      setArticles(articles.filter((a) => a.id !== id));
      setSelectedArticle(null);
      toast({
        title: "Artigo excluído!",
        description: "O artigo foi removido da documentação.",
      });
    }
  };

  const handleBackToList = () => {
    setSelectedArticle(null);
    setIsEditing(false);
  };

  const getCategoryInfo = (categoryId: string) => {
    return categories.find((c) => c.id === categoryId) || categories[5];
  };

  // Article View/Edit Mode
  if (selectedArticle) {
    const categoryInfo = getCategoryInfo(selectedArticle.category);

    return (
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between gap-4">
          <Button variant="ghost" onClick={handleBackToList}>
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar
          </Button>
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button variant="outline" onClick={() => setIsEditing(false)}>
                  Cancelar
                </Button>
                <Button onClick={handleSaveArticle}>
                  <Save className="w-4 h-4 mr-2" />
                  Salvar
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleEditArticle(selectedArticle)}
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="ghost"
                  className="text-destructive hover:text-destructive"
                  onClick={() => handleDeleteArticle(selectedArticle.id)}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </>
            )}
          </div>
        </div>

        {/* Article */}
        <div className="bg-card rounded-xl shadow-soft overflow-hidden">
          {isEditing ? (
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Título
                  </label>
                  <Input
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    placeholder="Título do artigo"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-foreground mb-2">
                    Categoria
                  </label>
                  <Select value={editCategory} onValueChange={setEditCategory}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.slice(1).map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Conteúdo
                </label>
                <RichTextEditor
                  content={editContent}
                  onChange={setEditContent}
                  placeholder="Escreva o conteúdo do artigo..."
                />
              </div>
            </div>
          ) : (
            <>
              <div className="bg-muted/50 p-6 border-b border-border">
                <div className="flex items-center gap-2 mb-4">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-primary/10 text-primary text-sm font-medium">
                    <categoryInfo.icon className="w-3.5 h-3.5" />
                    {categoryInfo.name}
                  </span>
                </div>
                <h1 className="font-display text-3xl font-bold text-foreground mb-4">
                  {selectedArticle.title}
                </h1>
                <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                  <span className="flex items-center gap-1.5">
                    <User className="w-4 h-4" />
                    {selectedArticle.author}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    Atualizado em{" "}
                    {new Date(selectedArticle.updatedAt).toLocaleDateString(
                      "pt-PT"
                    )}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Eye className="w-4 h-4" />
                    {selectedArticle.views} visualizações
                  </span>
                </div>
              </div>
              <div
                className="p-6 prose prose-sm max-w-none [&_h2]:font-display [&_h2]:text-2xl [&_h2]:font-semibold [&_h2]:text-foreground [&_h2]:mt-8 [&_h2]:mb-4 [&_h3]:font-display [&_h3]:text-xl [&_h3]:font-semibold [&_h3]:text-foreground [&_h3]:mt-6 [&_h3]:mb-3 [&_p]:text-muted-foreground [&_p]:mb-4 [&_ul]:text-muted-foreground [&_ol]:text-muted-foreground [&_li]:mb-2 [&_blockquote]:border-l-4 [&_blockquote]:border-secondary [&_blockquote]:bg-secondary/10 [&_blockquote]:pl-4 [&_blockquote]:py-2 [&_blockquote]:italic"
                dangerouslySetInnerHTML={{ __html: selectedArticle.content }}
              />
            </>
          )}
        </div>
      </div>
    );
  }

  // Articles List
  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl font-bold text-foreground">
            Documentação
          </h1>
          <p className="text-muted-foreground mt-1">
            Base de conhecimento e tutoriais internos da igreja
          </p>
        </div>
        <Dialog
          open={isNewArticleDialogOpen}
          onOpenChange={setIsNewArticleDialogOpen}
        >
          <DialogTrigger asChild>
            <Button>
              <Plus className="w-4 h-4 mr-2" />
              Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle className="font-display text-xl">
                Criar Novo Artigo
              </DialogTitle>
            </DialogHeader>
            <form onSubmit={handleCreateArticle} className="space-y-4 mt-4">
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Título *
                </label>
                <Input
                  name="title"
                  required
                  placeholder="Ex: Como configurar o projetor"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-foreground mb-2">
                  Categoria *
                </label>
                <Select name="category" required>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {categories.slice(1).map((cat) => (
                      <SelectItem key={cat.id} value={cat.id}>
                        <span className="flex items-center gap-2">
                          <cat.icon className="w-4 h-4" />
                          {cat.name}
                        </span>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  type="button"
                  variant="outline"
                  className="flex-1"
                  onClick={() => setIsNewArticleDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="flex-1">
                  Criar Artigo
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Filters */}
      <div className="bg-card rounded-xl shadow-soft p-4 flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Pesquisar artigos..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <div className="flex gap-2 flex-wrap">
          {categories.map((category) => (
            <Button
              key={category.id}
              variant={categoryFilter === category.id ? "default" : "outline"}
              size="sm"
              onClick={() => setCategoryFilter(category.id)}
              className="gap-1.5"
            >
              <category.icon className="w-4 h-4" />
              <span className="hidden sm:inline">{category.name}</span>
            </Button>
          ))}
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card rounded-xl shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
              <FileText className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">
                {articles.length}
              </span>
              <span className="block text-sm text-muted-foreground">
                Artigos
              </span>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-secondary/20 flex items-center justify-center">
              <FolderOpen className="w-5 h-5 text-secondary" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">
                {categories.length - 1}
              </span>
              <span className="block text-sm text-muted-foreground">
                Categorias
              </span>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-accent/20 flex items-center justify-center">
              <Eye className="w-5 h-5 text-accent" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">
                {articles.reduce((sum, a) => sum + a.views, 0)}
              </span>
              <span className="block text-sm text-muted-foreground">
                Visualizações
              </span>
            </div>
          </div>
        </div>
        <div className="bg-card rounded-xl shadow-soft p-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gold/20 flex items-center justify-center">
              <BookOpen className="w-5 h-5 text-gold-dark" />
            </div>
            <div>
              <span className="text-2xl font-bold text-foreground">3</span>
              <span className="block text-sm text-muted-foreground">
                Autores
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Articles Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredArticles.map((article) => {
          const categoryInfo = getCategoryInfo(article.category);
          return (
            <div
              key={article.id}
              className="bg-card rounded-xl shadow-soft hover:shadow-card transition-all duration-300 overflow-hidden group cursor-pointer"
              onClick={() => handleViewArticle(article)}
            >
              <div className="p-5">
                <div className="flex items-center gap-2 mb-3">
                  <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-primary/10 text-primary text-xs font-medium">
                    <categoryInfo.icon className="w-3 h-3" />
                    {categoryInfo.name}
                  </span>
                </div>
                <h3 className="font-semibold text-foreground text-lg mb-2 group-hover:text-primary transition-colors">
                  {article.title}
                </h3>
                <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                  <span className="flex items-center gap-1">
                    <User className="w-3 h-3" />
                    {article.author}
                  </span>
                  <span className="flex items-center gap-1">
                    <Eye className="w-3 h-3" />
                    {article.views}
                  </span>
                </div>
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {article.content.replace(/<[^>]*>/g, "").slice(0, 120)}...
                </p>
              </div>
              <div className="px-5 py-3 bg-muted/30 border-t border-border flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  Atualizado em{" "}
                  {new Date(article.updatedAt).toLocaleDateString("pt-PT")}
                </span>
                <div className="flex gap-1">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleEditArticle(article);
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-destructive hover:text-destructive"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteArticle(article.id);
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {filteredArticles.length === 0 && (
        <div className="text-center py-12">
          <FileText className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-foreground mb-2">
            Nenhum artigo encontrado
          </h3>
          <p className="text-muted-foreground mb-4">
            Tente ajustar os filtros ou crie um novo artigo.
          </p>
          <Button onClick={() => setIsNewArticleDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Criar Artigo
          </Button>
        </div>
      )}
    </div>
  );
}
