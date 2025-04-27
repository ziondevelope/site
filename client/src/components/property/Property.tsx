import React from 'react';
import { Link } from 'wouter';
import { Property as PropertyType } from '@shared/schema';
import { MapPin } from 'lucide-react';

interface PropertyCardProps {
  property: PropertyType;
  primaryColor?: string;
  onClick?: (id: number) => void;
}

export const Property: React.FC<PropertyCardProps> = ({ property, primaryColor = '#7f651e', onClick }) => {
  // Função para formatar preço em formato de moeda brasileira
  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    });
  };

  // Função para obter a primeira imagem do imóvel
  const getPropertyImage = () => {
    if (property.images && property.images.length > 0) {
      if (typeof property.images[0] === 'object' && 'url' in property.images[0]) {
        return property.images[0].url;
      }
      if (typeof property.images[0] === 'string') {
        return property.images[0];
      }
    }
    // Imagem de fallback (pode ser substituída por uma imagem de placeholder)
    return 'https://via.placeholder.com/400x300?text=Sem+Imagem';
  };

  // Handler para o clique no card de imóvel
  const handleClick = () => {
    if (onClick) {
      onClick(property.id);
    }
  };

  return (
    <div 
      className="card-property bg-white rounded-lg overflow-hidden shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer"
      onClick={handleClick}
    >
      {/* Imagem do Imóvel */}
      <div className="relative h-48 overflow-hidden">
        <img 
          src={getPropertyImage()} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-500 ease-in-out hover:scale-105"
        />
        
        {/* Badges */}
        <div className="absolute top-0 left-0 p-2 flex gap-2">
          {property.purpose === 'sale' && (
            <span 
              className="badge-sale text-xs px-2 py-1 rounded font-medium"
              style={{ backgroundColor: primaryColor, color: 'white' }}
            >
              Venda
            </span>
          )}
          {property.purpose === 'rent' && (
            <span 
              className="badge-rent text-xs px-2 py-1 rounded font-medium"
              style={{ backgroundColor: '#2563eb', color: 'white' }}
            >
              Aluguel
            </span>
          )}
          {property.isFeatured && (
            <span 
              className="badge-featured text-xs px-2 py-1 rounded font-medium bg-yellow-500 text-white"
            >
              Destaque
            </span>
          )}
        </div>
      </div>
      
      {/* Informações do Imóvel */}
      <div className="p-4">
        <h3 className="text-lg font-medium mb-1 truncate" title={property.title}>{property.title}</h3>
        
        {/* Localização */}
        <div className="flex items-center mb-2 text-sm text-gray-500">
          <MapPin size={14} className="mr-1" />
          <span className="truncate">{property.neighborhood || ''}{property.neighborhood && property.city ? ', ' : ''}{property.city || ''}</span>
        </div>
        
        {/* Características */}
        <div className="flex items-center mb-3 gap-4">
          {property.bedrooms && property.bedrooms > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <i className="fas fa-bed mr-1"></i>
              <span>{property.bedrooms}</span>
            </div>
          )}
          
          {property.bathrooms && property.bathrooms > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <i className="fas fa-shower mr-1"></i>
              <span>{property.bathrooms}</span>
            </div>
          )}
          
          {property.area > 0 && (
            <div className="flex items-center text-xs text-gray-600">
              <i className="fas fa-ruler-combined mr-1"></i>
              <span>{property.area}m²</span>
            </div>
          )}
        </div>
        
        {/* Preço */}
        <div className="text-base font-semibold" style={{ color: primaryColor }}>
          {formatCurrency(property.price)}
          {property.purpose === 'rent' && <span className="text-sm font-normal text-gray-500">/mês</span>}
        </div>
      </div>
    </div>
  );
};