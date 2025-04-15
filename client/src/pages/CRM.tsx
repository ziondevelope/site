import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsertLead, Lead, FunnelStage, SalesFunnel, insertLeadSchema } from "@shared/schema";
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
  interestType: z.enum(["purchase", "rent", "sale"]).optional().nullable(),
  propertyType: z.enum(["apartment", "house", "commercial"]).optional().nullable(),
  region: z.string().optional().nullable(),
  priceRange: z.object({
    min: z.number().optional().nullable(),
    max: z.number().optional().nullable(),
  }).optional().nullable(),
  stage: z.enum(["new", "contacted", "visit", "proposal"]).default("new"),
  quickNote: z.string().optional().nullable(),
  notes: z.string().optional().nullable(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function CRM() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const [leadToDelete, setLeadToDelete] = useState<Lead | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [openLeadId, setOpenLeadId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Função para abrir o modal de adicionar novo lead
  const handleAddClick = () => {
    form.reset();
    setIsAddLeadOpen(true);
  };
  
  // Fetch all leads at once to avoid Firestore index issues
  const { data: allLeads, isLoading: leadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads'],
    queryFn: () => apiRequest(`/api/leads`),
  });
  
  // Fetch all sales funnels
  const { data: funnels, isLoading: funnelsLoading } = useQuery<SalesFunnel[]>({
    queryKey: ['/api/sales-funnels'],
  });
  
  // Estado para armazenar o ID do funil selecionado para um lead específico quando a modal abrir
  const [currentLeadFunnelId, setCurrentLeadFunnelId] = useState<number | null>(null);
  
  // Fetch funnel stages when a funnel is selected
  const { data: stages, isLoading: stagesLoading } = useQuery<FunnelStage[]>({
    queryKey: ['/api/funnel-stages', selectedFunnelId || currentLeadFunnelId],
    queryFn: async () => {
      // Se não tiver funil selecionado mas tiver funis disponíveis, usar o padrão ou o primeiro
      let funnelIdToUse = selectedFunnelId || currentLeadFunnelId;
      
      if (!funnelIdToUse && funnels && funnels.length > 0) {
        const defaultFunnel = funnels.find(f => f.isDefault) || funnels[0];
        funnelIdToUse = defaultFunnel.id;
        
        // Atualizar o estado para manter a consistência
        if (selectedFunnelId === null) {
          setSelectedFunnelId(funnelIdToUse);
        }
      }
      
      if (!funnelIdToUse) throw new Error("Nenhum funil selecionado");
      return apiRequest(`/api/funnel-stages?funnelId=${funnelIdToUse}`);
    },
    enabled: (selectedFunnelId !== null || currentLeadFunnelId !== null || (funnels && funnels.length > 0)),
  });
  
  // Set default funnel when data is loaded
  useEffect(() => {
    if (funnels && funnels.length > 0 && !selectedFunnelId) {
      const defaultFunnel = funnels.find(f => f.isDefault) || funnels[0];
      setSelectedFunnelId(defaultFunnel.id);
    }
  }, [funnels, selectedFunnelId]);
  
  // Garantir que todos os leads tenham um funil associado
  useEffect(() => {
    if (allLeads && funnels && funnels.length > 0) {
      const leadsWithoutFunnel = allLeads.filter(lead => !lead.funnelId);
      
      if (leadsWithoutFunnel.length > 0) {
        // Encontrar o funil padrão ou usar o primeiro da lista
        const defaultFunnel = funnels.find(f => f.isDefault) || funnels[0];
        
        // Atualizar cada lead sem funil para usar o funil padrão
        leadsWithoutFunnel.forEach(lead => {
          apiRequest(`/api/leads/${lead.id}/funnel`, {
            method: "PATCH",
            body: JSON.stringify({ funnelId: defaultFunnel.id }),
          })
            .then(() => {
              queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
            })
            .catch(error => {
              console.error("Erro ao atribuir funil padrão:", error);
            });
        });
      }
    }
  }, [allLeads, funnels]);
  
  // Filter leads by status on the client side (for backward compatibility)
  const newLeads = allLeads?.filter(lead => lead.status === 'new') || [];
  const contactedLeads = allLeads?.filter(lead => lead.status === 'contacted') || [];
  const visitLeads = allLeads?.filter(lead => lead.status === 'visit') || [];
  const proposalLeads = allLeads?.filter(lead => lead.status === 'proposal') || [];
  
  // Filter leads by funnel and stage if selected
  const filteredLeads = useMemo(() => {
    if (!allLeads) return [];
    
    if (selectedFunnelId && selectedStageId) {
      return allLeads.filter(lead => 
        lead.funnelId === selectedFunnelId && 
        lead.stageId === selectedStageId
      );
    }
    
    if (selectedFunnelId) {
      return allLeads.filter(lead => lead.funnelId === selectedFunnelId);
    }
    
    return allLeads;
  }, [allLeads, selectedFunnelId, selectedStageId]);
  
  // Quando um lead é aberto, carregar seus dados de funil
  useEffect(() => {
    if (openLeadId !== null && allLeads) {
      const openLead = allLeads.find(lead => lead.id === openLeadId);
      
      if (openLead && openLead.funnelId) {
        // Se o lead já tem um funil associado, usar esse funil
        setCurrentLeadFunnelId(openLead.funnelId);
      } else if (openLead && funnels && funnels.length > 0) {
        // Se o lead não tem funil, mas existem funis disponíveis,
        // atribuir o funil padrão ou o primeiro funil disponível
        const defaultFunnel = funnels.find(f => f.isDefault) || funnels[0];
        
        // Atualizar o lead no backend
        apiRequest(`/api/leads/${openLead.id}/funnel`, {
          method: "PATCH",
          body: JSON.stringify({ funnelId: defaultFunnel.id }),
        })
          .then(() => {
            // Após atualizar o lead, definir o funil atual
            setCurrentLeadFunnelId(defaultFunnel.id);
            // Recarregar a lista de leads
            queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
          })
          .catch(error => {
            console.error("Erro ao atribuir funil padrão:", error);
          });
      }
    }
  }, [openLeadId, allLeads, funnels]);
  
  const isLoading = leadsLoading || funnelsLoading || (selectedFunnelId !== null && stagesLoading);

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
      // Transformar os dados do formulário no formato esperado pelo schema do lead
      // Encontrar o funil padrão ou usar o primeiro da lista
      const defaultFunnel = funnels?.find(f => f.isDefault) || funnels?.[0];
      
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || data.quickNote, // Use a mensagem ou nota rápida
        status: data.stage || 'new',
        source: data.source || 'manual',
        interestType: data.interestType, // Usar interestType do formulário
        budget: data.priceRange?.max, // Usar o valor máximo da faixa de preço como orçamento
        notes: data.quickNote, // Salvar a nota rápida
        propertyType: data.propertyType, // Adicionar tipo de propriedade
        region: data.region, // Adicionar região
        // Incluir automaticamente um funil padrão para novos leads
        funnelId: defaultFunnel?.id,
        // Outros campos específicos que não estão no schema padrão
        whatsapp: data.whatsapp,
        priceRangeMin: data.priceRange?.min,
        priceRangeMax: data.priceRange?.max,
      };
      
      console.log("Dados formatados para envio:", leadData);
      
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(leadData)
      });
    },
    onSuccess: (data) => {
      // Invalidar a consulta principal que busca todos os leads
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      console.log("Lead criado com sucesso:", data);
      
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
      <div className="bg-white p-6 rounded-lg shadow-sm">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Gerenciamento de Leads</h2>
            <p className="text-sm text-gray-500">Cadastre aqui leads, clientes potenciais, ou pessoas interessadas no seu produto/serviço.</p>
          </div>
          <div className="flex space-x-2">
            <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
              <DialogTrigger asChild>
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={handleAddClick}
                >
                  <i className="fas fa-plus mr-2"></i> Novo Lead
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
                    {/* Informações básicas */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="name"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome*</FormLabel>
                            <FormControl>
                              <Input placeholder="Digite o nome" {...field} />
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
                              <Input placeholder="Digite o email" {...field} />
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
                              <Input placeholder="(00) 0000-0000" {...field} />
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
                              <Input placeholder="(00) 00000-0000" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Informações de interesse */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="interestType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Negócio</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
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
                              defaultValue={field.value || ""}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
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
                      
                      <FormField
                        control={form.control}
                        name="region"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Região</FormLabel>
                            <FormControl>
                              <Input placeholder="Ex: Centro, Zona Sul..." {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    {/* Informações adicionais */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origem</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value || "manual"}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="indicacao">Indicação</SelectItem>
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
                                onChange={(e) => field.onChange(e.target.value === "" ? null : Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="quickNote"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nota Rápida</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações sobre o lead..." 
                              className="resize-none" 
                              {...field} 
                              rows={5}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="flex justify-end space-x-2">
                      <Button type="button" variant="outline" onClick={() => setIsAddLeadOpen(false)}>
                        Cancelar
                      </Button>
                      <Button type="submit" disabled={createLeadMutation.isPending} className="bg-blue-600 hover:bg-blue-700">
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

        {isLoading ? (
          <div className="flex justify-center py-8">
            <div className="animate-spin h-8 w-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
          </div>
        ) : (
          <div className="bg-white rounded-md">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className="w-[300px]">Nome / Contato</TableHead>
                    <TableHead>Interesse</TableHead>
                    <TableHead>WhatsApp</TableHead>
                    <TableHead>Estágio</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {[...newLeads, ...contactedLeads, ...visitLeads, ...proposalLeads]
                    .sort((a, b) => {
                      // Ordenar por data (mais recente primeiro)
                      const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                      const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                      return dateB - dateA;
                    })
                    .map((lead) => (
                      <TableRow 
                        key={lead.id} 
                        className="cursor-pointer hover:bg-gray-50" 
                        onClick={() => setOpenLeadId(lead.id)}
                      >
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
                          {(lead as any).whatsapp ? (
                            <div className="flex items-center">
                              <span className="mr-2">{(lead as any).whatsapp}</span>
                              <a 
                                href={`https://wa.me/${(lead as any).whatsapp.replace(/\D/g, '')}`} 
                                target="_blank" 
                                rel="noopener noreferrer"
                                onClick={(e) => e.stopPropagation()}
                                className="text-green-600 hover:text-green-700"
                              >
                                <i className="fab fa-whatsapp"></i>
                              </a>
                            </div>
                          ) : 'Não informado'}
                        </TableCell>
                        <TableCell>
                          {(() => {
                            // Verificar se o lead tem um estágio no funil
                            if (lead.stageId && stages) {
                              const currentStage = stages.find(s => s.id === lead.stageId);
                              if (currentStage) {
                                return currentStage.name;
                              }
                            }
                            
                            // Fallback para o status legado se não tiver estágio
                            return lead.status === 'new' ? 'Novo' :
                                   lead.status === 'contacted' ? 'Contatado' :
                                   lead.status === 'visit' ? 'Agendado' :
                                   lead.status === 'proposal' ? 'Proposta' :
                                   'Não definido';
                          })()}
                        </TableCell>
                      </TableRow>
                    ))}
                </TableBody>
              </Table>
            </div>
          </div>
        )}
      </div>

      {/* Lead Details Dialog */}
      {allLeads?.map(lead => (
        <Dialog 
          key={`lead-dialog-${lead.id}`}
          open={openLeadId === lead.id} 
          onOpenChange={(open) => {
            if (!open) setOpenLeadId(null);
          }}
        >
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
                {stages && stages.length > 0 ? (
                  (() => {
                    // Determinamos o funil atual
                    const currentFunnelId = lead.funnelId || (funnels?.find(f => f.isDefault)?.id || funnels?.[0]?.id);
                    
                    // Filtramos e ordenamos os estágios deste funil
                    const filteredStages = stages.filter(stage => stage.funnelId === currentFunnelId) || [];
                    const sortedStages = [...filteredStages].sort((a, b) => a.position - b.position);
                    
                    // Determinamos o número de colunas com base na quantidade de estágios
                    const gridCols = 
                      sortedStages.length === 1 ? 'grid-cols-1' :
                      sortedStages.length === 2 ? 'grid-cols-2' :
                      sortedStages.length === 3 ? 'grid-cols-3' :
                      sortedStages.length === 4 ? 'grid-cols-4' :
                      'grid-cols-5';
                    
                    return (
                      <div className={`grid gap-0 ${gridCols}`}>
                        {sortedStages.map((stage, index) => (
                          <div 
                            key={stage.id}
                            className={`flex justify-center items-center py-2 cursor-pointer hover:opacity-90
                              ${index === 0 ? 'rounded-l' : ''}
                              ${index === filteredStages.length - 1 ? 'rounded-r' : ''}
                              ${
                                // Estágio atual
                                lead.stageId === stage.id 
                                  ? 'bg-blue-600 text-white font-medium' 
                                  // Estágios anteriores (já concluídos)
                                  : sortedStages.findIndex(s => s.id === lead.stageId) > index
                                    ? 'bg-blue-400 text-white' 
                                    // Estágios futuros (ainda não alcançados)
                                    : 'bg-gray-200 text-gray-500'
                              }`}
                            onClick={() => {
                              // Atualizar o estágio do lead ao clicar
                              apiRequest(`/api/leads/${lead.id}/stage`, {
                                method: "PATCH",
                                body: JSON.stringify({ stageId: stage.id }),
                              })
                                .then(() => {
                                  // Atualizar a lista de leads
                                  queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                                  toast({
                                    title: "Estágio atualizado",
                                    description: "O estágio do lead foi atualizado com sucesso.",
                                  });
                                })
                                .catch((error) => {
                                  console.error("Erro ao atualizar estágio:", error);
                                  toast({
                                    title: "Erro ao atualizar estágio",
                                    description: "Não foi possível atualizar o estágio. Tente novamente.",
                                    variant: "destructive",
                                  });
                                });
                            }}
                          >
                            {stage.name}
                          </div>
                        ))}
                      </div>
                    );
                  })()
                ) : (
                  // Fallback para o sistema anterior se não houver estágios definidos
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
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-6 pb-6">
                {/* Coluna 1 - Dividida em 2 grids */}
                <div className="md:col-span-3">
                  <div className="grid gap-6">
                    {/* Grid 1: Informações de Contato */}
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <h3 className="text-base font-semibold mb-4">Informações de Contato</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Nome</h4>
                          <p className="text-gray-900 text-sm">{lead.name}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Email</h4>
                          <p className="text-gray-900 text-sm">{lead.email || "Não informado"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Telefone</h4>
                          <p className="text-gray-900 text-sm">{lead.phone || "Não informado"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">WhatsApp</h4>
                          <p className="text-gray-900 text-sm">{(lead as any).whatsapp || "Não informado"}</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Grid 2: Detalhes do Interesse */}
                    <div className="bg-white p-4 rounded-md border border-gray-100">
                      <h3 className="text-base font-semibold mb-4">Detalhes do Interesse</h3>
                      <div className="space-y-4">
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Tipo de Negócio</h4>
                          <p className="text-gray-900 text-sm">
                            {lead.interestType === 'purchase' ? 'Compra' :
                            lead.interestType === 'rent' ? 'Aluguel' :
                            lead.interestType || 'Não informado'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Tipo de Imóvel</h4>
                          <p className="text-gray-900 text-sm">
                            {(lead as any).propertyType === 'apartment' ? 'Apartamento' : 
                            (lead as any).propertyType === 'house' ? 'Casa' : 
                            (lead as any).propertyType === 'commercial' ? 'Comercial' : 
                            'Não informado'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Região</h4>
                          <p className="text-gray-900 text-sm">{(lead as any).region || "Não informado"}</p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Faixa de Preço</h4>
                          <p className="text-gray-900 text-sm">
                            {(lead as any).priceRangeMin && (lead as any).priceRangeMax ? 
                              `R$ ${(lead as any).priceRangeMin.toLocaleString('pt-BR')} - R$ ${(lead as any).priceRangeMax.toLocaleString('pt-BR')}` : 
                              lead.budget ? 'R$ ' + lead.budget.toLocaleString('pt-BR') : 'Não informado'}
                          </p>
                        </div>
                        
                        <div>
                          <h4 className="text-sm font-bold text-gray-700 mb-1">Origem</h4>
                          <p className="text-gray-900 text-sm">
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
                
                {/* Funil de Vendas */}
                <div className="md:col-span-6 px-8">                  
                  <div>
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
                  {/* Funil de Vendas */}
                  <h3 className="text-base font-semibold mb-4">Funil de Vendas</h3>                  
                  <div className="bg-white p-4 rounded-md border border-gray-100 mb-8">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Seletor de Funil */}
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                          Selecionar Funil
                        </label>
                        <Select
                          value={String(lead.funnelId || (funnels?.find(f => f.isDefault)?.id || funnels?.[0]?.id || ""))}
                          onValueChange={(value) => {
                            // Armazenar o ID do funil selecionado temporariamente
                            const funnelId = Number(value);
                            
                            // Atualizar o lead na API com o novo funnelId
                            apiRequest(`/api/leads/${lead.id}/funnel`, {
                              method: "PATCH",
                              body: JSON.stringify({ funnelId }),
                            })
                              .then(() => {
                                // Definir o funil atual para o lead
                                setCurrentLeadFunnelId(funnelId);
                                // Atualizar a lista de leads
                                queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                                // Recarregar a lista de estágios para o novo funil
                                queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', funnelId] });
                                
                                toast({
                                  title: "Funil atualizado",
                                  description: "O funil de vendas foi atualizado com sucesso.",
                                });
                              })
                              .catch((error) => {
                                console.error("Erro ao atualizar funil:", error);
                                toast({
                                  title: "Erro ao atualizar funil",
                                  description: "Não foi possível atualizar o funil. Tente novamente.",
                                  variant: "destructive",
                                });
                              });
                          }}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder="Selecione um funil" />
                          </SelectTrigger>
                          <SelectContent>
                            {funnels?.map((funnel) => (
                              <SelectItem key={funnel.id} value={String(funnel.id)}>
                                {funnel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      


                    </div>
                  </div>
                  
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
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  );
}