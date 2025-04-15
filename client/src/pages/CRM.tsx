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
  const [selectedFunnelId, setSelectedFunnelId] = useState<number | null>(null);
  const [selectedStageId, setSelectedStageId] = useState<number | null>(null);
  const [openLeadId, setOpenLeadId] = useState<number | null>(null);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Quando um lead é aberto, carregar seus dados de funil
  useEffect(() => {
    if (openLeadId !== null && allLeads) {
      const openLead = allLeads.find(lead => lead.id === openLeadId);
      if (openLead && openLead.funnelId) {
        setCurrentLeadFunnelId(openLead.funnelId);
      }
    }
  }, [openLeadId, allLeads]);
  
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
      const funnelIdToUse = selectedFunnelId || currentLeadFunnelId;
      if (!funnelIdToUse) throw new Error("Nenhum funil selecionado");
      return apiRequest(`/api/funnel-stages?funnelId=${funnelIdToUse}`);
    },
    enabled: (selectedFunnelId !== null || currentLeadFunnelId !== null),
  });
  
  // Set default funnel when data is loaded
  useEffect(() => {
    if (funnels && funnels.length > 0 && !selectedFunnelId) {
      const defaultFunnel = funnels.find(f => f.isDefault) || funnels[0];
      setSelectedFunnelId(defaultFunnel.id);
    }
  }, [funnels, selectedFunnelId]);
  
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
      const leadData = {
        name: data.name,
        email: data.email,
        phone: data.phone,
        message: data.message || data.quickNote, // Use a mensagem ou nota rápida
        status: data.stage || 'new',
        source: data.source || 'manual',
        interestType: data.businessType, // Usar businessType como interestType
        budget: data.priceRange?.max, // Usar o valor máximo da faixa de preço como orçamento
        notes: data.quickNote, // Salvar a nota rápida
        propertyType: data.propertyType, // Adicionar tipo de propriedade
        region: data.region, // Adicionar região
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
                    {/* Form fields here... */}
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
                    <TableHead>Origem</TableHead>
                    <TableHead>Orçamento</TableHead>
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
                {lead.funnelId && stages && stages.length > 0 ? (
                  <div className={`grid gap-0 ${
                    stages.filter(s => s.funnelId === lead.funnelId).length === 1 ? 'grid-cols-1' :
                    stages.filter(s => s.funnelId === lead.funnelId).length === 2 ? 'grid-cols-2' :
                    stages.filter(s => s.funnelId === lead.funnelId).length === 3 ? 'grid-cols-3' :
                    stages.filter(s => s.funnelId === lead.funnelId).length === 4 ? 'grid-cols-4' :
                    'grid-cols-5'
                  }`}>
                    {stages
                      .filter(stage => stage.funnelId === lead.funnelId)
                      .sort((a, b) => a.position - b.position)
                      .map((stage, index, filteredStages) => (
                        <div 
                          key={stage.id}
                          className={`flex justify-center items-center py-2 cursor-pointer hover:opacity-90
                            ${index === 0 ? 'rounded-l' : ''}
                            ${index === filteredStages.length - 1 ? 'rounded-r' : ''}
                            ${lead.stageId === stage.id ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}
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
                      ))
                    }
                  </div>
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
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-semibold">Funil de Vendas</h3>
                  </div>
                  
                  <div className="bg-white p-4 rounded-md border border-gray-100 mb-8">
                    <div className="grid grid-cols-1 gap-4">
                      {/* Seletor de Funil */}
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                          Selecionar Funil
                        </label>
                        <Select
                          value={String(lead.funnelId || "")}
                          onValueChange={(value) => {
                            // Armazenar o ID do funil selecionado temporariamente
                            const funnelId = Number(value);
                            
                            // Atualizar o lead na API com o novo funnelId
                            apiRequest(`/api/leads/${lead.id}/funnel`, {
                              method: "PATCH",
                              body: JSON.stringify({ funnelId }),
                            })
                              .then(() => {
                                // Atualizar a lista de leads
                                queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
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
                      
                      {/* Seletor de Estágio */}
                      <div>
                        <label className="text-sm font-bold text-gray-700 mb-2 block">
                          Estágio Atual
                        </label>
                        <Select
                          value={String(lead.stageId || "")}
                          onValueChange={(value) => {
                            // Armazenar o ID do estágio selecionado temporariamente
                            const stageId = Number(value);
                            
                            // Atualizar o lead na API com o novo stageId
                            apiRequest(`/api/leads/${lead.id}/stage`, {
                              method: "PATCH",
                              body: JSON.stringify({ stageId }),
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
                          disabled={!lead.funnelId}
                        >
                          <SelectTrigger className="w-full">
                            <SelectValue placeholder={lead.funnelId ? "Selecione um estágio" : "Selecione um funil primeiro"} />
                          </SelectTrigger>
                          <SelectContent>
                            {stages?.filter(stage => stage.funnelId === lead.funnelId).map((stage) => (
                              <SelectItem key={stage.id} value={String(stage.id)}>
                                {stage.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                      
                      {/* Status atual do funil */}
                      <div className="mt-2">
                        <div className="text-sm text-gray-500 flex items-center">
                          Status legado: 
                          <span className={`ml-2 font-medium px-2 py-1 rounded-full 
                            ${lead.status === 'new' ? 'bg-amber-100 text-amber-800' : 
                            lead.status === 'contacted' ? 'bg-amber-100 text-amber-800' : 
                            lead.status === 'visit' ? 'bg-amber-100 text-amber-800' : 
                            lead.status === 'proposal' ? 'bg-amber-100 text-amber-800' : 
                            'bg-gray-100 text-gray-800'}`}
                          >
                            {lead.status === 'new' ? 'Novo' : 
                            lead.status === 'contacted' ? 'Contatado' :
                            lead.status === 'visit' ? 'Visita' :
                            lead.status === 'proposal' ? 'Proposta' :
                            lead.status}
                          </span>
                        </div>
                      </div>
                    </div>
                  </div>
                  
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