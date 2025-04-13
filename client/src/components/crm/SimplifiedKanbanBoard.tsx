import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
import { apiRequest } from "@/lib/queryClient";
import { Lead } from "@shared/schema";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";

interface KanbanBoardProps {
  newLeads: Lead[];
  contactedLeads: Lead[];
  visitLeads: Lead[];
  proposalLeads: Lead[];
}

export default function SimplifiedKanbanBoard({ 
  newLeads, 
  contactedLeads, 
  visitLeads, 
  proposalLeads 
}: KanbanBoardProps) {
  const { toast } = useToast();
  const [localLeads, setLocalLeads] = useState({
    new: newLeads || [],
    contacted: contactedLeads || [],
    visit: visitLeads || [],
    proposal: proposalLeads || []
  });
  
  // Renderizando o esqueleto enquanto os dados carregam
  const [isLoading, setIsLoading] = useState(true);
  
  // Atualiza os dados locais quando as props forem alteradas
  useEffect(() => {
    setLocalLeads({
      new: newLeads || [],
      contacted: contactedLeads || [],
      visit: visitLeads || [],
      proposal: proposalLeads || []
    });
  }, [newLeads, contactedLeads, visitLeads, proposalLeads]);
  
  // Simula o carregamento para dar tempo dos dados chegarem
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);

  // Update lead status mutation
  const updateLeadStatusMutation = useMutation({
    mutationFn: async ({ id, status }: { id: number, status: string }) => {
      const response = await apiRequest("PATCH", `/api/leads/${id}/status`, { status });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi atualizado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar status",
        description: error.message,
        variant: "destructive",
      });
    }
  });

  // Função para mover o lead para outra coluna
  const moveLead = (leadId: number, currentStatus: string, newStatus: string) => {
    // Só faz algo se o status for diferente
    if (currentStatus === newStatus) return;
    
    // Encontra o lead na coluna atual
    const currentColumn = [...localLeads[currentStatus as keyof typeof localLeads]];
    const leadIndex = currentColumn.findIndex(lead => lead.id === leadId);
    
    if (leadIndex === -1) return;
    
    // Remove o lead da coluna atual
    const [removedLead] = currentColumn.splice(leadIndex, 1);
    
    // Adiciona o lead à nova coluna com o status atualizado
    const updatedLead = { ...removedLead, status: newStatus };
    const newColumn = [...localLeads[newStatus as keyof typeof localLeads], updatedLead];
    
    // Atualiza o estado local
    setLocalLeads({
      ...localLeads,
      [currentStatus]: currentColumn,
      [newStatus]: newColumn
    });
    
    // Atualiza no servidor
    updateLeadStatusMutation.mutate({
      id: leadId,
      status: newStatus
    });
  };

  const getInterestTypeLabel = (interestType: string | null | undefined) => {
    if (!interestType) return "";
    
    return interestType === "purchase" ? "Compra" : "Aluguel";
  };
  
  const getFormattedDate = (dateString: string | Date | null) => {
    if (!dateString) return "Data desconhecida";
    
    const date = new Date(dateString);
    const now = new Date();
    const diffInDays = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60 * 24));
    
    if (diffInDays === 0) {
      return "Hoje";
    } else if (diffInDays === 1) {
      return "Ontem";
    } else {
      return `${diffInDays} dias atrás`;
    }
  };

  const columns = [
    { 
      id: "new", 
      title: "Novos Contatos", 
      color: "bg-blue-500", 
      leads: localLeads.new 
    },
    { 
      id: "contacted", 
      title: "Em Contato", 
      color: "bg-yellow-500", 
      leads: localLeads.contacted 
    },
    { 
      id: "visit", 
      title: "Visita Agendada", 
      color: "bg-orange-500", 
      leads: localLeads.visit 
    },
    { 
      id: "proposal", 
      title: "Proposta", 
      color: "bg-green-500", 
      leads: localLeads.proposal 
    }
  ];

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {[1, 2, 3, 4].map((colIndex) => (
          <Card key={colIndex} className="p-4 rounded-xl shadow-sm">
            <div className="h-6 w-2/3 bg-gray-200 animate-pulse rounded mb-4"></div>
            <div className="space-y-3 min-h-[400px]">
              {[1, 2, 3].map((itemIndex) => (
                <div 
                  key={itemIndex} 
                  className="bg-gray-100 border border-gray-200 p-3 rounded-lg animate-pulse h-24"
                ></div>
              ))}
            </div>
          </Card>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
      {columns.map((column) => (
        <div key={column.id} className="rounded-lg">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium flex items-center text-indigo-700">
              {column.title}
              <span className="ml-2 text-gray-500 text-sm font-normal">
                ({column.leads.length})
              </span>
            </h3>
            <Button 
              variant="ghost" 
              size="sm" 
              className="text-indigo-700 hover:text-indigo-800 h-8 w-8 p-0 rounded-full bg-indigo-50"
            >
              <i className="ri-add-line"></i>
            </Button>
          </div>
          
          <div className="space-y-3 min-h-[400px]">
            {column.leads.length === 0 ? (
              <div className="bg-gray-50 border border-gray-200 p-6 rounded-lg flex flex-col items-center justify-center h-32">
                <p className="text-gray-400 text-sm">Nenhum lead neste estágio</p>
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-indigo-600 hover:text-indigo-700 mt-2"
                >
                  <i className="ri-add-line mr-1"></i> Adicionar lead
                </Button>
              </div>
            ) : (
              column.leads.map((lead) => (
                <div
                  key={lead.id}
                  className="bg-white border border-gray-200 p-4 rounded-lg hover:shadow-md transition"
                >
                  <div className="flex justify-between items-center mb-2">
                    <h4 className="font-medium text-gray-800">{lead.name}</h4>
                    <div className="flex items-center space-x-1">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                      >
                        <i className="ri-pencil-line"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-7 w-7 p-0 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-full"
                      >
                        <i className="ri-more-2-line"></i>
                      </Button>
                    </div>
                  </div>
                  
                  <div className="flex items-center text-sm text-gray-500 mb-3">
                    <i className="ri-phone-line mr-1"></i>
                    <span>{lead.phone || "Sem telefone"}</span>
                    
                    {lead.email && (
                      <>
                        <span className="mx-2">•</span>
                        <i className="ri-mail-line mr-1"></i>
                        <span className="truncate max-w-[100px]">{lead.email}</span>
                      </>
                    )}
                  </div>
                  
                  <div className="flex flex-wrap gap-2 mb-3">
                    <span className={`${
                      lead.interestType === "purchase" 
                        ? "bg-blue-50 text-blue-600" 
                        : "bg-purple-50 text-purple-600"
                    } text-xs px-2 py-1 rounded-md inline-flex items-center`}>
                      <i className={lead.interestType === "purchase" ? "ri-home-4-line mr-1" : "ri-key-line mr-1"}></i>
                      {getInterestTypeLabel(lead.interestType)}
                    </span>
                    
                    <span className="bg-gray-50 text-gray-600 text-xs px-2 py-1 rounded-md inline-flex items-center">
                      <i className="ri-time-line mr-1"></i>
                      {getFormattedDate(lead.createdAt)}
                    </span>
                    
                    {lead.budget && (
                      <span className="bg-green-50 text-green-600 text-xs px-2 py-1 rounded-md inline-flex items-center">
                        <i className="ri-money-dollar-circle-line mr-1"></i>
                        R$ {lead.budget.toLocaleString('pt-BR')}
                      </span>
                    )}
                  </div>
                  
                  {lead.message && (
                    <p className="text-sm text-gray-600 border-t border-gray-100 pt-2">
                      {lead.message.length > 100 ? lead.message.substring(0, 100) + '...' : lead.message}
                    </p>
                  )}
                  
                  <div className="flex justify-between items-center mt-3 pt-2 border-t border-gray-100">
                    <div className="flex items-center text-xs text-gray-500">
                      <i className="ri-user-line mr-1"></i>
                      <span>Fonte: {lead.source}</span>
                    </div>
                    
                    <div className="flex">
                      {column.id !== "new" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-indigo-600 text-xs rounded-full"
                          onClick={() => moveLead(lead.id, lead.status, "new")}
                          title="Mover para Novos"
                        >
                          <i className="ri-arrow-left-line"></i>
                        </Button>
                      )}
                      
                      {column.id !== "proposal" && (
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          className="text-gray-400 hover:text-indigo-600 text-xs rounded-full"
                          onClick={() => {
                            // Determinar próximo estágio
                            const stages = ["new", "contacted", "visit", "proposal"];
                            const currentIndex = stages.indexOf(column.id);
                            const nextStage = stages[currentIndex + 1];
                            moveLead(lead.id, lead.status, nextStage);
                          }}
                          title="Avançar para próximo estágio"
                        >
                          <i className="ri-arrow-right-line"></i>
                        </Button>
                      )}
                    </div>
                  </div>
                  
                </div>
              ))
            )}
          </div>
        </div>
      ))}
    </div>
  );
}