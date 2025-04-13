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

const agentFormSchema = insertUserSchema.extend({
  password: z.string().min(6, "A senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string(),
  avatar: z.string().optional(),
}).refine((data) => data.password === data.confirmPassword, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

type AgentFormValues = z.infer<typeof agentFormSchema>;

export default function Agents() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const { toast } = useToast();
  
  // Fetch agents
  const { data: agents, isLoading } = useQuery<User[]>({
    queryKey: ['/api/agents'],
  });

  // Form for adding/editing agent
  const form = useForm<AgentFormValues>({
    resolver: zodResolver(agentFormSchema),
    defaultValues: {
      username: "",
      password: "",
      confirmPassword: "",
      displayName: "",
      role: "agent",
      phone: "",
      email: "",
      avatar: "",
    },
  });

  // Add agent mutation
  const addAgentMutation = useMutation({
    mutationFn: async (data: AgentFormValues) => {
      const { confirmPassword, ...agentData } = data;
      const response = await apiRequest("POST", "/api/agents", agentData);
      return response.json();
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

  function onSubmit(data: AgentFormValues) {
    addAgentMutation.mutate(data);
  }

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[800px] p-0 overflow-hidden">
          <DialogHeader className="p-6 border-b border-gray-100">
            <DialogTitle className="text-xl font-light text-gray-700">Adicionar Novo Corretor</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Preencha os dados abaixo para cadastrar um novo profissional
            </DialogDescription>
          </DialogHeader>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="p-6">
              <Tabs defaultValue="info" className="w-full">
                <TabsList className="grid grid-cols-2 mb-6">
                  <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                  <TabsTrigger value="photo">Foto e Perfil</TabsTrigger>
                </TabsList>
                
                <TabsContent value="info" className="space-y-5">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                      name="username"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Usuário</FormLabel>
                          <FormControl>
                            <Input placeholder="joaosilva" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
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
                          <FormLabel>Telefone</FormLabel>
                          <FormControl>
                            <Input placeholder="(11) 99999-9999" {...field} value={field.value || ""} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <FormField
                      control={form.control}
                      name="password"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="confirmPassword"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Confirmar Senha</FormLabel>
                          <FormControl>
                            <Input type="password" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  <FormField
                    control={form.control}
                    name="role"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Função</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a função" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="agent">Corretor</SelectItem>
                            <SelectItem value="admin">Administrador</SelectItem>
                          </SelectContent>
                        </Select>
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
                        <FormLabel className="text-center mb-4 text-gray-700">Foto do Perfil</FormLabel>
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
                  <p className="text-sm text-gray-500 max-w-md text-center mt-6">
                    Adicione uma foto profissional do corretor. Fotos de perfil ajudam a criar confiança com os clientes.
                  </p>
                </TabsContent>
              </Tabs>
              
              <div className="flex justify-end space-x-3 border-t border-gray-100 pt-5 mt-8">
                <Button 
                  variant="outline" 
                  type="button" 
                  onClick={() => setIsAddDialogOpen(false)}
                  className="rounded-full px-5"
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  disabled={addAgentMutation.isPending}
                  className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5"
                >
                  {addAgentMutation.isPending ? (
                    <>
                      <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                      Salvando...
                    </>
                  ) : "Salvar Corretor"}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={() => setIsAddDialogOpen(true)}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5">
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
                        <Avatar className="h-8 w-8">
                          <AvatarImage src={agent.avatar || ''} alt={agent.displayName} />
                          <AvatarFallback className="bg-gray-100 text-gray-500 text-xs">
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
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-gray-100">
                        <i className="ri-edit-line text-gray-500"></i>
                      </Button>
                      <Button variant="ghost" size="sm" className="h-8 w-8 p-0 rounded-full hover:bg-red-50">
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
              className="mt-2 bg-indigo-600 hover:bg-indigo-700 rounded-full px-6" 
              onClick={() => setIsAddDialogOpen(true)}
            >
              <i className="ri-add-line mr-1"></i> Adicionar Primeiro Corretor
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
