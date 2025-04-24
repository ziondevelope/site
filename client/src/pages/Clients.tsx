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
import { Loader2, Search, UserPlus, AlertCircle, CheckCircle } from 'lucide-react';
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
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold">Clientes</h1>
          <p className="text-gray-500">Gerenciar clientes e informações de contato</p>
        </div>

        <Dialog open={openCreateDialog} onOpenChange={setOpenCreateDialog}>
          <DialogTrigger asChild>
            <Button variant="default" className="flex items-center gap-2">
              <UserPlus size={16} />
              Adicionar Cliente
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle>Adicionar Novo Cliente</DialogTitle>
              <DialogDescription>
                Preencha os dados do cliente para adicioná-lo ao sistema.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
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
          <DialogContent className="sm:max-w-[600px]">
            <DialogHeader>
              <DialogTitle className="flex items-center">
                Detalhes do Cliente
                <Badge variant={selectedClient.status === 'active' ? 'default' : 'secondary'} className="ml-2">
                  {selectedClient.status === 'active' ? 'Ativo' : 'Inativo'}
                </Badge>
              </DialogTitle>
            </DialogHeader>
            
            <ClientDetails 
              client={selectedClient} 
              onDelete={(id) => {
                if (window.confirm('Tem certeza que deseja excluir este cliente?')) {
                  deleteClientMutation.mutate(id);
                }
              }} 
            />
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}