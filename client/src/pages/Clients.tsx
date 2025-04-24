import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { Loader2, Search, UserPlus, AlertCircle, CheckCircle, User, Phone, Mail, MapPin, CreditCard, Trash2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { apiRequest } from '@/lib/queryClient';
import ClientFilters from '@/components/clients/ClientFilters';
import ClientDetails from '@/components/clients/ClientDetails';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';

// Schema para o formulário de cliente
const clientFormSchema = z.object({
  name: z.string().min(3, { message: 'O nome deve ter pelo menos 3 caracteres' }),
  email: z.string().email({ message: 'E-mail inválido' }).optional().nullable(),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  address: z.string().optional().nullable(),
  city: z.string().optional().nullable(),
  neighborhood: z.string().optional().nullable(),
  zipCode: z.string().optional().nullable(),
  document: z.string().optional().nullable(),
  type: z.string().default('physical'),
  interestType: z.string().optional().nullable(),
  budget: z.number().optional().nullable(),
  notes: z.string().optional().nullable(),
  status: z.string().default('active'),
  agentId: z.number().optional().nullable(),
});

type ClientFormValues = z.infer<typeof clientFormSchema>;

// Interface para o tipo Client
interface Client {
  id: number;
  name: string;
  email: string | null;
  phone: string | null;
  whatsapp: string | null;
  address: string | null;
  city: string | null;
  neighborhood: string | null;
  zipCode: string | null;
  document: string | null;
  type: string;
  interestType: string | null;
  budget: number | null;
  notes: string | null;
  convertedFromLeadId: number | null;
  agentId: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function Clients() {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [openCreateDialog, setOpenCreateDialog] = useState<boolean>(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [openDetailsDialog, setOpenDetailsDialog] = useState<boolean>(false);
  const [activeStatus, setActiveStatus] = useState<string>('all');
  const [activeOrigin, setActiveOrigin] = useState<string>('all');

  // Formulário para criar um novo cliente
  const form = useForm<ClientFormValues>({
    resolver: zodResolver(clientFormSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      whatsapp: '',
      address: '',
      city: '',
      neighborhood: '',
      zipCode: '',
      document: '',
      type: 'physical',
      interestType: '',
      budget: null,
      notes: '',
      status: 'active',
      agentId: null,
    },
  });

  // Consulta para buscar todos os clientes
  const { data: clients, isLoading } = useQuery({
    queryKey: ['/api/clients'],
    select: (data: Client[]) => {
      // Filtrar os clientes baseado nos filtros ativos
      return data.filter((client) => {
        const matchesSearch = 
          searchTerm === '' || 
          client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          (client.email && client.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
          (client.phone && client.phone.includes(searchTerm));
          
        const matchesStatus = 
          activeStatus === 'all' || 
          client.status === activeStatus;
          
        const matchesOrigin = 
          activeOrigin === 'all' || 
          (activeOrigin === 'leads' && client.convertedFromLeadId !== null) ||
          (activeOrigin === 'direct' && client.convertedFromLeadId === null);
          
        return matchesSearch && matchesStatus && matchesOrigin;
      });
    },
  });

  // Consulta para buscar os agentes (corretores)
  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  // Mutação para criar um novo cliente
  const createClientMutation = useMutation({
    mutationFn: (data: ClientFormValues) => {
      return apiRequest('/api/clients', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cliente criado com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setOpenCreateDialog(false);
      form.reset();
    },
    onError: (error) => {
      toast({
        title: 'Erro ao criar cliente',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  // Mutação para excluir um cliente
  const deleteClientMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/clients/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cliente excluído com sucesso',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
      setSelectedClient(null);
      setOpenDetailsDialog(false);
    },
    onError: (error) => {
      toast({
        title: 'Erro ao excluir cliente',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  // Função para abrir o dialog de detalhes do cliente
  const handleViewClient = (client: Client) => {
    setSelectedClient(client);
    setOpenDetailsDialog(true);
  };

  // Função para lidar com a submissão do formulário
  function onSubmit(values: ClientFormValues) {
    createClientMutation.mutate(values);
  }

  return (
    <div className="container mx-auto py-6">
      <div className="bg-white p-6 rounded-lg shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Gerenciamento de Clientes</h2>
            <p className="text-sm text-gray-500">Cadastre e gerencie seus clientes e informações de contato.</p>
          </div>

          <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
            <DialogTrigger asChild>
              <Button 
                variant="default" 
                className="bg-[#12636C] hover:bg-[#12636C]/90 rounded-full px-5"
              >
                <UserPlus className="mr-2 h-4 w-4" /> Novo Cliente
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto" style={{ 
              fontFamily: 'Montserrat, sans-serif',
              scrollbarWidth: 'thin',
              scrollbarColor: 'rgba(155, 155, 155, 0.5) transparent'
            }}>
              <DialogHeader>
                <DialogTitle>Adicionar Novo Cliente</DialogTitle>
                <DialogDescription>
                  Preencha as informações do novo cliente para cadastrá-lo no sistema.
                </DialogDescription>
              </DialogHeader>

              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
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
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} value={field.value || ''} />
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
                          <Input placeholder="(00) 0000-0000" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
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

                  <FormField
                    control={form.control}
                    name="type"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="physical">Pessoa Física</SelectItem>
                            <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="document"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>CPF/CNPJ</FormLabel>
                        <FormControl>
                          <Input placeholder="Documento" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Cidade</FormLabel>
                        <FormControl>
                          <Input placeholder="Cidade" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="neighborhood"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Bairro</FormLabel>
                        <FormControl>
                          <Input placeholder="Bairro" {...field} value={field.value || ''} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="interestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Interesse</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value === 'none' ? null : value)} 
                          defaultValue={field.value || 'none'}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o interesse" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            <SelectItem value="purchase">Compra</SelectItem>
                            <SelectItem value="rent">Aluguel</SelectItem>
                            <SelectItem value="sell">Venda</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="budget"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Orçamento</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            placeholder="Valor em R$"
                            {...field}
                            value={field.value || ''}
                            onChange={(e) => {
                              const value = e.target.value ? parseInt(e.target.value, 10) : null;
                              field.onChange(value);
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="agentId"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Responsável</FormLabel>
                        <Select 
                          onValueChange={(value) => field.onChange(value && value !== 'none' ? parseInt(value, 10) : null)} 
                          defaultValue={field.value ? field.value.toString() : 'none'}
                        >
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione um corretor" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {agents?.map((agent: any) => (
                              <SelectItem key={agent.id} value={agent.id.toString()}>
                                {agent.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Informações adicionais sobre o cliente"
                          className="resize-none"
                          {...field}
                          value={field.value || ''}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <DialogFooter>
                  <Button 
                    type="submit" 
                    disabled={createClientMutation.isPending}
                    className="w-full"
                  >
                    {createClientMutation.isPending && (
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    )}
                    Salvar Cliente
                  </Button>
                </DialogFooter>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
      </div>

      <ClientFilters
        searchTerm={searchTerm}
        setSearchTerm={setSearchTerm}
        activeStatus={activeStatus}
        setActiveStatus={setActiveStatus}
        activeOrigin={activeOrigin}
        setActiveOrigin={setActiveOrigin}
      />

      <Card className="mt-6">
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex justify-center items-center h-64">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : clients && clients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Contato</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Data Criação</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {clients.map((client) => (
                  <TableRow key={client.id} className="cursor-pointer hover:bg-muted/50" onClick={() => handleViewClient(client)}>
                    <TableCell className="font-medium">{client.name}</TableCell>
                    <TableCell>
                      {client.email ? (
                        <div className="flex flex-col">
                          <span>{client.email}</span>
                          {client.phone && <span className="text-sm text-gray-500">{client.phone}</span>}
                        </div>
                      ) : (
                        <span>{client.phone || 'Não informado'}</span>
                      )}
                    </TableCell>
                    <TableCell>
                      {client.type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </TableCell>
                    <TableCell>{client.city || 'Não informado'}</TableCell>
                    <TableCell>
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={client.convertedFromLeadId ? 'outline' : 'secondary'}>
                        {client.convertedFromLeadId ? 'Lead Convertido' : 'Cadastro Direto'}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {new Date(client.createdAt).toLocaleDateString('pt-BR')}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="outline" size="sm" onClick={(e) => {
                        e.stopPropagation();
                        handleViewClient(client);
                      }}>
                        Detalhes
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 gap-2">
              <AlertCircle className="h-8 w-8 text-muted-foreground" />
              <h3 className="font-semibold text-lg">Nenhum cliente encontrado</h3>
              <p className="text-muted-foreground text-center max-w-md">
                Não foram encontrados clientes que correspondam aos filtros selecionados. 
                Tente mudar os critérios de busca ou adicione um novo cliente.
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedClient && (
        <Dialog open={openDetailsDialog} onOpenChange={setOpenDetailsDialog}>
          <DialogContent className="max-w-6xl w-[95vw] max-h-[90vh] overflow-hidden p-0 rounded-xl border-none shadow-2xl">
            <div className="flex h-[90vh]">
              {/* Sidebar - Informações principais do cliente */}
              <div className="hidden md:flex md:w-[280px] bg-gradient-to-b from-[#12636C] to-[#0a4147] text-white flex-col">
                <div className="px-6 py-8 flex flex-col items-center text-center border-b border-white/10">
                  <div className="h-20 w-20 rounded-full bg-white/20 flex items-center justify-center mb-4">
                    <User className="h-10 w-10 text-white" />
                  </div>
                  <h2 className="text-xl font-medium mb-1 truncate w-full">{selectedClient.name}</h2>
                  <div className="flex flex-wrap justify-center gap-2 mt-2">
                    <Badge 
                      variant="outline" 
                      className={`px-3 py-1 ${
                        selectedClient.status === 'active' 
                          ? 'bg-emerald-500/30 border-emerald-400 text-white' 
                          : 'bg-gray-500/30 border-gray-400 text-white'
                      }`}
                    >
                      {selectedClient.status === 'active' ? 'Ativo' : 'Inativo'}
                    </Badge>
                    {selectedClient.interestType && (
                      <Badge 
                        variant="outline" 
                        className="px-3 py-1 bg-blue-500/30 border-blue-400 text-white"
                      >
                        {selectedClient.interestType === 'purchase' ? 'Compra' : 
                         selectedClient.interestType === 'rent' ? 'Aluguel' : 
                         selectedClient.interestType === 'both' ? 'Compra/Aluguel' : 
                         selectedClient.interestType}
                      </Badge>
                    )}
                  </div>
                </div>
                
                <div className="p-6 flex-1 overflow-y-auto">
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-xs font-semibold uppercase text-white/50 mb-2">Contato</h3>
                      {selectedClient.phone && (
                        <div className="flex items-center mb-3">
                          <Phone className="h-4 w-4 mr-3 text-white/70" />
                          <span className="text-sm">{selectedClient.phone}</span>
                        </div>
                      )}
                      {selectedClient.whatsapp && (
                        <div className="flex items-center mb-3">
                          <div className="h-4 w-4 mr-3 text-white/70 flex items-center justify-center">
                            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                              <path d="M13.601 2.326A7.854 7.854 0 0 0 7.994 0C3.627 0 .068 3.558.064 7.926c0 1.399.366 2.76 1.057 3.965L0 16l4.204-1.102a7.933 7.933 0 0 0 3.79.965h.004c4.368 0 7.926-3.558 7.93-7.93A7.898 7.898 0 0 0 13.6 2.326zM7.994 14.521a6.573 6.573 0 0 1-3.356-.92l-.24-.144-2.494.654.666-2.433-.156-.251a6.56 6.56 0 0 1-1.007-3.505c0-3.626 2.957-6.584 6.591-6.584a6.56 6.56 0 0 1 4.66 1.931 6.557 6.557 0 0 1 1.928 4.66c-.004 3.639-2.961 6.592-6.592 6.592zm3.615-4.934c-.197-.099-1.17-.578-1.353-.646-.182-.065-.315-.099-.445.099-.133.197-.513.646-.627.775-.114.133-.232.148-.43.05-.197-.1-.836-.308-1.592-.985-.59-.525-.985-1.175-1.103-1.372-.114-.198-.011-.304.088-.403.087-.088.197-.232.296-.346.1-.114.133-.198.198-.33.065-.134.034-.248-.015-.347-.05-.099-.445-1.076-.612-1.47-.16-.389-.323-.335-.445-.34-.114-.007-.247-.007-.38-.007a.729.729 0 0 0-.529.247c-.182.198-.691.677-.691 1.654 0 .977.71 1.916.81 2.049.098.133 1.394 2.132 3.383 2.992.47.205.84.326 1.129.418.475.152.904.129 1.246.08.38-.058 1.171-.48 1.338-.943.164-.464.164-.86.114-.943-.049-.084-.182-.133-.38-.232z"/>
                            </svg>
                          </div>
                          <span className="text-sm">{selectedClient.whatsapp}</span>
                        </div>
                      )}
                      {selectedClient.email && (
                        <div className="flex items-center">
                          <Mail className="h-4 w-4 mr-3 text-white/70" />
                          <span className="text-sm">{selectedClient.email}</span>
                        </div>
                      )}
                    </div>
                    
                    {(selectedClient.address || selectedClient.city || selectedClient.neighborhood) && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase text-white/50 mb-2">Localização</h3>
                        <div className="flex">
                          <MapPin className="h-4 w-4 mr-3 text-white/70 flex-shrink-0 mt-0.5" />
                          <div>
                            {selectedClient.address && <div className="text-sm mb-1">{selectedClient.address}</div>}
                            <div className="text-sm text-white/80">
                              {selectedClient.neighborhood && <span>{selectedClient.neighborhood}</span>}
                              {selectedClient.neighborhood && selectedClient.city && <span> - </span>}
                              {selectedClient.city && <span>{selectedClient.city}</span>}
                            </div>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {selectedClient.budget && (
                      <div>
                        <h3 className="text-xs font-semibold uppercase text-white/50 mb-2">Orçamento</h3>
                        <div className="flex items-center">
                          <CreditCard className="h-4 w-4 mr-3 text-white/70" />
                          <span className="text-sm">R$ {selectedClient.budget.toLocaleString('pt-BR')}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="px-6 py-4 border-t border-white/10">
                  <Button 
                    variant="destructive" 
                    className="w-full flex items-center justify-center bg-red-500/10 hover:bg-red-500/20 text-white border-red-400/30"
                    onClick={() => {
                      if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                        deleteClientMutation.mutate(selectedClient.id);
                      }
                    }}
                  >
                    <Trash2 className="h-4 w-4 mr-2" />
                    Excluir Cliente
                  </Button>
                </div>
              </div>
              
              {/* Conteúdo principal */}
              <div className="flex-1 flex flex-col overflow-hidden bg-white">
                {/* Mobile header */}
                <div className="md:hidden bg-[#12636C] text-white p-4 flex justify-between items-center">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full bg-white/20 flex items-center justify-center mr-3">
                      <User className="h-5 w-5 text-white" />
                    </div>
                    <div>
                      <h2 className="text-lg font-medium">{selectedClient.name}</h2>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${
                            selectedClient.status === 'active' 
                              ? 'bg-emerald-500/30 border-emerald-400 text-white' 
                              : 'bg-gray-500/30 border-gray-400 text-white'
                          }`}
                        >
                          {selectedClient.status === 'active' ? 'Ativo' : 'Inativo'}
                        </Badge>
                      </div>
                    </div>
                  </div>
                  <Button 
                    variant="ghost" 
                    className="h-8 w-8 p-0 text-white" 
                    onClick={() => setOpenDetailsDialog(false)}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
                
                {/* Conteúdo das tabs */}
                <div className="flex-1 overflow-y-auto p-6">
                  <ClientDetails 
                    client={selectedClient} 
                    onDelete={(id) => {
                      if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                        deleteClientMutation.mutate(id);
                      }
                    }} 
                  />
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}