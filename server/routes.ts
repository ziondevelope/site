import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storageInstance } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertPropertySchema,
  insertLeadSchema,
  insertTaskSchema,
  updateWebsiteConfigSchema,
  insertSalesFunnelSchema,
  insertFunnelStageSchema
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
      const funnel = await storageInstance.getSalesFunnel();
      res.json(funnel);
    } catch (error) {
      res.status(500).json({ message: "Error fetching sales funnel data" });
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

  apiRouter.post("/tasks", async (req, res) => {
    try {
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

  // Recent contacts endpoint
  apiRouter.get("/contacts/recent", async (req, res) => {
    try {
      const contacts = await storageInstance.getRecentContacts();
      res.json(contacts);
    } catch (error) {
      res.status(500).json({ message: "Error fetching recent contacts" });
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

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
