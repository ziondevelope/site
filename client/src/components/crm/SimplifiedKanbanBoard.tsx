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
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
      {columns.map((column) => (
        <Card key={column.id} className="p-4 rounded-xl shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold flex items-center">
              <div className={`w-3 h-3 rounded-full ${column.color} mr-2`}></div>
              {column.title}
              <span className="ml-2 text-gray-500 text-sm font-normal">
                ({column.leads.length})
              </span>
            </h3>
            <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0">
              <i className="ri-add-line"></i>
            </Button>
          </div>
          
          <div className="space-y-3 min-h-[400px]">
            {column.leads.map((lead) => (
              <div
                key={lead.id}
                className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:shadow-md transition"
              >
                <div className="flex justify-between items-start">
                  <h4 className="font-medium">{lead.name}</h4>
                  <span className={`${
                    lead.interestType === "purchase" 
                      ? "bg-blue-100 text-blue-800" 
                      : "bg-purple-100 text-purple-800"
                  } text-xs px-2 py-1 rounded-full`}>
                    {getInterestTypeLabel(lead.interestType)}
                  </span>
                </div>
                <p className="text-sm text-gray-600 mt-1">{lead.message || ""}</p>
                <p className="text-xs text-gray-500 mt-2">
                  Via {lead.source} - {getFormattedDate(lead.createdAt)}
                </p>
                
                <div className="flex justify-between items-center mt-3">
                  <div className="flex items-center">
                    {lead.agentId ? (
                      <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                        A
                      </div>
                    ) : (
                      <div className="h-6 w-6"></div>
                    )}
                  </div>
                  
                  {/* Botões para mover o lead para outras colunas */}
                  <div className="flex items-center space-x-1">
                    {lead.status !== "new" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-7" 
                        onClick={() => moveLead(lead.id, lead.status, "new")}
                      >
                        Novo
                      </Button>
                    )}
                    {lead.status !== "contacted" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-7" 
                        onClick={() => moveLead(lead.id, lead.status, "contacted")}
                      >
                        Contato
                      </Button>
                    )}
                    {lead.status !== "visit" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-7" 
                        onClick={() => moveLead(lead.id, lead.status, "visit")}
                      >
                        Visita
                      </Button>
                    )}
                    {lead.status !== "proposal" && (
                      <Button 
                        size="sm" 
                        variant="outline" 
                        className="text-xs px-2 py-1 h-7" 
                        onClick={() => moveLead(lead.id, lead.status, "proposal")}
                      >
                        Proposta
                      </Button>
                    )}
                  </div>
                </div>
                
                <div className="flex justify-end space-x-1 mt-2">
                  {lead.phone && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-primary">
                      <i className="ri-phone-line"></i>
                    </Button>
                  )}
                  {lead.email && (
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-primary">
                      <i className="ri-mail-line"></i>
                    </Button>
                  )}
                  <Button variant="ghost" size="sm" className="h-6 w-6 p-0 text-gray-500 hover:text-primary">
                    <i className="ri-more-2-line"></i>
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      ))}
    </div>
  );
}