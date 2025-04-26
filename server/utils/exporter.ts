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
 * Gera o XML no formato ZAP/VivaReal 4.0
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

  // Construir o objeto XML
  const xmlObj = {
    'ListingDataFeed': {
      '$': {
        'xmlns': 'http://www.vivareal.com/schemas/1.0/VivaReal.xsd',
        'xmlns:xsi': 'http://www.w3.org/2001/XMLSchema-instance',
        'xsi:schemaLocation': 'http://www.vivareal.com/schemas/1.0/VivaReal.xsd'
      },
      'Header': {
        'Provider': {
          'Name': 'ImobSite CRM',
          'Logo': '',
          'Email': '',
          'Phone': '',
        },
        'Email': '',
        'Website': '',
        'PublishDate': new Date().toISOString(),
      },
      'Listings': {
        'Listing': filteredProperties.map(property => {
          // Valores padrão para campos opcionais
          let bathrooms = property.bathrooms || 0;
          let bedrooms = property.bedrooms || 0;
          let parkingSpots = property.parkingSpots || 0;
          let iptuValue = property.iptuValue ? formatMoney(property.iptuValue) : '';
          let condoFee = property.condoFee ? formatMoney(property.condoFee) : '';
          
          // Determinar tipo de transação (venda ou aluguel)
          const transactionType = property.purpose === 'sale' ? 'For Sale' : 'For Rent';
          
          // Preparar endereço completo
          const fullAddress = [
            property.address,
            property.neighborhood,
            property.city,
            property.zipCode
          ].filter(Boolean).join(', ');
          
          // Mapear o tipo de imóvel para formato VivaReal
          let propertyType = 'Residential';
          let subType = 'Apartment';
          
          switch (property.type.toLowerCase()) {
            case 'apartment':
              propertyType = 'Residential';
              subType = 'Apartment';
              break;
            case 'house':
              propertyType = 'Residential';
              subType = 'Home';
              break;
            case 'commercial':
              propertyType = 'Commercial';
              subType = 'Office';
              break;
            case 'land':
              propertyType = 'Commercial';
              subType = 'Land';
              break;
            default:
              propertyType = 'Residential';
              subType = 'Apartment';
          }
          
          // Preparar imagens
          const photos = Array.isArray(property.images) 
            ? property.images.map((img: any, index: number) => ({
                'Photo': {
                  '$': { 'main': index === 0 ? 'true' : 'false' },
                  'URL': typeof img === 'string' ? img : img.url,
                  'Caption': `Imagem ${index + 1} de ${property.title}`
                }
              }))
            : [];
          
          // Identificar status do imóvel
          let propertyStatus = 'Active';
          if (property.status === 'sold' || property.status === 'rented') {
            propertyStatus = 'Inactive';
          } else if (property.status === 'available') {
            propertyStatus = 'Active';
          }
          
          // Construir o objeto da propriedade no formato VivaReal
          return {
            'ListingID': property.id.toString(),
            'Title': property.title,
            'TransactionType': transactionType,
            'PropertyType': propertyType,
            'PropertySubType': subType,
            'ListPrice': {
              '$': {
                'currency': 'BRL',
              },
              '_': formatMoney(property.price)
            },
            'Description': property.description,
            'ContactInfo': {
              'Email': '',
              'Phone': '',
              'Website': '',
              'Name': vivaRealUsername || 'ImobSite CRM',
            },
            'Location': {
              'Country': {
                '$': {
                  'abbreviation': 'BR'
                },
                '_': 'Brasil'
              },
              'State': {
                '_': property.city.split('-').pop()?.trim() || 'SP'
              },
              'City': {
                '_': property.city.split('-').shift()?.trim() || property.city
              },
              'Neighborhood': {
                '_': property.neighborhood
              },
              'Address': {
                '_': property.address
              },
              'PostalCode': property.zipCode || '',
            },
            'Details': {
              'UsableArea': {
                '$': {
                  'unit': 'square metres'
                },
                '_': property.area.toString()
              },
              'Bedrooms': bedrooms.toString(),
              'Bathrooms': bathrooms.toString(),
              'Garages': parkingSpots.toString(),
              'UnitFeatures': {
                'UnitFeature': property.features || []
              },
              'OtherFeatures': {
                'Feature': [
                  ...(property.iptuValue ? [`IPTU: ${iptuValue}/ano`] : []),
                  ...(property.condoFee ? [`Condomínio: ${condoFee}/mês`] : [])
                ]
              }
            },
            'Media': {
              'Item': photos
            },
            'Status': propertyStatus,
            'FeaturedListing': property.isFeatured ? 'true' : 'false',
          };
        })
      }
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