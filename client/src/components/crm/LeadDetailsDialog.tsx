import React, { useState } from "react";
import { User, Plus, Phone, Mail } from "lucide-react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Lead, FunnelStage, SalesFunnel } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaWhatsapp } from "react-icons/fa";

interface LeadDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  lead: Lead | null;
  stages: FunnelStage[] | undefined;
  funnels: SalesFunnel[] | undefined;
  onDelete: (lead: Lead) => void;
}

export default function LeadDetailsDialog({
  open,
  onOpenChange,
  lead,
  stages,
  funnels,
  onDelete
}: LeadDetailsDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [leadNotes, setLeadNotes] = useState<{[leadId: number]: string}>({});
  const [savedNotes, setSavedNotes] = useState<{[leadId: number]: Array<{text: string, date: Date}>}>({});

  // Módulos para o editor React Quill
  const quillModules = {
    toolbar: [
      ['bold', 'italic', 'underline']
    ]
  };

  // Função para salvar a nota
  const handleSaveNote = (leadId: number) => {
    if (!lead) return;
    
    const noteText = leadNotes[leadId] || "";
    
    if (noteText.trim() === "") {
      toast({
        title: "Nota vazia",
        description: "Por favor, digite algum texto para salvar uma nota.",
        variant: "destructive"
      });
      return;
    }
    
    // Adiciona a nova nota ao array de notas salvas para o lead específico
    setSavedNotes(prev => {
      const leadNotes = prev[leadId] || [];
      return {
        ...prev,
        [leadId]: [...leadNotes, {
          text: noteText,
          date: new Date()
        }]
      };
    });
    
    // Limpa o campo de texto
    setLeadNotes(prev => ({
      ...prev,
      [leadId]: ""
    }));
    
    toast({
      title: "Nota salva",
      description: "Sua nota foi salva com sucesso!",
    });
  };

  if (!lead) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
        <VisuallyHidden>
          <DialogTitle>Detalhes do Lead</DialogTitle>
        </VisuallyHidden>
        
        {/* Header com nome do lead e botões de ação */}
        <div className="bg-white">
          <div className="flex justify-between items-center p-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                <User className="h-5 w-5" />
              </div>
              <div>
                <h2 className="text-lg font-semibold">{lead.name}</h2>
                <p className="text-sm text-gray-500">
                  Lead do {lead.source === 'facebook' ? 'Facebook' : 
                          lead.source === 'manual' ? 'Manual' : 
                          lead.source === 'website' ? 'Website' : 
                          lead.source} · Criado em: {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Button 
                variant="outline" 
                className="h-9 px-3 text-sm border-red-200 text-red-600 hover:text-red-700 hover:bg-red-50"
                onClick={() => onDelete(lead)}
              >
                Excluir lead
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm">
                Editar lead
              </Button>
            </div>
          </div>
          
          {/* Estágios do funil com números e círculos */}
          <div className="flex justify-center items-center py-5 bg-gray-50">
            <div className="flex items-center">
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                  style={{ backgroundColor: '#3b82f6' }}
                  onClick={() => {
                    // Update to first stage
                    const firstStage = stages?.find(s => s.position === 0);
                    if (firstStage) {
                      apiRequest(`/api/leads/${lead.id}/stage`, {
                        method: "PATCH",
                        body: JSON.stringify({ stageId: firstStage.id }),
                      })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                          toast({
                            title: "Estágio atualizado",
                            description: "O estágio do lead foi atualizado com sucesso.",
                          });
                        })
                        .catch(error => console.error("Erro ao atualizar estágio:", error));
                    }
                  }}
                >
                  1
                </div>
                <div className="mt-14 absolute text-xs font-medium" style={{ transform: 'translateX(-50%)', marginLeft: '20px' }}>
                  Novo
                </div>
                <div className="h-[2px] w-24" style={{ backgroundColor: '#3b82f6' }}></div>
              </div>
              
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-white cursor-pointer"
                  style={{ backgroundColor: '#3b82f6' }}
                  onClick={() => {
                    // Update to second stage
                    const secondStage = stages?.find(s => s.position === 1);
                    if (secondStage) {
                      apiRequest(`/api/leads/${lead.id}/stage`, {
                        method: "PATCH",
                        body: JSON.stringify({ stageId: secondStage.id }),
                      })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                          toast({
                            title: "Estágio atualizado",
                            description: "O estágio do lead foi atualizado com sucesso.",
                          });
                        })
                        .catch(error => console.error("Erro ao atualizar estágio:", error));
                    }
                  }}
                >
                  2
                </div>
                <div className="mt-14 absolute text-xs font-medium" style={{ transform: 'translateX(-50%)', marginLeft: '20px' }}>
                  Contato Feito
                </div>
                <div className="h-[2px] w-24" style={{ backgroundColor: '#E5E7EB' }}></div>
              </div>
              
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 cursor-pointer"
                  style={{ backgroundColor: '#E5E7EB' }}
                  onClick={() => {
                    // Update to third stage
                    const thirdStage = stages?.find(s => s.position === 2);
                    if (thirdStage) {
                      apiRequest(`/api/leads/${lead.id}/stage`, {
                        method: "PATCH",
                        body: JSON.stringify({ stageId: thirdStage.id }),
                      })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                          toast({
                            title: "Estágio atualizado",
                            description: "O estágio do lead foi atualizado com sucesso.",
                          });
                        })
                        .catch(error => console.error("Erro ao atualizar estágio:", error));
                    }
                  }}
                >
                  3
                </div>
                <div className="mt-14 absolute text-xs font-medium" style={{ transform: 'translateX(-50%)', marginLeft: '20px' }}>
                  Follow Up
                </div>
                <div className="h-[2px] w-24" style={{ backgroundColor: '#E5E7EB' }}></div>
              </div>
              
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 cursor-pointer"
                  style={{ backgroundColor: '#E5E7EB' }}
                  onClick={() => {
                    // Update to fourth stage
                    const fourthStage = stages?.find(s => s.position === 3);
                    if (fourthStage) {
                      apiRequest(`/api/leads/${lead.id}/stage`, {
                        method: "PATCH",
                        body: JSON.stringify({ stageId: fourthStage.id }),
                      })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                          toast({
                            title: "Estágio atualizado",
                            description: "O estágio do lead foi atualizado com sucesso.",
                          });
                        })
                        .catch(error => console.error("Erro ao atualizar estágio:", error));
                    }
                  }}
                >
                  4
                </div>
                <div className="mt-14 absolute text-xs font-medium" style={{ transform: 'translateX(-50%)', marginLeft: '20px' }}>
                  Contrato
                </div>
                <div className="h-[2px] w-24" style={{ backgroundColor: '#E5E7EB' }}></div>
              </div>
              
              <div className="flex items-center">
                <div
                  className="w-10 h-10 rounded-full flex items-center justify-center text-gray-700 cursor-pointer"
                  style={{ backgroundColor: '#E5E7EB' }}
                  onClick={() => {
                    // Update to fifth stage
                    const fifthStage = stages?.find(s => s.position === 4);
                    if (fifthStage) {
                      apiRequest(`/api/leads/${lead.id}/stage`, {
                        method: "PATCH",
                        body: JSON.stringify({ stageId: fifthStage.id }),
                      })
                        .then(() => {
                          queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                          toast({
                            title: "Estágio atualizado",
                            description: "O estágio do lead foi atualizado com sucesso.",
                          });
                        })
                        .catch(error => console.error("Erro ao atualizar estágio:", error));
                    }
                  }}
                >
                  5
                </div>
                <div className="mt-14 absolute text-xs font-medium" style={{ transform: 'translateX(-50%)', marginLeft: '20px' }}>
                  Concluído
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Content area with tabs and info panels */}
        <div className="bg-gray-100">
          {/* Tabs */}
          <div className="flex border-b border-gray-200 bg-white">
            <div className="px-4 py-2 border-b-2 border-blue-600 font-semibold text-blue-600">
              Nota
            </div>
            <div className="px-4 py-2 text-gray-500">
              Criar tarefa
            </div>
            <div className="px-4 py-2 text-gray-500">
              Email
            </div>
            <div className="px-4 py-2 text-gray-500">
              Whatsapp
            </div>
          </div>
          
          {/* Content grid with two panels */}
          <div className="grid grid-cols-1 md:grid-cols-12 gap-6 p-4">
            {/* Left panel - Lead information */}
            <div className="md:col-span-4">
              {/* Lead basic info panel */}
              <div className="bg-white rounded-lg mb-4">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="font-medium text-gray-700">INFORMAÇÕES DO LEAD</h3>
                  <button className="text-gray-500 text-sm">Editar</button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Etapa:</p>
                    <p className="text-sm text-gray-800">
                      {stages && stages.find(s => s.id === lead.stageId)?.name || "Contato Feito"}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Nome:</p>
                    <p className="text-sm text-gray-800">{lead.name}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">E-mail:</p>
                    <p className="text-sm text-gray-800">{lead.email || "contato@gmail.com"}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Telefone:</p>
                    <p className="text-sm text-gray-800">{lead.phone || "(21) 9 8585 9264"}</p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">Whatsapp:</p>
                    <p className="text-sm text-gray-800">{(lead as any).whatsapp || lead.phone || "(21) 9 8585 9264"}</p>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Entrar em Contato
                    </Button>
                  </div>
                </div>
              </div>
              
              {/* Lead interest profile panel */}
              <div className="bg-white rounded-lg">
                <div className="flex justify-between items-center border-b p-4">
                  <h3 className="font-medium text-gray-700">PERFIL DE INTERESSE</h3>
                  <button className="text-gray-500 text-sm">Editar</button>
                </div>
                <div className="p-4">
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Tipo de Negócio:</p>
                    <p className="text-sm text-gray-800">
                      {lead.interestType === 'purchase' ? 'Compra' :
                       lead.interestType === 'rent' ? 'Aluguel' :
                       lead.interestType === 'sale' ? 'Venda' : 'Compra'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Tipo de imóvel:</p>
                    <p className="text-sm text-gray-800">
                      {(lead as any).propertyType === 'apartment' ? 'Apartamento' :
                       (lead as any).propertyType === 'house' ? 'Casa' :
                       (lead as any).propertyType === 'commercial' ? 'Comercial' : 'Apartamento'}
                    </p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Região:</p>
                    <p className="text-sm text-gray-800">{(lead as any).region || "Rio de Janeiro"}</p>
                  </div>
                  
                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-600">Faixa de Preço:</p>
                    <p className="text-sm text-gray-800">
                      {lead.budget ? `R$ ${lead.budget.toLocaleString('pt-BR')}` : "R$ 5.000.000,00"}
                    </p>
                  </div>
                  
                  <div className="mb-2">
                    <p className="text-sm font-medium text-gray-600">Origem do Lead:</p>
                    <p className="text-sm text-gray-800">
                      {lead.source === 'manual' ? 'Manual' :
                       lead.source === 'website' ? 'Website' :
                       lead.source === 'facebook' ? 'Facebook' :
                       lead.source === 'instagram' ? 'Instagram' :
                       lead.source === 'whatsapp' ? 'WhatsApp' : 'Internet'}
                    </p>
                  </div>
                  
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full text-blue-600 border-blue-200 hover:bg-blue-50"
                    >
                      Entrar em Contato
                    </Button>
                  </div>
                </div>
              </div>
            </div>
            
            {/* Right panel - Notes/communication area */}
            <div className="md:col-span-8">
              <div className="bg-white rounded-lg p-4 h-full">
                {/* Note editor */}
                <div className="h-[300px]">
                  <ReactQuill
                    value={leadNotes[lead.id] || ""}
                    onChange={(content) => 
                      setLeadNotes(prev => ({
                        ...prev,
                        [lead.id]: content
                      }))
                    }
                    modules={quillModules}
                    className="h-full"
                  />
                </div>
                
                {/* Save button */}
                <div className="flex justify-end mt-4">
                  <Button
                    className="bg-blue-600 hover:bg-blue-700"
                    onClick={() => handleSaveNote(lead.id)}
                  >
                    Salvar
                  </Button>
                </div>
                
                {/* Existing notes */}
                <div className="mt-6">
                  <h3 className="text-lg font-medium mb-4">Notas Salvas</h3>
                  {savedNotes[lead.id] && savedNotes[lead.id].length > 0 ? (
                    <div className="space-y-4">
                      {savedNotes[lead.id].map((note, index) => (
                        <div key={index} className="p-3 bg-gray-50 rounded-lg">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-xs text-gray-500">
                              {new Date(note.date).toLocaleDateString('pt-BR')} {new Date(note.date).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <div className="text-sm text-left" dangerouslySetInnerHTML={{ __html: note.text }}></div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-6 text-gray-500 text-sm">
                      Nenhuma nota foi adicionada ainda.
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}