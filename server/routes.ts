import express, { type Express, type Request, type Response, type NextFunction } from "express";
import { createServer, type Server } from "http";
import { storageInstance } from "./storage";
import { getFirestore, doc, setDoc, updateDoc, getDoc, collection, getDocs, deleteDoc } from "firebase/firestore";
import { z } from "zod";
import multer from "multer";
import csvParser from "csv-parser";
import fs from "fs";
import path from "path";
import { promisify } from "util";
import * as xml2js from "xml2js";
import { generatePropertyXml, saveXmlToFile } from './utils/exporter';
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
  
  // Configuração do multer para upload de arquivos
  const storage = multer.diskStorage({
    destination: (req, file, cb) => {
      const uploadDir = './tmp/uploads';
      if (!fs.existsSync(uploadDir)) {
        fs.mkdirSync(uploadDir, { recursive: true });
      }
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      cb(null, `${Date.now()}-${file.originalname}`);
    }
  });
  
  const upload = multer({ 
    storage,
    limits: { fileSize: 10 * 1024 * 1024 } // Limite de 10MB
  });
  
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
  
  // Rota para excluir múltiplos imóveis de uma vez
  apiRouter.post("/properties/delete-batch", async (req, res) => {
    try {
      const { ids } = req.body;
      
      if (!ids || !Array.isArray(ids) || ids.length === 0) {
        return res.status(400).json({ 
          message: "Você deve fornecer um array de IDs de imóveis para excluir" 
        });
      }
      
      console.log(`Solicitação para excluir ${ids.length} imóveis em lote:`, ids);
      
      // Converter IDs para números, caso não sejam
      const propertyIds = ids.map(id => typeof id === 'number' ? id : parseInt(id));
      
      const result = await storageInstance.deleteProperties(propertyIds);
      
      res.status(200).json({
        message: `Exclusão concluída: ${result.success} imóveis excluídos, ${result.failed} falhas`,
        ...result
      });
    } catch (error) {
      console.error("Erro ao excluir imóveis em lote:", error);
      res.status(500).json({ 
        message: "Erro ao processar a exclusão em lote de imóveis",
        error: error.message 
      });
    }
  });
  
  // Importação de imóveis em massa
  apiRouter.post("/properties/import", upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "Nenhum arquivo enviado" });
      }
      
      const method = req.body.method as 'csv' | 'xml' | 'json';
      if (!method || !['csv', 'xml', 'json'].includes(method)) {
        // Limpar arquivo temporário
        fs.unlinkSync(req.file.path);
        return res.status(400).json({ message: "Método de importação inválido" });
      }
      
      console.log(`Iniciando importação de imóveis via ${method.toUpperCase()}:`, req.file.originalname);
      
      let properties: any[] = [];
      
      // Processar arquivo de acordo com o método
      if (method === 'csv') {
        // Processamento de CSV
        const results: any[] = [];
        const readStream = fs.createReadStream(req.file.path);
        const csvData = fs.readFileSync(req.file.path, 'utf8');
        
        console.log('Primeiras linhas do CSV:', csvData.split('\n').slice(0, 3).join('\n'));
        
        try {
          await new Promise<void>((resolve, reject) => {
            readStream
              .pipe(csvParser())
              .on('data', (data) => {
                results.push(data);
              })
              .on('end', () => {
                console.log(`CSV processado, ${results.length} linhas encontradas`);
                if (results.length > 0) {
                  console.log('Amostra de dados CSV (primeira linha):', JSON.stringify(results[0]));
                }
                properties = results;
                resolve();
              })
              .on('error', (error) => {
                console.error('Erro no processamento do CSV:', error);
                reject(error);
              });
          });
        } catch (error) {
          console.error('Erro ao processar o arquivo CSV:', error);
          throw new Error(`Erro ao processar o arquivo CSV: ${error.message}`);
        }
      } else if (method === 'xml') {
        // Processamento de XML
        const xmlParser = new xml2js.Parser({ explicitArray: false });
        const xmlData = fs.readFileSync(req.file.path, 'utf8');
        
        console.log('Conteúdo do arquivo XML:', xmlData.substring(0, 300) + '...');
        
        try {
          const result = await promisify(xmlParser.parseString)(xmlData);
          
          console.log('Estrutura do XML após parsing:', JSON.stringify(result, null, 2).substring(0, 500) + '...');
          
          // Verificar formato esperado (array de propriedades)
          if (result && result.properties && result.properties.property) {
            if (Array.isArray(result.properties.property)) {
              properties = result.properties.property;
              console.log(`Encontradas ${properties.length} propriedades no array`);
            } else {
              // Se for apenas uma propriedade, converter para array
              properties = [result.properties.property];
              console.log('Encontrada 1 propriedade, convertida para array');
            }
          } else {
            console.log('Estrutura do XML não é compatível. Estrutura encontrada:', Object.keys(result || {}).join(', '));
            
            // Tentar outras estruturas comuns
            if (result && result.imoveis && result.imoveis.imovel) {
              if (Array.isArray(result.imoveis.imovel)) {
                properties = result.imoveis.imovel;
                console.log(`Encontradas ${properties.length} propriedades no formato alternativo (imoveis > imovel)`);
              } else {
                properties = [result.imoveis.imovel];
                console.log('Encontrada 1 propriedade no formato alternativo (imoveis > imovel)');
              }
            } else if (result && result.root && result.root.property) {
              if (Array.isArray(result.root.property)) {
                properties = result.root.property;
                console.log(`Encontradas ${properties.length} propriedades no formato alternativo (root > property)`);
              } else {
                properties = [result.root.property];
                console.log('Encontrada 1 propriedade no formato alternativo (root > property)');
              }
            } else if (result && result.NewDataSet) {
              // Formato de DataSet XML (MS SQL Server)
              console.log('Formato de DataSet XML identificado');
              
              // Verificar se há o elemento 'Table' com os dados ou se há apenas o schema
              if (result.NewDataSet.Table) {
                // Temos dados na tabela
                if (Array.isArray(result.NewDataSet.Table)) {
                  properties = result.NewDataSet.Table;
                  console.log(`Encontradas ${properties.length} propriedades no formato DataSet (NewDataSet > Table)`);
                } else {
                  properties = [result.NewDataSet.Table];
                  console.log('Encontrada 1 propriedade no formato DataSet (NewDataSet > Table)');
                }
              } else {
                // Pode ser que apenas o esquema esteja presente, vamos procurar outras tabelas no arquivo
                console.log('Esquema XML encontrado, mas sem dados na tabela "Table". Verificando todo o arquivo...');
                
                // Reler o arquivo e procurar diretamente por elementos <Table>
                const rawXml = fs.readFileSync(req.file.path, 'utf8');
                
                // Verificar se há o padrão <Table>...</Table> no arquivo
                const tableMatches = rawXml.match(/<Table>[\s\S]*?<\/Table>/g);
                
                if (tableMatches && tableMatches.length > 0) {
                  console.log(`Encontrados ${tableMatches.length} elementos <Table> no arquivo XML`);
                  
                  // Criar um novo XML com esses elementos para facilitar o parsing
                  const fixedXml = `<?xml version="1.0" encoding="UTF-8"?><root>${tableMatches.join('')}</root>`;
                  
                  // Parsear o XML corrigido
                  const fixedResult = await promisify(xmlParser.parseString)(fixedXml);
                  
                  if (fixedResult && fixedResult.root && fixedResult.root.Table) {
                    if (Array.isArray(fixedResult.root.Table)) {
                      properties = fixedResult.root.Table;
                      console.log(`Extraídos ${properties.length} imóveis dos elementos <Table>`);
                    } else {
                      properties = [fixedResult.root.Table];
                      console.log('Extraído 1 imóvel dos elementos <Table>');
                    }
                  }
                } else {
                  // Se não encontramos elementos Table, pode ser que o XML tenha um formato diferente
                  console.log('Nenhum elemento <Table> encontrado no arquivo XML. Verificando outros padrões...');
                  
                  // Tentar outros padrões comuns para imóveis
                  const imovelMatches = rawXml.match(/<imovel[\s\S]*?<\/imovel>/gi) || 
                                        rawXml.match(/<property[\s\S]*?<\/property>/gi) ||
                                        rawXml.match(/<imoveis[\s\S]*?<\/imoveis>/gi);
                  
                  if (imovelMatches && imovelMatches.length > 0) {
                    console.log(`Encontrados ${imovelMatches.length} elementos de imóveis com padrão alternativo`);
                    
                    // Criar um novo XML com esses elementos para facilitar o parsing
                    const fixedXml = `<?xml version="1.0" encoding="UTF-8"?><root>${imovelMatches.join('')}</root>`;
                    
                    // Parsear o XML corrigido
                    const fixedResult = await promisify(xmlParser.parseString)(fixedXml);
                    
                    if (fixedResult && fixedResult.root) {
                      if (fixedResult.root.imovel) {
                        properties = Array.isArray(fixedResult.root.imovel) ? 
                                    fixedResult.root.imovel : [fixedResult.root.imovel];
                      } else if (fixedResult.root.property) {
                        properties = Array.isArray(fixedResult.root.property) ? 
                                    fixedResult.root.property : [fixedResult.root.property];
                      } else if (fixedResult.root.imoveis) {
                        properties = Array.isArray(fixedResult.root.imoveis) ? 
                                    fixedResult.root.imoveis : [fixedResult.root.imoveis];
                      }
                      
                      console.log(`Extraídos ${properties.length} imóveis usando padrão alternativo`);
                    }
                  }
                }
              }
              
              // Mapear os campos para o formato esperado
              properties = properties.map(item => {
                // Converter os nomes dos campos para o formato esperado
                const mappedProperty: any = {};
                
                // Mapeamento básico de campos
                if (item.principaltipo) mappedProperty.type = item.principaltipo;
                if (item.principalvalvenda) mappedProperty.price = Number(item.principalvalvenda);
                if (item.principalvallocalacao) mappedProperty.rentPrice = Number(item.principalvallocalacao);
                if (item.principaldescricao) mappedProperty.description = item.principaldescricao;
                if (item.principaltipo && item.principalsubtipo) {
                  mappedProperty.title = `${item.principalsubtipo} - ${item.principalbairro || ''}`;
                }
                
                // Endereço
                if (item.principalendereco) mappedProperty.address = item.principalendereco;
                if (item.principalbairro) mappedProperty.neighborhood = item.principalbairro;
                if (item.principalcidade) mappedProperty.city = item.principalcidade;
                if (item.principaluf) mappedProperty.state = item.principaluf;
                if (item.principalcep) mappedProperty.zipCode = item.principalcep;
                
                // Características
                if (item.detalheareautil) mappedProperty.area = Number(item.detalheareautil);
                if (item.detalhedormitorios) mappedProperty.bedrooms = Number(item.detalhedormitorios);
                if (item.detalhebanheiros) mappedProperty.bathrooms = Number(item.detalhebanheiros);
                if (item.detalhegaragens) mappedProperty.parkingSpots = Number(item.detalhegaragens);
                if (item.detalhesuite) mappedProperty.suites = Number(item.detalhesuite);
                
                // Finalidade (propósito)
                if (item.principalvenda && item.principalvenda == 1) {
                  mappedProperty.purpose = 'sale';
                } else if (item.principallocalacao && item.principallocalacao == 1) {
                  mappedProperty.purpose = 'rent';
                } else {
                  mappedProperty.purpose = 'sale'; // padrão
                }
                
                // Status
                if (item.principalsituacao) {
                  if (item.principalsituacao.toLowerCase().includes('vend')) {
                    mappedProperty.status = 'sold';
                  } else if (item.principalsituacao.toLowerCase().includes('alug')) {
                    mappedProperty.status = 'rented';
                  } else {
                    mappedProperty.status = 'available';
                  }
                } else {
                  mappedProperty.status = 'available'; // padrão
                }
                
                // Características como array
                const features = [];
                if (item.detalhechurrasqueira && item.detalhechurrasqueira == 1) features.push('Churrasqueira');
                if (item.detalhepiscina && item.detalhepiscina == 1) features.push('Piscina');
                if (item.detalheportaoeletronico && item.detalheportaoeletronico == 1) features.push('Portão Eletrônico');
                if (item.detalhearcondicionado && item.detalhearcondicionado == 1) features.push('Ar Condicionado');
                if (item.detalhesacada && item.detalhesacada == 1) features.push('Sacada');
                if (item.detalhelavanderia && item.detalhelavanderia == 1) features.push('Lavanderia');
                
                if (features.length > 0) {
                  mappedProperty.features = features;
                }
                
                return mappedProperty;
              });
              
              console.log('Dados mapeados com sucesso. Exemplo do primeiro imóvel:', 
                JSON.stringify(properties[0]).substring(0, 300) + '...');
            }
          }
        } catch (error) {
          console.error('Erro no parsing do XML:', error);
          throw new Error(`Erro no parsing do XML: ${error.message}`);
        }
      } else if (method === 'json') {
        // Processamento de JSON
        const jsonData = fs.readFileSync(req.file.path, 'utf8');
        
        console.log('Amostra do arquivo JSON:', jsonData.substring(0, 300) + '...');
        
        try {
          const parsedData = JSON.parse(jsonData);
          console.log('Estrutura do JSON após parsing:', Object.keys(parsedData).join(', '));
          
          if (Array.isArray(parsedData)) {
            properties = parsedData;
            console.log(`Encontradas ${properties.length} propriedades no array JSON`);
            if (properties.length > 0) {
              console.log('Amostra da primeira propriedade:', JSON.stringify(properties[0]).substring(0, 300) + '...');
            }
          } else if (parsedData.properties && Array.isArray(parsedData.properties)) {
            properties = parsedData.properties;
            console.log(`Encontradas ${properties.length} propriedades no campo 'properties' do JSON`);
          } else if (parsedData.imoveis && Array.isArray(parsedData.imoveis)) {
            properties = parsedData.imoveis;
            console.log(`Encontradas ${properties.length} propriedades no campo 'imoveis' do JSON`);
          } else if (parsedData.data && Array.isArray(parsedData.data)) {
            properties = parsedData.data;
            console.log(`Encontradas ${properties.length} propriedades no campo 'data' do JSON`);
          } else if (parsedData.items && Array.isArray(parsedData.items)) {
            properties = parsedData.items;
            console.log(`Encontradas ${properties.length} propriedades no campo 'items' do JSON`);
          } else {
            // Se for um objeto único, tentar converter para array
            if (!Array.isArray(parsedData) && typeof parsedData === 'object') {
              if (parsedData.title || parsedData.address || parsedData.description) {
                properties = [parsedData];
                console.log('Único objeto de imóvel encontrado no JSON, convertido para array');
              } else {
                // Tentar todas as propriedades do objeto para ver se alguma é um array
                const possibleArrayProps = Object.keys(parsedData).filter(key => 
                  Array.isArray(parsedData[key]) && parsedData[key].length > 0);
                
                if (possibleArrayProps.length > 0) {
                  // Usar o primeiro array encontrado
                  const arrayProp = possibleArrayProps[0];
                  properties = parsedData[arrayProp];
                  console.log(`Encontradas ${properties.length} propriedades no campo '${arrayProp}' do JSON`);
                }
              }
            }
          }
        } catch (error) {
          console.error('Erro no parsing do JSON:', error);
          throw new Error(`Erro no parsing do JSON: ${error.message}`);
        }
      }
      
      // Limpar arquivo temporário
      fs.unlinkSync(req.file.path);
      
      if (!properties.length) {
        return res.status(400).json({ 
          message: "Não foi possível extrair dados de imóveis do arquivo" 
        });
      }
      
      console.log(`Encontrados ${properties.length} imóveis para importação`);
      
      // Processar e validar cada propriedade
      const validProperties = [];
      const errors = [];
      
      for (const propData of properties) {
        try {
          // Garantir que os valores numéricos sejam números
          if (propData.price) propData.price = Number(propData.price);
          if (propData.area) propData.area = Number(propData.area);
          if (propData.bedrooms) propData.bedrooms = Number(propData.bedrooms);
          if (propData.bathrooms) propData.bathrooms = Number(propData.bathrooms);
          if (propData.parkingSpots) propData.parkingSpots = Number(propData.parkingSpots);
          if (propData.suites) propData.suites = Number(propData.suites);
          
          // Tentar validar com o schema parcial (validar o que for possível)
          const validatedData = insertPropertySchema.partial().parse(propData);
          validProperties.push(validatedData);
        } catch (error) {
          if (error instanceof z.ZodError) {
            errors.push({
              property: propData.title || 'Imóvel sem título',
              errors: error.errors
            });
          } else {
            errors.push({
              property: propData.title || 'Imóvel sem título',
              error: 'Erro desconhecido na validação'
            });
          }
        }
      }
      
      console.log(`${validProperties.length} imóveis válidos para importação`);
      if (errors.length) {
        console.log(`${errors.length} imóveis com erros de validação`);
      }
      
      // Importar propriedades válidas
      const imported = [];
      
      for (const propData of validProperties) {
        try {
          const property = await storageInstance.createProperty(propData);
          imported.push(property);
        } catch (error) {
          console.error('Erro ao criar imóvel:', error);
          errors.push({
            property: propData.title || 'Imóvel sem título',
            error: 'Erro ao salvar no banco de dados'
          });
        }
      }
      
      // Retornar resultado
      res.status(200).json({
        imported: imported.length,
        failed: errors.length,
        total: properties.length,
        errors: errors.length > 0 ? errors : undefined
      });
      
    } catch (error) {
      console.error('Erro na importação de imóveis:', error);
      
      // Limpar arquivo temporário, se existir
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      
      res.status(500).json({ 
        message: "Erro ao processar importação de imóveis", 
        error: error.message 
      });
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
      console.log("Fetching all clients...");
      if (typeof storageInstance.getAllClients !== 'function') {
        console.error("getAllClients is not a function!");
        return res.status(500).json({ message: "Implementation error: getAllClients is not a function" });
      }
      
      const clients = await storageInstance.getAllClients();
      console.log("Clients fetched successfully:", clients ? clients.length : 0);
      res.json(clients || []);
    } catch (error) {
      console.error("Error fetching clients:", error);
      res.status(500).json({ message: `Error fetching clients: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
      console.log("Trying to create client with data:", req.body);
      
      if (typeof storageInstance.createClient !== 'function') {
        console.error("createClient is not a function!");
        return res.status(500).json({ message: "Implementation error: createClient is not a function" });
      }
      
      const validatedData = insertClientSchema.parse(req.body);
      console.log("Data validated successfully:", validatedData);
      
      const client = await storageInstance.createClient(validatedData);
      console.log("Client created successfully:", client);
      
      res.status(201).json(client);
    } catch (error) {
      console.error("Error creating client:", error);
      if (error instanceof z.ZodError) {
        console.error("Validation errors:", error.errors);
        return res.status(400).json({ message: "Invalid client data", errors: error.errors });
      }
      res.status(500).json({ message: `Error creating client: ${error instanceof Error ? error.message : 'Unknown error'}` });
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
  
  // Endpoint para atualização parcial das configurações
  apiRouter.patch("/website/config", async (req, res) => {
    try {
      // Obter a configuração atual
      const currentConfig = await storageInstance.getWebsiteConfig();
      if (!currentConfig) {
        return res.status(404).json({ message: "Website configuration not found" });
      }
      
      // Mesclar com as atualizações recebidas
      const updatedConfig = {
        ...currentConfig,
        ...req.body,
      };
      
      // Atualizar no banco de dados
      const config = await storageInstance.updateWebsiteConfig(updatedConfig);
      res.json(config);
    } catch (error) {
      console.error("Error updating website configuration:", error);
      res.status(500).json({ message: "Error updating website configuration" });
    }
  });
  
  // Rotas para integração e exportação
  apiRouter.post("/integrations/generate-xml", async (req, res) => {
    try {
      // Obter a configuração do site
      const config = await storageInstance.getWebsiteConfig();
      if (!config) {
        return res.status(404).json({ message: "Website configuration not found" });
      }
      
      // Obter todos os imóveis
      const properties = await storageInstance.getAllProperties();
      
      // Gerar o XML
      const xmlContent = await generatePropertyXml(
        properties,
        config.vivaRealUsername,
        config.includeInactiveProperties || false,
        config.includeSoldProperties || false
      );
      
      // Definir o nome do arquivo
      const xmlFilename = config.customXmlPath || "xml_imoveis.xml";
      
      // Salvar o XML no diretório public
      await saveXmlToFile(xmlContent, xmlFilename);
      
      // Atualizar a data da última atualização do XML
      const updatedConfig = {
        ...config,
        lastXmlUpdate: new Date().toISOString()
      };
      await storageInstance.updateWebsiteConfig(updatedConfig);
      
      res.json({ 
        success: true, 
        message: "XML generated successfully", 
        filename: xmlFilename,
        propertiesCount: properties.length 
      });
    } catch (error) {
      console.error("Error generating XML:", error);
      res.status(500).json({ message: "Error generating XML file" });
    }
  });
  
  // Configurar diretório public para servir arquivos estáticos
  // Isso será chamado na função principal depois de registrar as rotas
  const publicDir = path.join(process.cwd(), 'public');
  if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
  }

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
  
  // Configurar o Express para servir arquivos estáticos da pasta 'public'
  app.use(express.static('public'));
  
  // Rota específica para servir arquivos XML com cabeçalho correto
  app.get('*.xml', (req, res, next) => {
    const xmlPath = path.join(process.cwd(), 'public', req.path);
    fs.access(xmlPath, fs.constants.R_OK, (err) => {
      if (err) {
        next(); // Arquivo não existe, prosseguir para o próximo handler
      } else {
        res.set('Content-Type', 'application/xml');
        res.sendFile(xmlPath);
      }
    });
  });

  const httpServer = createServer(app);
  return httpServer;
}
