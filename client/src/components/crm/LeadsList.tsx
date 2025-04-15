import { useState } from "react";
import { Lead } from "@shared/schema";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";

// Componente para exibir um único lead em formato de card
const LeadCard = ({ lead }: { lead: Lead }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [status, setStatus] = useState(lead.status);
  const queryClient = useQueryClient();
  const { toast } = useToast();

  // Mutação para atualizar o status do lead
  const updateLeadStatusMutation = useMutation({
    mutationFn: (newStatus: string) => {
      return apiRequest(`/api/leads/${lead.id}/status`, { 
    method: 'PATCH',
    body: JSON.stringify({ status: newStatus })
  });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Status atualizado",
        description: "O status do lead foi atualizado com sucesso.",
      });
      setIsOpen(false);
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o status do lead.",
        variant: "destructive",
      });
    },
  });

  const handleStatusChange = (newStatus: string) => {
    setStatus(newStatus);
    updateLeadStatusMutation.mutate(newStatus);
  };

  // Função para formatar o orçamento
  const formatBudget = (budget?: number) => {
    if (!budget) return "Não informado";
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(budget);
  };

  // Função para mapear o status para texto em português
  const getStatusText = (status: string) => {
    const statusMap: Record<string, string> = {
      new: "Novo",
      contacted: "Contatado",
      visit: "Visita",
      proposal: "Proposta"
    };
    return statusMap[status] || status;
  };

  // Função para mapear o status para uma cor
  const getStatusColor = (status: string) => {
    const colorMap: Record<string, string> = {
      new: "bg-blue-100 text-blue-800",
      contacted: "bg-yellow-100 text-yellow-800",
      visit: "bg-green-100 text-green-800",
      proposal: "bg-purple-100 text-purple-800"
    };
    return colorMap[status] || "bg-gray-100 text-gray-800";
  };

  // Função para mapear o tipo de interesse para texto em português
  const getInterestTypeText = (interestType?: string) => {
    if (!interestType) return "Não informado";
    
    const interestMap: Record<string, string> = {
      purchase: "Compra",
      rent: "Aluguel"
    };
    return interestMap[interestType] || interestType;
  };

  const getSourceText = (source?: string) => {
    if (!source) return "Não informado";
    
    const sourceMap: Record<string, string> = {
      manual: "Manual",
      website: "Website",
      whatsapp: "WhatsApp",
      instagram: "Instagram",
      facebook: "Facebook",
      indicacao: "Indicação"
    };
    return sourceMap[source] || source;
  };

  return (
    <Card className="mb-3 hover:shadow-md transition-shadow">
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between">
          <div className="mb-2 md:mb-0 md:mr-4">
            <div className="flex items-center mb-1">
              <h3 className="font-medium text-gray-900 mr-2">{lead.name}</h3>
              <Badge className={`text-xs font-normal ${getStatusColor(lead.status)}`}>
                {getStatusText(lead.status)}
              </Badge>
            </div>
            <div className="text-sm text-gray-600">
              {lead.email && <div><i className="fas fa-envelope text-xs mr-1"></i> {lead.email}</div>}
              {lead.phone && <div><i className="fas fa-phone text-xs mr-1"></i> {lead.phone}</div>}
            </div>
          </div>
          
          <div className="flex flex-wrap text-sm text-gray-600 gap-x-4 md:text-right">
            <div>
              <strong className="text-gray-700">Interesse:</strong> {getInterestTypeText(lead.interestType)}
            </div>
            <div>
              <strong className="text-gray-700">Orçamento:</strong> {formatBudget(lead.budget)}
            </div>
            <div>
              <strong className="text-gray-700">Origem:</strong> {getSourceText(lead.source)}
            </div>
          </div>
          
          <div className="mt-2 md:mt-0 ml-auto flex items-center gap-2">
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <i className="fas fa-eye mr-1 text-xs"></i> Detalhes
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[550px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center gap-2">
                    Detalhes do Lead
                    <Badge className={`ml-2 ${getStatusColor(lead.status)}`}>
                      {getStatusText(lead.status)}
                    </Badge>
                  </DialogTitle>
                </DialogHeader>
                
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Nome</h4>
                      <p className="text-gray-900">{lead.name}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                      <Select 
                        value={status} 
                        onValueChange={handleStatusChange}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Selecione o status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="visit">Visita</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Email</h4>
                      <p className="text-gray-900">{lead.email || "Não informado"}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Telefone</h4>
                      <p className="text-gray-900">{lead.phone || "Não informado"}</p>
                    </div>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Tipo de Interesse</h4>
                      <p className="text-gray-900">{getInterestTypeText(lead.interestType)}</p>
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Orçamento</h4>
                      <p className="text-gray-900">{formatBudget(lead.budget)}</p>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Origem</h4>
                    <p className="text-gray-900">{getSourceText(lead.source)}</p>
                  </div>
                  
                  {lead.message && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Mensagem</h4>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                        {lead.message}
                      </div>
                    </div>
                  )}
                  
                  {lead.notes && (
                    <div>
                      <h4 className="text-sm font-medium text-gray-700 mb-1">Observações</h4>
                      <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                        {lead.notes}
                      </div>
                    </div>
                  )}
                  
                  <div className="mt-2">
                    <h4 className="text-sm font-medium text-gray-700 mb-1">Data de Criação</h4>
                    <p className="text-gray-900">
                      {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                    </p>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            
            <Select 
              value={lead.status} 
              onValueChange={handleStatusChange}
            >
              <SelectTrigger className="w-[140px] h-9">
                <SelectValue placeholder="Atualizar status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="new">Novo</SelectItem>
                <SelectItem value="contacted">Contatado</SelectItem>
                <SelectItem value="visit">Visita</SelectItem>
                <SelectItem value="proposal">Proposta</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface LeadsListProps {
  leads: Lead[];
  isLoading: boolean;
}

// Componente principal que mostra a lista de leads
export default function LeadsList({ leads, isLoading }: LeadsListProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="text-center py-10 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <div className="text-4xl mb-2">📋</div>
        <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum lead encontrado</h3>
        <p className="text-sm text-gray-500">Adicione novos leads para começar a gerenciar seus contatos.</p>
      </div>
    );
  }

  return (
    <div className="space-y-1">
      {leads.map((lead) => (
        <LeadCard key={lead.id} lead={lead} />
      ))}
    </div>
  );
}