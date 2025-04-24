import React, { useState, useEffect, useMemo } from "react";
import { Helmet } from "react-helmet-async";
import { Pencil, Check, X, User, Mail, Phone, Tag, Filter, MessageSquare, FileText, CalendarPlus, CheckCircle } from "lucide-react";
import { ClientFilters } from "@/components/clients/ClientFilters";
import { FaWhatsapp } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { useLoading } from "@/contexts/LoadingContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

// Constantes de estilo para campos de edição mais sutis
const subtleEditingStyles = {
  input: {
    boxShadow: "none",
    border: '1px solid #e5e7eb',
    outline: "none",
    ringColor: 'transparent',
    ringOffset: '0'
  },
  select: {
    boxShadow: "none",
    border: '1px solid #e5e7eb',
    outline: "none",
    ringColor: 'transparent',
    ringOffset: '0'
  }
};

// Schema do formulário de cliente
const clientFormSchema = z.object({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  source: z.string().optional().nullable(),
  status: z.string().optional().default("lead"),
  propertyId: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

export default function Clients() {
  const { setIsLoading: setLoading } = useLoading();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Estados para gerenciamento de clientes
  const [isAddClientOpen, setIsAddClientOpen] = useState(false);
  const [clientToDelete, setClientToDelete] = useState<any | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [openClientId, setOpenClientId] = useState<number | null>(null);
  const [activeTab, setActiveTab] = useState<{[clientId: number]: string}>({});

  // Estados para filtros de pesquisa
  const [searchTerm, setSearchTerm] = useState('');
  const [sourceFilter, setSourceFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  
  // Busca os clientes (leads) do sistema
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery<any[]>({
    queryKey: ["/api/leads"],
    retry: 1,
  });
  
  // Busca os imóveis disponíveis para associar ao cliente
  const { data: properties = [], isLoading: isLoadingProperties } = useQuery<any[]>({
    queryKey: ["/api/properties"],
    retry: 1,
  });
  
  // Atualiza o estado de carregamento baseado na consulta
  useEffect(() => {
    setLoading(isLoadingClients);
    return () => setLoading(false);
  }, [isLoadingClients, setLoading]);

  // Configuração do formulário de clientes
  const clientForm = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      source: "manual",
      status: "lead",
      notes: "",
    }
  });
  
  // Filtra os clientes com base nos filtros selecionados
  const filteredClients = useMemo(() => {
    return clients.filter((client: any) => {
      // Filtro de texto (nome, email, telefone)
      const matchesSearch = searchTerm === '' || 
        (client.name && client.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (client.phone && client.phone.toLowerCase().includes(searchTerm.toLowerCase()));
      
      // Filtro de fonte
      const matchesSource = sourceFilter === 'all' || client.source === sourceFilter;
      
      // Filtro de status
      const matchesStatus = statusFilter === 'all' || client.status === statusFilter;
      
      return matchesSearch && matchesSource && matchesStatus;
    });
  }, [clients, searchTerm, sourceFilter, statusFilter]);
  
  // Mutação para adicionar um novo cliente
  const addClientMutation = useMutation({
    mutationFn: async (data: ClientFormValues) => {
      return await apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      toast({
        title: "Cliente adicionado com sucesso",
        description: "O novo cliente foi cadastrado no sistema.",
      });
      setIsAddClientOpen(false);
      clientForm.reset();
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao adicionar cliente",
        description: "Ocorreu um erro ao cadastrar o cliente. Tente novamente.",
      });
    }
  });
  
  // Handler para submissão do formulário de novo cliente
  const handleAddClient = (data: ClientFormValues) => {
    addClientMutation.mutate(data);
  };
  
  // Mutação para excluir um cliente
  const deleteClientMutation = useMutation({
    mutationFn: async (clientId: number) => {
      return await apiRequest(`/api/leads/${clientId}`, {
        method: 'DELETE'
      });
    },
    onSuccess: () => {
      toast({
        title: "Cliente excluído com sucesso",
        description: "O cliente foi removido do sistema.",
      });
      setIsDeleteConfirmOpen(false);
      setClientToDelete(null);
      queryClient.invalidateQueries({ queryKey: ["/api/leads"] });
    },
    onError: (error) => {
      toast({
        variant: "destructive",
        title: "Erro ao excluir cliente",
        description: "Ocorreu um erro ao remover o cliente. Tente novamente.",
      });
    }
  });
  
  // Handler para excluir um cliente
  const handleDeleteClient = () => {
    if (clientToDelete) {
      deleteClientMutation.mutate(clientToDelete.id);
    }
  };

  // Abre o diálogo de detalhes do cliente
  const openClientDetails = (client: any) => {
    setOpenClientId(client.id);
    setActiveTab({ ...activeTab, [client.id]: "info" });
  };

  // Fecha o diálogo de detalhes do cliente
  const closeClientDetails = () => {
    setOpenClientId(null);
  };

  return (
    <div className="py-6 px-6 space-y-6">
      <Helmet>
        <title>Gestão de Clientes | Zimob</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de clientes, prospecção e atendimento</p>
        </div>
        
        <div className="flex gap-2">
          <Button 
            onClick={() => setIsAddClientOpen(true)}
            className="bg-[#15616D] hover:bg-[#124C56]"
          >
            <User className="mr-2 h-4 w-4" />
            Adicionar Cliente
          </Button>
        </div>
      </div>

      {/* Filtros de clientes */}
      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        sourceFilter={sourceFilter}
        setSourceFilter={setSourceFilter}
        statusFilter={statusFilter}
        setStatusFilter={setStatusFilter}
        filteredClientsCount={filteredClients.length}
      />

      {/* Lista de clientes */}
      {clientsError ? (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Erro ao carregar clientes</AlertTitle>
          <AlertDescription>
            Não foi possível carregar a lista de clientes. Tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      ) : (
        <Card>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50 hover:bg-muted">
                    <TableHead className="font-medium">Nome</TableHead>
                    <TableHead className="font-medium">Email</TableHead>
                    <TableHead className="font-medium">Telefone</TableHead>
                    <TableHead className="font-medium">Fonte</TableHead>
                    <TableHead className="font-medium">Status</TableHead>
                    <TableHead className="font-medium text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredClients.length > 0 ? (
                    filteredClients.map((client: any) => (
                      <TableRow key={client.id} className="hover:bg-muted/30">
                        <TableCell className="font-medium">{client.name}</TableCell>
                        <TableCell>{client.email || "—"}</TableCell>
                        <TableCell>{client.phone || client.whatsapp || "—"}</TableCell>
                        <TableCell>
                          <div className="flex items-center">
                            {client.source === "whatsapp" && (
                              <><FaWhatsapp className="text-green-500 mr-1.5" /> WhatsApp</>
                            )}
                            {client.source === "contact-form" && (
                              <><MessageSquare className="text-blue-500 mr-1.5 h-4 w-4" /> Formulário de Contato</>
                            )}
                            {client.source === "property-contact-form" && (
                              <><MessageSquare className="text-blue-500 mr-1.5 h-4 w-4" /> Formulário de Imóvel</>
                            )}
                            {!client.source && (
                              <><User className="text-gray-500 mr-1.5 h-4 w-4" /> Manual</>
                            )}
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium 
                            ${client.status === 'active' 
                              ? 'bg-green-100 text-green-800' 
                              : client.status === 'lead' 
                                ? 'bg-blue-100 text-blue-800' 
                                : 'bg-gray-100 text-gray-800'
                            }`}>
                            {client.status === "active" && "Ativo"}
                            {client.status === "lead" && "Lead"}
                            {client.status === "inactive" && "Inativo"}
                            {!client.status && "Novo"}
                          </div>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => openClientDetails(client)}
                              className="h-8 w-8 p-0 text-blue-600"
                            >
                              <span className="sr-only">Ver detalhes</span>
                              <User className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              className="h-8 w-8 p-0 text-red-600"
                              onClick={() => {
                                setClientToDelete(client);
                                setIsDeleteConfirmOpen(true);
                              }}
                            >
                              <span className="sr-only">Excluir</span>
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        Nenhum cliente encontrado com os filtros selecionados.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Diálogo para adicionar novo cliente */}
      <Dialog open={isAddClientOpen} onOpenChange={setIsAddClientOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Cliente</DialogTitle>
            <DialogDescription>
              Preencha os dados abaixo para cadastrar um novo cliente no sistema.
            </DialogDescription>
          </DialogHeader>
          
          <Form {...clientForm}>
            <form onSubmit={clientForm.handleSubmit(handleAddClient)} className="space-y-4">
              <FormField
                control={clientForm.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome*</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do cliente" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={clientForm.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input placeholder="Email do cliente" {...field} value={field.value || ''} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={clientForm.control}
                  name="phone"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 0000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="whatsapp"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>WhatsApp</FormLabel>
                      <FormControl>
                        <Input placeholder="(00) 00000-0000" {...field} value={field.value || ''} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={clientForm.control}
                  name="source"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Fonte</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'manual'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="manual">Cadastro manual</SelectItem>
                          <SelectItem value="website">Website</SelectItem>
                          <SelectItem value="whatsapp">WhatsApp</SelectItem>
                          <SelectItem value="property-contact-form">Formulário de Imóvel</SelectItem>
                          <SelectItem value="indicacao">Indicação</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={clientForm.control}
                  name="status"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Status</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || 'lead'}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="lead">Lead</SelectItem>
                          <SelectItem value="active">Ativo</SelectItem>
                          <SelectItem value="inactive">Inativo</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              {/* Campo de Imóvel de interesse */}
              <FormField
                control={clientForm.control}
                name="propertyId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Imóvel de interesse</FormLabel>
                    <Select 
                      onValueChange={(value) => {
                        if (value === 'none') {
                          field.onChange(null);
                        } else {
                          field.onChange(parseInt(value));
                        }
                      }} 
                      value={field.value?.toString() || 'none'}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione um imóvel (opcional)" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">Nenhum imóvel selecionado</SelectItem>
                        {properties.map((property) => (
                          <SelectItem key={property.id} value={property.id.toString()}>
                            {property.title} - {property.neighborhood}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={clientForm.control}
                name="notes"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Observações</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Observações sobre o cliente..." 
                        className="resize-none min-h-[80px]"
                        {...field}
                        value={field.value || ''}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end gap-2 pt-4">
                <Button type="button" variant="outline" onClick={() => setIsAddClientOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-[#15616D] hover:bg-[#124C56]">
                  Adicionar Cliente
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Diálogo de confirmação para exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Confirmar Exclusão</DialogTitle>
            <DialogDescription>
              Tem certeza que deseja excluir o cliente {clientToDelete?.name}? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end gap-2 pt-4">
            <Button variant="outline" onClick={() => setIsDeleteConfirmOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDeleteClient}>
              Excluir
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}