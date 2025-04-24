import { users, type User, type InsertUser } from "@shared/schema";
import { properties, type Property, type InsertProperty } from "@shared/schema";
import { leads, type Lead, type InsertLead } from "@shared/schema";
import { clients, type Client, type InsertClient } from "@shared/schema";
import { tasks, type Task, type InsertTask } from "@shared/schema";
import { websiteConfig, type WebsiteConfig, type UpdateWebsiteConfig } from "@shared/schema";
import { testimonials, type Testimonial, type InsertTestimonial } from "@shared/schema";
import { salesFunnels, type SalesFunnel, type InsertSalesFunnel } from "@shared/schema";
import { funnelStages, type FunnelStage, type InsertFunnelStage } from "@shared/schema";
import { leadNotes, type LeadNote, type InsertLeadNote } from "@shared/schema";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit, writeBatch } from "firebase/firestore";
import { getStorage } from "firebase/storage";
import { firebaseConfig, checkEnvironmentConfig } from "@shared/config";

// Verifica se o ambiente está configurado corretamente
const configCheck = checkEnvironmentConfig();
if (!configCheck.isValid) {
  console.warn(`⚠️ AVISO: Algumas variáveis de ambiente estão faltando: ${configCheck.missingVars.join(', ')}`);
  console.warn("Por favor, configure o arquivo .env com base no .env.example");
}

console.log('Inicializando Firebase com:', 
  {
    projectId: firebaseConfig.projectId,
    hasApiKey: !!firebaseConfig.apiKey,
    hasAppId: !!firebaseConfig.appId
  }
);

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const fbStorage = getStorage(app);

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  getAllUsers(): Promise<User[]>;
  updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined>;
  deleteUser(id: number): Promise<boolean>;

  // Property methods
  getProperty(id: number): Promise<Property | undefined>;
  getAllProperties(): Promise<Property[]>;
  createProperty(property: InsertProperty): Promise<Property>;
  updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined>;
  deleteProperty(id: number): Promise<boolean>;

  // Lead methods
  getLead(id: number): Promise<Lead | undefined>;
  getAllLeads(): Promise<Lead[]>;
  getLeadsByStatus(status: string): Promise<Lead[]>;
  // Permite campos extras além do InsertLead para preservar whatsapp, preços, etc.
  createLead(lead: any): Promise<Lead>;
  updateLeadStatus(id: number, status: string): Promise<Lead | undefined>;
  updateLead(id: number, leadData: any): Promise<Lead | undefined>;
  deleteLead(id: number): Promise<boolean>;
  
  // Client methods
  getClient(id: number): Promise<Client | undefined>;
  getAllClients(): Promise<Client[]>;
  createClient(client: InsertClient): Promise<Client>;
  updateClient(id: number, clientData: Partial<InsertClient>): Promise<Client | undefined>;
  deleteClient(id: number): Promise<boolean>;
  convertLeadToClient(leadId: number, additionalData?: Partial<InsertClient>): Promise<Client>;

  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getScheduledTasks(): Promise<Task[]>;
  getTasksByLeadId(leadId: number): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Website configuration
  getWebsiteConfig(): Promise<WebsiteConfig | undefined>;
  updateWebsiteConfig(config: UpdateWebsiteConfig): Promise<WebsiteConfig>;

  // Sales Funnel methods
  getSalesFunnel(id: number): Promise<SalesFunnel | undefined>;
  getAllSalesFunnels(): Promise<SalesFunnel[]>;
  getDefaultSalesFunnel(): Promise<SalesFunnel | undefined>;
  createSalesFunnel(funnel: InsertSalesFunnel): Promise<SalesFunnel>;
  updateSalesFunnel(id: number, funnelData: Partial<InsertSalesFunnel>): Promise<SalesFunnel | undefined>;
  deleteSalesFunnel(id: number): Promise<boolean>;
  setDefaultSalesFunnel(id: number): Promise<boolean>;

  // Funnel Stage methods
  getFunnelStage(id: number): Promise<FunnelStage | undefined>;
  getFunnelStagesByFunnelId(funnelId: number): Promise<FunnelStage[]>;
  createFunnelStage(stage: InsertFunnelStage): Promise<FunnelStage>;
  updateFunnelStage(id: number, stageData: Partial<InsertFunnelStage>): Promise<FunnelStage | undefined>;
  deleteFunnelStage(id: number): Promise<boolean>;
  reorderFunnelStages(funnelId: number, stageIds: number[]): Promise<FunnelStage[]>;

  // Lead funnel management
  updateLeadStage(leadId: number, stageId: number): Promise<Lead | undefined>;
  getLeadsByFunnelStage(funnelId: number, stageId: number): Promise<Lead[]>;
  assignLeadToFunnel(leadId: number, funnelId: number): Promise<Lead | undefined>;

  // Lead Notes methods
  getLeadNotes(leadId: number): Promise<LeadNote[]>;
  createLeadNote(note: InsertLeadNote): Promise<LeadNote>;
  deleteLeadNote(id: number): Promise<boolean>;
  
  // Dashboard data
  getDashboardStats(): Promise<any>;
  getSalesFunnel(): Promise<any>;
  getRecentContacts(): Promise<any[]>;
}

