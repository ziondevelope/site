import { pgTable, text, serial, integer, boolean, timestamp, json, doublePrecision } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// User schema for authentication and admin access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  displayName: text("display_name").notNull(),
  role: text("role").notNull().default("agent"),
  phone: text("phone"),
  email: text("email"),
  avatar: text("avatar"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertUserSchema = createInsertSchema(users).omit({ 
  id: true,
  createdAt: true
});

// Properties schema
export const properties = pgTable("properties", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  type: text("type").notNull(), // apartment, house, commercial, land
  purpose: text("purpose").notNull(), // sale, rent
  price: integer("price").notNull(),
  iptuValue: integer("iptu_value"), // Valor do IPTU anual
  condoFee: integer("condo_fee"), // Valor do condomínio mensal
  area: integer("area").notNull(),
  bedrooms: integer("bedrooms"),
  bathrooms: integer("bathrooms"),
  suites: integer("suites"),
  parkingSpots: integer("parking_spots"),
  address: text("address").notNull(),
  city: text("city").notNull(),
  neighborhood: text("neighborhood").notNull(),
  zipCode: text("zip_code"),
  latitude: doublePrecision("latitude"),
  longitude: doublePrecision("longitude"),
  featuredImage: text("featured_image"),
  images: json("images").$type<{url: string, isFeatured?: boolean}[]>(),
  features: json("features").$type<string[]>(),
  isFeatured: boolean("is_featured").default(false),
  status: text("status").notNull().default("available"), // available, sold, rented
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
  agentId: integer("agent_id"),
});

