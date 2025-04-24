import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { apiRequest } from '@/lib/queryClient';
import { toast } from '@/hooks/use-toast';
import { Loader2, Phone, Mail, MapPin, Calendar, User, Edit, Trash, Save, X } from 'lucide-react';
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

  return (
    <div className="space-y-4">
      <Tabs defaultValue="info">
        <TabsList className="w-full">
          <TabsTrigger value="info" className="flex-1">Informações Gerais</TabsTrigger>
          <TabsTrigger value="contact" className="flex-1">Contato</TabsTrigger>
          <TabsTrigger value="notes" className="flex-1">Observações</TabsTrigger>
        </TabsList>

        <TabsContent value="info" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>Nome</Label>
              {isEditing ? (
                <Input
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <User className="h-4 w-4 text-muted-foreground" />
                  <span>{client.name}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Tipo</Label>
              {isEditing ? (
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleSelectChange('type', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="physical">Pessoa Física</SelectItem>
                    <SelectItem value="legal">Pessoa Jurídica</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md">
                  {client.type === 'physical' ? 'Pessoa Física' : 'Pessoa Jurídica'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>CPF/CNPJ</Label>
              {isEditing ? (
                <Input
                  name="document"
                  value={formData.document || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="p-2 border rounded-md">
                  {client.document || 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Tipo de Interesse</Label>
              {isEditing ? (
                <Select
                  value={formData.interestType || ''}
                  onValueChange={(value) => handleSelectChange('interestType', value)}
                >
                  <SelectTrigger>
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
                <div className="p-2 border rounded-md">
                  {client.interestType === 'purchase' && 'Compra'}
                  {client.interestType === 'rent' && 'Aluguel'}
                  {client.interestType === 'sell' && 'Venda'}
                  {!client.interestType && 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Orçamento</Label>
              {isEditing ? (
                <Input
                  type="number"
                  name="budget"
                  value={formData.budget || ''}
                  onChange={(e) => handleNumberChange('budget', e.target.value)}
                />
              ) : (
                <div className="p-2 border rounded-md">
                  {client.budget ? `R$ ${client.budget.toLocaleString('pt-BR')}` : 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Status</Label>
              {isEditing ? (
                <Select
                  value={formData.status}
                  onValueChange={(value) => handleSelectChange('status', value)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Ativo</SelectItem>
                    <SelectItem value="inactive">Inativo</SelectItem>
                  </SelectContent>
                </Select>
              ) : (
                <div className="p-2 border rounded-md">
                  <Badge variant={client.status === 'active' ? 'default' : 'secondary'}>
                    {client.status === 'active' ? 'Ativo' : 'Inativo'}
                  </Badge>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Responsável</Label>
              {isEditing ? (
                <Select
                  value={formData.agentId?.toString() || ''}
                  onValueChange={handleAgentChange}
                >
                  <SelectTrigger>
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
                <div className="p-2 border rounded-md">
                  {client.agentId && agents?.find((a: any) => a.id === client.agentId)?.name || 'Não atribuído'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Criado em</Label>
              <div className="flex items-center gap-2 p-2 border rounded-md">
                <Calendar className="h-4 w-4 text-muted-foreground" />
                <span>{formatDate(client.createdAt)}</span>
              </div>
            </div>

            <div className="space-y-1">
              <Label>Origem</Label>
              <div className="p-2 border rounded-md">
                <Badge variant="outline">
                  {client.convertedFromLeadId 
                    ? `Convertido de Lead #${client.convertedFromLeadId}` 
                    : 'Cadastrado Diretamente'
                  }
                </Badge>
              </div>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="contact" className="space-y-4 pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1">
              <Label>E-mail</Label>
              {isEditing ? (
                <Input
                  name="email"
                  value={formData.email || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Mail className="h-4 w-4 text-muted-foreground" />
                  <span>{client.email || 'Não informado'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Telefone</Label>
              {isEditing ? (
                <Input
                  name="phone"
                  value={formData.phone || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.phone || 'Não informado'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>WhatsApp</Label>
              {isEditing ? (
                <Input
                  name="whatsapp"
                  value={formData.whatsapp || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <Phone className="h-4 w-4 text-muted-foreground" />
                  <span>{client.whatsapp || 'Não informado'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Endereço</Label>
              {isEditing ? (
                <Input
                  name="address"
                  value={formData.address || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="flex items-center gap-2 p-2 border rounded-md">
                  <MapPin className="h-4 w-4 text-muted-foreground" />
                  <span>{client.address || 'Não informado'}</span>
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Cidade</Label>
              {isEditing ? (
                <Input
                  name="city"
                  value={formData.city || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="p-2 border rounded-md">
                  {client.city || 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>Bairro</Label>
              {isEditing ? (
                <Input
                  name="neighborhood"
                  value={formData.neighborhood || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="p-2 border rounded-md">
                  {client.neighborhood || 'Não informado'}
                </div>
              )}
            </div>

            <div className="space-y-1">
              <Label>CEP</Label>
              {isEditing ? (
                <Input
                  name="zipCode"
                  value={formData.zipCode || ''}
                  onChange={handleChange}
                />
              ) : (
                <div className="p-2 border rounded-md">
                  {client.zipCode || 'Não informado'}
                </div>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="notes" className="space-y-4 pt-4">
          <div className="space-y-1">
            <Label>Observações</Label>
            {isEditing ? (
              <Textarea
                name="notes"
                value={formData.notes || ''}
                onChange={handleChange}
                className="min-h-[150px]"
              />
            ) : (
              <div className="p-4 border rounded-md min-h-[150px] whitespace-pre-wrap">
                {client.notes || 'Nenhuma observação registrada.'}
              </div>
            )}
          </div>
        </TabsContent>
      </Tabs>

      <Separator />

      <div className="flex justify-between items-center">
        <Button
          variant="destructive"
          onClick={() => onDelete(client.id)}
          className="flex items-center gap-2"
        >
          <Trash className="h-4 w-4" />
          Excluir Cliente
        </Button>

        {isEditing ? (
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={handleCancel}
              className="flex items-center gap-2"
            >
              <X className="h-4 w-4" />
              Cancelar
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={updateClientMutation.isPending}
              className="flex items-center gap-2"
            >
              {updateClientMutation.isPending ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <Save className="h-4 w-4" />
              )}
              Salvar Alterações
            </Button>
          </div>
        ) : (
          <Button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2"
          >
            <Edit className="h-4 w-4" />
            Editar Cliente
          </Button>
        )}
      </div>
    </div>
  );
}