import { useState, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogTrigger, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { Trash2, Plus, Upload } from "lucide-react";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Tipo para os depoimentos
interface Testimonial {
  id: number;
  name: string;
  role?: string;
  content: string;
  avatar?: string;
  featured: boolean;
  createdAt: string;
}

export function TestimonialsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newTestimonial, setNewTestimonial] = useState({
    name: "",
    role: "",
    content: "",
    avatar: "",
    featured: false
  });
  
  // Referência para o input de arquivo
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  // Buscar todos os depoimentos
  const { data: testimonials = [], isLoading } = useQuery<Testimonial[]>({
    queryKey: ['/api/testimonials'],
    refetchOnWindowFocus: false,
  });

  // Mutation para adicionar um novo depoimento
  const addTestimonialMutation = useMutation({
    mutationFn: (data: Omit<Testimonial, "id" | "createdAt">) => 
      apiRequest("/api/testimonials", { method: "POST", body: JSON.stringify(data) }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      setIsDialogOpen(false);
      setNewTestimonial({
        name: "",
        role: "",
        content: "",
        avatar: "",
        featured: false
      });
      toast({
        title: "Depoimento adicionado",
        description: "O depoimento foi adicionado com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível adicionar o depoimento.",
        variant: "destructive"
      });
    }
  });

  // Mutation para excluir um depoimento
  const deleteTestimonialMutation = useMutation({
    mutationFn: (id: number) => 
      apiRequest(`/api/testimonials/${id}`, { method: "DELETE" }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/testimonials'] });
      toast({
        title: "Depoimento excluído",
        description: "O depoimento foi excluído com sucesso!"
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o depoimento.",
        variant: "destructive"
      });
    }
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setNewTestimonial(prev => ({ ...prev, [name]: value }));
  };

  const handleSwitchChange = (checked: boolean) => {
    setNewTestimonial(prev => ({ ...prev, featured: checked }));
  };
  
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    
    if (file.size > 2 * 1024 * 1024) { // 2MB limit
      toast({
        title: "Arquivo muito grande",
        description: "O tamanho máximo permitido é 2MB",
        variant: "destructive"
      });
      return;
    }
    
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64String = reader.result as string;
      setPreviewImage(base64String);
      setNewTestimonial(prev => ({ ...prev, avatar: base64String }));
    };
    reader.readAsDataURL(file);
  };
  
  const handleOpenFileDialog = () => {
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTestimonialMutation.mutate(newTestimonial);
    setPreviewImage(null);
  };

  const handleDelete = (id: number) => {
    if (confirm("Tem certeza que deseja excluir este depoimento?")) {
      deleteTestimonialMutation.mutate(id);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-semibold">Depoimentos</h2>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="rounded-full text-indigo-600 bg-indigo-50 hover:bg-indigo-100">
              <Plus className="h-4 w-4 mr-2" /> Adicionar Depoimento
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Adicionar Novo Depoimento</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Nome</Label>
                <Input
                  id="name"
                  name="name"
                  value={newTestimonial.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Nome do cliente"
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="role">Cargo/Função (opcional)</Label>
                <Input
                  id="role"
                  name="role"
                  value={newTestimonial.role}
                  onChange={handleInputChange}
                  placeholder="Ex: Empresário, Médica, etc."
                />
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="content">Depoimento</Label>
                <Textarea
                  id="content"
                  name="content"
                  value={newTestimonial.content}
                  onChange={handleInputChange}
                  required
                  placeholder="Digite o depoimento do cliente"
                  rows={4}
                />
              </div>
              
              <div className="space-y-2">
                <Label>Foto do Cliente (opcional)</Label>
                <div className="mt-1 flex items-center gap-4">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    ref={fileInputRef}
                    onChange={handleImageUpload}
                  />
                  
                  {previewImage ? (
                    <div className="relative">
                      <Avatar className="h-16 w-16">
                        <AvatarImage src={previewImage} alt="Preview" />
                      </Avatar>
                      <Button
                        type="button"
                        variant="destructive"
                        size="icon"
                        className="absolute -top-2 -right-2 h-6 w-6 rounded-full"
                        onClick={() => {
                          setPreviewImage(null);
                          setNewTestimonial(prev => ({ ...prev, avatar: "" }));
                        }}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ) : (
                    <div 
                      className="h-16 w-16 rounded-full border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:border-indigo-500 transition-colors"
                      onClick={handleOpenFileDialog}
                    >
                      <Upload className="h-5 w-5 text-gray-400" />
                    </div>
                  )}
                  
                  <div className="flex-1">
                    <Button
                      type="button"
                      variant="outline"
                      className="w-full"
                      onClick={handleOpenFileDialog}
                    >
                      {previewImage ? "Trocar Imagem" : "Selecionar Imagem"}
                    </Button>
                    <p className="text-xs text-gray-500 mt-1">
                      JPG, PNG ou GIF. Tamanho máximo de 2MB.
                    </p>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="featured"
                  checked={newTestimonial.featured}
                  onCheckedChange={handleSwitchChange}
                />
                <Label htmlFor="featured">Destacado</Label>
              </div>
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white"
                  disabled={addTestimonialMutation.isPending}
                >
                  {addTestimonialMutation.isPending ? "Adicionando..." : "Adicionar"}
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {isLoading ? (
        <div className="text-center py-8">Carregando depoimentos...</div>
      ) : testimonials.length === 0 ? (
        <div className="text-center py-8 text-gray-500">
          Nenhum depoimento adicionado ainda. Adicione seu primeiro depoimento!
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {testimonials.map((testimonial: Testimonial) => (
            <div 
              key={testimonial.id} 
              className={`p-4 rounded-lg border ${testimonial.featured ? 'border-indigo-200 bg-indigo-50' : 'border-gray-200'}`}
            >
              <div className="flex justify-between">
                <div className="flex space-x-3">
                  <Avatar className="h-10 w-10">
                    {testimonial.avatar ? (
                      <AvatarImage 
                        src={testimonial.avatar} 
                        alt={testimonial.name} 
                        style={{ objectFit: 'cover' }}
                      />
                    ) : (
                      <AvatarFallback className="bg-indigo-100 text-indigo-600">
                        {testimonial.name.substring(0, 2).toUpperCase()}
                      </AvatarFallback>
                    )}
                  </Avatar>
                  <div>
                    <h3 className="font-medium">{testimonial.name}</h3>
                    {testimonial.role && <p className="text-sm text-gray-500">{testimonial.role}</p>}
                  </div>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-red-600 hover:text-red-700 hover:bg-red-50"
                  onClick={() => handleDelete(testimonial.id)}
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
              <div className="mt-3">
                <p className="text-gray-700 text-sm">
                  "{testimonial.content}"
                </p>
              </div>
              {testimonial.featured && (
                <div className="mt-2">
                  <span className="inline-flex items-center px-2 py-1 text-xs rounded-full bg-indigo-100 text-indigo-800">
                    Destacado
                  </span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}