import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import SimplifiedKanbanBoard from "@/components/crm/SimplifiedKanbanBoard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Lead } from "@shared/schema";

export default function CRM() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  
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
  
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">CRM - Gestão de Leads</h2>
        <div className="flex space-x-2">
          <Button variant="outline">
            <i className="ri-filter-line mr-1"></i> Filtros
          </Button>
          <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
            <DialogTrigger asChild>
              <Button>
                <i className="ri-add-line mr-1"></i> Novo Lead
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
              <DialogHeader>
                <DialogTitle>Adicionar Novo Lead</DialogTitle>
              </DialogHeader>
              {/* Add Lead Form would go here */}
              <div className="py-4">
                <p className="text-center text-muted-foreground">
                  Formulário de cadastro de leads será implementado aqui
                </p>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center items-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
        </div>
      ) : (
        <SimplifiedKanbanBoard 
          newLeads={newLeads || []}
          contactedLeads={contactedLeads || []}
          visitLeads={visitLeads || []}
          proposalLeads={proposalLeads || []}
        />
      )}
    </div>
  );
}
