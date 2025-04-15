import { users, type User, type InsertUser } from "@shared/schema";
import { properties, type Property, type InsertProperty } from "@shared/schema";
import { leads, type Lead, type InsertLead } from "@shared/schema";
import { tasks, type Task, type InsertTask } from "@shared/schema";
import { websiteConfig, type WebsiteConfig, type UpdateWebsiteConfig } from "@shared/schema";
import { testimonials, type Testimonial, type InsertTestimonial } from "@shared/schema";
import { initializeApp } from "firebase/app";
import { getFirestore, collection, doc, getDocs, getDoc, setDoc, updateDoc, deleteDoc, query, where, orderBy, limit } from "firebase/firestore";
import { getStorage } from "firebase/storage";

// Initialize Firebase - usando o SDK cliente
const firebaseConfig = {
  apiKey: process.env.VITE_FIREBASE_API_KEY,
  authDomain: `${process.env.VITE_FIREBASE_PROJECT_ID}.firebaseapp.com`,
  projectId: process.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: `${process.env.VITE_FIREBASE_PROJECT_ID}.appspot.com`,
  appId: process.env.VITE_FIREBASE_APP_ID
};

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

  // Task methods
  getTask(id: number): Promise<Task | undefined>;
  getAllTasks(): Promise<Task[]>;
  getScheduledTasks(): Promise<Task[]>;
  createTask(task: InsertTask): Promise<Task>;
  updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined>;
  deleteTask(id: number): Promise<boolean>;

  // Website configuration
  getWebsiteConfig(): Promise<WebsiteConfig | undefined>;
  updateWebsiteConfig(config: UpdateWebsiteConfig): Promise<WebsiteConfig>;

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
      const leadRef = db.collection('leads').doc(id.toString());
      const leadDoc = await leadRef.get();
      
      if (!leadDoc.exists) {
        return undefined;
      }
      
      const updatedLead = {
        ...leadDoc.data(),
        ...leadData,
        updatedAt: new Date().toISOString(),
      };
      
      await leadRef.update(updatedLead);
      return updatedLead as Lead;
    } catch (error) {
      console.error('Error updating lead:', error);
      return undefined;
    }
  }

  async deleteLead(id: number): Promise<boolean> {
    try {
      // Usando a nova API do Firebase
      const leadsRef = collection(db, 'leads');
      const q = query(leadsRef, where('id', '==', id), limit(1));
      const leadSnapshot = await getDocs(q);
      
      if (leadSnapshot.empty) {
        console.log(`Lead com ID ${id} não encontrado para exclusão`);
        return false;
      }
      
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
      const taskSnapshot = await db.collection('tasks').where('id', '==', id).limit(1).get();
      
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
      const tasksSnapshot = await db.collection('tasks').orderBy('date', 'asc').get();
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
      
      const tasksSnapshot = await db.collection('tasks')
        .where('date', '>=', today.toISOString())
        .orderBy('date', 'asc')
        .limit(10)
        .get();
        
      return tasksSnapshot.docs.map(doc => doc.data() as Task);
    } catch (error) {
      console.error('Error fetching scheduled tasks:', error);
      return [];
    }
  }

  async createTask(task: InsertTask): Promise<Task> {
    try {
      // Find the highest ID to increment
      const tasksSnapshot = await db.collection('tasks').orderBy('id', 'desc').limit(1).get();
      const highestId = tasksSnapshot.empty ? 0 : tasksSnapshot.docs[0].data().id;
      
      const now = new Date().toISOString();
      const newTask: Task = {
        ...task,
        id: highestId + 1,
        createdAt: now,
        updatedAt: now,
      };
      
      await db.collection('tasks').doc(newTask.id.toString()).set(newTask);
      return newTask;
    } catch (error) {
      console.error('Error creating task:', error);
      throw new Error('Failed to create task');
    }
  }

  async updateTask(id: number, taskData: Partial<InsertTask>): Promise<Task | undefined> {
    try {
      const taskRef = db.collection('tasks').doc(id.toString());
      const taskDoc = await taskRef.get();
      
      if (!taskDoc.exists) {
        return undefined;
      }
      
      const updatedTask = {
        ...taskDoc.data(),
        ...taskData,
        updatedAt: new Date().toISOString(),
      };
      
      await taskRef.update(updatedTask);
      return updatedTask as Task;
    } catch (error) {
      console.error('Error updating task:', error);
      return undefined;
    }
  }

  async deleteTask(id: number): Promise<boolean> {
    try {
      const taskRef = db.collection('tasks').doc(id.toString());
      const taskDoc = await taskRef.get();
      
      if (!taskDoc.exists) {
        return false;
      }
      
      await taskRef.delete();
      return true;
    } catch (error) {
      console.error('Error deleting task:', error);
      return false;
    }
  }

  // Website configuration
  async getWebsiteConfig(): Promise<WebsiteConfig | undefined> {
    try {
      const configRef = doc(db, 'websiteConfig', 'config');
      const configDoc = await getDoc(configRef);
      
      if (!configDoc.exists()) {
        // Create default config if it doesn't exist
        const defaultConfig: WebsiteConfig = {
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
      const configRef = doc(db, 'websiteConfig', 'config');
      const configDoc = await getDoc(configRef);
      
      let updatedConfig: WebsiteConfig;
      
      if (!configDoc.exists()) {
        // Create new config
        updatedConfig = {
          ...config,
          id: 1,
          updatedAt: new Date().toISOString(),
        } as WebsiteConfig;
      } else {
        // Update existing config
        updatedConfig = {
          ...configDoc.data(),
          ...config,
          updatedAt: new Date().toISOString(),
        } as WebsiteConfig;
      }
      
      await setDoc(configRef, updatedConfig);
      return updatedConfig;
    } catch (error) {
      console.error('Error updating website config:', error);
      throw new Error('Failed to update website configuration');
    }
  }

  // Dashboard data
  async getDashboardStats(): Promise<any> {
    try {
      // Get counts of total properties
      const propertiesCount = (await db.collection('properties').get()).size;
      
      // Get counts of active leads
      const activeLeadsCount = (await db.collection('leads').where('status', 'in', ['new', 'contacted', 'visit']).get()).size;
      
      // Get counts of monthly sales (properties with status sold in the current month)
      const currentMonth = new Date().getMonth();
      const currentYear = new Date().getFullYear();
      const firstDayOfMonth = new Date(currentYear, currentMonth, 1).toISOString();
      const lastDayOfMonth = new Date(currentYear, currentMonth + 1, 0).toISOString();
      
      const monthlySalesCount = (await db.collection('properties')
        .where('status', '==', 'sold')
        .where('updatedAt', '>=', firstDayOfMonth)
        .where('updatedAt', '<=', lastDayOfMonth)
        .get()).size;
      
      // Get counts of active agents
      const activeAgentsCount = (await db.collection('users').where('role', '==', 'agent').get()).size;
      
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
      const leadsCount = (await db.collection('leads').get()).size;
      const contactsCount = (await db.collection('leads').where('status', 'in', ['contacted', 'visit', 'proposal']).get()).size;
      const visitsCount = (await db.collection('leads').where('status', 'in', ['visit', 'proposal']).get()).size;
      const proposalsCount = (await db.collection('leads').where('status', '==', 'proposal').get()).size;
      const salesCount = (await db.collection('properties').where('status', '==', 'sold').get()).size;
      
      return {
        leads: leadsCount,
        contacts: contactsCount,
        visits: visitsCount,
        proposals: proposalsCount,
        sales: salesCount
      };
    } catch (error) {
      console.error('Error fetching sales funnel data:', error);
      return {
        leads: 0,
        contacts: 0,
        visits: 0,
        proposals: 0,
        sales: 0
      };
    }
  }

  async getRecentContacts(): Promise<any[]> {
    try {
      const recentContactsSnapshot = await db.collection('leads')
        .orderBy('createdAt', 'desc')
        .limit(5)
        .get();
        
      return recentContactsSnapshot.docs.map(doc => {
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
