import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertUserSchema, type User } from "@shared/schema";
import { apiRequest } from "@/lib/queryClient";
import { ImageUpload } from "@/components/ui/image-upload";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
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

const agentFormSchema = z.object({
  displayName: z.string().min(2, "O nome deve ter pelo menos 2 caracteres"),
  email: z.string().email("Email inválido"),
  phone: z.string().min(8, "O número de WhatsApp deve ter pelo menos 8 caracteres"),
  avatar: z.string().optional(),
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function Agents() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<User | null>(null);
  const { toast } = useToast();
  
  // Fetch agents
  const { data: agents, isLoading } = useQuery<User[]>({
    queryKey: ['/api/agents'],
  });

  // Form for adding/editing agent
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      displayName: "",
      phone: "",
      email: "",
      avatar: "",
    },
  });

  // Initialize edit form with agent data
  const initEditForm = (agent: User) => {
    setSelectedAgent(agent);
    form.reset({
      displayName: agent.displayName || "",
      phone: agent.phone || "",
      email: agent.email || "",
      avatar: agent.avatar || "",
    });
    setIsEditDialogOpen(true);
  };

  // Handle adding a new agent
  const handleAddClick = () => {
    // Reset form to default values
    form.reset({
      displayName: "",
      phone: "",
      email: "",
      avatar: "",
    });
    setIsAddDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (agent: User) => {
    initEditForm(agent);
  };

  // Handle delete button click
  const handleDeleteClick = (agent: User) => {
    setSelectedAgent(agent);
    setIsDeleteAlertOpen(true);
  };

  // Add agent mutation
  const addAgentMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      // Gera um usuário automático com base no nome
      const agentData = {
        ...data,
        username: data.displayName.toLowerCase().replace(/\s+/g, '.') + Date.now(),
        password: 'password123', // Senha padrão para o primeiro acesso
        role: 'agent'
      };
      
      return apiRequest("/api/agents", {
        method: "POST",
        body: JSON.stringify(agentData)
      });
    },
    onSuccess: () => {
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Corretor adicionado",
        description: "O corretor foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar corretor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update agent mutation
  const updateAgentMutation = useMutation({
    mutationFn: async (data: AgentFormValues & { id: number }) => {
      const { id, ...agentData } = data;
      
      return apiRequest(`/api/agents/${id}`, {
        method: "PATCH",
        body: JSON.stringify(agentData)
      });
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedAgent(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Corretor atualizado",
        description: "As informações do corretor foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar corretor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete agent mutation
  const deleteAgentMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/agents/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      setIsDeleteAlertOpen(false);
      setSelectedAgent(null);
      queryClient.invalidateQueries({ queryKey: ['/api/agents'] });
      toast({
        title: "Corretor excluído",
        description: "O corretor foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir corretor",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: AgentFormValues) {
    if (selectedAgent && isEditDialogOpen) {
      // Update existing agent
      updateAgentMutation.mutate({
        ...data,
        id: selectedAgent.id
      });
    } else {
      // Add new agent
      addAgentMutation.mutate(data);
    }
  }

  function handleDeleteConfirm() {
    if (selectedAgent) {
      deleteAgentMutation.mutate(selectedAgent.id);
    }
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-light text-gray-700">Adicionar Novo Corretor</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Preencha os dados abaixo para cadastrar um novo profissional
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 sticky top-0">
                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="photo">Foto e Perfil</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="joao@exemplo.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="photo" className="flex flex-col items-center justify-center py-4">
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem className="w-full flex flex-col items-center">
                          <FormLabel className="text-center mb-2 text-gray-700">Foto do Perfil</FormLabel>
                          <FormControl>
                            <ImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={addAgentMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-gray-500 max-w-md text-center mt-4">
                      Adicione uma foto profissional do corretor. Fotos de perfil ajudam a criar confiança com os clientes.
                    </p>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
          <div className="flex justify-end space-x-3 border-t border-gray-100 p-4 sticky bottom-0 bg-white z-10">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-full px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={addAgentMutation.isPending}
              className="bg-[#15616D] hover:bg-[#15616D]/90 rounded-full px-5"
            >
              {addAgentMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Salvando...
                </>
              ) : "Salvar Corretor"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={handleAddClick}
            className="bg-[#15616D] hover:bg-[#15616D]/90 rounded-full px-5">
            <i className="ri-add-line mr-1"></i> Adicionar Corretor
          </Button>
          <div className="flex space-x-4 items-center">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Buscar por nome"
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : agents && agents.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <Table className="min-w-full divide-y divide-gray-100">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Nome</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Email</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Telefone</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Função</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-100">
                {agents.map((agent) => (
                  <TableRow key={agent.id} className="hover:bg-gray-50 transition-colors">
                    <TableCell>
                      <div className="flex items-center space-x-3">
                        <Avatar className="h-10 w-10 border border-gray-200">
                          <AvatarImage 
                            src={agent.avatar || ''} 
                            alt={agent.displayName} 
                            className="object-cover"
                          />
                          <AvatarFallback className="bg-gray-100 text-gray-500 text-xs font-medium">
                            {agent.displayName?.split(' ').map(name => name[0]).join('').substring(0, 2).toUpperCase()}
                          </AvatarFallback>
                        </Avatar>
                        <span className="font-medium text-gray-700">{agent.displayName}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-gray-600">{agent.email}</TableCell>
                    <TableCell className="text-gray-600">{agent.phone || "—"}</TableCell>
                    <TableCell>
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        agent.role === "admin" ? "bg-purple-100 text-purple-800" : "bg-blue-100 text-blue-800"
                      }`}>
                        {agent.role === "admin" ? "Administrador" : "Corretor"}
                      </span>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full hover:bg-gray-100"
                        onClick={() => handleEditClick(agent)}
                      >
                        <i className="ri-edit-line text-gray-500"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 rounded-full hover:bg-red-50"
                        onClick={() => handleDeleteClick(agent)}
                      >
                        <i className="ri-delete-bin-line text-red-500"></i>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
            <div className="w-16 h-16 mx-auto mb-4 bg-gray-100 rounded-full flex items-center justify-center">
              <i className="ri-user-add-line text-gray-400 text-2xl"></i>
            </div>
            <h3 className="text-lg font-medium text-gray-700 mb-2">Nenhum corretor cadastrado</h3>
            <p className="text-gray-500 max-w-md mx-auto mb-6">
              Cadastre os corretores que fazem parte da sua equipe para gerenciar suas atividades e imóveis.
            </p>
            <Button 
              className="mt-2 bg-[#15616D] hover:bg-[#15616D]/90 rounded-full px-6" 
              onClick={handleAddClick}
            >
              <i className="ri-add-line mr-1"></i> Adicionar Primeiro Corretor
            </Button>
          </div>
        )}
      </div>

      {/* Edit Agent Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-light text-gray-700">Editar Corretor</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Altere as informações do corretor conforme necessário
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid grid-cols-2 mb-4 sticky top-0">
                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="photo">Foto e Perfil</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="displayName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome Completo</FormLabel>
                          <FormControl>
                            <Input placeholder="João Silva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email</FormLabel>
                          <FormControl>
                            <Input type="email" placeholder="joao@exemplo.com" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>WhatsApp</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="photo" className="flex flex-col items-center justify-center py-4">
                    <FormField
                      control={form.control}
                      name="avatar"
                      render={({ field }) => (
                        <FormItem className="w-full flex flex-col items-center">
                          <FormLabel className="text-center mb-2 text-gray-700">Foto do Perfil</FormLabel>
                          <FormControl>
                            <ImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={updateAgentMutation.isPending}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <p className="text-xs text-gray-500 max-w-md text-center mt-4">
                      Adicione uma foto profissional do corretor. Fotos de perfil ajudam a criar confiança com os clientes.
                    </p>
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
          <div className="flex justify-end space-x-3 border-t border-gray-100 p-4 sticky bottom-0 bg-white z-10">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-full px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={updateAgentMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5"
            >
              {updateAgentMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Salvando...
                </>
              ) : "Salvar Alterações"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent className="max-w-[400px]">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-800">
              Confirmar exclusão
            </AlertDialogTitle>
            <AlertDialogDescription className="text-gray-600">
              Você realmente deseja excluir o corretor {selectedAgent?.displayName}? 
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className="mt-6">
            <AlertDialogCancel 
              className="rounded-full"
              disabled={deleteAgentMutation.isPending}
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction 
              className="bg-red-600 hover:bg-red-700 rounded-full"
              onClick={handleDeleteConfirm}
              disabled={deleteAgentMutation.isPending}
            >
              {deleteAgentMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Excluindo...
                </>
              ) : "Excluir Corretor"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
