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

export const insertTaskSchema = createInsertSchema(tasks)
  .extend({
    // Permitir que o campo date seja uma string ISO e convertê-la para Date
    date: z.string().transform((str) => new Date(str)),
  })
  .omit({
    id: true,
    createdAt: true,
    updatedAt: true
  });

// Website configuration schema
export const websiteConfig = pgTable("website_config", {
  id: serial("id").primaryKey(),
  logo: text("logo"),
  bannerBackground: text("banner_background"),
  mainFont: text("main_font").default("Inter"),
  headingFont: text("heading_font").default("Inter"),
  bodyFont: text("body_font").default("Inter"),
  primaryColor: text("primary_color").default("#3B82F6"),
  secondaryColor: text("secondary_color").default("#10B981"),
  footerInfo: text("footer_info"),
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
  // Campos SEO
  seoTitle: text("seo_title"),
  seoDescription: text("seo_description"),
  seoKeywords: text("seo_keywords"),
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

// Define types from schemas
export type InsertUser = z.infer<typeof insertUserSchema>;
export type User = typeof users.$inferSelect;

export type InsertProperty = z.infer<typeof insertPropertySchema>;
export type Property = typeof properties.$inferSelect;

export type InsertLead = z.infer<typeof insertLeadSchema>;
export type Lead = typeof leads.$inferSelect;

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
});

export const insertLeadNoteSchema = createInsertSchema(leadNotes).omit({
  id: true,
  createdAt: true
});

export type InsertLeadNote = z.infer<typeof insertLeadNoteSchema>;
export type LeadNote = typeof leadNotes.$inferSelect;
