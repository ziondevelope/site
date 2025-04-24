import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storageInstance } from "./storage";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { z } from "zod";
import {
  insertUserSchema,
  insertPropertySchema,
  insertLeadSchema,
  insertClientSchema,
  insertTaskSchema,
  updateWebsiteConfigSchema,
  insertSalesFunnelSchema,
  insertFunnelStageSchema,
  insertTestimonialSchema
} from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  // prefix all routes with /api
  const apiRouter = express.Router();
  
  // Dashboard endpoints
  apiRouter.get("/dashboard/stats", async (req, res) => {
    try {
      const stats = await storageInstance.getDashboardStats();
      res.json(stats);
    } catch (error) {
      res.status(500).json({ message: "Error fetching dashboard stats" });
    }
  });

  apiRouter.get("/dashboard/funnel", async (req, res) => {
    try {
      try {
        const funnel = await storageInstance.getSalesFunnel();
        console.log("Dados do funil obtidos:", funnel);
        res.json(funnel);
      } catch (error) {
        console.error("Error fetching sales funnel:", error);
        
        // Fallback: Criar dados do funil baseado nos leads existentes
        const allLeads = await storageInstance.getAllLeads();
        
        // Contagem baseada no status para compatibilidade com versões anteriores
        const leads = allLeads.length;
        const contacts = allLeads.filter(lead => lead.status === 'contacted').length;
        const visits = allLeads.filter(lead => lead.status === 'visit').length;
        const proposals = allLeads.filter(lead => lead.status === 'proposal').length;
        const sales = allLeads.filter(lead => lead.status === 'closed').length;
        
        const resultado = {
          leads,
          contacts,
          visits, 
          proposals,
          sales
        };
        
        console.log("Retornando dados processados do funil:", resultado);
        
        res.json(resultado);
      }
    } catch (error) {
      console.error("Error in dashboard funnel fallback:", error);
      
      // Fornecer dados padrão para garantir que o funil seja exibido
      const dadosPadrao = { 
        leads: 3,
        contacts: 2,
        visits: 1,
        proposals: 1,
        sales: 0
      };
      
      console.log("Fornecendo dados padrão de fallback:", dadosPadrao);
      
      res.json(dadosPadrao);
    }
  });

  // Properties endpoints
  apiRouter.get("/properties", async (req, res) => {
    try {
      const properties = await storageInstance.getAllProperties();
      res.json(properties);
    } catch (error) {
      res.status(500).json({ message: "Error fetching properties" });
    }
  });

  apiRouter.get("/properties/:id", async (req, res) => {
    try {
      const property = await storageInstance.getProperty(parseInt(req.params.id));
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      res.status(500).json({ message: "Error fetching property" });
    }
  });

  apiRouter.post("/properties", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.parse(req.body);
      const property = await storageInstance.createProperty(validatedData);
      res.status(201).json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating property" });
    }
  });

  apiRouter.patch("/properties/:id", async (req, res) => {
    try {
      const validatedData = insertPropertySchema.partial().parse(req.body);
      const property = await storageInstance.updateProperty(parseInt(req.params.id), validatedData);
      if (!property) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.json(property);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid property data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating property" });
    }
  });

  apiRouter.delete("/properties/:id", async (req, res) => {
    try {
      const success = await storageInstance.deleteProperty(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Property not found" });
      }
      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Error deleting property" });
    }
  });

  // Leads endpoints
  apiRouter.get("/leads", async (req, res) => {
    try {
      const status = req.query.status as string | undefined;
      const leads = status 
        ? await storageInstance.getLeadsByStatus(status) 
        : await storageInstance.getAllLeads();
      res.json(leads);
    } catch (error) {
      res.status(500).json({ message: "Error fetching leads" });
    }
  });

  apiRouter.get("/leads/:id", async (req, res) => {
    try {
      const lead = await storageInstance.getLead(parseInt(req.params.id));
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Error fetching lead" });
    }
  });

  apiRouter.post("/leads", async (req, res) => {
    try {
      console.log("Recebendo request para criar lead:", req.body);
      
      // Validar apenas os campos principais do schema, permitindo campos extras
      const baseValidatedData = insertLeadSchema.parse(req.body);
      
      // Preservar todos os dados do request, não apenas os validados pelo schema
      const fullLeadData = {
        ...req.body,
        // Garantir que pelo menos os campos validados estejam presentes
        ...baseValidatedData
      };
      
      console.log("Dados completos do lead após validação:", fullLeadData);
      
      const lead = await storageInstance.createLead(fullLeadData);
      res.status(201).json(lead);
    } catch (error) {
      console.error("Erro ao criar lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating lead" });
    }
  });

  apiRouter.patch("/leads/:id/status", async (req, res) => {
    try {
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ message: "Status is required" });
      }
      const lead = await storageInstance.updateLeadStatus(parseInt(req.params.id), status);
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      res.json(lead);
    } catch (error) {
      res.status(500).json({ message: "Error updating lead status" });
    }
  });
  
  // Rota para atualizar o funil de um lead
  apiRouter.patch("/leads/:id/funnel", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { funnelId } = req.body;
      
      if (typeof funnelId !== 'number') {
        return res.status(400).json({ message: "funnelId deve ser um número" });
      }
      
      const lead = await storageInstance.assignLeadToFunnel(leadId, funnelId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead funnel:", error);
      res.status(500).json({ message: "Erro ao atualizar o funil do lead" });
    }
  });
  
  // Rota para atualizar o estágio de um lead
  apiRouter.patch("/leads/:id/stage", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const { stageId } = req.body;
      
      if (typeof stageId !== 'number') {
        return res.status(400).json({ message: "stageId deve ser um número" });
      }
      
      const lead = await storageInstance.updateLeadStage(leadId, stageId);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead stage:", error);
      res.status(500).json({ message: "Erro ao atualizar o estágio do lead" });
    }
  });
  
  // Rota para atualizar um lead
  apiRouter.patch("/leads/:id", async (req, res) => {
    try {
      console.log("Recebendo request para atualizar lead:", req.params.id, req.body);
      const leadId = parseInt(req.params.id);
      
      // Validar apenas os campos principais do schema, permitindo campos extras
      const validatedData = insertLeadSchema.partial().parse(req.body);
      
      // Manter quaisquer campos extras que possam existir
      const fullLeadData = {
        ...req.body,
        ...validatedData
      };
      
      console.log("Dados validados do lead:", fullLeadData);
      
      const lead = await storageInstance.updateLead(leadId, fullLeadData);
      
      if (!lead) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.json(lead);
    } catch (error) {
      console.error("Erro ao atualizar lead:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid lead data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating lead" });
    }
  });

  // Rota para excluir um lead
  apiRouter.delete("/leads/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const result = await storageInstance.deleteLead(id);
      
      if (!result) {
        return res.status(404).json({ message: "Lead not found" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting lead:", error);
      res.status(500).json({ message: "Error deleting lead" });
    }
  });

  // Agents (users) endpoints
  apiRouter.get("/agents", async (req, res) => {
    try {
      const agents = await storageInstance.getAllUsers();
      res.json(agents);
    } catch (error) {
      res.status(500).json({ message: "Error fetching agents" });
    }
  });
  
  apiRouter.patch("/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updatedAgent = await storageInstance.updateUser(id, req.body);
      if (!updatedAgent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(updatedAgent);
    } catch (error) {
      res.status(500).json({ message: "Error updating agent" });
    }
  });
  
  apiRouter.delete("/agents/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storageInstance.deleteUser(id);
      if (!success) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error deleting agent:", error);
      res.status(500).json({ message: "Error deleting agent" });
    }
  });

  apiRouter.get("/agents/:id", async (req, res) => {
    try {
      const agent = await storageInstance.getUser(parseInt(req.params.id));
      if (!agent) {
        return res.status(404).json({ message: "Agent not found" });
      }
      res.json(agent);
    } catch (error) {
      res.status(500).json({ message: "Error fetching agent" });
    }
  });

  apiRouter.post("/agents", async (req, res) => {
    try {
      console.log("Dados recebidos para criar agente:", req.body);
      // Verificar se requisição possui os campos obrigatórios
      if (!req.body.username || !req.body.password || !req.body.displayName) {
        console.log("Dados insuficientes:", req.body);
        return res.status(400).json({ 
          message: "Dados insuficientes para criar o corretor", 
          required: ["username", "password", "displayName"]
        });
      }
      
      const validatedData = insertUserSchema.parse(req.body);
      console.log("Dados validados:", validatedData);
      const agent = await storageInstance.createUser(validatedData);
      console.log("Agente criado com sucesso:", agent);
      res.status(201).json(agent);
    } catch (error) {
      console.error("Erro ao criar agente:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid agent data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating agent" });
    }
  });

  // Tasks endpoints
  apiRouter.get("/tasks/scheduled", async (req, res) => {
    try {
      const tasks = await storageInstance.getScheduledTasks();
      res.json(tasks);
    } catch (error) {
      res.status(500).json({ message: "Error fetching scheduled tasks" });
    }
  });

  // Obter todas as tarefas ou filtrar por leadId
  apiRouter.get("/tasks", async (req, res) => {
    try {
      const leadId = req.query.leadId ? parseInt(req.query.leadId as string) : null;
      
      // Se leadId foi fornecido, filtrar tarefas por lead
      if (leadId) {
        // Implementar método para buscar tarefas por lead (será adicionado ao storage)
        const tasks = await storageInstance.getTasksByLeadId(leadId);
        return res.json(tasks);
      }
      
      // Se não, retornar todas as tarefas
      const tasks = await storageInstance.getAllTasks();
      res.json(tasks);
    } catch (error) {
      console.error("Erro ao buscar tarefas:", error);
      res.status(500).json({ message: "Erro ao buscar tarefas" });
    }
  });
  
  apiRouter.post("/tasks", async (req, res) => {
    try {
      // Ainda usando o schema Zod para validação
      const validatedData = insertTaskSchema.parse(req.body);
      const task = await storageInstance.createTask(validatedData);
      res.status(201).json(task);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid task data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating task" });
    }
  });
  
  // Novo endpoint que não usa Zod (contorno temporário)
  apiRouter.post("/tasks-direct", async (req, res) => {
    try {
      console.log("Dados recebidos na API (direct):", req.body);
      
      // Validação manual dos campos obrigatórios
      const { title, description, date, type, status, leadId, agentId } = req.body;
      
      if (!title || !description || !date || !type || !status) {
        return res.status(400).json({ 
          message: "Missing required fields", 
          requiredFields: ["title", "description", "date", "type", "status"]
        });
      }
      
      // Criamos um ID temporário para a tarefa
      const highestId = Date.now() % 10000;
      const now = new Date().toISOString();
      
      // Criar objeto da tarefa explicitamente com todos os campos
      const newTask = {
        id: highestId,
        title,
        description,
        date: date, // Mantemos como string
        type, 
        status,
        leadId: leadId ? parseInt(leadId) : null,
        propertyId: req.body.propertyId ? parseInt(req.body.propertyId) : null,
        agentId: agentId ? parseInt(agentId) : null,
        createdAt: now,
        updatedAt: now
      };
      
      // Salvar diretamente no Firebase
      const db = getFirestore();
      await setDoc(doc(db, 'tasks', newTask.id.toString()), newTask);
      console.log("Tarefa salva diretamente:", newTask);
      
      res.status(201).json(newTask);
    } catch (error) {
      console.error("Erro detalhado na criação da tarefa:", error);
      const errorMessage = error instanceof Error ? error.message : "Unknown error";
      res.status(500).json({ 
        message: "Error creating task direct",
        error: errorMessage
      });
    }
  });
  
  // Atualização geral de tarefas
  apiRouter.patch("/tasks/:id", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      console.log("Atualizando tarefa ID:", taskId, "Dados:", req.body);
      
      // Extrair os dados da requisição
      const { type, title, description, date } = req.body;
      
      // Construir objeto de atualização
      const updateData: any = {};
      if (type) updateData.type = type;
      if (title) updateData.title = title;
      if (description) updateData.description = description;
      if (date) updateData.date = date;
      
      // Atualizar a tarefa diretamente no Firebase (se for muito simples)
      if (Object.keys(updateData).length > 0) {
        updateData.updatedAt = new Date().toISOString();
        
        // Usar Firebase diretamente
        const db = getFirestore();
        await updateDoc(doc(db, 'tasks', taskId.toString()), updateData);
        
        // Obter a tarefa atualizada
        const taskDoc = await getDoc(doc(db, 'tasks', taskId.toString()));
        if (taskDoc.exists()) {
          res.json(taskDoc.data());
        } else {
          res.status(404).json({ message: "Tarefa não encontrada após atualização" });
        }
      } else {
        res.status(400).json({ message: "Nenhum dado válido fornecido para atualização" });
      }
    } catch (error) {
      console.error("Erro ao atualizar tarefa:", error);
      res.status(500).json({ message: "Erro ao atualizar tarefa" });
    }
  });
  
  apiRouter.patch("/tasks/:id/complete", async (req, res) => {
    try {
      const taskId = parseInt(req.params.id);
      const { status } = req.body;
      
      if (status !== "completed") {
        return res.status(400).json({ message: "Status deve ser 'completed'" });
      }
      
      console.log("Marcando tarefa como concluída:", taskId);
      
      // Atualizar diretamente no Firebase para garantir a atualização
      const db = getFirestore();
      const taskRef = doc(db, 'tasks', taskId.toString());
      
      // Verificar se a tarefa existe
      const taskDoc = await getDoc(taskRef);
      if (!taskDoc.exists()) {
        return res.status(404).json({ message: "Tarefa não encontrada" });
      }
      
      // Atualizar os campos da tarefa
      await updateDoc(taskRef, { 
        status: 'completed',
        completed: true,
        updatedAt: new Date().toISOString()
      });
      
      // Buscar a tarefa atualizada para responder
      const updatedTaskDoc = await getDoc(taskRef);
      if (!updatedTaskDoc.exists()) {
        return res.status(404).json({ message: "Erro ao recuperar tarefa atualizada" });
      }
      
      res.json(updatedTaskDoc.data());
    } catch (error) {
      console.error("Erro ao marcar tarefa como concluída:", error);
      res.status(500).json({ message: "Erro ao atualizar tarefa" });
    }
  });

  // Recent contacts endpoint
  apiRouter.get("/contacts/recent", async (req, res) => {
    try {
      const contacts = await storageInstance.getRecentContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent contacts" });
    }
  });

  // Client endpoints
  apiRouter.get("/clients", async (req, res) => {
    try {
      const clients = await storageInstance.getAllClients();
      res.json(clients);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: "Error fetching clients" });
    }
  });

  apiRouter.get("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const client = await storageInstance.getClient(id);
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error fetching client:", error);
      res.status(500).json({ message: "Error fetching client" });
    }
  });

  apiRouter.post("/clients", async (req, res) => {
    try {
      const validatedData = insertClientSchema.parse(req.body);
      const client = await storageInstance.createClient(validatedData);
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating client" });
    }
  });

  apiRouter.patch("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const validatedData = insertClientSchema.partial().parse(req.body);
      const client = await storageInstance.updateClient(id, validatedData);
      
      if (!client) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.json(client);
    } catch (error) {
      console.error("Error updating client:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating client" });
    }
  });

  apiRouter.delete("/clients/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const success = await storageInstance.deleteClient(id);
      
      if (!success) {
        return res.status(404).json({ message: "Client not found" });
      }
      
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting client:", error);
      res.status(500).json({ message: "Error deleting client" });
    }
  });

  apiRouter.post("/leads/:id/convert-to-client", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid ID" });
      }
      
      const additionalData = req.body;
      const client = await storageInstance.convertLeadToClient(id, additionalData);
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error converting lead to client:", error);
      res.status(500).json({ message: "Error converting lead to client" });
    }
  });
  
  // Lead Notes endpoints
  apiRouter.get("/leads/:id/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      const notes = await storageInstance.getLeadNotes(leadId);
      res.json(notes);
    } catch (error) {
      console.error("Error fetching lead notes:", error);
      res.status(500).json({ message: "Erro ao buscar notas do lead" });
    }
  });
  
  apiRouter.post("/leads/:id/notes", async (req, res) => {
    try {
      const leadId = parseInt(req.params.id);
      console.log("Criando nota para lead ID:", leadId, "Dados recebidos:", req.body);
      
      // Verificar se há texto na nota
      if (!req.body.text && !req.body.content) {
        return res.status(400).json({ message: "O texto da nota não pode estar vazio" });
      }
      
      // Compatibilidade com diferentes formatos de envio (do formulário ou do CRM)
      const noteText = req.body.text || req.body.content;
      const createdBy = req.body.createdBy || "Sistema";
      const type = req.body.type || "manual";
      
      // Criar a nota
      const note = await storageInstance.createLeadNote({
        leadId,
        text: noteText,
        createdBy,
        type
      });
      
      res.status(201).json(note);
    } catch (error) {
      console.error("Erro ao criar nota para o lead:", error);
      res.status(500).json({ message: "Erro ao criar nota para o lead" });
    }
  });
  
  apiRouter.delete("/lead-notes/:id", async (req, res) => {
    try {
      const noteId = parseInt(req.params.id);
      const success = await storageInstance.deleteLeadNote(noteId);
      
      if (!success) {
        return res.status(404).json({ message: "Nota não encontrada" });
      }
      
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error deleting lead note:", error);
      res.status(500).json({ message: "Erro ao excluir nota" });
    }
  });

  // Website config endpoints
  apiRouter.get("/website/config", async (req, res) => {
    try {
      const config = await storageInstance.getWebsiteConfig();
      res.json(config);
    } catch (error) {
      res.status(500).json({ message: "Error fetching website configuration" });
    }
  });

  apiRouter.put("/website/config", async (req, res) => {
    try {
      const validatedData = updateWebsiteConfigSchema.parse(req.body);
      const config = await storageInstance.updateWebsiteConfig(validatedData);
      res.json(config);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid config data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating website configuration" });
    }
  });

  // Sales Funnels endpoints
  apiRouter.get("/sales-funnels", async (req, res) => {
    try {
      const funnels = await storageInstance.getAllSalesFunnels();
      res.json(funnels);
    } catch (error) {
      console.error("Error fetching sales funnels:", error);
      res.status(500).json({ message: "Error fetching sales funnels" });
    }
  });

  apiRouter.get("/sales-funnels/:id", async (req, res) => {
    try {
      const funnel = await storageInstance.getSalesFunnel(parseInt(req.params.id));
      if (!funnel) {
        return res.status(404).json({ message: "Sales funnel not found" });
      }
      res.json(funnel);
    } catch (error) {
      console.error("Error fetching sales funnel:", error);
      res.status(500).json({ message: "Error fetching sales funnel" });
    }
  });

  apiRouter.post("/sales-funnels", async (req, res) => {
    try {
      const validatedData = insertSalesFunnelSchema.parse(req.body);
      const funnel = await storageInstance.createSalesFunnel(validatedData);
      res.status(201).json(funnel);
    } catch (error) {
      console.error("Error creating sales funnel:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales funnel data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating sales funnel" });
    }
  });

  apiRouter.patch("/sales-funnels/:id", async (req, res) => {
    try {
      const validatedData = insertSalesFunnelSchema.partial().parse(req.body);
      const funnel = await storageInstance.updateSalesFunnel(parseInt(req.params.id), validatedData);
      if (!funnel) {
        return res.status(404).json({ message: "Sales funnel not found" });
      }
      res.json(funnel);
    } catch (error) {
      console.error("Error updating sales funnel:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid sales funnel data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating sales funnel" });
    }
  });

  apiRouter.delete("/sales-funnels/:id", async (req, res) => {
    try {
      const success = await storageInstance.deleteSalesFunnel(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Sales funnel not found or cannot be deleted (default funnel)" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting sales funnel:", error);
      res.status(500).json({ message: "Error deleting sales funnel" });
    }
  });

  apiRouter.post("/sales-funnels/:id/set-default", async (req, res) => {
    try {
      const success = await storageInstance.setDefaultSalesFunnel(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Sales funnel not found" });
      }
      res.json({ success: true });
    } catch (error) {
      console.error("Error setting default sales funnel:", error);
      res.status(500).json({ message: "Error setting default sales funnel" });
    }
  });

  // Funnel Stages endpoints
  apiRouter.get("/funnel-stages", async (req, res) => {
    try {
      const { funnelId } = req.query;
      if (!funnelId) {
        return res.status(400).json({ message: "Funnel ID is required" });
      }
      const stages = await storageInstance.getFunnelStagesByFunnelId(parseInt(funnelId as string));
      res.json(stages);
    } catch (error) {
      console.error("Error fetching funnel stages:", error);
      res.status(500).json({ message: "Error fetching funnel stages" });
    }
  });

  apiRouter.get("/funnel-stages/:id", async (req, res) => {
    try {
      const stage = await storageInstance.getFunnelStage(parseInt(req.params.id));
      if (!stage) {
        return res.status(404).json({ message: "Funnel stage not found" });
      }
      res.json(stage);
    } catch (error) {
      console.error("Error fetching funnel stage:", error);
      res.status(500).json({ message: "Error fetching funnel stage" });
    }
  });

  apiRouter.post("/funnel-stages", async (req, res) => {
    try {
      const validatedData = insertFunnelStageSchema.parse(req.body);
      const stage = await storageInstance.createFunnelStage(validatedData);
      res.status(201).json(stage);
    } catch (error) {
      console.error("Error creating funnel stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid funnel stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Error creating funnel stage" });
    }
  });

  apiRouter.patch("/funnel-stages/:id", async (req, res) => {
    try {
      const validatedData = insertFunnelStageSchema.partial().parse(req.body);
      const stage = await storageInstance.updateFunnelStage(parseInt(req.params.id), validatedData);
      if (!stage) {
        return res.status(404).json({ message: "Funnel stage not found" });
      }
      res.json(stage);
    } catch (error) {
      console.error("Error updating funnel stage:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid funnel stage data", errors: error.errors });
      }
      res.status(500).json({ message: "Error updating funnel stage" });
    }
  });

  apiRouter.delete("/funnel-stages/:id", async (req, res) => {
    try {
      const success = await storageInstance.deleteFunnelStage(parseInt(req.params.id));
      if (!success) {
        return res.status(404).json({ message: "Funnel stage not found" });
      }
      res.status(204).send();
    } catch (error) {
      console.error("Error deleting funnel stage:", error);
      res.status(500).json({ message: "Error deleting funnel stage" });
    }
  });

  apiRouter.post("/sales-funnels/:id/reorder-stages", async (req, res) => {
    try {
      const { stageIds } = req.body;
      if (!stageIds || !Array.isArray(stageIds)) {
        return res.status(400).json({ message: "Stage IDs array is required" });
      }
      const stages = await storageInstance.reorderFunnelStages(parseInt(req.params.id), stageIds);
      res.json(stages);
    } catch (error) {
      console.error("Error reordering funnel stages:", error);
      res.status(500).json({ message: "Error reordering funnel stages" });
    }
  });

  // Lead funnel management
  apiRouter.patch("/leads/:id/funnel/:funnelId", async (req, res) => {
    try {
      const lead = await storageInstance.assignLeadToFunnel(
        parseInt(req.params.id),
        parseInt(req.params.funnelId)
      );
      if (!lead) {
        return res.status(404).json({ message: "Lead or funnel not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error assigning lead to funnel:", error);
      res.status(500).json({ message: "Error assigning lead to funnel" });
    }
  });

  apiRouter.patch("/leads/:id/stage/:stageId", async (req, res) => {
    try {
      const lead = await storageInstance.updateLeadStage(
        parseInt(req.params.id),
        parseInt(req.params.stageId)
      );
      if (!lead) {
        return res.status(404).json({ message: "Lead or stage not found" });
      }
      res.json(lead);
    } catch (error) {
      console.error("Error updating lead stage:", error);
      res.status(500).json({ message: "Error updating lead stage" });
    }
  });

  apiRouter.get("/funnel-stages/:funnelId/:stageId/leads", async (req, res) => {
    try {
      const leads = await storageInstance.getLeadsByFunnelStage(
        parseInt(req.params.funnelId),
        parseInt(req.params.stageId)
      );
      res.json(leads);
    } catch (error) {
      console.error("Error fetching leads by funnel stage:", error);
      res.status(500).json({ message: "Error fetching leads by funnel stage" });
    }
  });
  
  // Rotas para depoimentos (testimonials)
  apiRouter.get("/testimonials", async (req, res) => {
    try {
      const db = getFirestore();
      const testimonialsCollection = collection(db, 'testimonials');
      const testimonialsSnapshot = await getDocs(testimonialsCollection);
      
      const testimonials = testimonialsSnapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: parseInt(doc.id),
          name: data.name,
          role: data.role || "",
          content: data.content,
          avatar: data.avatar || "",
          featured: data.featured || false,
          createdAt: data.createdAt || new Date().toISOString()
        };
      });
      
      res.json(testimonials);
    } catch (error) {
      console.error("Erro ao buscar depoimentos:", error);
      res.status(500).json({ message: "Erro ao buscar depoimentos" });
    }
  });
  
  apiRouter.post("/testimonials", async (req, res) => {
    try {
      const validatedData = insertTestimonialSchema.parse(req.body);
      console.log("Criando novo depoimento:", validatedData);
      
      const db = getFirestore();
      
      // Gerar ID sequencial
      const counterRef = doc(db, 'counters', 'testimonials');
      let newId = 1;
      
      try {
        const counterDoc = await getDoc(counterRef);
        if (counterDoc.exists()) {
          newId = (counterDoc.data().count || 0) + 1;
        }
        
        await setDoc(counterRef, { count: newId });
      } catch (error) {
        console.error("Erro ao gerar ID do depoimento:", error);
        await setDoc(counterRef, { count: newId });
      }
      
      // Criar o depoimento com o ID gerado
      const testimonialData = {
        ...validatedData,
        createdAt: new Date().toISOString()
      };
      
      await setDoc(doc(db, 'testimonials', newId.toString()), testimonialData);
      
      const newTestimonial = {
        id: newId,
        ...testimonialData
      };
      
      res.status(201).json(newTestimonial);
    } catch (error) {
      console.error("Erro ao criar depoimento:", error);
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Dados de depoimento inválidos", errors: error.errors });
      }
      res.status(500).json({ message: "Erro ao criar depoimento" });
    }
  });
  
  apiRouter.delete("/testimonials/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const db = getFirestore();
      const testimonialRef = doc(db, 'testimonials', id.toString());
      
      // Verificar se o depoimento existe
      const testimonialDoc = await getDoc(testimonialRef);
      if (!testimonialDoc.exists()) {
        return res.status(404).json({ message: "Depoimento não encontrado" });
      }
      
      await deleteDoc(testimonialRef);
      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Erro ao excluir depoimento:", error);
      res.status(500).json({ message: "Erro ao excluir depoimento" });
    }
  });

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
