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
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch leads with different status
  const { data: newLeads, isLoading: newLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'new'],
  });
  
  const { data: contactedLeads, isLoading: contactedLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'contacted'],
  });
  
  const { data: visitLeads, isLoading: visitLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'visit'],
  });
  
  const { data: proposalLeads, isLoading: proposalLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'proposal'],
  });
  
  const isLoading = newLeadsLoading || contactedLeadsLoading || visitLeadsLoading || proposalLeadsLoading;

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

  const createLeadMutation = useMutation({
    mutationFn: (data: LeadFormValues) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Invalidate leads queries to update the UI
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
  
  return (
    <div className="space-y-2">
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
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
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
                        <DialogContent className="max-w-6xl w-full h-[90vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle className="sr-only">Detalhes do lead</DialogTitle>
                          </DialogHeader>
                          
                          {/* Barra de progresso do funil */}
                          <div className="w-full bg-gray-100 rounded-md p-2 mb-6">
                            <div className="flex">
                              <div className={`rounded-md py-2 px-6 text-white text-center font-semibold ${lead.status === 'new' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                Contato
                              </div>
                              <div className={`rounded-md py-2 px-6 text-white text-center font-semibold ${lead.status === 'contacted' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                Envio de proposta
                              </div>
                              <div className={`rounded-md py-2 px-6 text-white text-center font-semibold ${lead.status === 'visit' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                Follow-up
                              </div>
                              <div className={`rounded-md py-2 px-6 text-white text-center font-semibold ${lead.status === 'proposal' ? 'bg-indigo-600' : 'bg-gray-300'}`}>
                                Fechamento
                              </div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-3 gap-6">
                            {/* Coluna Dados do Contato */}
                            <div className="bg-white p-6 rounded-md border border-gray-200">
                              <h3 className="text-indigo-600 font-semibold mb-6">Dados do Contato</h3>
                              
                              <div className="space-y-5">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Nome:</h4>
                                  <p className="text-gray-800">{lead.name}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Email:</h4>
                                  <p className="text-gray-800">{lead.email || "Não informado"}</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Telefone:</h4>
                                  <p className="text-gray-800">{lead.phone || "Não informado"}</p>
                                </div>

                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">WhatsApp:</h4>
                                  <p className="text-gray-800">{lead.phone || "Não informado"}</p>
                                </div>
                              </div>
                            </div>
                            
                            {/* Coluna Notas Rápidas */}
                            <div className="bg-white p-6 rounded-md border border-gray-200">
                              <h3 className="text-indigo-600 font-semibold mb-6">Notas Rápidas</h3>
                              
                              <div className="mb-4">
                                <Textarea 
                                  placeholder="Digite uma anotação rápida sobre este lead..."
                                  className="resize-none border rounded-md" 
                                  rows={6}
                                  defaultValue={lead.notes || ""}
                                />
                              </div>
                              
                              <div className="flex justify-end mt-2">
                                <Button className="bg-blue-500 hover:bg-blue-600 text-sm">
                                  Salvar Nota
                                </Button>
                              </div>
                            </div>
                            
                            {/* Coluna Ações */}
                            <div className="bg-white p-6 rounded-md border border-gray-200">
                              <h3 className="text-indigo-600 font-semibold mb-6">Ações</h3>
                              
                              <div className="space-y-3">
                                <Button className="w-full bg-indigo-600 hover:bg-indigo-700">
                                  Agendar Atividades
                                </Button>
                                
                                <Button variant="outline" className="w-full text-red-600 hover:text-red-700 border-red-200 hover:bg-red-50">
                                  Excluir Lead
                                </Button>
                              </div>
                            </div>
                          </div>
                          
                          {/* Segunda linha */}
                          <div className="mt-6 mb-4">
                            <div className="bg-white p-6 rounded-md border border-gray-200">
                              <h3 className="text-indigo-600 font-semibold mb-6">Interesse do Lead</h3>
                              
                              <div className="grid grid-cols-2 gap-5">
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo de Negócio:</h4>
                                  <p className="text-gray-800">
                                    {lead.interestType === 'purchase' ? 'Compra' :
                                    lead.interestType === 'rent' ? 'Aluguel' :
                                    lead.interestType || 'Não informado'}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Tipo de Imóvel:</h4>
                                  <p className="text-gray-800">Não informado</p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Faixa de Preço (R$):</h4>
                                  <p className="text-gray-800">
                                    {lead.budget ? lead.budget.toLocaleString('pt-BR', {
                                      style: 'currency',
                                      currency: 'BRL',
                                      minimumFractionDigits: 0,
                                      maximumFractionDigits: 0,
                                    }).replace('R$', '') : 'Não informado'}
                                  </p>
                                </div>
                                
                                <div>
                                  <h4 className="text-sm font-medium text-gray-500 mb-1">Região de Interesse:</h4>
                                  <p className="text-gray-800">Não informado</p>
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
