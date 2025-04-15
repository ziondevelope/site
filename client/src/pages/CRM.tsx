import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsertLead, Lead, insertLeadSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const leadFormSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional().nullable(),
  whatsapp: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
  businessType: z.enum(["purchase", "rent", "sale"]).optional().nullable(),
  propertyType: z.enum(["apartment", "house", "commercial"]).optional().nullable(),
  region: z.string().optional().nullable(),
  priceRange: z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
  }).optional().nullable(),
  stage: z.enum(["new", "contacted", "visit", "proposal"]).default("new"),
  quickNote: z.string().optional().nullable(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function CRM() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch all leads at once to avoid Firestore index issues
  const { data: allLeads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    queryFn: () => apiRequest(`/api/leads`),
  });
  
  // Filter leads by status on the client side
  const newLeads = allLeads?.filter(lead => lead.status === 'new') || [];
  const contactedLeads = allLeads?.filter(lead => lead.status === 'contacted') || [];
  const visitLeads = allLeads?.filter(lead => lead.status === 'visit') || [];
  const proposalLeads = allLeads?.filter(lead => lead.status === 'proposal') || [];
  
  const isLoading = leadsLoading;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      whatsapp: "",
      message: "",
      source: "manual",
      interestType: undefined,
      budget: undefined,
      notes: "",
      status: "new",
      businessType: undefined,
      propertyType: undefined,
      region: "",
      priceRange: {
        min: undefined,
        max: undefined,
      },
      stage: "new",
      quickNote: "",
    },
  });
  
  // Mutation para atualizar o status do lead
  const updateLeadStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: number; status: string }) => {
      return apiRequest(`/api/leads/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status })
      });
    },
    onSuccess: () => {
      // Invalidar a consulta principal que busca todos os leads
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      toast({
        title: "Status atualizado",
        description: "O status do lead foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      console.error("Erro ao atualizar status:", error);
      toast({
        title: "Erro ao atualizar status",
        description: "Não foi possível atualizar o status do lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Mutação para excluir um lead
  const deleteLeadMutation = useMutation({
    mutationFn: (id: number) => {
      return apiRequest(`/api/leads/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      // Invalidar a consulta principal que busca todos os leads
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      toast({
        title: "Lead excluído",
        description: "O lead foi excluído com sucesso.",
      });
      
      // Fechar o diálogo e limpar o estado
      setIsDeleteConfirmOpen(false);
      setLeadToDelete(null);
    },
    onError: (error) => {
      console.error("Erro ao excluir lead:", error);
      toast({
        title: "Erro ao excluir lead",
        description: "Não foi possível excluir o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: LeadFormValues) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Invalidar a consulta principal que busca todos os leads
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      toast({
        title: "Lead criado com sucesso",
        description: "O lead foi adicionado ao CRM.",
      });
      setIsAddLeadOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Erro ao criar lead:", error);
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível adicionar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: LeadFormValues) {
    console.log("Submetendo dados do lead:", data);
    createLeadMutation.mutate(data);
  }
  
  // Diálogo de confirmação de exclusão
  const handleConfirmDelete = () => {
    if (leadToDelete) {
      deleteLeadMutation.mutate(leadToDelete.id);
    }
  };

  return (
    <div className="space-y-2">
      {/* Diálogo de confirmação de exclusão */}
      <Dialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Excluir Lead</DialogTitle>
            <DialogDescription>
              Você tem certeza que deseja excluir este lead? Esta ação não pode ser desfeita.
            </DialogDescription>
          </DialogHeader>
          <div className="flex justify-end space-x-2 pt-4">
            <Button
              variant="outline"
              onClick={() => setIsDeleteConfirmOpen(false)}
            >
              Cancelar
            </Button>
            <Button
              variant="destructive"
              onClick={handleConfirmDelete}
              disabled={deleteLeadMutation.isPending}
            >
              {deleteLeadMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Excluindo...
                </>
              ) : (
                'Excluir Lead'
              )}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Cadastre aqui leads, clientes potenciais, ou pessoas interessadas no seu produto/serviço. No CRM você poderá gerenciar seus leads de forma eficiente.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="border border-gray-300">
              <i className="ri-filter-line mr-1"></i> Filtros
            </Button>
            <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <i className="ri-add-line mr-1"></i> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[850px] max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                  <DialogDescription>
                    Preencha as informações do novo lead para cadastrá-lo no sistema.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    {/* Perfil do Cliente */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Perfil do Cliente</h3>
                      
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

                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="whatsapp"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>WhatsApp</FormLabel>
                              <FormControl>
                                <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
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
                                <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@exemplo.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    {/* Interesse do Lead */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Interesse do Lead</h3>
                      
                      <div className="grid grid-cols-2 gap-4">
                        <FormField
                          control={form.control}
                          name="businessType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Negócio</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value as string}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="purchase">Compra</SelectItem>
                                  <SelectItem value="rent">Aluguel</SelectItem>
                                  <SelectItem value="sale">Venda</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="propertyType"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Tipo de Imóvel</FormLabel>
                              <Select
                                onValueChange={field.onChange}
                                defaultValue={field.value as string}
                              >
                                <FormControl>
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione" />
                                  </SelectTrigger>
                                </FormControl>
                                <SelectContent>
                                  <SelectItem value="apartment">Apartamento</SelectItem>
                                  <SelectItem value="house">Casa</SelectItem>
                                  <SelectItem value="commercial">Comercial</SelectItem>
                                </SelectContent>
                              </Select>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                      </div>

                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Região de Interesse</FormLabel>
                            <FormControl>
                              <Input placeholder="Bairro, cidade ou região" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <div className="space-y-2">
                        <FormLabel>Faixa de Preço (R$)</FormLabel>
                        <div className="grid grid-cols-2 gap-4">
                          <FormField
                            control={form.control}
                            name="priceRange.min"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Valor mínimo" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                          
                          <FormField
                            control={form.control}
                            name="priceRange.max"
                            render={({ field }) => (
                              <FormItem>
                                <FormControl>
                                  <Input 
                                    type="number" 
                                    placeholder="Valor máximo" 
                                    {...field}
                                    onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                                    value={field.value || ""}
                                  />
                                </FormControl>
                                <FormMessage />
                              </FormItem>
                            )}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Funil de Vendas */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium text-gray-700 border-b pb-2">Funil de Vendas</h3>
                      
                      <FormField
                        control={form.control}
                        name="stage"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Estágio</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o estágio" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="new">Contato</SelectItem>
                                <SelectItem value="contacted">Envio de proposta</SelectItem>
                                <SelectItem value="visit">Follow-up</SelectItem>
                                <SelectItem value="proposal">Fechamento</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="quickNote"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nota Rápida</FormLabel>
                            <FormControl>
                              <Textarea 
                                placeholder="Adicione uma nota rápida sobre este lead" 
                                className="resize-none h-24" 
                                {...field}
                                value={field.value || ""}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsAddLeadOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createLeadMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {createLeadMutation.isPending ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                            Salvando...
                          </>
                        ) : (
                          'Salvar Lead'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-2">
          <div className="col-span-2">
            <div className="flex items-center">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">Nome</span>
              </div>
              <div className="relative rounded-md shadow-sm">
                <input 
                  type="text" 
                  placeholder="Filtrar por nome"
                  className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">E-mail</span>
              </div>
              <div className="relative rounded-md shadow-sm">
                <input 
                  type="text" 
                  placeholder="Filtrar por e-mail"
                  className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">Situação</span>
              </div>
              <div className="relative flex-1">
                <select className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm appearance-none bg-white">
                  <option>Situação</option>
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="visit">Visita</option>
                  <option value="proposal">Proposta</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button className="h-9 bg-indigo-600 hover:bg-indigo-700">
              <i className="ri-search-line mr-1"></i> Buscar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96 bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nome / Contato</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...(newLeads || []), 
                  ...(contactedLeads || []), 
                  ...(visitLeads || []), 
                  ...(proposalLeads || [])
                ]
                .sort((a, b) => {
                  // Ordenar por data (do mais recente para o mais antigo)
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                })
                .map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <i className="fas fa-user-alt"></i>
                        </div>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {lead.email || lead.phone || 'Sem contato'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {lead.interestType === 'purchase' ? 'Compra' :
                        lead.interestType === 'rent' ? 'Aluguel' :
                        lead.interestType || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {lead.source === 'manual' ? 'Manual' :
                        lead.source === 'website' ? 'Website' :
                        lead.source === 'whatsapp' ? 'WhatsApp' :
                        lead.source === 'instagram' ? 'Instagram' :
                        lead.source === 'facebook' ? 'Facebook' :
                        lead.source === 'indicacao' ? 'Indicação' :
                        lead.source || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.budget ? lead.budget.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }) : 'Não informado'}
                    </TableCell>
                    <TableCell>
                      <div className={`text-xs font-medium rounded-full px-2.5 py-1 inline-flex items-center justify-center w-24
                        ${lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 
                          lead.status === 'contacted' ? 'bg-yellow-50 text-yellow-700' : 
                          lead.status === 'visit' ? 'bg-green-50 text-green-700' : 
                          lead.status === 'proposal' ? 'bg-purple-50 text-purple-700' : 
                          'bg-gray-50 text-gray-700'}`}
                      >
                        {lead.status === 'new' ? 'Novo' : 
                        lead.status === 'contacted' ? 'Contatado' :
                        lead.status === 'visit' ? 'Visita' :
                        lead.status === 'proposal' ? 'Proposta' :
                        lead.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="mr-2">
                            <i className="fas fa-eye mr-1 text-xs"></i> Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="flex justify-between items-center">
                              <div className="flex items-center">
                                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-blue-100 text-blue-600 mr-3">
                                  <i className="fas fa-user-alt"></i>
                                </div>
                                <div>
                                  <p className="font-medium">{lead.name}</p>
                                  <p className="text-sm font-normal text-gray-500">
                                    Criado em {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                                  </p>
                                </div>
                              </div>

                            </DialogTitle>
                            <div className="sr-only">Detalhes do lead</div>
                          </DialogHeader>
                          
                          <div className="mt-4">
                            {/* Indicadores de progresso */}
                            <div className="relative mb-6">
                              <div className="grid grid-cols-4 gap-0">
                                <div 
                                  className={`flex justify-center items-center py-2 rounded-l 
                                    ${lead.status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                >
                                  Contato
                                </div>
                                <div 
                                  className={`flex justify-center items-center py-2 
                                    ${lead.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                >
                                  Follow up
                                </div>
                                <div 
                                  className={`flex justify-center items-center py-2 
                                    ${lead.status === 'visit' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                >
                                  Agendamento
                                </div>
                                <div 
                                  className={`flex justify-center items-center py-2 rounded-r
                                    ${lead.status === 'proposal' ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
                                >
                                  Perdido
                                </div>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                              {/* Informações de Contato */}
                              <div className="md:col-span-3">
                                <h3 className="text-base font-semibold mb-4">Informações de Contato</h3>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Nome</h4>
                                    <p className="text-gray-900">{lead.name}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Email</h4>
                                    <p className="text-gray-900">{lead.email || "Não informado"}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Telefone</h4>
                                    <p className="text-gray-900">{lead.phone || "Não informado"}</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">WhatsApp</h4>
                                    <p className="text-gray-900">Não informado</p>
                                  </div>
                                  
                                  <h3 className="text-base font-semibold mt-8 mb-4">Campos Personalizados</h3>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Valor</h4>
                                    <p className="text-gray-900">
                                      {lead.budget ? 'R$ ' + lead.budget.toLocaleString('pt-BR') : 'R$ 0'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Data Prevista</h4>
                                    <p className="text-gray-900">Não informado</p>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Funil de Vendas */}
                              <div className="md:col-span-6 px-8">
                                <div className="flex justify-between items-center mb-4">
                                  <h3 className="text-base font-semibold">Funil de Vendas</h3>
                                  <div className="text-sm text-gray-500">
                                    Estágio atual: 
                                    <span className={`ml-2 font-medium px-2 py-1 rounded-full 
                                      ${lead.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                                      lead.status === 'contacted' ? 'bg-amber-100 text-amber-800' : 
                                      lead.status === 'visit' ? 'bg-amber-100 text-amber-800' : 
                                      lead.status === 'proposal' ? 'bg-amber-100 text-amber-800' : 
                                      'bg-gray-100 text-gray-800'}`}
                                    >
                                      {lead.status === 'new' ? 'Envio de proposta' : 
                                      lead.status === 'contacted' ? 'Envio de proposta' :
                                      lead.status === 'visit' ? 'Agendamento Visita' :
                                      lead.status === 'proposal' ? 'Visita' :
                                      lead.status}
                                    </span>
                                  </div>
                                </div>
                                
                                <div className="mt-8">
                                  <h3 className="text-sm font-medium text-gray-500 mb-3">Nota Rápida</h3>
                                  <div className="bg-gray-50 p-4 rounded-md border border-gray-200">
                                    <Textarea 
                                      placeholder="Digite uma anotação rápida sobre este lead..." 
                                      className="resize-none border-0 bg-transparent p-0 focus-visible:ring-0 text-sm" 
                                      rows={8}
                                      defaultValue={lead.notes || ""}
                                    />
                                  </div>
                                  <div className="flex justify-end mt-4">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-sm">
                                      Salvar Nota
                                    </Button>
                                  </div>
                                </div>
                              </div>
                              
                              {/* Ações e Atividades */}
                              <div className="md:col-span-3">
                                <h3 className="text-base font-semibold mb-4">Ações</h3>
                                <div className="space-y-2 mb-8">
                                  <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 h-10">
                                    <i className="fas fa-pen mr-2 text-gray-500"></i> Editar Lead
                                  </Button>
                                  <Button variant="outline" className="w-full justify-start text-gray-700 border-gray-300 h-10">
                                    <i className="far fa-calendar-alt mr-2 text-gray-500"></i> Agendar Atividade
                                  </Button>
                                  <Button 
                                    variant="outline" 
                                    className="w-full justify-start text-red-600 hover:text-red-700 border-gray-300 h-10"
                                    onClick={() => {
                                      setLeadToDelete(lead);
                                      setIsDeleteConfirmOpen(true);
                                    }}
                                  >
                                    <i className="fas fa-trash-alt mr-2"></i> Excluir Lead
                                  </Button>
                                </div>
                                
                                <h3 className="text-base font-semibold mb-4">Próximas Atividades</h3>
                                <div className="flex flex-col items-center justify-center py-4 bg-gray-50 rounded-md border border-gray-200">
                                  <p className="text-gray-500 text-sm mb-4">Nenhuma atividade agendada.</p>
                                  <Button variant="outline" className="border-dashed border-gray-300 text-gray-600">
                                    <i className="fas fa-plus mr-2"></i> Agendar Nova Atividade
                                  </Button>
                                </div>
                                
                                <h3 className="text-base font-semibold mt-8 mb-4">Interesse do Lead</h3>
                                <div className="space-y-4">
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo de Negócio</h4>
                                    <p className="text-gray-900">
                                      {lead.interestType === 'purchase' ? 'Compra' :
                                      lead.interestType === 'rent' ? 'Aluguel' :
                                      lead.interestType || 'Não informado'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo de Imóvel</h4>
                                    <p className="text-gray-900">Não informado</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Região</h4>
                                    <p className="text-gray-900">Não informado</p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Faixa de Preço</h4>
                                    <p className="text-gray-900">
                                      {lead.budget ? 'R$ ' + lead.budget.toLocaleString('pt-BR') : 'Não informado'}
                                    </p>
                                  </div>
                                  
                                  <div>
                                    <h4 className="text-sm font-medium text-gray-500 mb-1">Origem</h4>
                                    <p className="text-gray-900">
                                      {lead.source === 'manual' ? 'Manual' :
                                      lead.source === 'website' ? 'Website' :
                                      lead.source === 'whatsapp' ? 'WhatsApp' :
                                      lead.source === 'instagram' ? 'Instagram' :
                                      lead.source === 'facebook' ? 'Facebook' :
                                      lead.source === 'indicacao' ? 'Indicação' :
                                      lead.source || 'Não informado'}
                                    </p>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Select 
                        value={lead.status}
                        onValueChange={(value) => {
                          updateLeadStatusMutation.mutate({ id: lead.id, status: value });
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-9 inline-flex">
                          <SelectValue placeholder="Atualizar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="visit">Visita</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