export class FirebaseStorage implements IStorage {
  // Users collection
  async getUser(id: number): Promise<User | undefined> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', id), limit(1));
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        return undefined;
      }
      
      return userSnapshot.docs[0].data() as User;
    } catch (error) {
      console.error('Error fetching user:', error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('username', '==', username), limit(1));
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        return undefined;
      }
      
      return userSnapshot.docs[0].data() as User;
    } catch (error) {
      console.error('Error fetching user by username:', error);
      return undefined;
    }
  }

  async createUser(user: InsertUser): Promise<User> {
    try {
      // Find the highest ID to increment
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('id', 'desc'), limit(1));
      const usersSnapshot = await getDocs(q);
      const highestId = usersSnapshot.empty ? 0 : usersSnapshot.docs[0].data().id;
      
      const newUser: User = {
        ...user,
        id: highestId + 1,
        createdAt: new Date().toISOString(),
      };
      
      await setDoc(doc(db, 'users', newUser.id.toString()), newUser);
      return newUser;
    } catch (error) {
      console.error('Error creating user:', error);
      throw new Error('Failed to create user');
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      const usersRef = collection(db, 'users');
      const q = query(usersRef, orderBy('createdAt', 'desc'));
      const usersSnapshot = await getDocs(q);
      return usersSnapshot.docs.map(doc => doc.data() as User);
    } catch (error) {
      console.error('Error fetching all users:', error);
      return [];
    }
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    try {
      const userRef = doc(db, 'users', id.toString());
      const userDoc = await getDoc(userRef);
      
      if (!userDoc.exists()) {
        return undefined;
      }
      
      const updatedUser = {
        ...userDoc.data(),
        ...userData,
      };
      
      await updateDoc(userRef, updatedUser);
      return updatedUser as User;
    } catch (error) {
      console.error('Error updating user:', error);
      return undefined;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      console.log('Deleting user with ID:', id);
      const usersRef = collection(db, 'users');
      const q = query(usersRef, where('id', '==', id), limit(1));
      const userSnapshot = await getDocs(q);
      
      if (userSnapshot.empty) {
        console.log('User not found with ID:', id);
        return false;
      }
      
      const userDoc = userSnapshot.docs[0];
      console.log('Found user document:', userDoc.id);
      
      await deleteDoc(doc(db, 'users', userDoc.id));
      console.log('User successfully deleted');
      return true;
    } catch (error) {
      console.error('Error deleting user:', error);
      return false;
    }
  }

  // Properties collection
  async getProperty(id: number): Promise<Property | undefined> {
    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, where('id', '==', id), limit(1));
      const propertySnapshot = await getDocs(q);
      
      if (propertySnapshot.empty) {
        return undefined;
      }
      
      return propertySnapshot.docs[0].data() as Property;
    } catch (error) {
      console.error('Error fetching property:', error);
      return undefined;
    }
  }

  async getAllProperties(): Promise<Property[]> {
    try {
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, orderBy('createdAt', 'desc'));
      const propertiesSnapshot = await getDocs(q);
      return propertiesSnapshot.docs.map(doc => doc.data() as Property);
    } catch (error) {
      console.error('Error fetching all properties:', error);
      return [];
    }
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    try {
      console.log('Criando propriedade:', property);
      
      // Find the highest ID to increment
      const propertiesRef = collection(db, 'properties');
      const q = query(propertiesRef, orderBy('id', 'desc'), limit(1));
      const propertiesSnapshot = await getDocs(q);
      
      let highestId = 0;
      if (!propertiesSnapshot.empty) {
        const data = propertiesSnapshot.docs[0].data();
        highestId = data.id || 0;
      }
      
      console.log('ID mais alto encontrado:', highestId);
      
      const now = new Date().toISOString();
      const newProperty: Property = {
        ...property,
        id: highestId + 1,
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('Nova propriedade para salvar:', newProperty);
      
      // Salvar no Firestore
      const propertyDocRef = doc(db, 'properties', newProperty.id.toString());
      await setDoc(propertyDocRef, newProperty);
      
      console.log('Propriedade salva com sucesso!');
      return newProperty;
    } catch (error) {
      console.error('Error creating property:', error);
      throw new Error('Failed to create property');
    }
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    try {
      const propertyRef = doc(db, 'properties', id.toString());
      const propertyDoc = await getDoc(propertyRef);
      
      if (!propertyDoc.exists()) {
        return undefined;
      }
      
      const updatedProperty = {
        ...propertyDoc.data(),
        ...propertyData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(propertyRef, updatedProperty);
      return updatedProperty as Property;
    } catch (error) {
      console.error('Error updating property:', error);
      return undefined;
    }
  }

  async deleteProperty(id: number): Promise<boolean> {
    try {
      const propertyRef = doc(db, 'properties', id.toString());
      const propertyDoc = await getDoc(propertyRef);
      
      if (!propertyDoc.exists()) {
        return false;
      }
      
      await deleteDoc(propertyRef);
      return true;
    } catch (error) {
      console.error('Error deleting property:', error);
      return false;
    }
  }

  // Leads collection
  async getLead(id: number): Promise<Lead | undefined> {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('id', '==', id), limit(1));
      const leadSnapshot = await getDocs(q);
      
      if (leadSnapshot.empty) {
        return undefined;
      }
      
      return leadSnapshot.docs[0].data() as Lead;
    } catch (error) {
      console.error('Error fetching lead:', error);
      return undefined;
    }
  }

  async getAllLeads(): Promise<Lead[]> {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, orderBy('createdAt', 'desc'));
      const leadsSnapshot = await getDocs(q);
      return leadsSnapshot.docs.map(doc => doc.data() as Lead);
    } catch (error) {
      console.error('Error fetching all leads:', error);
      return [];
    }
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    try {
      const leadsRef = collection(db, 'leads');
      // Usando apenas o filtro por status sem ordenação para evitar necessidade de índices compostos
      const q = query(leadsRef, where('status', '==', status));
      const leadsSnapshot = await getDocs(q);
      
      // Ordenar no lado do servidor após obter os dados
      const leads = leadsSnapshot.docs.map(doc => doc.data() as Lead);
      return leads.sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error(`Error fetching leads with status ${status}:`, error);
      return [];
    }
  }

  async createLead(lead: any): Promise<Lead> {
    try {
      console.log('Criando lead com todos os campos:', lead);
      
      // Find the highest ID to increment
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, orderBy('id', 'desc'), limit(1));
      const leadsSnapshot = await getDocs(q);
      
      let highestId = 0;
      if (!leadsSnapshot.empty) {
        const data = leadsSnapshot.docs[0].data();
        highestId = data.id || 0;
      }
      
      console.log('ID mais alto encontrado:', highestId);
      
      const now = new Date().toISOString();
      
      // Criamos um objeto lead com todos os campos que vieram na requisição
      // Não filtramos nenhum campo, preservando whatsapp, region, propertyType, etc.
      const leadData = {
        ...lead,  // Preserva todos os campos extras
        id: highestId + 1,
        status: lead.status || 'new',
        createdAt: now,
        updatedAt: now,
      };
      
      console.log('Novo lead para salvar (com TODOS os campos extras):', leadData);
      
      // Salvar no Firestore como plain object para incluir todos os campos
      const leadDocRef = doc(db, 'leads', leadData.id.toString());
      await setDoc(leadDocRef, leadData);
      
      console.log('Lead salvo com sucesso!');
      return leadData as Lead;
    } catch (error) {
      console.error('Error creating lead:', error);
      throw new Error('Failed to create lead');
    }
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    try {
      // Primeiro obtém o lead para verificar se existe
      const leadDocRef = doc(db, 'leads', id.toString());
      const leadDoc = await getDoc(leadDocRef);
      
      if (!leadDoc.exists()) {
        return undefined;
      }
      
      const leadData = leadDoc.data() as Lead;
      const updatedLead = {
        ...leadData,
        status,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(leadDocRef, updatedLead);
      return updatedLead;
    } catch (error) {
      console.error('Error updating lead status:', error);
      return undefined;
    }
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    try {
      // Usar a sintaxe correta do Firebase v9+
      const leadDocRef = doc(db, 'leads', id.toString());
      const leadDoc = await getDoc(leadDocRef);
      
      if (!leadDoc.exists()) {
        console.log(`Lead com ID ${id} não encontrado para atualização`);
        return undefined;
      }
      
      console.log(`Lead encontrado para atualizar:`, leadDoc.data());
      
      const existingData = leadDoc.data() as Lead;
      const updatedLead = {
        ...existingData,
        ...leadData,
        updatedAt: new Date().toISOString(),
      };
      
      console.log(`Dados atualizados do lead:`, updatedLead);
      
      await updateDoc(leadDocRef, updatedLead);
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      return undefined;
    }
  }

  async deleteLead(id: number): Promise<boolean> {
    try {
      // Verificar se o lead existe antes de prosseguir
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('id', '==', id), limit(1));
      const leadSnapshot = await getDocs(q);
      
      if (leadSnapshot.empty) {
        console.log(`Lead com ID ${id} não encontrado para exclusão`);
        return false;
      }
      
      // 1. Excluir todas as notas relacionadas ao lead
      const notesRef = collection(db, 'lead_notes');
      const notesQuery = query(notesRef, where('leadId', '==', id));
      const notesSnapshot = await getDocs(notesQuery);
      
      const notesDeletionPromises = notesSnapshot.docs.map(noteDoc => {
        console.log(`Excluindo nota ${noteDoc.id} do lead ${id}`);
        return deleteDoc(doc(db, 'lead_notes', noteDoc.id));
      });
      
      await Promise.all(notesDeletionPromises);
      console.log(`Excluídas ${notesSnapshot.docs.length} notas do lead ${id}`);
      
      // 2. Excluir todas as tarefas relacionadas ao lead
      const tasksRef = collection(db, 'tasks');
      const tasksQuery = query(tasksRef, where('leadId', '==', id));
      const tasksSnapshot = await getDocs(tasksQuery);
      
      const tasksDeletionPromises = tasksSnapshot.docs.map(taskDoc => {
        console.log(`Excluindo tarefa ${taskDoc.id} do lead ${id}`);
        return deleteDoc(doc(db, 'tasks', taskDoc.id));
      });
      
      await Promise.all(tasksDeletionPromises);
      console.log(`Excluídas ${tasksSnapshot.docs.length} tarefas do lead ${id}`);
      
      // 3. Finalmente, excluir o lead
      const leadDoc = leadSnapshot.docs[0];
      const leadRef = doc(db, 'leads', leadDoc.id);
      
      await deleteDoc(leadRef);
      console.log(`Lead com ID ${id} excluído com sucesso`);
      return true;
    } catch (error) {
      console.error('Error deleting lead:', error);
      return false;
    }
  }

  // Tasks collection
  async getTask(id: number): Promise<Task | undefined> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, where('id', '==', id), limit(1));
      const taskSnapshot = await getDocs(q);
      
      if (taskSnapshot.empty) {
        return undefined;
      }
      
      return taskSnapshot.docs[0].data() as Task;
    } catch (error) {
      console.error('Error fetching task:', error);
      return undefined;
    }
  }

  async getAllTasks(): Promise<Task[]> {
    try {
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('date', 'asc'));
      const tasksSnapshot = await getDocs(q);
      return tasksSnapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.error('Error fetching all tasks:', error);
      return [];
    }
  }

  async getScheduledTasks(): Promise<Task[]> {
    try {
      // Get tasks that are scheduled for today or in the future
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('date', '>=', today.toISOString()),
        orderBy('date', 'asc'),
        limit(10)
      );
      const tasksSnapshot = await getDocs(q);
        
      return tasksSnapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      return [];
    }
  }
  
  async getTasksByLeadId(leadId: number): Promise<Task[]> {
    try {
      // Buscar tarefas associadas a um lead específico
      // Removemos orderBy para evitar necessidade de índice composto
      const tasksRef = collection(db, 'tasks');
      const q = query(
        tasksRef,
        where('leadId', '==', leadId)
      );
      const tasksSnapshot = await getDocs(q);
      
      // Ordenar os resultados manualmente após obter os dados
      const tasks = tasksSnapshot.docs.map(doc => doc.data() as Task);
      return tasks.sort((a, b) => {
        const dateA = new Date(a.date || 0).getTime();
        const dateB = new Date(b.date || 0).getTime();
        return dateA - dateB; // Ordem crescente por data
      });
    } catch (error) {
      console.error(`Error fetching tasks for lead ${leadId}:`, error);
      return [];
    }
  }

  async createTask(task: any): Promise<Task> {
    try {
      console.log("Storage: recebido task:", task);
      
      // Find the highest ID to increment
      const tasksRef = collection(db, 'tasks');
      const q = query(tasksRef, orderBy('id', 'desc'), limit(1));
      const tasksSnapshot = await getDocs(q);
      
      const highestId = tasksSnapshot.empty ? 0 : tasksSnapshot.docs[0].data().id;
      
      const now = new Date().toISOString();
      
      // Garantir que a data seja convertida para string ISO
      let taskDate = task.date;
      if (taskDate instanceof Date) {
        taskDate = taskDate.toISOString();
      }
      
      const newTask: Task = {
        id: highestId + 1,
        title: task.title,
        description: task.description,
        date: taskDate,
        type: task.type,
        status: task.status || "pending",
        leadId: task.leadId,
        propertyId: task.propertyId,
        agentId: task.agentId,
        createdAt: now,
        updatedAt: now,
      };
      
      console.log("Storage: criando task:", newTask);
      
      await setDoc(doc(db, 'tasks', newTask.id.toString()), newTask);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task: ' + error.message);
    }
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      const taskRef = doc(db, 'tasks', id.toString());
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        return undefined;
      }
      
      const updatedTask = {
        ...taskDoc.data(),
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(taskRef, updatedTask);
      return updatedTask as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const taskRef = doc(db, 'tasks', id.toString());
      const taskDoc = await getDoc(taskRef);
      
      if (!taskDoc.exists()) {
        return false;
      }
      
      await deleteDoc(taskRef);
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Website configuration
  async getWebsiteConfig(): Promise<WebsiteConfig | undefined> {
    try {
      const configRef = doc(db, 'websiteConfig', '1');
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        // Create default config if it doesn't exist
        const defaultConfig: WebsiteConfig = {
          id: 1,
          logo: '',
          footerLogo: '',
          bannerBackground: '',
          mainFont: 'Inter',
          headingFont: 'Inter',
          bodyFont: 'Inter',
          primaryColor: '#3B82F6',
          secondaryColor: '#10B981',
          footerTextColor: '#ffffff',
          footerIconsColor: '#3B82F6',
          footerInfo: 'Imobiliária XYZ\nAv. Paulista, 1000 - São Paulo, SP\ncontato@imobiliariaxyz.com.br\n(11) 3333-4444',
          footerStyle: 'default',
          bannerTitle: 'Encontre o imóvel dos seus sonhos',
          bannerSubtitle: 'Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado',
          showBannerText: true,
          showSearchBar: true,
          showFeaturedProperties: true,
          showSaleProperties: true,
          showRentProperties: true,
          showTestimonials: false,
          showAboutSection: true,
          
          // Cards de Qualidade
          showQualityCards: true,
          qualityCard1Title: 'Os melhores imóveis',
          qualityCard1Text: 'Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores',
          qualityCard1Enabled: true,
          qualityCard2Title: 'Vamos acompanhar você',
          qualityCard2Text: 'Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características',
          qualityCard2Enabled: true,
          qualityCard3Title: 'Sempre a melhor condição',
          qualityCard3Text: 'Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento',
          qualityCard3Enabled: true,
          
          address: '',
          email: '',
          phone: '',
          workingHours: '',
          instagramUrl: '',
          facebookUrl: '',
          youtubeUrl: '',
          linkedinUrl: '',
          tiktokUrl: '',
          aboutTitle: 'Quem Somos',
          aboutSubtitle: 'Conheça Nossa História',
          aboutDescription: '',
          aboutImage: '',
          seoTitle: 'Imobiliária XYZ - Imóveis à venda e para alugar em São Paulo',
          seoDescription: 'A Imobiliária XYZ oferece os melhores imóveis à venda e para alugar em São Paulo. Encontre apartamentos, casas, salas comerciais e terrenos com a ajuda de nossos corretores especializados.',
          seoKeywords: 'imobiliária, imóveis, apartamentos, casas, comprar, alugar, São Paulo',
          favicon: '', // Adicionando o campo favicon à configuração padrão
          googleTagManagerTag: '',
          googleAdsConversionTag: '',
          googleAdsRemarketingTag: '',
          facebookPixelTag: '',
          updatedAt: new Date().toISOString(),
        };
        
        await setDoc(configRef, defaultConfig);
        return defaultConfig;
      }
      
      return configDoc.data() as WebsiteConfig;
    } catch (error) {
      console.error('Error fetching website config:', error);
      return undefined;
    }
  }

  async updateWebsiteConfig(config: UpdateWebsiteConfig): Promise<WebsiteConfig> {
    try {
      // Importante: Usar o ID '1' para manter consistência com getWebsiteConfig
      const configRef = doc(db, 'websiteConfig', '1');
      const configDoc = await getDoc(configRef);
      
      let updatedConfig: WebsiteConfig;
      
      if (!configDoc.exists()) {
        // Create new config
        updatedConfig = {
          ...config,
          id: 1,
          updatedAt: new Date().toISOString(),
        } as WebsiteConfig;
        console.log('Criando nova configuração:', updatedConfig);
      } else {
        // Update existing config
        const existingData = configDoc.data();
        
        // Log para diagnóstico
        console.log('Dados existentes:', existingData);
        console.log('Dados sendo atualizados:', config);
        console.log('showAboutSection antes:', existingData.showAboutSection);
        console.log('showAboutSection sendo atualizado para:', config.showAboutSection);
        
        // Logs específicos para favicon
        console.log('Favicon sendo recebido para atualização?', !!config.favicon);
        console.log('Favicon existente?', !!existingData.favicon);
        if (config.favicon) {
          console.log('Primeiros 50 caracteres do favicon novo:', config.favicon.substring(0, 50));
        }
        
        updatedConfig = {
          ...existingData,
          ...config,
          updatedAt: new Date().toISOString(),
        } as WebsiteConfig;
        
        // Log do resultado após a fusão
        console.log('Dados finais após mesclagem:', updatedConfig);
        console.log('showAboutSection após mesclagem:', updatedConfig.showAboutSection);
        console.log('Favicon presente após mesclagem?', !!updatedConfig.favicon);
      }
      
      try {
        await setDoc(configRef, updatedConfig);
        return updatedConfig;
      } catch (setDocError) {
        console.error('Erro específico ao chamar setDoc:', setDocError);
        // Tenta alternativa usando updateDoc se o documento já existir
        if (configDoc.exists()) {
          await updateDoc(configRef, updatedConfig);
          return updatedConfig;
        } else {
          throw setDocError;
        }
      }
    } catch (error) {
      console.error('Error updating website config:', error);
      throw new Error('Failed to update website configuration');
    }
  }

  // Dashboard data
  async getDashboardStats(): Promise<any> {
    try {
      // Get counts of total properties
      const propertiesRef = collection(db, 'properties');
      const propertiesSnapshot = await getDocs(propertiesRef);
      const propertiesCount = propertiesSnapshot.size;
      
      // Get counts of active leads
      const leadsRef = collection(db, 'leads');
      const activeLeadsQuery = query(leadsRef, where('status', 'in', ['new', 'contacted', 'visit']));
      const activeLeadsSnapshot = await getDocs(activeLeadsQuery);
      const activeLeadsCount = activeLeadsSnapshot.size;
      
      // Get counts of monthly sales (properties with status sold in the current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();
      
      const salesRef = collection(db, 'properties');
      const monthlySalesQuery = query(
        salesRef,
        where('status', '==', 'sold'),
        where('updatedAt', '>=', firstDayOfMonth),
        where('updatedAt', '<=', lastDayOfMonth)
      );
      const monthlySalesSnapshot = await getDocs(monthlySalesQuery);
      const monthlySalesCount = monthlySalesSnapshot.size;
      
      // Get counts of active agents
      const agentsRef = collection(db, 'users');
      const activeAgentsQuery = query(agentsRef, where('role', '==', 'agent'));
      const activeAgentsSnapshot = await getDocs(activeAgentsQuery);
      const activeAgentsCount = activeAgentsSnapshot.size;
      
      // Generate random trends for now (in a real app we would calculate these)
      const propertyTrend = Math.floor(Math.random() * 20) - 5; // Between -5 and 15
      const leadsTrend = Math.floor(Math.random() * 20) - 5;
      const salesTrend = Math.floor(Math.random() * 10) - 5; // Between -5 and 5
      const agentsTrend = Math.floor(Math.random() * 10) - 2; // Between -2 and 8
      
      return {
        totalProperties: propertiesCount,
        activeLeads: activeLeadsCount,
        monthlySales: monthlySalesCount,
        activeAgents: activeAgentsCount,
        propertyTrend,
        leadsTrend,
        salesTrend,
        agentsTrend
      };
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
      return {
        totalProperties: 0,
        activeLeads: 0,
        monthlySales: 0,
        activeAgents: 0,
        propertyTrend: 0,
        leadsTrend: 0,
        salesTrend: 0,
        agentsTrend: 0
      };
    }
  }

  async getSalesFunnel(): Promise<any> {
    try {
      // Usamos uma abordagem mais segura com métodos compatíveis do Firebase
      const leadsRef = collection(db, 'leads');
      const propertiesRef = collection(db, 'properties');
      
      // Buscar todos os leads e propriedades
      const leadsSnapshot = await getDocs(leadsRef);
      const propertiesSnapshot = await getDocs(propertiesRef);
      
      // Extrair dados
      const leads = leadsSnapshot.docs.map(doc => doc.data());
      const properties = propertiesSnapshot.docs.map(doc => doc.data());
      
      // Calcular contagens
      const leadsCount = leads.length;
      const contactsCount = leads.filter(lead => 
        ['contacted', 'visit', 'proposal'].includes(lead.status as string)).length;
      const visitsCount = leads.filter(lead => 
        ['visit', 'proposal'].includes(lead.status as string)).length;
      const proposalsCount = leads.filter(lead => 
        lead.status === 'proposal').length;
      const salesCount = properties.filter(prop => 
        prop.status === 'sold').length;
      
      const result = {
        leads: leadsCount,
        contacts: contactsCount,
        visits: visitsCount,
        proposals: proposalsCount,
        sales: salesCount
      };
      
      console.log('Funnel data:', result);
      
      return result;
    } catch (error) {
      console.error('Error fetching sales funnel data:', error);
      // Dados de fallback em caso de erro
      return {
        leads: 3,
        contacts: 2,
        visits: 1,
        proposals: 1,
        sales: 0
      };
    }
  }

  async getRecentContacts(): Promise<any[]> {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, orderBy('createdAt', 'desc'), limit(5));
      const leadsSnapshot = await getDocs(q);
      
      return leadsSnapshot.docs.map(doc => {
        const lead = doc.data() as Lead;
        return {
          id: lead.id,
          name: lead.name,
          message: lead.message || '',
          date: lead.createdAt,
          phone: lead.phone,
          avatar: null // We would get this from a real profile picture in a production app
        };
      });
    } catch (error) {
      console.error('Error fetching recent contacts:', error);
      return [];
    }
  }

  // Sales Funnel methods
  async getSalesFunnel(id: number): Promise<SalesFunnel | undefined> {
    try {
      const funnelsRef = collection(db, 'sales_funnels');
      const q = query(funnelsRef, where('id', '==', id), limit(1));
      const funnelSnapshot = await getDocs(q);
      
      if (funnelSnapshot.empty) {
        return undefined;
      }
      
      return funnelSnapshot.docs[0].data() as SalesFunnel;
    } catch (error) {
      console.error('Error fetching sales funnel:', error);
      return undefined;
    }
  }

  async getAllSalesFunnels(): Promise<SalesFunnel[]> {
    try {
      const funnelsRef = collection(db, 'sales_funnels');
      const q = query(funnelsRef, orderBy('name', 'asc'));
      const funnelsSnapshot = await getDocs(q);
      return funnelsSnapshot.docs.map(doc => doc.data() as SalesFunnel);
    } catch (error) {
      console.error('Error fetching all sales funnels:', error);
      return [];
    }
  }

  async getDefaultSalesFunnel(): Promise<SalesFunnel | undefined> {
    try {
      const funnelsRef = collection(db, 'sales_funnels');
      const q = query(funnelsRef, where('isDefault', '==', true), limit(1));
      const funnelSnapshot = await getDocs(q);
      
      if (funnelSnapshot.empty) {
        // Se não houver um funil padrão, tenta pegar o primeiro funil disponível
        const allFunnelsRef = collection(db, 'sales_funnels');
        const allQ = query(allFunnelsRef, limit(1));
        const allFunnelSnapshot = await getDocs(allQ);
        
        if (allFunnelSnapshot.empty) {
          return undefined;
        }
        
        return allFunnelSnapshot.docs[0].data() as SalesFunnel;
      }
      
      return funnelSnapshot.docs[0].data() as SalesFunnel;
    } catch (error) {
      console.error('Error fetching default sales funnel:', error);
      return undefined;
    }
  }

  async createSalesFunnel(funnel: InsertSalesFunnel): Promise<SalesFunnel> {
    try {
      // Find the highest ID to increment
      const funnelsRef = collection(db, 'sales_funnels');
      const q = query(funnelsRef, orderBy('id', 'desc'), limit(1));
      const funnelsSnapshot = await getDocs(q);
      
      let highestId = 0;
      if (!funnelsSnapshot.empty) {
        const data = funnelsSnapshot.docs[0].data();
        highestId = data.id || 0;
      }
      
      const now = new Date().toISOString();
      const newFunnel: SalesFunnel = {
        ...funnel,
        id: highestId + 1,
        createdAt: now,
        updatedAt: now,
      };
      
      // Se for o primeiro funil ou configurado como padrão, garantir que seja o padrão
      if (funnel.isDefault || highestId === 0) {
        // Se for definido como padrão, remover a flag de padrão de quaisquer outros funis
        if (funnel.isDefault) {
          const defaultFunnelsRef = collection(db, 'sales_funnels');
          const defaultQ = query(defaultFunnelsRef, where('isDefault', '==', true));
          const defaultFunnelsSnapshot = await getDocs(defaultQ);
          
          const batch = writeBatch(db);
          defaultFunnelsSnapshot.docs.forEach(doc => {
            batch.update(doc.ref, { isDefault: false });
          });
          await batch.commit();
        }
        
        newFunnel.isDefault = true;
      }
      
      await setDoc(doc(db, 'sales_funnels', newFunnel.id.toString()), newFunnel);
      return newFunnel;
    } catch (error) {
      console.error('Error creating sales funnel:', error);
      throw new Error('Failed to create sales funnel');
    }
  }

  async updateSalesFunnel(id: number, funnelData: Partial<InsertSalesFunnel>): Promise<SalesFunnel | undefined> {
    try {
      const funnelRef = doc(db, 'sales_funnels', id.toString());
      const funnelDoc = await getDoc(funnelRef);
      
      if (!funnelDoc.exists()) {
        return undefined;
      }
      
      const currentFunnel = funnelDoc.data() as SalesFunnel;
      const updatedFunnel = {
        ...currentFunnel,
        ...funnelData,
        updatedAt: new Date().toISOString(),
      };
      
      // Se esse funil estiver sendo definido como padrão, atualizar outros funis
      if (funnelData.isDefault && !currentFunnel.isDefault) {
        const defaultFunnelsRef = collection(db, 'sales_funnels');
        const defaultQ = query(defaultFunnelsRef, where('isDefault', '==', true));
        const defaultFunnelsSnapshot = await getDocs(defaultQ);
        
        const batch = writeBatch(db);
        defaultFunnelsSnapshot.docs.forEach(doc => {
          batch.update(doc.ref, { isDefault: false });
        });
        await batch.commit();
      }
      
      await updateDoc(funnelRef, updatedFunnel);
      return updatedFunnel as SalesFunnel;
    } catch (error) {
      console.error('Error updating sales funnel:', error);
      return undefined;
    }
  }

  async deleteSalesFunnel(id: number): Promise<boolean> {
    try {
      const funnelRef = doc(db, 'sales_funnels', id.toString());
      const funnelDoc = await getDoc(funnelRef);
      
      if (!funnelDoc.exists()) {
        return false;
      }
      
      const funnel = funnelDoc.data() as SalesFunnel;
      
      // Se for o funil padrão, não permitir exclusão
      if (funnel.isDefault) {
        throw new Error('Cannot delete the default sales funnel');
      }
      
      // Excluir todos os estágios associados a este funil
      const stagesRef = collection(db, 'funnel_stages');
      const stagesQ = query(stagesRef, where('funnelId', '==', id));
      const stagesSnapshot = await getDocs(stagesQ);
      
      const batch = writeBatch(db);
      stagesSnapshot.docs.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      // Excluir o funil
      batch.delete(funnelRef);
      await batch.commit();
      
      return true;
    } catch (error) {
      console.error('Error deleting sales funnel:', error);
      return false;
    }
  }

  async setDefaultSalesFunnel(id: number): Promise<boolean> {
    try {
      // Verificar se o funil existe
      const funnelRef = doc(db, 'sales_funnels', id.toString());
      const funnelDoc = await getDoc(funnelRef);
      
      if (!funnelDoc.exists()) {
        return false;
      }
      
      // Remover a flag de padrão de todos os funis
      const funnelsRef = collection(db, 'sales_funnels');
      const funnelsSnapshot = await getDocs(funnelsRef);
      
      const batch = writeBatch(db);
      funnelsSnapshot.docs.forEach(doc => {
        batch.update(doc.ref, { isDefault: false });
      });
      
      // Definir o novo funil padrão
      batch.update(funnelRef, { 
        isDefault: true,
        updatedAt: new Date().toISOString()
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error setting default sales funnel:', error);
      return false;
    }
  }

  // Funnel Stage methods
  async getFunnelStage(id: number): Promise<FunnelStage | undefined> {
    try {
      const stagesRef = collection(db, 'funnel_stages');
      const q = query(stagesRef, where('id', '==', id), limit(1));
      const stageSnapshot = await getDocs(q);
      
      if (stageSnapshot.empty) {
        return undefined;
      }
      
      return stageSnapshot.docs[0].data() as FunnelStage;
    } catch (error) {
      console.error('Error fetching funnel stage:', error);
      return undefined;
    }
  }

  async getFunnelStagesByFunnelId(funnelId: number): Promise<FunnelStage[]> {
    try {
      const stagesRef = collection(db, 'funnel_stages');
      
      // Modificado para buscar primeiro por funnelId sem ordenação para evitar necessidade de índice composto
      const q = query(stagesRef, where('funnelId', '==', funnelId));
      const stagesSnapshot = await getDocs(q);
      
      // Ordenamos manualmente os resultados
      const stages = stagesSnapshot.docs.map(doc => doc.data() as FunnelStage);
      return stages.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error('Error fetching funnel stages:', error);
      return [];
    }
  }

  async createFunnelStage(stage: InsertFunnelStage): Promise<FunnelStage> {
    try {
      // Find the highest ID to increment
      const stagesRef = collection(db, 'funnel_stages');
      const q = query(stagesRef, orderBy('id', 'desc'), limit(1));
      const stagesSnapshot = await getDocs(q);
      
      let highestId = 0;
      if (!stagesSnapshot.empty) {
        const data = stagesSnapshot.docs[0].data();
        highestId = data.id || 0;
      }
      
      // Find the highest position for this funnel if not provided
      let position = stage.position;
      if (position === undefined) {
        // Buscar todos os estágios deste funil sem orderBy para evitar necessidade de índice composto
        const posQ = query(
          stagesRef, 
          where('funnelId', '==', stage.funnelId)
        );
        const posSnapshot = await getDocs(posQ);
        
        position = 0;
        // Se há estágios, ordenamos manualmente e pegamos a maior posição
        if (!posSnapshot.empty) {
          const stages = posSnapshot.docs.map(doc => doc.data() as FunnelStage);
          if (stages.length > 0) {
            // Encontrar a maior posição e adicionar 1
            const maxPosition = Math.max(...stages.map(s => s.position || 0));
            position = maxPosition + 1;
          }
        }
      }
      
      const now = new Date().toISOString();
      const newStage: FunnelStage = {
        ...stage,
        id: highestId + 1,
        position,
        createdAt: now,
        updatedAt: now,
      };
      
      await setDoc(doc(db, 'funnel_stages', newStage.id.toString()), newStage);
      return newStage;
    } catch (error) {
      console.error('Error creating funnel stage:', error);
      throw new Error('Failed to create funnel stage');
    }
  }

  async updateFunnelStage(id: number, stageData: Partial<InsertFunnelStage>): Promise<FunnelStage | undefined> {
    try {
      const stageRef = doc(db, 'funnel_stages', id.toString());
      const stageDoc = await getDoc(stageRef);
      
      if (!stageDoc.exists()) {
        return undefined;
      }
      
      const updatedStage = {
        ...stageDoc.data(),
        ...stageData,
        updatedAt: new Date().toISOString(),
      };
      
      await updateDoc(stageRef, updatedStage);
      return updatedStage as FunnelStage;
    } catch (error) {
      console.error('Error updating funnel stage:', error);
      return undefined;
    }
  }

  async deleteFunnelStage(id: number): Promise<boolean> {
    try {
      const stageRef = doc(db, 'funnel_stages', id.toString());
      const stageDoc = await getDoc(stageRef);
      
      if (!stageDoc.exists()) {
        return false;
      }
      
      await deleteDoc(stageRef);
      
      // Atualizar posições dos estágios restantes
      const stage = stageDoc.data() as FunnelStage;
      const stagesRef = collection(db, 'funnel_stages');
      const q = query(
        stagesRef, 
        where('funnelId', '==', stage.funnelId),
        where('position', '>', stage.position)
      );
      const stagesSnapshot = await getDocs(q);
      
      const batch = writeBatch(db);
      stagesSnapshot.docs.forEach(doc => {
        const stageData = doc.data();
        batch.update(doc.ref, { position: stageData.position - 1 });
      });
      
      await batch.commit();
      return true;
    } catch (error) {
      console.error('Error deleting funnel stage:', error);
      return false;
    }
  }

  async reorderFunnelStages(funnelId: number, stageIds: number[]): Promise<FunnelStage[]> {
    try {
      // Verificar se todos os estágios existem e pertencem a este funil
      const stagesRef = collection(db, 'funnel_stages');
      const q = query(stagesRef, where('funnelId', '==', funnelId));
      const stagesSnapshot = await getDocs(q);
      
      const currentStages = stagesSnapshot.docs.map(doc => doc.data() as FunnelStage);
      const allIds = currentStages.map(stage => stage.id);
      
      // Validar se todos os IDs fornecidos são válidos e pertencem a este funil
      const hasInvalidId = stageIds.some(id => !allIds.includes(id));
      if (hasInvalidId) {
        throw new Error('Invalid stage ids provided');
      }
      
      // Atualizar as posições
      const batch = writeBatch(db);
      stageIds.forEach((id, index) => {
        const stageDoc = stagesSnapshot.docs.find(doc => (doc.data() as FunnelStage).id === id);
        if (stageDoc) {
          batch.update(stageDoc.ref, { 
            position: index,
            updatedAt: new Date().toISOString()
          });
        }
      });
      
      await batch.commit();
      
      // Retornar os estágios atualizados (sem usar orderBy para evitar necessidade de índice composto)
      const updatedQ = query(
        stagesRef, 
        where('funnelId', '==', funnelId)
      );
      const updatedSnapshot = await getDocs(updatedQ);
      const stages = updatedSnapshot.docs.map(doc => doc.data() as FunnelStage);
      // Ordenação manual
      return stages.sort((a, b) => a.position - b.position);
    } catch (error) {
      console.error('Error reordering funnel stages:', error);
      throw new Error('Failed to reorder funnel stages');
    }
  }

  // Lead funnel management
  async updateLeadStage(leadId: number, stageId: number): Promise<Lead | undefined> {
    try {
      // Verificar se o estágio existe
      const stageRef = doc(db, 'funnel_stages', stageId.toString());
      const stageDoc = await getDoc(stageRef);
      
      if (!stageDoc.exists()) {
        throw new Error('Stage not found');
      }
      
      const stage = stageDoc.data() as FunnelStage;
      
      // Obter o lead
      const leadRef = doc(db, 'leads', leadId.toString());
      const leadDoc = await getDoc(leadRef);
      
      if (!leadDoc.exists()) {
        return undefined;
      }
      
      // Atualizar o lead
      const updatedLead = {
        ...leadDoc.data(),
        stageId,
        funnelId: stage.funnelId,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(leadRef, updatedLead);
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error updating lead stage:', error);
      return undefined;
    }
  }
  
  // Implementação dos métodos de notas para leads
  async getLeadNotes(leadId: number): Promise<LeadNote[]> {
    try {
      const notesRef = collection(db, 'lead_notes');
      // Simplificamos a consulta para evitar o erro de índice
      // Apenas filtramos por leadId sem ordenação
      const q = query(notesRef, where('leadId', '==', leadId));
      const notesSnapshot = await getDocs(q);
      
      // Ordenamos manualmente depois de obter os dados
      const notes = notesSnapshot.docs.map(doc => doc.data() as LeadNote);
      
      // Ordenar por data decrescente (mais recente primeiro)
      return notes.sort((a, b) => {
        const dateA = a.date ? new Date(a.date).getTime() : 0;
        const dateB = b.date ? new Date(b.date).getTime() : 0;
        return dateB - dateA; // Ordem decrescente
      });
    } catch (error) {
      console.error(`Erro ao buscar notas para o lead ${leadId}:`, error);
      return [];
    }
  }

  async createLeadNote(note: InsertLeadNote): Promise<LeadNote> {
    try {
      // Encontrar o ID mais alto para incrementar
      const notesRef = collection(db, 'lead_notes');
      const q = query(notesRef, orderBy('id', 'desc'), limit(1));
      const notesSnapshot = await getDocs(q);
      
      let highestId = 0;
      if (!notesSnapshot.empty) {
        const data = notesSnapshot.docs[0].data();
        highestId = data.id || 0;
      }
      
      const now = new Date().toISOString();
      const newNote: LeadNote = {
        ...note,
        id: highestId + 1,
        date: note.date || now,
        createdAt: now
      };
      
      await setDoc(doc(db, 'lead_notes', newNote.id.toString()), newNote);
      return newNote;
    } catch (error) {
      console.error('Erro ao criar nota:', error);
      throw new Error('Falha ao criar nota para o lead');
    }
  }

  async deleteLeadNote(id: number): Promise<boolean> {
    try {
      const noteRef = doc(db, 'lead_notes', id.toString());
      const noteDoc = await getDoc(noteRef);
      
      if (!noteDoc.exists()) {
        return false;
      }
      
      await deleteDoc(noteRef);
      return true;
    } catch (error) {
      console.error('Erro ao excluir nota:', error);
      return false;
    }
  }

  async getLeadsByFunnelStage(funnelId: number, stageId: number): Promise<Lead[]> {
    try {
      const leadsRef = collection(db, 'leads');
      const q = query(
        leadsRef, 
        where('funnelId', '==', funnelId),
        where('stageId', '==', stageId)
        // Removido orderBy para evitar necessidade de índice composto
      );
      const leadsSnapshot = await getDocs(q);
      
      // Ordenação manual por data de criação
      const leads = leadsSnapshot.docs.map(doc => doc.data() as Lead);
      return leads.sort((a, b) => {
        const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
        const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
        return dateB - dateA; // ordem decrescente (mais recentes primeiro)
      });
    } catch (error) {
      console.error('Error fetching leads by funnel stage:', error);
      return [];
    }
  }

  async assignLeadToFunnel(leadId: number, funnelId: number): Promise<Lead | undefined> {
    try {
      // Verificar se o funil existe
      const funnelRef = doc(db, 'sales_funnels', funnelId.toString());
      const funnelDoc = await getDoc(funnelRef);
      
      if (!funnelDoc.exists()) {
        throw new Error('Funnel not found');
      }
      
      // Obter o primeiro estágio do funil (sem orderBy para evitar índice composto)
      const stagesRef = collection(db, 'funnel_stages');
      const q = query(
        stagesRef, 
        where('funnelId', '==', funnelId)
      );
      const stagesSnapshot = await getDocs(q);
      
      if (stagesSnapshot.empty) {
        throw new Error('Funnel has no stages');
      }
      
      // Ordenamos manualmente e pegamos o primeiro
      const stages = stagesSnapshot.docs.map(doc => doc.data() as FunnelStage)
        .sort((a, b) => a.position - b.position);
      
      const firstStage = stages[0];
      
      // Obter o lead
      const leadRef = doc(db, 'leads', leadId.toString());
      const leadDoc = await getDoc(leadRef);
      
      if (!leadDoc.exists()) {
        return undefined;
      }
      
      // Atualizar o lead
      const updatedLead = {
        ...leadDoc.data(),
        funnelId,
        stageId: firstStage.id,
        updatedAt: new Date().toISOString()
      };
      
      await updateDoc(leadRef, updatedLead);
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error assigning lead to funnel:', error);
      return undefined;
    }
  }
}

// If running in test/development environment, use in-memory storage
export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private properties: Map<number, Property>;
  private leads: Map<number, Lead>;
  private tasks: Map<number, Task>;
  private websiteConfig: WebsiteConfig | undefined;
  
  private userIdCounter: number;
  private propertyIdCounter: number;
  private leadIdCounter: number;
  private taskIdCounter: number;

  constructor() {
    this.users = new Map();
    this.properties = new Map();
    this.leads = new Map();
    this.tasks = new Map();
    
    this.userIdCounter = 1;
    this.propertyIdCounter = 1;
    this.leadIdCounter = 1;
    this.taskIdCounter = 1;
    
    // Add some initial data for development
    this.initializeDemoData();
  }

  private initializeDemoData() {
    // Create admin user
    this.createUser({
      username: "admin",
      password: "admin123",
      displayName: "Admin User",
      role: "admin",
      phone: "(11) 99999-9999",
      email: "admin@example.com"
    });
    
    // Create some properties
    this.createProperty({
      title: "Apartamento 3 quartos com sacada",
      description: "Lindo apartamento com 3 quartos, sala ampla, cozinha equipada e sacada com vista panorâmica.",
      type: "apartment",
      purpose: "sale",
      price: 450000,
      area: 95,
      bedrooms: 3,
      bathrooms: 2,
      address: "Rua das Flores, 123",
      city: "São Paulo",
      neighborhood: "Jardim América",
      zipCode: "01000-000",
      isFeatured: true,
      status: "available"
    });
    
    this.createProperty({
      title: "Casa em condomínio fechado",
      description: "Casa moderna em condomínio fechado com segurança 24h, piscina, 4 quartos sendo 2 suítes.",
      type: "house",
      purpose: "sale",
      price: 950000,
      area: 220,
      bedrooms: 4,
      bathrooms: 3,
      address: "Alameda dos Ipês, 456",
      city: "São Paulo",
      neighborhood: "Alphaville",
      zipCode: "06400-000",
      isFeatured: true,
      status: "available"
    });
    
    this.createProperty({
      title: "Sala comercial no centro",
      description: "Sala comercial em edifício moderno, com recepção, 2 banheiros e copa.",
      type: "commercial",
      purpose: "rent",
      price: 3800,
      area: 65,
      bathrooms: 2,
      address: "Av. Paulista, 789",
      city: "São Paulo",
      neighborhood: "Centro",
      zipCode: "01100-000",
      isFeatured: false,
      status: "available"
    });
    
    // Create some leads
    this.createLead({
      name: "Maria Santos",
      email: "maria@example.com",
      phone: "(11) 98765-4321",
      message: "Tenho interesse no apartamento do Jardim América. Quando posso visitar?",
      propertyId: 1,
      status: "new",
      source: "website",
      interestType: "purchase"
    });
    
    this.createLead({
      name: "Carlos Oliveira",
      email: "carlos@example.com",
      phone: "(11) 91234-5678",
      message: "Procuro casa para comprar com valor até R$ 1 milhão em Alphaville.",
      status: "contacted",
      source: "whatsapp",
      interestType: "purchase",
      budget: 1000000
    });
    
    this.createLead({
      name: "Ana Beatriz",
      email: "ana@example.com",
      phone: "(11) 99876-5432",
      message: "Tenho interesse em alugar a sala comercial no centro.",
      propertyId: 3,
      status: "visit",
      source: "instagram",
      interestType: "rent"
    });
    
    // Create some tasks
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    this.createTask({
      title: "Visita ao Apartamento",
      description: "Visita ao apartamento do Jardim América com a cliente Maria Santos",
      date: new Date().toISOString(),
      type: "visit",
      status: "confirmed",
      leadId: 1,
      propertyId: 1,
      agentId: 1
    });
    
    this.createTask({
      title: "Ligação de Acompanhamento",
      description: "Ligar para Carlos para verificar interesse nas casas disponíveis",
      date: tomorrow.toISOString(),
      type: "call",
      status: "pending",
      leadId: 2,
      agentId: 1
    });
    
    // Set default website config
    this.websiteConfig = {
      id: 1,
      logo: '',
      bannerBackground: '',
      mainFont: 'Inter',
      primaryColor: '#3B82F6',
      secondaryColor: '#10B981',
      footerInfo: 'Imobiliária XYZ\nAv. Paulista, 1000 - São Paulo, SP\ncontato@imobiliariaxyz.com.br\n(11) 3333-4444',
      showSearchBar: true,
      showFeaturedProperties: true,
      showSaleProperties: true,
      showRentProperties: true,
      showTestimonials: false,
      seoTitle: 'Imobiliária XYZ - Imóveis à venda e para alugar em São Paulo',
      seoDescription: 'A Imobiliária XYZ oferece os melhores imóveis à venda e para alugar em São Paulo. Encontre apartamentos, casas, salas comerciais e terrenos com a ajuda de nossos corretores especializados.',
      seoKeywords: 'imobiliária, imóveis, apartamentos, casas, comprar, alugar, São Paulo',
      updatedAt: new Date().toISOString()
    };
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(user: InsertUser): Promise<User> {
    const id = this.userIdCounter++;
    const newUser: User = { 
      ...user, 
      id,
      createdAt: new Date().toISOString()
    };
    this.users.set(id, newUser);
    return newUser;
  }

  async getAllUsers(): Promise<User[]> {
    return Array.from(this.users.values());
  }

  async updateUser(id: number, userData: Partial<InsertUser>): Promise<User | undefined> {
    const user = this.users.get(id);
    if (!user) return undefined;
    
    const updatedUser: User = { ...user, ...userData };
    this.users.set(id, updatedUser);
    return updatedUser;
  }

  async deleteUser(id: number): Promise<boolean> {
    return this.users.delete(id);
  }

  // Property methods
  async getProperty(id: number): Promise<Property | undefined> {
    return this.properties.get(id);
  }

  async getAllProperties(): Promise<Property[]> {
    return Array.from(this.properties.values());
  }

  async createProperty(property: InsertProperty): Promise<Property> {
    const id = this.propertyIdCounter++;
    const now = new Date().toISOString();
    const newProperty: Property = { 
      ...property, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.properties.set(id, newProperty);
    return newProperty;
  }

  async updateProperty(id: number, propertyData: Partial<InsertProperty>): Promise<Property | undefined> {
    const property = this.properties.get(id);
    if (!property) return undefined;
    
    const updatedProperty: Property = { 
      ...property, 
      ...propertyData,
      updatedAt: new Date().toISOString()
    };
    this.properties.set(id, updatedProperty);
    return updatedProperty;
  }

  async deleteProperty(id: number): Promise<boolean> {
    return this.properties.delete(id);
  }

  // Lead methods
  async getLead(id: number): Promise<Lead | undefined> {
    return this.leads.get(id);
  }

  async getAllLeads(): Promise<Lead[]> {
    return Array.from(this.leads.values());
  }

  async getLeadsByStatus(status: string): Promise<Lead[]> {
    return Array.from(this.leads.values()).filter(
      (lead) => lead.status === status
    );
  }

  async createLead(lead: InsertLead): Promise<Lead> {
    const id = this.leadIdCounter++;
    const now = new Date().toISOString();
    const newLead: Lead = { 
      ...lead, 
      id,
      status: lead.status || 'new',
      createdAt: now,
      updatedAt: now
    };
    this.leads.set(id, newLead);
    return newLead;
  }

  async updateLeadStatus(id: number, status: string): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead: Lead = { 
      ...lead, 
      status,
      updatedAt: new Date().toISOString()
    };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async updateLead(id: number, leadData: Partial<InsertLead>): Promise<Lead | undefined> {
    const lead = this.leads.get(id);
    if (!lead) return undefined;
    
    const updatedLead: Lead = { 
      ...lead, 
      ...leadData,
      updatedAt: new Date().toISOString()
    };
    this.leads.set(id, updatedLead);
    return updatedLead;
  }

  async deleteLead(id: number): Promise<boolean> {
    return this.leads.delete(id);
  }

  // Task methods
  async getTask(id: number): Promise<Task | undefined> {
    return this.tasks.get(id);
  }

  async getAllTasks(): Promise<Task[]> {
    return Array.from(this.tasks.values());
  }

  async getScheduledTasks(): Promise<Task[]> {
    const now = new Date();
    return Array.from(this.tasks.values())
      .filter(task => new Date(task.date) >= now)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  
  async getTasksByLeadId(leadId: number): Promise<Task[]> {
    return Array.from(this.tasks.values())
      .filter(task => task.leadId === leadId)
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  async createTask(task: InsertTask): Promise<Task> {
    const id = this.taskIdCounter++;
    const now = new Date().toISOString();
    const newTask: Task = { 
      ...task, 
      id,
      createdAt: now,
      updatedAt: now
    };
    this.tasks.set(id, newTask);
    return newTask;
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    const task = this.tasks.get(id);
    if (!task) return undefined;
    
    const updatedTask: Task = { 
      ...task, 
      ...taskData,
      updatedAt: new Date().toISOString()
    };
    this.tasks.set(id, updatedTask);
    return updatedTask;
  }

  async deleteTask(id: number): Promise<boolean> {
    return this.tasks.delete(id);
  }

  // Website configuration
  async getWebsiteConfig(): Promise<WebsiteConfig | undefined> {
    return this.websiteConfig;
  }

  async updateWebsiteConfig(config: UpdateWebsiteConfig): Promise<WebsiteConfig> {
    if (!this.websiteConfig) {
      this.websiteConfig = {
        ...config,
        id: 1,
        updatedAt: new Date().toISOString()
      };
    } else {
      this.websiteConfig = {
        ...this.websiteConfig,
        ...config,
        updatedAt: new Date().toISOString()
      };
    }
    return this.websiteConfig;
  }

  // Dashboard data
  async getDashboardStats(): Promise<any> {
    return {
      totalProperties: this.properties.size,
      activeLeads: Array.from(this.leads.values()).filter(lead => 
        ['new', 'contacted', 'visit'].includes(lead.status || '')
      ).length,
      monthlySales: Array.from(this.properties.values()).filter(property => 
        property.status === 'sold' && 
        new Date(property.updatedAt).getMonth() === new Date().getMonth()
      ).length,
      activeAgents: Array.from(this.users.values()).filter(user => 
        user.role === 'agent'
      ).length,
      propertyTrend: 12,
      leadsTrend: 8,
      salesTrend: -3,
      agentsTrend: 2
    };
  }

  async getSalesFunnel(): Promise<any> {
    const leadsArray = Array.from(this.leads.values());
    
    return {
      leads: leadsArray.length,
      contacts: leadsArray.filter(lead => 
        ['contacted', 'visit', 'proposal'].includes(lead.status || '')
      ).length,
      visits: leadsArray.filter(lead => 
        ['visit', 'proposal'].includes(lead.status || '')
      ).length,
      proposals: leadsArray.filter(lead => 
        lead.status === 'proposal'
      ).length,
      sales: Array.from(this.properties.values()).filter(property => 
        property.status === 'sold'
      ).length
    };
  }

  async getRecentContacts(): Promise<any[]> {
    const recent = Array.from(this.leads.values())
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5)
      .map(lead => ({
        id: lead.id,
        name: lead.name,
        message: lead.message || '',
        date: lead.createdAt,
        phone: lead.phone
      }));
      
    return recent;
  }
}

// Always use Firebase storage for persistence
export const storageInstance = new FirebaseStorage();
