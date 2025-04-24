import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { 
  Loader2, Phone, Mail, MapPin, Calendar, User, Edit, Trash, Save, X, 
  Home, CreditCard, BadgeCheck, UserCheck, FilePen, Target, History
} from 'lucide-react';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
// Removida importação de Avatar

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

interface ClientDetailsProps {
  client: Client;
  onDelete: (id: number) => void;
}

export default function ClientDetails({ client, onDelete }: ClientDetailsProps) {
  const queryClient = useQueryClient();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: client.name,
    email: client.email,
    phone: client.phone,
    whatsapp: client.whatsapp,
    address: client.address,
    city: client.city,
    neighborhood: client.neighborhood,
    zipCode: client.zipCode,
    document: client.document,
    type: client.type,
    interestType: client.interestType,
    budget: client.budget,
    notes: client.notes,
    status: client.status,
    agentId: client.agentId,
  });

  // Consulta para buscar os agentes (corretores)
  const { data: agents } = useQuery({
    queryKey: ['/api/agents'],
  });

  // Mutação para atualizar o cliente
  const updateClientMutation = useMutation({
    mutationFn: (data: any) => {
      return apiRequest(`/api/clients/${client.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Cliente atualizado com sucesso',
        variant: 'default',
      });
      setIsEditing(false);
      queryClient.invalidateQueries({ queryKey: ['/api/clients'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao atualizar cliente',
        description: error instanceof Error ? error.message : 'Ocorreu um erro desconhecido',
        variant: 'destructive',
      });
    },
  });

  // Handler para mudanças nos campos
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  // Handler para campos de seleção
  const handleSelectChange = (name: string, value: string) => {
    if (name === 'interestType' && value === 'none') {
      setFormData((prev) => ({ ...prev, [name]: null }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  // Handler para número (budget)
  const handleNumberChange = (name: string, value: string) => {
    setFormData((prev) => ({ ...prev, [name]: value ? parseInt(value, 10) : null }));
  };

  // Handler para agente (ID)
  const handleAgentChange = (value: string) => {
    setFormData((prev) => ({ ...prev, agentId: value && value !== 'none' ? parseInt(value, 10) : null }));
  };

  // Enviar o formulário
  const handleSubmit = () => {
    updateClientMutation.mutate(formData);
  };

  // Cancelar edição
  const handleCancel = () => {
    setFormData({
      name: client.name,
      email: client.email,
      phone: client.phone,
      whatsapp: client.whatsapp,
      address: client.address,
      city: client.city,
      neighborhood: client.neighborhood,
      zipCode: client.zipCode,
      document: client.document,
      type: client.type,
      interestType: client.interestType,
      budget: client.budget,
      notes: client.notes,
      status: client.status,
      agentId: client.agentId,
    });
    setIsEditing(false);
  };

  // Formatar data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
    });
  };

  // Obter iniciais para o avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  return (
    <div className="space-y-6">
      {/* Header Card com informações principais */}
      <Card className="border-none shadow-none bg-gradient-to-r from-slate-50 to-white">
        <CardContent className="p-4 sm:p-6">
          <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
            <div className="flex-shrink-0">
              <div className="h-16 w-16 md:h-20 md:w-20 rounded-md bg-gradient-to-br from-[#12636C] to-[#0a4147] flex items-center justify-center text-white font-bold text-xl">
                {getInitials(client.name)}
              </div>
            </div>
            
            <div className="flex-grow">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-2">
                <div>
                  <h3 className="text-lg md:text-xl font-bold tracking-tight">{client.name}</h3>
                  <div className="flex flex-col sm:flex-row items-start sm:items-center gap-2 text-sm text-muted-foreground mt-1">
                    {client.email && (
                      <div className="flex items-center gap-1">
                        <Mail className="h-3.5 w-3.5" />
                        <span className="text-xs sm:text-sm overflow-hidden text-ellipsis">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-1 sm:ml-3">
                        <Phone className="h-3.5 w-3.5" />
                        <span className="text-xs sm:text-sm">{client.phone}</span>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex mt-2 sm:mt-0 space-x-2">
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'} className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full text-xs">
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                  <Badge variant="outline" className="px-2 sm:px-3 py-0.5 sm:py-1 rounded-full bg-slate-50 text-xs">
                    {client.type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                  </Badge>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 sm:gap-4 mt-3">
                <div className="flex items-center gap-2 text-xs sm:text-sm">
                  <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                    <Calendar className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                  </div>
                  <div>
                    <p className="text-xs text-muted-foreground">Cliente desde</p>
                    <p className="font-medium">{formatDate(client.createdAt)}</p>
                  </div>
                </div>
                
                {client.interestType && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Target className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Interesse</p>
                      <p className="font-medium">
                        {client.interestType === 'purchase' && 'Compra'}
                        {client.interestType === 'rent' && 'Aluguel'}
                        {client.interestType === 'sell' && 'Venda'}
                      </p>
                    </div>
                  </div>
                )}
                
                {client.budget && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <CreditCard className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Orçamento</p>
                      <p className="font-medium">R$ {client.budget.toLocaleString('pt-BR')}</p>
                    </div>
                  </div>
                )}
                
                {client.city && (
                  <div className="flex items-center gap-2 text-xs sm:text-sm">
                    <div className="h-7 w-7 sm:h-8 sm:w-8 rounded-full bg-primary/10 flex items-center justify-center">
                      <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Cidade</p>
                      <p className="font-medium">{client.city}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Tabs de conteúdo */}
      <Tabs defaultValue="info" className="mt-2">
        <TabsList className="w-full bg-background border border-slate-200 rounded-lg p-1">
          <TabsTrigger value="info" className="rounded-md text-xs sm:text-sm">
            <UserCheck className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Informações</span>
            <span className="xs:hidden">Info</span>
          </TabsTrigger>
          <TabsTrigger value="contact" className="rounded-md text-xs sm:text-sm">
            <Mail className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Contato e Endereço</span>
            <span className="xs:hidden">Contato</span>
          </TabsTrigger>
          <TabsTrigger value="notes" className="rounded-md text-xs sm:text-sm">
            <FilePen className="h-3.5 w-3.5 sm:h-4 sm:w-4 mr-1 sm:mr-2" />
            <span className="hidden xs:inline">Observações</span>
            <span className="xs:hidden">Notas</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="mt-4">
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base sm:text-lg">Dados Principais</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Informações pessoais e comerciais</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="name" className="text-sm font-medium text-muted-foreground">Nome Completo</Label>
                  {isEditing ? (
                    <Input
                      id="name"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <User className="h-4 w-4 text-primary" />
                      <span className="font-medium">{client.name}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="document" className="text-sm font-medium text-muted-foreground">CPF/CNPJ</Label>
                  {isEditing ? (
                    <Input
                      id="document"
                      name="document"
                      value={formData.document || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <span>{client.document || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="type" className="text-sm font-medium text-muted-foreground">Tipo de Cliente</Label>
                  {isEditing ? (
                    <Select
                      value={formData.type}
                      onValueChange={(value) => handleSelectChange('type', value)}
                    >
                      <SelectTrigger id="type" className="mt-1.5">
                        <SelectValue placeholder="Selecione o tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="physical">Pessoa Física</SelectItem>
                        <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="status" className="text-sm font-medium text-muted-foreground">Status</Label>
                  {isEditing ? (
                    <Select
                      value={formData.status}
                      onValueChange={(value) => handleSelectChange('status', value)}
                    >
                      <SelectTrigger id="status" className="mt-1.5">
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="active">Ativo</SelectItem>
                        <SelectItem value="inactive">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                        {client.status === 'active' ? 'Ativo' : 'Inativo'}
                      </Badge>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="interestType" className="text-sm font-medium text-muted-foreground">Tipo de Interesse</Label>
                  {isEditing ? (
                    <Select
                      value={formData.interestType || ''}
                      onValueChange={(value) => handleSelectChange('interestType', value)}
                    >
                      <SelectTrigger id="interestType" className="mt-1.5">
                        <SelectValue placeholder="Selecione o interesse" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        <SelectItem value="purchase">Compra</SelectItem>
                        <SelectItem value="rent">Aluguel</SelectItem>
                        <SelectItem value="sell">Venda</SelectItem>
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.interestType === 'purchase' && 'Compra'}
                      {client.interestType === 'rent' && 'Aluguel'}
                      {client.interestType === 'sell' && 'Venda'}
                      {!client.interestType && 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="budget" className="text-sm font-medium text-muted-foreground">Orçamento</Label>
                  {isEditing ? (
                    <Input
                      id="budget"
                      type="number"
                      name="budget"
                      value={formData.budget || ''}
                      onChange={(e) => handleNumberChange('budget', e.target.value)}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.budget ? `R$ ${client.budget.toLocaleString('pt-BR')}` : 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="agent" className="text-sm font-medium text-muted-foreground">Corretor Responsável</Label>
                  {isEditing ? (
                    <Select
                      value={formData.agentId?.toString() || ''}
                      onValueChange={handleAgentChange}
                    >
                      <SelectTrigger id="agent" className="mt-1.5">
                        <SelectValue placeholder="Selecione um corretor" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="none">Nenhum</SelectItem>
                        {agents?.map((agent: any) => (
                          <SelectItem key={agent.id} value={agent.id.toString()}>
                            {agent.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.agentId && agents?.find((a: any) => a.id === client.agentId)?.name || 'Não atribuído'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label className="text-sm font-medium text-muted-foreground">Origem do Cliente</Label>
                  <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10 flex items-center">
                    <History className="h-4 w-4 text-primary mr-2" />
                    <Badge variant="outline" className="font-normal">
                      {client.convertedFromLeadId 
                        ? `Convertido de Lead #${client.convertedFromLeadId}` 
                        : 'Cadastrado Diretamente'
                      }
                    </Badge>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="contact" className="mt-4">
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base sm:text-lg">Dados de Contato</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Informações de contato e localização</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <div className="space-y-1.5">
                  <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">E-mail</Label>
                  {isEditing ? (
                    <Input
                      id="email"
                      name="email"
                      value={formData.email || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <Mail className="h-4 w-4 text-primary" />
                      <span>{client.email || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">Telefone</Label>
                  {isEditing ? (
                    <Input
                      id="phone"
                      name="phone"
                      value={formData.phone || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <Phone className="h-4 w-4 text-primary" />
                      <span>{client.phone || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="whatsapp" className="text-sm font-medium text-muted-foreground">WhatsApp</Label>
                  {isEditing ? (
                    <Input
                      id="whatsapp"
                      name="whatsapp"
                      value={formData.whatsapp || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <svg className="h-4 w-4 text-[#25D366]" xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                        <path d="M3 21l1.65-3.8a9 9 0 1 1 3.4 2.9L3 21" />
                        <path d="M9 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M14 10a.5.5 0 0 0 1 0V9a.5.5 0 0 0-1 0v1Z" />
                        <path d="M8.5 13.5A.5.5 0 0 0 9 14h6a.5.5 0 0 0 .5-.5v0a.5.5 0 0 0-.5-.5H9a.5.5 0 0 0-.5.5v0Z" />
                      </svg>
                      <span>{client.whatsapp || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="col-span-1 md:col-span-2 space-y-1.5">
                  <Label htmlFor="address" className="text-sm font-medium text-muted-foreground">Endereço Completo</Label>
                  {isEditing ? (
                    <Input
                      id="address"
                      name="address"
                      value={formData.address || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="flex items-center gap-2 p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      <MapPin className="h-4 w-4 text-primary" />
                      <span>{client.address || 'Não informado'}</span>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="city" className="text-sm font-medium text-muted-foreground">Cidade</Label>
                  {isEditing ? (
                    <Input
                      id="city"
                      name="city"
                      value={formData.city || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.city || 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="neighborhood" className="text-sm font-medium text-muted-foreground">Bairro</Label>
                  {isEditing ? (
                    <Input
                      id="neighborhood"
                      name="neighborhood"
                      value={formData.neighborhood || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.neighborhood || 'Não informado'}
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <Label htmlFor="zipCode" className="text-sm font-medium text-muted-foreground">CEP</Label>
                  {isEditing ? (
                    <Input
                      id="zipCode"
                      name="zipCode"
                      value={formData.zipCode || ''}
                      onChange={handleChange}
                      className="mt-1.5"
                    />
                  ) : (
                    <div className="p-2 bg-slate-50 rounded-md mt-1.5 min-h-10">
                      {client.zipCode || 'Não informado'}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notes" className="mt-4">
          <Card>
            <CardHeader className="pb-2 px-4 pt-4">
              <CardTitle className="text-base sm:text-lg">Observações</CardTitle>
              <CardDescription className="text-xs sm:text-sm">Anotações e informações adicionais sobre o cliente</CardDescription>
            </CardHeader>
            <CardContent className="px-4 pb-4 pt-0">
              <div className="space-y-1.5">
                {isEditing ? (
                  <Textarea
                    name="notes"
                    value={formData.notes || ''}
                    onChange={handleChange}
                    className="min-h-[150px] sm:min-h-[200px] resize-none text-sm"
                    placeholder="Adicione observações importantes sobre o cliente..."
                  />
                ) : (
                  <div className="p-4 bg-slate-50 rounded-lg min-h-[150px] sm:min-h-[200px] whitespace-pre-wrap text-xs sm:text-sm">
                    {client.notes || 'Nenhuma observação registrada.'}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Separator className="my-4 sm:my-6" />

      {/* Barra de ações */}
      <div className="flex flex-col-reverse sm:flex-row justify-between items-center gap-3">
        <Button
          variant="destructive"
          onClick={() => onDelete(client.id)}
          className="flex items-center gap-2 w-full sm:w-auto"
        >
          <Trash className="h-4 w-4" />
          <span>Excluir Cliente</span>
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              <X className="h-4 w-4" />
              <span>Cancelar</span>
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateClientMutation.isPending}
              className="flex items-center gap-2 flex-1 sm:flex-none"
            >
              {updateClientMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <BadgeCheck className="h-4 w-4" />
              )}
              <span>Salvar Alterações</span>
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 w-full sm:w-auto"
          >
            <Edit className="h-4 w-4" />
            <span>Editar Cliente</span>
          </Button>
        )}
      </div>
    </div>
  );
}