export const insertPropertySchema = createInsertSchema(properties).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Leads schema
export const leads = pgTable("leads", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  message: text("message"),
  propertyId: integer("property_id"),
  status: text("status").notNull().default("new"), // new, contacted, visit, proposal, closed
  source: text("source").notNull().default("website"), // website, whatsapp, instagram, etc.
  interestType: text("interest_type"), // purchase, rent
  budget: integer("budget"),
  notes: text("notes"),
  agentId: integer("agent_id"),
  funnelId: integer("funnel_id"), // Referência ao funil de vendas associado
  stageId: integer("stage_id"), // Referência ao estágio atual no funil
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertLeadSchema = createInsertSchema(leads).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Tasks schema
export const tasks = pgTable("tasks", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description"),
  date: timestamp("date").notNull(),
  type: text("type").notNull(), // visit, call, meeting, etc.
  status: text("status").notNull().default("pending"), // pending, completed, cancelled
  leadId: integer("lead_id"),
  propertyId: integer("property_id"),
  agentId: integer("agent_id"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertTaskSchema = createInsertSchema(tasks).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Website configuration schema
export const websiteConfig = pgTable("website_config", {
  id: serial("id").primaryKey(),
  logo: text("logo"),
  footerLogo: text("footer_logo"),
  bannerBackground: text("banner_background"),
  mainFont: text("main_font").default("Inter"),
  headingFont: text("heading_font").default("Inter"),
  bodyFont: text("body_font").default("Inter"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#10B981"),
  footerTextColor: text("footer_text_color").default("#ffffff"),
  footerIconsColor: text("footer_icons_color"),
  footerInfo: text("footer_info"),
  footerStyle: text("footer_style").default("default"), // "default" ou "minimal"
  headerStyle: text("header_style").default("transparent"), // "transparent" ou "solid"
  // Cores para a página de detalhes do imóvel
  propertyDetailsBackgroundColor: text("property_details_background_color").default("#ffffff"),
  propertyDetailsTextColor: text("property_details_text_color").default("#333333"),
  propertyDetailsIconsColor: text("property_details_icons_color").default("#3B82F6"),
  bannerTitle: text("banner_title").default("Encontre o imóvel dos seus sonhos"),
  bannerSubtitle: text("banner_subtitle").default("Oferecemos as melhores opções de imóveis para compra e aluguel com atendimento personalizado"),
  showBannerText: boolean("show_banner_text").default(true),
  showSearchBar: boolean("show_search_bar").default(true),
  showFeaturedProperties: boolean("show_featured_properties").default(true),
  showSaleProperties: boolean("show_sale_properties").default(true),
  showRentProperties: boolean("show_rent_properties").default(true),
  showTestimonials: boolean("show_testimonials").default(false),
  // Campos de informações de contato
  address: text("address"),
  email: text("email"),
  phone: text("phone"),
  workingHours: text("working_hours"),
  // Redes Sociais
  instagramUrl: text("instagram_url"),
  facebookUrl: text("facebook_url"),
  youtubeUrl: text("youtube_url"),
  linkedinUrl: text("linkedin_url"),
  tiktokUrl: text("tiktok_url"),
  // Seção Quem Somos
  aboutTitle: text("about_title"),
  aboutSubtitle: text("about_subtitle"),
  aboutDescription: text("about_description"),
  aboutImage: text("about_image"),
  showAboutSection: boolean("show_about_section").default(true),
  
  // Seção de Cards de Qualidade
  showQualityCards: boolean("show_quality_cards").default(true),
  
  // Card 1
  qualityCard1Title: text("quality_card1_title").default("Os melhores imóveis"),
  qualityCard1Text: text("quality_card1_text").default("Escolha entre apartamentos, casas, salas, ... Considere uma visita com um dos nossos corretores"),
  qualityCard1Enabled: boolean("quality_card1_enabled").default(true),
  
  // Card 2
  qualityCard2Title: text("quality_card2_title").default("Vamos acompanhar você"),
  qualityCard2Text: text("quality_card2_text").default("Oferecemos a você a melhor consultoria na escolha do seu imóvel, desde a escolha da localização, tipo e características"),
  qualityCard2Enabled: boolean("quality_card2_enabled").default(true),
  
  // Card 3
  qualityCard3Title: text("quality_card3_title").default("Sempre a melhor condição"),
  qualityCard3Text: text("quality_card3_text").default("Nossa equipe irá buscar a melhor condição de fechamento, inclusive oferecendo consultoria no financiamento"),
  qualityCard3Enabled: boolean("quality_card3_enabled").default(true),
  // Campos SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
  favicon: text("favicon"),
  // Tags de Marketing e Conversão
  googleTagManagerTag: text("google_tag_manager_tag"),
  googleAdsConversionTag: text("google_ads_conversion_tag"),
  googleAdsRemarketingTag: text("google_ads_remarketing_tag"),
  facebookPixelTag: text("facebook_pixel_tag"),
  
  // Slider Imóveis em Destaque
  featuredSliderBackgroundColor: text("featured_slider_background_color").default("#7f651e"),
  featuredSliderTextColor: text("featured_slider_text_color").default("#ffffff"),
  featuredSliderButtonTextColor: text("featured_slider_button_text_color").default("#7f651e"),
  
  // WhatsApp Chat
  whatsappChatEnabled: boolean("whatsapp_chat_enabled").default(false),
  whatsappNumber: text("whatsapp_number"),
  whatsappMessage: text("whatsapp_message").default("Olá! Gostaria de mais informações sobre um imóvel."),
  whatsappButtonText: text("whatsapp_button_text").default("Falar com corretor"),
  whatsappButtonPosition: text("whatsapp_button_position").default("right"), // right, left
  whatsappFormEnabled: boolean("whatsapp_form_enabled").default(true), // Se deve mostrar formulário antes de redirecionar
  whatsappFormTitle: text("whatsapp_form_title").default("Entre em contato com um corretor"),
  whatsappFormMessage: text("whatsapp_form_message").default("Preencha seus dados para que um de nossos corretores possa lhe atender da melhor forma."),
  whatsappInitialMessage: text("whatsapp_initial_message").default("Está com dificuldades para achar o imóvel dos seus sonhos? De Imóveis Populares a de Alto Padrão, CHAME O CAPITÃO!!"),
  whatsappChatBackgroundColor: text("whatsapp_chat_background_color").default("#ffffff"),
  whatsappChatTextColor: text("whatsapp_chat_text_color").default("#333333"),
  whatsappButtonBackgroundColor: text("whatsapp_button_background_color").default("#25D366"),
  whatsappButtonTextColor: text("whatsapp_button_text_color").default("#ffffff"),
  
  // Configurações de integração VivaReal/ZAP
  enableVivaRealIntegration: boolean("enable_vivareal_integration").default(false),
  vivaRealUsername: text("vivareal_username"),
  xmlAutomaticUpdate: boolean("xml_automatic_update").default(true),
  customXmlPath: text("custom_xml_path").default("imoveis.xml"),
  includeInactiveProperties: boolean("include_inactive_properties").default(false),
  includeSoldProperties: boolean("include_sold_properties").default(false),
  lastXmlUpdate: timestamp("last_xml_update"),
  
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const updateWebsiteConfigSchema = createInsertSchema(websiteConfig).omit({
  id: true,
  updatedAt: true
});

// Testimonials schema
export const testimonials = pgTable("testimonials", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  role: text("role"),
  content: text("content").notNull(),
  avatar: text("avatar"),
  featured: boolean("featured").default(false),
  createdAt: timestamp("created_at").defaultNow(),
});

export const insertTestimonialSchema = createInsertSchema(testimonials).omit({
  id: true,
  createdAt: true
});

// Schemas do funil de vendas
export const salesFunnels = pgTable("sales_funnels", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  description: text("description"),
  isDefault: boolean("is_default").default(false),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertSalesFunnelSchema = createInsertSchema(salesFunnels).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

export const funnelStages = pgTable("funnel_stages", {
  id: serial("id").primaryKey(),
  funnelId: integer("funnel_id").notNull(),
  name: text("name").notNull(),
  description: text("description"),
  color: text("color").default("#E5E7EB"),
  position: integer("position").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertFunnelStageSchema = createInsertSchema(funnelStages).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Clients schema - separate from leads
export const clients = pgTable("clients", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  email: text("email"),
  phone: text("phone"),
  whatsapp: text("whatsapp"),
  address: text("address"),
  city: text("city"),
  neighborhood: text("neighborhood"),
  zipCode: text("zip_code"),
  document: text("document"), // CPF/CNPJ
  type: text("type").default("physical"), // physical or legal
  interestType: text("interest_type"), // purchase, rent, sell
  budget: integer("budget"),
  notes: text("notes"),
  convertedFromLeadId: integer("converted_from_lead_id"), // Reference to the lead this client was converted from
  agentId: integer("agent_id"),
  status: text("status").default("active"), // active, inactive
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const insertClientSchema = createInsertSchema(clients).omit({
  id: true,
  createdAt: true,
  updatedAt: true
});

// Define types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

export type InsertClient = z.infer<typeof insertClientSchema>;
export type Client = typeof clients.$inferSelect;

export type InsertTask = z.infer<typeof insertTaskSchema>;
export type Task = typeof tasks.$inferSelect;

export type UpdateWebsiteConfig = z.infer<typeof updateWebsiteConfigSchema>;
export type WebsiteConfig = typeof websiteConfig.$inferSelect;

export type InsertTestimonial = z.infer<typeof insertTestimonialSchema>;
export type Testimonial = typeof testimonials.$inferSelect;

export type InsertSalesFunnel = z.infer<typeof insertSalesFunnelSchema>;
export type SalesFunnel = typeof salesFunnels.$inferSelect;

export type InsertFunnelStage = z.infer<typeof insertFunnelStageSchema>;
export type FunnelStage = typeof funnelStages.$inferSelect;

// Notas para leads
export const leadNotes = pgTable("lead_notes", {
  id: serial("id").primaryKey(),
  leadId: integer("lead_id").notNull(),
  text: text("text").notNull(),
  date: timestamp("date").notNull().defaultNow(),
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: text("created_by"),
  type: text("type"),
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes)
  .extend({
    // Permitir que date seja um objeto Date
    date: z.date().optional(),
    // Campos adicionais
    createdBy: z.string().optional(),
    type: z.string().optional()
  })
  .omit({
    id: true,
    createdAt: true
  });

export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type LeadNote = typeof leadNotes.$inferSelect;
