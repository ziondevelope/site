import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storageInstance } from "./storage";
import { z } from "zod";
import {
  insertUserSchema,
  insertPropertySchema,
  insertLeadSchema,
  insertTaskSchema,
  updateWebsiteConfigSchema
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
      const validatedData = insertLeadSchema.parse(req.body);
      const lead = await storageInstance.createLead(validatedData);
      res.status(201).json(lead);
    } catch (error) {
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

  app.use("/api", apiRouter);

  const httpServer = createServer(app);
  return httpServer;
}
