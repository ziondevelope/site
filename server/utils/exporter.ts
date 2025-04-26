import { Property } from '@shared/schema';
import { promises as fs } from 'fs';
import path from 'path';
import xml2js from 'xml2js';

/**
 * Formata um valor numérico para o formato de moeda brasileiro
 */
function formatMoney(value: number): string {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).replace('R$', '').trim();
}

/**
 * Gera o XML no formato do portal imobiliário brasileiro
 */
export async function generatePropertyXml(
  properties: Property[],
  vivaRealUsername: string | undefined,
  includeInactiveProperties: boolean,
  includeSoldProperties: boolean
): Promise<string> {
  // Filtrar propriedades conforme as configurações
  const filteredProperties = properties.filter(prop => {
    // Se não incluir imóveis inativos, filtrar apenas os ativos
    if (!includeInactiveProperties && prop.status !== 'available') {
      return false;
    }
    
    // Se não incluir imóveis vendidos/alugados, filtrar apenas os disponíveis
    if (!includeSoldProperties && (prop.status === 'sold' || prop.status === 'rented')) {
      return false;
    }
    
    return true;
  });

  // Construir o objeto XML no formato brasileiro
  const xmlObj = {
    'imoveis': {
      'imovel': filteredProperties.map(property => {
        // Valores padrão para campos opcionais
        let bathrooms = property.bathrooms || 0;
        let bedrooms = property.bedrooms || 0;
        let suites = property.suites || 0;
        let parkingSpots = property.parkingSpots || 0;
        
        // Mapear o tipo de imóvel para categorias brasileiras
        let categoria = 'Residencial';
        let tipo = 'Apartamento';
        let subtipo = '';
        
        switch (property.type.toLowerCase()) {
          case 'apartment':
            categoria = 'Residencial';
            tipo = 'Apartamento';
            break;
          case 'house':
            categoria = 'Residencial';
            tipo = 'Casa';
            subtipo = 'Casa';
            break;
          case 'townhouse':
            categoria = 'Residencial';
            tipo = 'Casa';
            subtipo = 'Casa de condomínio';
            break;
          case 'commercial':
            categoria = 'Comercial';
            tipo = 'Sala Comercial';
            break;
          case 'office':
            categoria = 'Comercial';
            tipo = 'Sala Comercial';
            break;
          case 'land':
            categoria = 'Terrenos e Lotes';
            tipo = 'Terreno';
            break;
          case 'rural':
            categoria = 'Rural';
            tipo = 'Fazenda';
            break;
          default:
            categoria = 'Residencial';
            tipo = 'Apartamento';
        }
        
        // Identificar disponibilidade do imóvel
        let disponibilidade = 'ativo';
        if (property.status === 'sold') {
          disponibilidade = 'vendido';
        } else if (property.status === 'rented') {
          disponibilidade = 'alugado';
        } else if (property.status !== 'available') {
          disponibilidade = 'inativo';
        }
        
        // Extrair informações do endereço
        const cityParts = property.city.split('-');
        const cidade = cityParts[0]?.trim() || property.city;
        const uf = cityParts[1]?.trim() || 'SP';
        
        // Extrair número do endereço (se disponível)
        const addressParts = property.address.match(/^(.*?)(?:,\s*(\d+)|$)/);
        const logradouro = addressParts ? addressParts[1] : property.address;
        const numero = addressParts && addressParts[2] ? addressParts[2] : '';
        
        // Preparar características/features
        const caracteristicas = Array.isArray(property.features) ? property.features : [];
        
        // Preparar fotos
        const fotos = [];
        if (Array.isArray(property.images)) {
          for (const img of property.images) {
            const url = typeof img === 'string' ? img : img.url;
            fotos.push({
              url: url
            });
          }
        }
        
        // Construir o objeto da propriedade no formato exato do exemplo
        return {
          codigo: property.id.toString(),
          categoria: categoria,
          tipo: tipo,
          subtipo: subtipo,
          endereco: {
            logradouro: logradouro,
            numero: numero,
            bairro: property.neighborhood,
            cidade: cidade,
            uf: uf,
            cep: property.zipCode || ''
          },
          area_util: property.area,
          area_total: property.totalArea || property.area,
          quartos: bedrooms,
          suites: suites,
          banheiros: bathrooms,
          vagas: parkingSpots,
          valor: property.price.toFixed(2),
          descricao: property.description,
          caracteristicas: {
            caracteristica: caracteristicas
          },
          fotos: {
            foto: fotos
          },
          disponibilidade: disponibilidade
        };
      })
    }
  };

  // Criar o construtor XML
  const builder = new xml2js.Builder({
    renderOpts: { pretty: true, indent: '  ' },
    xmldec: { version: '1.0', encoding: 'UTF-8' }
  });

  // Gerar o XML como string
  return builder.buildObject(xmlObj);
}

/**
 * Salva o XML em um arquivo
 */
export async function saveXmlToFile(xml: string, filename: string): Promise<void> {
  const publicDir = path.join(process.cwd(), 'public');
  
  // Criar diretório public se não existir
  try {
    await fs.mkdir(publicDir, { recursive: true });
  } catch (err) {
    console.error('Erro ao criar diretório public:', err);
  }
  
  // Salvar arquivo XML
  const xmlPath = path.join(publicDir, filename);
  await fs.writeFile(xmlPath, xml, 'utf8');
}