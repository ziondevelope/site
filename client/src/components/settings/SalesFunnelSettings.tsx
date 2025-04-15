import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { useToast } from "@/hooks/use-toast";
import { Separator } from "@/components/ui/separator";
import { SalesFunnel, FunnelStage } from "@shared/schema";
import { Trash2, Plus, GripVertical, Edit, Check, X } from "lucide-react";

interface SalesFunnelSettingsProps {
  // Não precisamos de configData ou onConfigChange porque esta configuração é independente
}

export default function SalesFunnelSettings({}: SalesFunnelSettingsProps) {
  const [activeFunnelId, setActiveFunnelId] = useState<number | null>(null);
  const [isNewFunnelDialogOpen, setIsNewFunnelDialogOpen] = useState(false);
  const [isNewStageDialogOpen, setIsNewStageDialogOpen] = useState(false);
  const [isEditStageDialogOpen, setIsEditStageDialogOpen] = useState(false);
  const [editingStageId, setEditingStageId] = useState<number | null>(null);
  const [newFunnelData, setNewFunnelData] = useState({ name: "", description: "", isDefault: false });
  const [newStageData, setNewStageData] = useState({ name: "", description: "", color: "#E5E7EB", position: 0 });
  const [editStageData, setEditStageData] = useState({ name: "", description: "", color: "#E5E7EB" });
  const { toast } = useToast();

  // Buscar todos os funis de vendas
  const { data: funnels, isLoading: isFunnelsLoading } = useQuery<SalesFunnel[]>({
    queryKey: ['/api/sales-funnels'],
  });
  
  // Buscar os estágios do funil ativo
  const { data: stages, isLoading: isStagesLoading } = useQuery<FunnelStage[]>({
    queryKey: ['/api/funnel-stages', activeFunnelId],
    enabled: activeFunnelId !== null,
  });

  // Mutações para realizar operações CRUD
  const createFunnelMutation = useMutation({
    mutationFn: async (data: typeof newFunnelData) => {
      return apiRequest('/api/sales-funnels', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-funnels'] });
      setIsNewFunnelDialogOpen(false);
      setNewFunnelData({ name: "", description: "", isDefault: false });
      toast({
        title: "Sucesso!",
        description: "Funil de vendas criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o funil de vendas.",
        variant: "destructive",
      });
    },
  });

  const setDefaultFunnelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/sales-funnels/${id}/set-default`, {
        method: 'POST',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-funnels'] });
      toast({
        title: "Sucesso!",
        description: "Funil padrão definido com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível definir o funil padrão.",
        variant: "destructive",
      });
    },
  });

  const deleteFunnelMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/sales-funnels/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/sales-funnels'] });
      if (activeFunnelId && funnels && funnels.length > 1) {
        const remainingFunnels = funnels.filter(f => f.id !== activeFunnelId);
        if (remainingFunnels.length > 0) {
          setActiveFunnelId(remainingFunnels[0].id);
        } else {
          setActiveFunnelId(null);
        }
      } else {
        setActiveFunnelId(null);
      }
      toast({
        title: "Sucesso!",
        description: "Funil de vendas excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o funil de vendas. Verifique se não é o funil padrão.",
        variant: "destructive",
      });
    },
  });

  const createStageMutation = useMutation({
    mutationFn: async (data: typeof newStageData & { funnelId: number }) => {
      return apiRequest('/api/funnel-stages', {
        method: 'POST',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', activeFunnelId] });
      setIsNewStageDialogOpen(false);
      setNewStageData({ name: "", description: "", color: "#E5E7EB", position: 0 });
      toast({
        title: "Sucesso!",
        description: "Estágio criado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível criar o estágio.",
        variant: "destructive",
      });
    },
  });

  const updateStageMutation = useMutation({
    mutationFn: async (data: { id: number, data: typeof editStageData }) => {
      return apiRequest(`/api/funnel-stages/${data.id}`, {
        method: 'PATCH',
        body: JSON.stringify(data.data),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', activeFunnelId] });
      setIsEditStageDialogOpen(false);
      setEditingStageId(null);
      setEditStageData({ name: "", description: "", color: "#E5E7EB" });
      toast({
        title: "Sucesso!",
        description: "Estágio atualizado com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível atualizar o estágio.",
        variant: "destructive",
      });
    },
  });

  const deleteStageMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/funnel-stages/${id}`, {
        method: 'DELETE',
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', activeFunnelId] });
      toast({
        title: "Sucesso!",
        description: "Estágio excluído com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível excluir o estágio.",
        variant: "destructive",
      });
    },
  });

  const reorderStagesMutation = useMutation({
    mutationFn: async ({ funnelId, stageIds }: { funnelId: number, stageIds: number[] }) => {
      return apiRequest(`/api/sales-funnels/${funnelId}/reorder-stages`, {
        method: 'POST',
        body: JSON.stringify({ stageIds }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', activeFunnelId] });
      toast({
        title: "Sucesso!",
        description: "Ordem dos estágios atualizada com sucesso.",
      });
    },
    onError: () => {
      toast({
        title: "Erro",
        description: "Não foi possível reordenar os estágios.",
        variant: "destructive",
      });
    },
  });

  // Definir o primeiro funil como ativo quando os dados forem carregados
  useEffect(() => {
    if (funnels && funnels.length > 0 && activeFunnelId === null) {
      // Tentar encontrar o funil padrão primeiro
      const defaultFunnel = funnels.find(f => f.isDefault);
      if (defaultFunnel) {
        setActiveFunnelId(defaultFunnel.id);
      } else {
        setActiveFunnelId(funnels[0].id);
      }
    }
  }, [funnels, activeFunnelId]);

  // Função para iniciar a edição de um estágio
  const handleEditStage = (stage: FunnelStage) => {
    setEditingStageId(stage.id);
    setEditStageData({
      name: stage.name,
      description: stage.description || "",
      color: stage.color || "#E5E7EB"
    });
    setIsEditStageDialogOpen(true);
  };

  // Funções de manipulação de arrastamento para reordenar estágios
  const [draggedStageId, setDraggedStageId] = useState<number | null>(null);
  const [dragOverStageId, setDragOverStageId] = useState<number | null>(null);

  const handleDragStart = (e: React.DragEvent<HTMLDivElement>, stageId: number) => {
    setDraggedStageId(stageId);
    e.dataTransfer.effectAllowed = 'move';
    // Algumas lógicas adicionais podem ser necessárias para navegadores específicos
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>, stageId: number) => {
    e.preventDefault();
    if (draggedStageId !== stageId) {
      setDragOverStageId(stageId);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    if (draggedStageId !== null && dragOverStageId !== null && stages) {
      // Encontrar os índices dos estágios envolvidos
      const draggedIndex = stages.findIndex(s => s.id === draggedStageId);
      const dropIndex = stages.findIndex(s => s.id === dragOverStageId);
      
      if (draggedIndex !== -1 && dropIndex !== -1) {
        // Criar uma nova ordem dos estágios
        const newStages = [...stages];
        const [removed] = newStages.splice(draggedIndex, 1);
        newStages.splice(dropIndex, 0, removed);
        
        // Enviar a nova ordem para o servidor
        reorderStagesMutation.mutate({
          funnelId: activeFunnelId!,
          stageIds: newStages.map(s => s.id)
        });
      }
    }
    
    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  const handleDragEnd = () => {
    setDraggedStageId(null);
    setDragOverStageId(null);
  };

  const activeFunnel = funnels?.find(f => f.id === activeFunnelId);

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-1.5">
        <h3 className="text-lg font-medium leading-6 text-gray-900">
          Configuração de Funis de Vendas
        </h3>
        <p className="text-sm text-gray-500">
          Configure seus funis de vendas e estágios para acompanhar seus leads de maneira eficiente.
        </p>
      </div>

      <Separator />

      <div className="grid grid-cols-4 gap-6">
        {/* Lista de Funis à Esquerda */}
        <div className="col-span-1 space-y-4">
          <div className="flex justify-between items-center">
            <h4 className="text-sm font-medium">Meus Funis</h4>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setIsNewFunnelDialogOpen(true)}
            >
              <Plus className="h-4 w-4 mr-1" /> Novo
            </Button>
          </div>
          
          <div className="border rounded-md overflow-hidden">
            {isFunnelsLoading ? (
              <div className="p-4 text-center text-sm text-gray-500">Carregando...</div>
            ) : funnels && funnels.length > 0 ? (
              <div className="divide-y">
                {funnels.map(funnel => (
                  <div 
                    key={funnel.id}
                    className={`p-3 cursor-pointer flex justify-between items-center hover:bg-gray-50 ${
                      activeFunnelId === funnel.id ? 'bg-gray-100 font-medium' : ''
                    }`}
                    onClick={() => setActiveFunnelId(funnel.id)}
                  >
                    <div className="flex items-center">
                      <span>{funnel.name}</span>
                      {funnel.isDefault && (
                        <span className="ml-2 px-1.5 py-0.5 text-xs bg-green-100 text-green-800 rounded">
                          Padrão
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="p-4 text-center text-sm text-gray-500">
                Nenhum funil configurado. Crie seu primeiro funil!
              </div>
            )}
          </div>
        </div>

        {/* Detalhes do Funil e Estágios à Direita */}
        <div className="col-span-3 space-y-6">
          {activeFunnel ? (
            <>
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-semibold">{activeFunnel.name}</h3>
                  {activeFunnel.description && (
                    <p className="text-sm text-gray-500 mt-1">{activeFunnel.description}</p>
                  )}
                </div>
                <div className="flex space-x-2">
                  {!activeFunnel.isDefault && (
                    <Button 
                      variant="outline" 
                      size="sm"
                      onClick={() => setDefaultFunnelMutation.mutate(activeFunnel.id)}
                    >
                      <Check className="h-4 w-4 mr-1" /> Definir como Padrão
                    </Button>
                  )}
                  {!activeFunnel.isDefault && (
                    <Button 
                      variant="destructive" 
                      size="sm"
                      onClick={() => {
                        if (confirm("Tem certeza que deseja excluir este funil? Esta ação não pode ser desfeita.")) {
                          deleteFunnelMutation.mutate(activeFunnel.id);
                        }
                      }}
                    >
                      <Trash2 className="h-4 w-4 mr-1" /> Excluir
                    </Button>
                  )}
                </div>
              </div>

              <Separator />

              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <h4 className="text-md font-medium">Estágios do Funil</h4>
                  <Button 
                    size="sm"
                    onClick={() => setIsNewStageDialogOpen(true)}
                  >
                    <Plus className="h-4 w-4 mr-1" /> Adicionar Estágio
                  </Button>
                </div>

                <div className="border rounded-lg overflow-hidden">
                  {isStagesLoading ? (
                    <div className="p-4 text-center text-sm text-gray-500">Carregando estágios...</div>
                  ) : stages && stages.length > 0 ? (
                    <div className="divide-y">
                      {stages.map(stage => (
                        <div 
                          key={stage.id}
                          className="p-4 hover:bg-gray-50 flex items-center"
                          draggable
                          onDragStart={(e) => handleDragStart(e, stage.id)}
                          onDragOver={(e) => handleDragOver(e, stage.id)}
                          onDrop={handleDrop}
                          onDragEnd={handleDragEnd}
                          style={{
                            backgroundColor: dragOverStageId === stage.id ? '#f3f4f6' : '',
                            opacity: draggedStageId === stage.id ? 0.5 : 1
                          }}
                        >
                          <div className="cursor-move mr-3">
                            <GripVertical className="h-5 w-5 text-gray-400" />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <div 
                                className="w-4 h-4 rounded-full mr-2" 
                                style={{ backgroundColor: stage.color || '#E5E7EB' }}
                              />
                              <h5 className="font-medium">{stage.name}</h5>
                            </div>
                            {stage.description && (
                              <p className="text-sm text-gray-500 mt-1">{stage.description}</p>
                            )}
                          </div>
                          
                          <div className="flex space-x-2">
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => handleEditStage(stage)}
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => {
                                if (confirm("Tem certeza que deseja excluir este estágio? Esta ação não pode ser desfeita.")) {
                                  deleteStageMutation.mutate(stage.id);
                                }
                              }}
                            >
                              <Trash2 className="h-4 w-4 text-red-500" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="p-6 text-center">
                      <p className="text-sm text-gray-500">Nenhum estágio foi configurado neste funil.</p>
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => setIsNewStageDialogOpen(true)}
                      >
                        <Plus className="h-4 w-4 mr-1" /> Adicionar Estágio
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-8 border rounded-md">
              <p className="text-gray-500 mb-4">Selecione um funil para ver seus detalhes ou crie um novo.</p>
              <Button onClick={() => setIsNewFunnelDialogOpen(true)}>
                <Plus className="h-4 w-4 mr-1" /> Criar Novo Funil
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* Dialog para novo funil */}
      <Dialog open={isNewFunnelDialogOpen} onOpenChange={setIsNewFunnelDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Criar Novo Funil de Vendas</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="funnel-name">Nome do Funil*</Label>
              <Input 
                id="funnel-name" 
                value={newFunnelData.name} 
                onChange={(e) => setNewFunnelData({...newFunnelData, name: e.target.value})}
                placeholder="Ex: Vendas Residenciais" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="funnel-description">Descrição (opcional)</Label>
              <Textarea 
                id="funnel-description" 
                value={newFunnelData.description} 
                onChange={(e) => setNewFunnelData({...newFunnelData, description: e.target.value})}
                placeholder="Uma breve descrição sobre este funil" 
                rows={3}
              />
            </div>
            <div className="flex items-center space-x-2 pt-2">
              <Switch 
                id="default-funnel"
                checked={newFunnelData.isDefault}
                onCheckedChange={(checked) => setNewFunnelData({...newFunnelData, isDefault: checked})}
              />
              <Label htmlFor="default-funnel">Definir como funil padrão</Label>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewFunnelDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (!newFunnelData.name.trim()) {
                  toast({
                    title: "Erro",
                    description: "O nome do funil é obrigatório.",
                    variant: "destructive",
                  });
                  return;
                }
                createFunnelMutation.mutate(newFunnelData);
              }}
              disabled={createFunnelMutation.isPending}
            >
              {createFunnelMutation.isPending ? "Criando..." : "Criar Funil"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para novo estágio */}
      <Dialog open={isNewStageDialogOpen} onOpenChange={setIsNewStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adicionar Novo Estágio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="stage-name">Nome do Estágio*</Label>
              <Input 
                id="stage-name" 
                value={newStageData.name} 
                onChange={(e) => setNewStageData({...newStageData, name: e.target.value})}
                placeholder="Ex: Primeiro Contato" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-description">Descrição (opcional)</Label>
              <Textarea 
                id="stage-description" 
                value={newStageData.description} 
                onChange={(e) => setNewStageData({...newStageData, description: e.target.value})}
                placeholder="Uma breve descrição sobre este estágio" 
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="stage-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  id="stage-color" 
                  value={newStageData.color} 
                  onChange={(e) => setNewStageData({...newStageData, color: e.target.value})}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">
                  Escolha uma cor para representar este estágio
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsNewStageDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (!newStageData.name.trim()) {
                  toast({
                    title: "Erro",
                    description: "O nome do estágio é obrigatório.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!activeFunnelId) {
                  toast({
                    title: "Erro",
                    description: "Nenhum funil selecionado.",
                    variant: "destructive",
                  });
                  return;
                }
                
                // Calcular a próxima posição com base nos estágios existentes
                const nextPosition = stages && stages.length > 0
                  ? Math.max(...stages.map(s => s.position)) + 1
                  : 1;
                
                createStageMutation.mutate({
                  ...newStageData,
                  position: nextPosition,
                  funnelId: activeFunnelId
                });
              }}
              disabled={createStageMutation.isPending}
            >
              {createStageMutation.isPending ? "Adicionando..." : "Adicionar Estágio"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog para editar estágio */}
      <Dialog open={isEditStageDialogOpen} onOpenChange={setIsEditStageDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Editar Estágio</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label htmlFor="edit-stage-name">Nome do Estágio*</Label>
              <Input 
                id="edit-stage-name" 
                value={editStageData.name} 
                onChange={(e) => setEditStageData({...editStageData, name: e.target.value})}
                placeholder="Ex: Primeiro Contato" 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stage-description">Descrição (opcional)</Label>
              <Textarea 
                id="edit-stage-description" 
                value={editStageData.description} 
                onChange={(e) => setEditStageData({...editStageData, description: e.target.value})}
                placeholder="Uma breve descrição sobre este estágio" 
                rows={2}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-stage-color">Cor</Label>
              <div className="flex items-center space-x-2">
                <input 
                  type="color" 
                  id="edit-stage-color" 
                  value={editStageData.color} 
                  onChange={(e) => setEditStageData({...editStageData, color: e.target.value})}
                  className="w-10 h-10 border border-gray-300 rounded cursor-pointer"
                />
                <span className="text-sm text-gray-500">
                  Escolha uma cor para representar este estágio
                </span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setIsEditStageDialogOpen(false)}
            >
              Cancelar
            </Button>
            <Button 
              onClick={() => {
                if (!editStageData.name.trim()) {
                  toast({
                    title: "Erro",
                    description: "O nome do estágio é obrigatório.",
                    variant: "destructive",
                  });
                  return;
                }
                if (!editingStageId) {
                  toast({
                    title: "Erro",
                    description: "Nenhum estágio selecionado para edição.",
                    variant: "destructive",
                  });
                  return;
                }
                updateStageMutation.mutate({
                  id: editingStageId,
                  data: editStageData
                });
              }}
              disabled={updateStageMutation.isPending}
            >
              {updateStageMutation.isPending ? "Salvando..." : "Salvar Alterações"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}