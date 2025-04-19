import React, { useState, useEffect, useMemo, useRef } from "react";
import { Pencil, Check, X, User, Mail, Phone, Store, Home, MapPin, DollarSign, Tag, Filter, Trophy, MessageSquare, FileText, Bold, Italic, Underline, AlignLeft, AlignCenter, AlignRight, List, CalendarPlus, CheckCircle, FileEdit } from "lucide-react";
import ReactQuill from 'react-quill';
import 'react-quill/dist/quill.snow.css';
import { FaWhatsapp } from "react-icons/fa";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger, DialogClose } from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsertLead, Lead, FunnelStage, SalesFunnel, insertLeadSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

// Estilos personalizados para campos de edição com bordas mais sutis
const subtleEditingStyles = {
  input: {
    boxShadow: "none",
    border: '1px solid #e5e7eb',
    outline: "none",
    ringColor: 'transparent',
    ringOffset: '0'
  },
  select: {
    boxShadow: "none",
    border: '1px solid #e5e7eb',
    outline: "none",
    ringColor: 'transparent',
    ringOffset: '0'
  }
};

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
  const [leadNotes, setLeadNotes] = useState<{[leadId: number]: string}>({});
  const [savedNotes, setSavedNotes] = useState<{[leadId: number]: Array<{text: string, date: Date}>}>({});
  const [activeTab, setActiveTab] = useState<{[leadId: number]: string}>({});
  
  // Estados para gerenciamento de tarefas
  const [taskForm, setTaskForm] = useState<{
    [leadId: number]: {
      type: string;
      description: string;
      date: Date | null;
      time: string;
    }
  }>({});
  const [taskList, setTaskList] = useState<{
    [leadId: number]: Array<{
      id: number;
      type: string;
      description: string;
      date: Date;
      time: string;
      completed: boolean;
    }>
  }>({});
  const [taskIdCounter, setTaskIdCounter] = useState(1);
  
  // Módulos para o editor React Quill
  const quillModules = {
    toolbar: [
      ['bold', 'underline'] // removido o itálico
    ]
  };
  const [editingField, setEditingField] = useState<{leadId: number, field: string} | null>(null);
  const [editingValue, setEditingValue] = useState<string>("");
  
  // As funções de formatação não são mais necessárias, o ReactQuill já implementa formatação direta
  
  // Mutation para atualizar dados do lead
  const updateLeadFieldMutation = useMutation({
    mutationFn: ({ id, field, value }: { id: number; field: string; value: string }) => {
      console.log("Enviando dados:", { id, field, value });
      // Para campos que podem ser null, precisamos manter como string vazia se vazio
      const updateData = { [field]: value || "" };
      return apiRequest(`/api/leads/${id}`, {
        method: 'PATCH',
        body: JSON.stringify(updateData)
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      
      toast({
        title: "Campo atualizado",
        description: "As informações do lead foram atualizadas com sucesso.",
      });
      
      // Limpar estado de edição
      setEditingField(null);
      setEditingValue("");
    },
    onError: (error) => {
      console.error("Erro ao atualizar campo:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar as informações do lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });
  
  // Função para iniciar edição de um campo
  const handleStartEditing = (leadId: number, field: string, currentValue: string | null | undefined) => {
    setEditingField({ leadId, field });
    setEditingValue(currentValue || "");
  };
  
  // Função para salvar o valor editado
  const handleSaveEdit = () => {
    if (editingField) {
      updateLeadFieldMutation.mutate({
        id: editingField.leadId,
        field: editingField.field,
        value: editingValue
      });
    }
  };
  
  // Função para cancelar a edição
  const handleCancelEdit = () => {
    setEditingField(null);
    setEditingValue("");
  };
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Funções auxiliares para formatação de data
  const formatDate = (date: Date | string | null) => {
    try {
      if (date === null || date === undefined) {
        return "Data não definida";
      }
      
      // Se for string, tenta converter para Date
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verifica se a data é válida
      if (isNaN(dateObj.getTime())) {
        return "Data inválida";
      }
      
      return new Intl.DateTimeFormat('pt-BR', { 
        day: '2-digit', 
        month: '2-digit', 
        year: 'numeric' 
      }).format(dateObj);
    } catch (error) {
      console.error("Erro ao formatar data:", error);
      return "Data inválida";
    }
  };
  
  const formatTime = (date: Date | string | null) => {
    try {
      if (date === null || date === undefined) {
        return "Hora não definida";
      }
      
      // Se for string, tenta converter para Date
      const dateObj = typeof date === 'string' ? new Date(date) : date;
      
      // Verifica se a data é válida
      if (isNaN(dateObj.getTime())) {
        return "Hora inválida";
      }
      
      return new Intl.DateTimeFormat('pt-BR', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }).format(dateObj);
    } catch (error) {
      console.error("Erro ao formatar hora:", error);
      return "Hora inválida";
    }
  };
  
  // Função para definir a aba ativa
  const handleTabChange = (leadId: number, tabValue: string) => {
    setActiveTab(prev => ({
      ...prev,
      [leadId]: tabValue
    }));
  };

  // Função para salvar a nota
  const handleSaveNote = (leadId: number) => {
    const noteText = leadNotes[leadId] || "";
    
    if (noteText.trim() === "") {
      toast({
        title: "Nota vazia",
        description: "Por favor, digite algum texto para salvar uma nota.",
        variant: "destructive"
      });
      return;
    }
    
    // Chama a API para salvar a nota no banco de dados
    apiRequest(`/api/leads/${leadId}/notes`, {
      method: 'POST',
      body: JSON.stringify({ text: noteText })
    })
    .then((savedNote) => {
      // Limpa o campo de texto
      setLeadNotes(prev => ({
        ...prev,
        [leadId]: ""
      }));
      
      // Recarregar as notas do banco de dados para garantir que elas apareçam atualizadas
      fetchLeadNotes(leadId);
      
      toast({
        title: "Nota salva no banco",
        description: "Sua nota foi salva com sucesso!",
      });
    })
    .catch(error => {
      console.error("Erro ao salvar nota:", error);
      toast({
        title: "Erro ao salvar nota",
        description: "Não foi possível salvar a nota no banco de dados.",
        variant: "destructive"
      });
    });
  };
  
  // Inicializar o formulário de tarefa para um lead
  const initializeTaskForm = (leadId: number) => {
    if (!taskForm[leadId]) {
      setTaskForm(prev => ({
        ...prev,
        [leadId]: {
          type: "ligacao",
          description: "",
          date: null,
          time: ""
        }
      }));
    }
  };
  
  // Manipular a alteração nos campos do formulário de tarefa
  const handleTaskFormChange = (leadId: number, field: string, value: any) => {
    setTaskForm(prev => ({
      ...prev,
      [leadId]: {
        ...prev[leadId],
        [field]: value
      }
    }));
  };
  
  // Criar nova tarefa
  const handleCreateTask = (leadId: number) => {
    const form = taskForm[leadId];
    
    if (!form) {
      toast({
        title: "Erro",
        description: "Formulário de tarefa não inicializado",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.description) {
      toast({
        title: "Descrição necessária",
        description: "Por favor, adicione uma descrição para a tarefa",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.date) {
      toast({
        title: "Data necessária",
        description: "Por favor, selecione uma data para a tarefa",
        variant: "destructive"
      });
      return;
    }
    
    if (!form.time) {
      toast({
        title: "Horário necessário",
        description: "Por favor, selecione um horário para a tarefa",
        variant: "destructive"
      });
      return;
    }
    
    // Formatar a data/hora completa
    const taskDate = new Date(form.date as Date);
    const [hours, minutes] = form.time.split(':').map(Number);
    taskDate.setHours(hours, minutes);
    
    // Criar objeto da tarefa para o backend
    const taskData = {
      title: form.description,
      description: form.description,
      date: taskDate.toISOString(),
      type: form.type,
      status: "pending",
      leadId: leadId,
      agentId: 1  // Valor padrão para agentId para não quebrar a validação
    };
    
    console.log("Dados da tarefa a serem enviados:", taskData);
    
    // Salvar a tarefa no banco de dados
    apiRequest('/api/tasks-direct', {
      method: 'POST',
      body: JSON.stringify(taskData)
    })
    .then((savedTask) => {
      // Cria a nova tarefa local
      const newTask = {
        id: savedTask.id || taskIdCounter,
        type: form.type,
        description: form.description,
        date: form.date as Date,
        time: form.time,
        completed: false
      };
      
      // Atualiza a lista de tarefas
      setTaskList(prev => {
        const leadTasks = prev[leadId] || [];
        return {
          ...prev,
          [leadId]: [...leadTasks, newTask]
        };
      });
      
      // Adiciona a tarefa como atividade no histórico
      const taskTypeText = 
        form.type === "ligacao" ? "Ligação" :
        form.type === "email" ? "E-mail" : 
        form.type === "whatsapp" ? "WhatsApp" : "Tarefa";
      
      const formattedDate = form.date ? formatDate(form.date as Date) : "";
      
      // Criar e salvar uma nota para registrar a atividade
      const noteText = `<strong>${taskTypeText}</strong> agendada: ${form.description} - Data: ${formattedDate} às ${form.time}`;
      
      apiRequest(`/api/leads/${leadId}/notes`, {
        method: 'POST',
        body: JSON.stringify({ text: noteText })
      })
      .then(() => {
        // Recarregar as notas do lead após registrar uma atividade
        fetchLeadNotes(leadId);
      })
      .catch(error => {
        console.error("Erro ao salvar nota de tarefa:", error);
      });
      
      // Incrementa o contador de IDs (somente se necessário)
      if (!savedTask.id) {
        setTaskIdCounter(prev => prev + 1);
      }
      
      // Limpa o formulário
      setTaskForm(prev => ({
        ...prev,
        [leadId]: {
          type: "ligacao",
          description: "",
          date: null,
          time: ""
        }
      }));
      
      // Atualizar a lista de tarefas agendadas
      queryClient.invalidateQueries({ queryKey: ['/api/tasks/scheduled'] });
      
      toast({
        title: "Tarefa criada no banco",
        description: `${taskTypeText} agendada com sucesso!`,
      });
    })
    .catch(error => {
      console.error("Erro ao criar tarefa:", error);
      toast({
        title: "Erro ao criar tarefa",
        description: "Não foi possível salvar a tarefa no banco de dados.",
        variant: "destructive"
      });
    });
  };
  
  // Marcar tarefa como concluída
  const handleCompleteTask = (leadId: number, taskId: number) => {
    // Atualizar a tarefa no banco de dados
    apiRequest(`/api/tasks/${taskId}/complete`, {
      method: 'PATCH',
      body: JSON.stringify({ status: 'completed' })
    })
    .then((updatedTask) => {
      // Atualizar a lista de tarefas na interface
      setTaskList(prev => {
        const leadTasks = prev[leadId] || [];
        const updatedTasks = leadTasks.map(task => 
          task.id === taskId ? { ...task, completed: true } : task
        );
        
        return {
          ...prev,
          [leadId]: updatedTasks
        };
      });
      
      // Adiciona a conclusão da tarefa ao histórico
      const task = taskList[leadId]?.find(t => t.id === taskId);
      
      if (task) {
        const taskTypeText = 
          task.type === "ligacao" ? "Ligação" :
          task.type === "email" ? "E-mail" : 
          task.type === "whatsapp" ? "WhatsApp" : "Tarefa";
        
        // Criar e salvar nota de conclusão da tarefa
        const noteText = `<strong>${taskTypeText}</strong> concluída: ${task.description}`;
        
        apiRequest(`/api/leads/${leadId}/notes`, {
          method: 'POST',
          body: JSON.stringify({ text: noteText })
        })
        .then(() => {
          // Recarregar as notas após salvar a conclusão da tarefa
          fetchLeadNotes(leadId);
        })
        .catch(error => {
          console.error("Erro ao salvar nota de conclusão de tarefa:", error);
        });
        
        // Atualizar a lista de tarefas agendadas
        queryClient.invalidateQueries({ queryKey: ['/api/tasks/scheduled'] });
        
        toast({
          title: "Tarefa concluída no banco",
          description: `${taskTypeText} marcada como concluída!`,
        });
      }
    })
    .catch(error => {
      console.error("Erro ao concluir tarefa:", error);
      toast({
        title: "Erro ao concluir tarefa",
        description: "Não foi possível marcar a tarefa como concluída no banco de dados.",
        variant: "destructive"
      });
    });
  };
  
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
  
  // Função para carregar notas de um lead específico
  const fetchLeadNotes = async (leadId: number) => {
    try {
      const notes = await apiRequest(`/api/leads/${leadId}/notes`);
      // Atualizar o estado com as notas do banco de dados
      setSavedNotes(prev => ({
        ...prev,
        [leadId]: notes.map((note: any) => {
          // Garante que temos uma data válida
          let dateObj;
          try {
            dateObj = note.date ? new Date(note.date) : new Date();
            // Verifica se a data é válida
            if (isNaN(dateObj.getTime())) {
              console.log("Data inválida detectada, usando data atual:", note.date);
              dateObj = new Date(); // Usa a data atual se a data for inválida
            }
          } catch (error) {
            console.log("Erro ao converter data, usando data atual:", error);
            dateObj = new Date(); // Usa a data atual em caso de erro
          }
          
          return {
            id: note.id,
            text: note.text,
            date: dateObj
          };
        })
      }));
    } catch (error) {
      console.error("Erro ao carregar notas do lead:", error);
      toast({
        title: "Erro ao carregar notas",
        description: "Não foi possível recuperar as notas deste lead.",
        variant: "destructive"
      });
    }
  };

  // Quando um lead é aberto, carregar seus dados de funil e definir a aba ativa padrão
  useEffect(() => {
    if (openLeadId !== null && allLeads) {
      const openLead = allLeads.find(lead => lead.id === openLeadId);
      
      // Definir a aba padrão como "nota" quando abrir o modal
      setActiveTab(prev => ({
        ...prev,
        [openLeadId]: "nota"
      }));
      
      // Inicializar o formulário de tarefa para o lead
      initializeTaskForm(openLeadId);
      
      // Carregar as notas do lead
      fetchLeadNotes(openLeadId);
      
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
  
  // Efeito adicional para inicializar formulários de tarefas quando a aba muda
  useEffect(() => {
    // Para cada lead que tem a aba "tarefas" ativa, garantir que o formulário esteja inicializado
    Object.entries(activeTab).forEach(([leadIdStr, tabValue]) => {
      const leadId = parseInt(leadIdStr, 10);
      if (tabValue === "tarefas" && !taskForm[leadId]) {
        initializeTaskForm(leadId);
      }
    });
  }, [activeTab, taskForm]);
  
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
      
      // Encontrar o primeiro estágio do funil padrão
      let firstStageId = null;
      if (defaultFunnel && stages) {
        const filteredStages = stages.filter(stage => stage.funnelId === defaultFunnel.id);
        const sortedStages = [...filteredStages].sort((a, b) => a.position - b.position);
        if (sortedStages.length > 0) {
          firstStageId = sortedStages[0].id;
        }
      }
      
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
        // Definir o primeiro estágio do funil como o estágio atual do lead
        stageId: firstStageId,
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
          <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto p-0" style={{ fontFamily: 'Montserrat, sans-serif' }}>
            {/* Cabeçalho no estilo RD Station - INVISIBLE TITLE para acessibilidade */}
            <VisuallyHidden>
              <DialogTitle>Detalhes do Lead</DialogTitle>
            </VisuallyHidden>
            <div className="bg-[#E8E8E8]">
              {/* Barra superior com nome do lead e detalhes */}
              <div className="flex justify-between items-center bg-[#E8E8E8] p-6 rounded-t-lg">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600">
                    <i className="fas fa-user text-xl"></i>
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">{lead.name}</h2>
                    <p className="text-sm text-[#111111]">
                      {lead.source === 'manual' ? 'Lead manual' :
                      lead.source === 'website' ? 'Lead do website' :
                      lead.source === 'whatsapp' ? 'Lead do WhatsApp' :
                      lead.source === 'instagram' ? 'Lead do Instagram' :
                      lead.source === 'facebook' ? 'Lead do Facebook' :
                      lead.source === 'indicacao' ? 'Lead por indicação' :
                      'Lead'} · Criado em {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Button 
                    variant="outline" 
                    className="h-9 px-3 text-sm text-red-600 hover:text-red-700"
                    onClick={() => {
                      setLeadToDelete(lead);
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    <i className="fas fa-trash-alt mr-2"></i> 
                    Excluir lead
                  </Button>
                  <Button className="bg-blue-600 hover:bg-blue-700 h-9 px-3 text-sm">
                    <i className="fas fa-pen mr-2"></i> 
                    Editar lead
                  </Button>
                </div>
              </div>
              
              {/* Indicadores de progresso (funil) - mantemos o código já melhorado */}
              <div className="relative mb-6 bg-[#E8E8E8] px-6 py-4">
                
                {stages && stages.length > 0 ? (
                  (() => {
                    // Determinamos o funil atual
                    const currentFunnelId = lead.funnelId || (funnels?.find(f => f.isDefault)?.id || funnels?.[0]?.id);
                    
                    // Filtramos e ordenamos os estágios deste funil
                    const filteredStages = stages.filter(stage => stage.funnelId === currentFunnelId) || [];
                    const sortedStages = [...filteredStages].sort((a, b) => a.position - b.position);
                    
                    // Função para obter cor de estágio similar ao dashboard do funil
                    const getStageColor = (index: number, isActive: boolean, isCompleted: boolean) => {
                      const totalStages = sortedStages.length;
                      
                      // Se for o último estágio
                      if (index === totalStages - 1) {
                        return isActive ? "#2ecc71" : isCompleted ? "#2ecc71" : "#e2f8ed";
                      }
                      
                      // Primeiro estágio (azul)
                      if (index === 0) {
                        return isActive ? "#0066ff" : isCompleted ? "#0066ff" : "#e6f0ff";
                      }
                      
                      // Estágios do meio
                      const ratio = index / (totalStages - 2);
                      if (isActive) {
                        return `rgb(${Math.round(0 + (77 - 0) * ratio)}, ${Math.round(102 + (148 - 102) * ratio)}, 255)`;
                      } else if (isCompleted) {
                        return `rgb(${Math.round(0 + (77 - 0) * ratio)}, ${Math.round(102 + (148 - 102) * ratio)}, 255)`;
                      }
                      
                      // Cor de fundo para estágios inativos
                      return `rgba(${Math.round(0 + (77 - 0) * ratio)}, ${Math.round(102 + (148 - 102) * ratio)}, 255, 0.15)`;
                    };
                    
                    return (
                      <div className="w-full mb-4">
                        {/* Novo design de funil com círculos e linhas horizontais */}
                        <div className="flex flex-col w-full px-4">
                          <div className="relative flex items-center justify-between w-full">
                            {/* Linha horizontal de conexão - ajustada para ficar centralizada nas bolas */}
                            <div className="absolute bg-gray-300 left-[25px] right-[25px] top-[20px] z-0" style={{ height: '1px' }}></div>
                            
                            {sortedStages.map((stage, index) => {
                              const isActive = lead.stageId === stage.id || (!lead.stageId && index === 0);
                              const isCompleted = sortedStages.findIndex(s => s.id === lead.stageId) > index;
                              
                              // Cores dos estágios conforme solicitação
                              let bgColor;
                              let textColor;
                              let numberColor;
                              
                              if (isActive) {
                                // Estágio ativo e selecionado (atual) - Verde
                                bgColor = '#34C38F';
                                textColor = 'text-white';
                                numberColor = 'white';
                              } else if (isCompleted) {
                                // Estágio já completado - Azul
                                bgColor = '#3565E7';
                                textColor = 'text-white';
                                numberColor = 'white';
                              } else {
                                // Estágio não ativo e não selecionado - Cinza claro
                                bgColor = '#D3D3D3';
                                textColor = 'text-gray-700';
                                numberColor = '#3465E7'; // Cor específica para o número quando inativo
                              }
                              
                              return (
                                <div 
                                  key={stage.id}
                                  className="flex flex-col items-center z-10 cursor-pointer"
                                  onClick={() => {
                                    apiRequest(`/api/leads/${lead.id}/stage`, {
                                      method: "PATCH",
                                      body: JSON.stringify({ stageId: stage.id }),
                                    })
                                      .then(() => {
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
                                          description: "Não foi possível atualizar o estágio.",
                                          variant: "destructive",
                                        });
                                      });
                                  }}
                                >
                                  {/* Círculo com número */}
                                  <div 
                                    className={`w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-200`}
                                    style={{ backgroundColor: bgColor }}
                                  >
                                    <span className="font-bold" style={{ color: numberColor }}>{index + 1}</span>
                                  </div>
                                  
                                  {/* Nome do estágio */}
                                  <span className="text-xs font-medium text-center truncate" style={{ maxWidth: '80px', textAlign: 'center', fontSize: '12px', color: '#111111', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', display: 'inline-block' }}>{stage.name}</span>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    );
                  })()
                ) : (
                  // Fallback para o sistema anterior se não houver estágios definidos
                  <div className="flex justify-between items-center bg-gray-50 p-3 rounded-lg">
                    <div className="flex space-x-8">
                      <div 
                        className={`flex flex-col items-center cursor-pointer ${lead.status === 'new' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${lead.status === 'new' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          <i className="fas fa-user-plus text-sm"></i>
                        </div>
                        <span className="text-xs">Contato</span>
                      </div>
                      
                      <div 
                        className={`flex flex-col items-center cursor-pointer ${lead.status === 'contacted' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${lead.status === 'contacted' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          <i className="fas fa-phone-alt text-sm"></i>
                        </div>
                        <span className="text-xs">Follow up</span>
                      </div>
                      
                      <div 
                        className={`flex flex-col items-center cursor-pointer ${lead.status === 'visit' ? 'text-blue-600 font-medium' : 'text-gray-500'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${lead.status === 'visit' ? 'bg-blue-600 text-white' : 'bg-gray-200'}`}>
                          <i className="fas fa-calendar-check text-sm"></i>
                        </div>
                        <span className="text-xs">Agendamento</span>
                      </div>
                      
                      <div 
                        className={`flex flex-col items-center cursor-pointer ${lead.status === 'proposal' ? 'text-green-600 font-medium' : 'text-gray-500'}`}
                      >
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center mb-1 ${lead.status === 'proposal' ? 'bg-green-600 text-white' : 'bg-gray-200'}`}>
                          <i className="fas fa-check-circle text-sm"></i>
                        </div>
                        <span className="text-xs">Fechado</span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-12 gap-3 pb-6" style={{
                padding: '0px 40px',
                background: '#E8E8E8'
              }}>
                {/* Coluna 1 - Dividida em 2 grids */}
                <div className="md:col-span-4">
                  <div className="grid gap-6">
                    {/* Grid 1: Informações de Contato */}
                    <div className="p-5 border border-[#f5f5f5] rounded-[10px]" style={{ background: '#F9FAFB' }}>
                      <h3 className="text-sm font-bold mb-4 uppercase" style={{ color: '#444444' }}>INFORMAÇÕES DO LEAD</h3>
                      <div className="w-full h-px mb-4 -mx-5" style={{ marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)', backgroundColor: 'rgb(245, 245, 245)' }}></div>
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><User className="h-4 w-4 mr-1 text-gray-500" /> Nome:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'name' ? (
                              <div className="flex items-center">
                                <Input 
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: '13px', color: '#878484' }}>
                                  {lead.name}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'name', lead.name)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><Mail className="h-4 w-4 mr-1 text-gray-500" /> Email:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'email' ? (
                              <div className="flex items-center">
                                <Input 
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: '13px', color: '#878484' }}>
                                  {lead.email || "Não informado"}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'email', lead.email)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><Phone className="h-4 w-4 mr-1 text-gray-500" /> Telefone:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'phone' ? (
                              <div className="flex items-center">
                                <Input 
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: '13px', color: '#878484' }}>
                                  {lead.phone || "Não informado"}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'phone', lead.phone)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><FaWhatsapp className="h-4 w-4 mr-1 text-gray-500" /> WhatsApp:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'whatsapp' ? (
                              <div className="flex items-center">
                                <Input 
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: '13px', color: '#878484' }}>
                                  {(lead as any).whatsapp || "Não informado"}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'whatsapp', (lead as any).whatsapp)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Grid 2: Detalhes do Interesse */}
                    <div className="p-5 border border-[#f5f5f5] rounded-[10px]" style={{ background: '#F9FAFB' }}>
                      <h3 className="text-sm font-bold mb-4 uppercase" style={{ color: '#444444' }}>DETALHES DO INTERESSE</h3>
                      <div className="w-full h-px mb-4 -mx-5" style={{ marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)', backgroundColor: 'rgb(245, 245, 245)' }}></div>
                      <div className="space-y-5">
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><Store className="h-4 w-4 mr-1 text-gray-500" /> Tipo de Negócio:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'interestType' ? (
                              <div className="flex items-center">
                                <Select
                                  value={editingValue}
                                  onValueChange={(value) => setEditingValue(value)}
                                >
                                  <SelectTrigger className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" 
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}>
                                    <SelectValue placeholder="Selecione o tipo de negócio" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="purchase">Compra</SelectItem>
                                    <SelectItem value="rent">Aluguel</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: "13px", color: "#878484" }}>
                                  {lead.interestType === 'purchase' ? 'Compra' :
                                  lead.interestType === 'rent' ? 'Aluguel' :
                                  lead.interestType || 'Não informado'}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'interestType', lead.interestType)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><Home className="h-4 w-4 mr-1 text-gray-500" /> Tipo de Imóvel:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'propertyType' ? (
                              <div className="flex items-center">
                                <Select
                                  value={editingValue}
                                  onValueChange={(value) => setEditingValue(value)}
                                >
                                  <SelectTrigger className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" 
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}>
                                    <SelectValue placeholder="Selecione o tipo de imóvel" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="apartment">Apartamento</SelectItem>
                                    <SelectItem value="house">Casa</SelectItem>
                                    <SelectItem value="commercial">Comercial</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: "13px", color: "#878484" }}>
                                  {(lead as any).propertyType === 'apartment' ? 'Apartamento' : 
                                  (lead as any).propertyType === 'house' ? 'Casa' : 
                                  (lead as any).propertyType === 'commercial' ? 'Comercial' : 
                                  'Não informado'}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'propertyType', (lead as any).propertyType)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><MapPin className="h-4 w-4 mr-1 text-gray-500" /> Região:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'region' ? (
                              <div className="flex items-center">
                                <Input 
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: "13px", color: "#878484" }}>{(lead as any).region || "Não informado"}</p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'region', (lead as any).region)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><DollarSign className="h-4 w-4 mr-1 text-gray-500" /> Faixa de Preço:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'budget' ? (
                              <div className="flex items-center">
                                <Input 
                                  type="number"
                                  value={editingValue}
                                  onChange={(e) => setEditingValue(e.target.value)}
                                  className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none"
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}
                                  autoFocus
                                  placeholder="Valor do orçamento"
                                />
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: "13px", color: "#878484" }}>
                                  {(lead as any).priceRangeMin && (lead as any).priceRangeMax ? 
                                    `R$ ${(lead as any).priceRangeMin.toLocaleString('pt-BR')} - R$ ${(lead as any).priceRangeMax.toLocaleString('pt-BR')}` : 
                                    lead.budget ? 'R$ ' + lead.budget.toLocaleString('pt-BR') : 'Não informado'}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'budget', lead.budget)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="text-xs font-semibold mb-1 flex items-center" style={{ fontSize: '14px' }}><Tag className="h-4 w-4 mr-1 text-gray-500" /> Origem:</h4>
                          <div className="group relative">
                            {editingField && editingField.leadId === lead.id && editingField.field === 'source' ? (
                              <div className="flex items-center">
                                <Select
                                  value={editingValue}
                                  onValueChange={(value) => setEditingValue(value)}
                                >
                                  <SelectTrigger className="h-8 text-sm focus-visible:ring-0 focus-visible:ring-offset-0 focus:outline-none" 
                                  style={{ 
                                    fontSize: '12px',
                                    border: '1px solid #d0d0d0',
                                    boxShadow: "none",
                                    outline: "none"
                                  }}>
                                    <SelectValue placeholder="Selecione a origem" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="manual">Manual</SelectItem>
                                    <SelectItem value="website">Website</SelectItem>
                                    <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                    <SelectItem value="instagram">Instagram</SelectItem>
                                    <SelectItem value="facebook">Facebook</SelectItem>
                                    <SelectItem value="indicacao">Indicação</SelectItem>
                                  </SelectContent>
                                </Select>
                                <div className="flex ml-2">
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleSaveEdit}
                                    disabled={updateLeadFieldMutation.isPending}
                                  >
                                    <Check className="h-4 w-4" />
                                  </Button>
                                  <Button 
                                    size="icon" 
                                    variant="ghost" 
                                    className="h-6 w-6" 
                                    onClick={handleCancelEdit}
                                  >
                                    <X className="h-4 w-4" />
                                  </Button>
                                </div>
                              </div>
                            ) : (
                              <div className="flex items-center">
                                <p className="text-sm text-left" style={{ fontSize: "13px", color: "#878484" }}>
                                  {lead.source === 'manual' ? 'Manual' :
                                  lead.source === 'website' ? 'Website' :
                                  lead.source === 'whatsapp' ? 'WhatsApp' :
                                  lead.source === 'instagram' ? 'Instagram' :
                                  lead.source === 'facebook' ? 'Facebook' :
                                  lead.source === 'indicacao' ? 'Indicação' :
                                  lead.source || 'Não informado'}
                                </p>
                                <button 
                                  className="ml-2 invisible group-hover:visible"
                                  onClick={() => handleStartEditing(lead.id, 'source', lead.source)}
                                >
                                  <Pencil className="h-3 w-3 text-gray-500 hover:text-gray-700" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Coluna de Notas e Tarefas com Sistema de Abas */}
                <div className="md:col-span-8 px-4">                  
                  <div>
                    {/* Seção de abas para Nota/Tarefas */}
                    <div className="p-5 border border-[#f5f5f5] rounded-[10px] mb-8" style={{ background: '#F9FAFB' }}>
                      
                      <Tabs 
                        defaultValue="nota" 
                        value={activeTab[lead.id] || "nota"}
                        onValueChange={(value) => handleTabChange(lead.id, value)}
                        className="w-full"
                      >
                        <TabsList className="w-full mb-4 bg-transparent border-b border-[#f0f0f0] flex justify-start">
                          <TabsTrigger 
                            value="nota" 
                            className="px-6 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#3565E7] data-[state=active]:bg-transparent text-sm text-left"
                            style={{ 
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                              justifyContent: 'flex-start'
                            }}
                          >
                            Nota
                          </TabsTrigger>
                          <TabsTrigger 
                            value="tarefas"
                            className="px-6 py-2 rounded-none border-b-2 border-transparent data-[state=active]:border-[#3565E7] data-[state=active]:bg-transparent text-sm text-left"
                            style={{ 
                              fontFamily: 'Montserrat, sans-serif',
                              fontWeight: 500,
                              textTransform: 'capitalize',
                              justifyContent: 'flex-start'
                            }}
                          >
                            Criar tarefa
                          </TabsTrigger>
                        </TabsList>
                        
                        {/* Linha de divisão removida já que a Tab List tem uma borda inferior */}
                        
                        <TabsContent value="nota" className="space-y-4">
                          <div className="bg-white" style={{ minHeight: '200px' }}>
                            <div className="relative">
                              {/* Ícone removido conforme solicitado */}
                              <ReactQuill
                                id={`note-textarea-${lead.id}`}
                                theme="snow"
                                placeholder="Faça uma anotação"
                                value={leadNotes[lead.id] || lead.notes || ""}
                                onChange={(content) => setLeadNotes(prev => ({
                                  ...prev,
                                  [lead.id]: content
                                }))}
                                modules={{
                                  ...quillModules,
                                  // Desativando itálico no editor
                                  toolbar: [
                                    ['bold'], // apenas negrito, sem itálico
                                    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                                    ['clean']
                                  ]
                                }}
                                className="h-32 focus:outline-none quill-no-border"
                                style={{ fontFamily: 'Montserrat, sans-serif' }}
                              />
                            </div>
                          </div>
                          <div className="flex justify-end mt-4 pr-5 pb-2">
                            <Button 
                              className="bg-[#3565E7] hover:bg-[#2955CC] text-sm"
                              onClick={() => handleSaveNote(lead.id)}
                            >
                              Salvar Nota
                            </Button>
                          </div>
                        </TabsContent>
                        
                        <TabsContent value="tarefas" className="space-y-4">
                          <div className="p-4 bg-white rounded-md" style={{ minHeight: '250px' }}>

                            
                            <div className="space-y-4">
                              <h3 className="text-sm font-medium mb-2">Criar nova tarefa para {lead.name}</h3>
                              
                              <div className="grid grid-cols-1 gap-4">
                                {/* Tipo de tarefa */}
                                <div>
                                  <Label htmlFor={`task-type-${lead.id}`} className="text-xs mb-1">Tipo de tarefa</Label>
                                  <Select
                                    value={taskForm[lead.id]?.type || "ligacao"}
                                    onValueChange={(value) => handleTaskFormChange(lead.id, "type", value)}
                                  >
                                    <SelectTrigger id={`task-type-${lead.id}`} className="h-8 text-sm">
                                      <SelectValue placeholder="Selecione o tipo" />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="ligacao">
                                        <span className="flex items-center">
                                          <Phone className="h-3.5 w-3.5 mr-2" />
                                          Ligação
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="email">
                                        <span className="flex items-center">
                                          <Mail className="h-3.5 w-3.5 mr-2" />
                                          E-mail
                                        </span>
                                      </SelectItem>
                                      <SelectItem value="whatsapp">
                                        <span className="flex items-center">
                                          <MessageSquare className="h-3.5 w-3.5 mr-2" />
                                          WhatsApp
                                        </span>
                                      </SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                
                                {/* Descrição da tarefa */}
                                <div>
                                  <Label htmlFor={`task-description-${lead.id}`} className="text-xs mb-1">Descrição</Label>
                                  <Input
                                    id={`task-description-${lead.id}`}
                                    value={taskForm[lead.id]?.description || ""}
                                    onChange={(e) => handleTaskFormChange(lead.id, "description", e.target.value)}
                                    placeholder="Descreva a tarefa..."
                                    className="h-8 text-sm"
                                  />
                                </div>
                                
                                {/* Data da tarefa */}
                                <div className="flex space-x-3">
                                  <div className="flex-1">
                                    <Label htmlFor={`task-date-${lead.id}`} className="text-xs mb-1">Data</Label>
                                    <input
                                      id={`task-date-${lead.id}`}
                                      type="date"
                                      value={taskForm[lead.id]?.date 
                                        ? new Date(taskForm[lead.id].date as Date).toISOString().split('T')[0] 
                                        : ""}
                                      onChange={(e) => {
                                        const dateValue = e.target.value 
                                          ? new Date(e.target.value) 
                                          : null;
                                        handleTaskFormChange(lead.id, "date", dateValue);
                                      }}
                                      className="w-full h-8 text-sm px-3 py-1 rounded-md border border-input"
                                    />
                                  </div>
                                  
                                  {/* Horário da tarefa */}
                                  <div className="flex-1">
                                    <Label htmlFor={`task-time-${lead.id}`} className="text-xs mb-1">Horário</Label>
                                    <input
                                      id={`task-time-${lead.id}`}
                                      type="time"
                                      value={taskForm[lead.id]?.time || ""}
                                      onChange={(e) => handleTaskFormChange(lead.id, "time", e.target.value)}
                                      className="w-full h-8 text-sm px-3 py-1 rounded-md border border-input"
                                    />
                                  </div>
                                </div>
                              </div>
                              
                              {/* Botão de criar tarefa */}
                              <div className="flex justify-end mt-4">
                                <Button 
                                  onClick={() => handleCreateTask(lead.id)}
                                  className="bg-[#3565E7] hover:bg-[#2955CC] text-sm"
                                >
                                  <CalendarPlus className="h-4 w-4 mr-2" />
                                  Agendar Tarefa
                                </Button>
                              </div>
                              
                              {/* Lista de tarefas pendentes */}
                              {taskList[lead.id] && taskList[lead.id].filter(task => !task.completed).length > 0 && (
                                <div className="mt-6">
                                  <h4 className="text-sm font-medium mb-3">Tarefas Pendentes</h4>
                                  <div className="space-y-3">
                                    {taskList[lead.id]
                                      .filter(task => !task.completed)
                                      .map((task) => {
                                        const taskIcon = 
                                          task.type === "ligacao" ? <Phone className="h-3.5 w-3.5 text-blue-500" /> :
                                          task.type === "email" ? <Mail className="h-3.5 w-3.5 text-green-500" /> :
                                          <MessageSquare className="h-3.5 w-3.5 text-purple-500" />;
                                          
                                        const taskTitle = 
                                          task.type === "ligacao" ? "Ligação" :
                                          task.type === "email" ? "E-mail" : "WhatsApp";
                                          
                                        return (
                                          <div 
                                            key={task.id} 
                                            className="flex items-center justify-between p-3 border border-gray-100 rounded-md bg-gray-50"
                                          >
                                            <div className="flex items-start">
                                              <div className="mr-3 mt-0.5">{taskIcon}</div>
                                              <div>
                                                <div className="flex items-center">
                                                  <span className="text-xs font-medium">{taskTitle}:</span>
                                                  <span className="text-xs ml-2">{task.description}</span>
                                                </div>
                                                <div className="text-xs text-gray-500 mt-1">
                                                  {task.date ? formatDate(task.date) : ""} às {task.time}
                                                </div>
                                              </div>
                                            </div>
                                            <Button 
                                              variant="outline" 
                                              size="sm" 
                                              className="h-7 text-xs"
                                              onClick={() => handleCompleteTask(lead.id, task.id)}
                                            >
                                              <CheckCircle className="h-3.5 w-3.5 mr-1" />
                                              Concluir
                                            </Button>
                                          </div>
                                        );
                                      })}
                                  </div>
                                </div>
                              )}
                            </div>
                          </div>
                        </TabsContent>
                      </Tabs>
                    </div>
                    
                    {/* Histórico de atividades/notas - Seção separada, sempre visível */}
                    <div className="p-5 border border-[#f5f5f5] rounded-[10px]" style={{ background: '#F9FAFB' }}>
                      <h3 className="text-sm font-bold mb-4 uppercase flex items-center" style={{ color: '#444444' }}>
                        <MessageSquare className="h-4 w-4 mr-2 text-gray-500" />
                        HISTÓRICO DE ATIVIDADES
                      </h3>
                      <div className="w-full h-px mb-4 -mx-5" style={{ marginLeft: '-20px', marginRight: '-20px', width: 'calc(100% + 40px)', backgroundColor: 'rgb(245, 245, 245)' }}></div>
                      
                      {savedNotes[lead.id] && savedNotes[lead.id].length > 0 ? (
                        <div className="space-y-4">
                          {savedNotes[lead.id].map((note, index) => (
                            <div key={index} className="p-4 border border-[#f5f5f5] rounded-[10px] bg-white">
                              <div className="flex justify-between items-start mb-2">
                                <span className="text-sm font-semibold">{formatDate(note.date)}</span>
                                <span className="text-xs text-gray-500">{formatTime(note.date)}</span>
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
      ))}
    </div>
  );
}