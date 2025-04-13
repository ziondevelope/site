import { DragDropContext, Droppable, Draggable } from "react-beautiful-dnd";
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

export default function KanbanBoard({ 
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
  
  // Estado para controlar se o componente está montado
  const [isMounted, setIsMounted] = useState(false);
  
  // Inicializa o componente
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);
  
  // Atualiza os dados locais quando as props forem alteradas
  useEffect(() => {
    if (isMounted) {
      setLocalLeads({
        new: newLeads || [],
        contacted: contactedLeads || [],
        visit: visitLeads || [],
        proposal: proposalLeads || []
      });
    }
  }, [newLeads, contactedLeads, visitLeads, proposalLeads, isMounted]);

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

  const handleDragEnd = (result: any) => {
    if (!result.destination) return;
    
    const { source, destination, draggableId } = result;
    
    if (source.droppableId === destination.droppableId) {
      // Reordering within the same column
      const column = [...localLeads[source.droppableId as keyof typeof localLeads]];
      const [removed] = column.splice(source.index, 1);
      column.splice(destination.index, 0, removed);
      
      setLocalLeads({
        ...localLeads,
        [source.droppableId]: column
      });
    } else {
      // Moving to another column
      const sourceColumn = [...localLeads[source.droppableId as keyof typeof localLeads]];
      const destColumn = [...localLeads[destination.droppableId as keyof typeof localLeads]];
      const [removed] = sourceColumn.splice(source.index, 1);
      
      // Update the lead status
      const updatedLead = { ...removed, status: destination.droppableId };
      destColumn.splice(destination.index, 0, updatedLead);
      
      setLocalLeads({
        ...localLeads,
        [source.droppableId]: sourceColumn,
        [destination.droppableId]: destColumn
      });
      
      // Call API to update status
      updateLeadStatusMutation.mutate({ 
        id: parseInt(draggableId), 
        status: destination.droppableId 
      });
    }
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

  // Se o componente não estiver montado, mostre apenas o esqueleto
  if (!isMounted) {
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
    <DragDropContext onDragEnd={handleDragEnd}>
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
            
            <Droppable droppableId={column.id}>
              {(provided) => (
                <div
                  ref={provided.innerRef}
                  {...provided.droppableProps}
                  className="space-y-3 min-h-[400px]"
                >
                  {column.leads.map((lead, index) => (
                    <Draggable 
                      key={lead.id} 
                      draggableId={lead.id.toString()} 
                      index={index}
                    >
                      {(provided) => (
                        <div
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                          className="bg-white border border-gray-200 p-3 rounded-lg shadow-sm hover:shadow-md transition cursor-move"
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
                            <div className="flex space-x-1">
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
                        </div>
                      )}
                    </Draggable>
                  ))}
                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </Card>
        ))}
      </div>
    </DragDropContext>
  );
}
