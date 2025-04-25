import React, { useState } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';
import { WebsiteConfig, UpdateWebsiteConfig } from '@shared/schema';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faGripVertical, faEye, faEyeSlash, faCheck, faExclamationCircle } from '@fortawesome/free-solid-svg-icons';

interface HomeSectionsOrderSettingsProps {
  config?: WebsiteConfig;
  configData: Partial<UpdateWebsiteConfig>;
  onConfigChange: (data: Partial<UpdateWebsiteConfig>) => void;
}

type SectionType = {
  id: string;
  title: string;
  description: string;
  isEnabled: boolean;
  configKey: string;
};

export default function HomeSectionsOrderSettings({ config, configData, onConfigChange }: HomeSectionsOrderSettingsProps) {
  // Use ordem já existente ou padrão se não existir
  const defaultOrder = ['featuredProperties', 'saleProperties', 'rentProperties', 'testimonials', 'aboutSection'];
  const currentOrder = configData.homeSectionsOrder || config?.homeSectionsOrder || defaultOrder;

  // Seções disponíveis
  const allSections: Record<string, SectionType> = {
    featuredProperties: {
      id: 'featuredProperties',
      title: 'Imóveis em Destaque',
      description: 'Exibe os imóveis marcados como destaque',
      isEnabled: configData.showFeaturedProperties !== undefined 
          ? !!configData.showFeaturedProperties 
          : config?.showFeaturedProperties !== false,
      configKey: 'showFeaturedProperties'
    },
    saleProperties: {
      id: 'saleProperties',
      title: 'Imóveis para Venda',
      description: 'Exibe os imóveis disponíveis para venda',
      isEnabled: configData.showSaleProperties !== undefined 
          ? !!configData.showSaleProperties 
          : config?.showSaleProperties !== false,
      configKey: 'showSaleProperties'
    },
    rentProperties: {
      id: 'rentProperties',
      title: 'Imóveis para Aluguel',
      description: 'Exibe os imóveis disponíveis para aluguel',
      isEnabled: configData.showRentProperties !== undefined 
          ? !!configData.showRentProperties 
          : config?.showRentProperties !== false,
      configKey: 'showRentProperties'
    },
    testimonials: {
      id: 'testimonials',
      title: 'Depoimentos',
      description: 'Exibe os depoimentos de clientes',
      isEnabled: configData.showTestimonials !== undefined 
          ? !!configData.showTestimonials 
          : config?.showTestimonials === true,
      configKey: 'showTestimonials'
    },
    aboutSection: {
      id: 'aboutSection',
      title: 'Quem Somos',
      description: 'Exibe a seção Quem Somos com informações sobre a imobiliária',
      isEnabled: configData.showAboutSection !== undefined 
          ? !!configData.showAboutSection 
          : config?.showAboutSection !== false,
      configKey: 'showAboutSection'
    }
  };

  // Garante que temos um array de strings
  const getInitialSections = (): string[] => {
    if (!currentOrder) {
      return defaultOrder;
    }
    
    if (Array.isArray(currentOrder)) {
      return currentOrder.filter(id => typeof id === 'string' && id in allSections) as string[];
    }
    
    return defaultOrder;
  };
  
  // Seções ordenadas conforme a configuração atual
  const [orderedSections, setOrderedSections] = useState<string[]>(getInitialSections);

  // Handler para quando um item é arrastado e solto
  const handleDragEnd = (result: any) => {
    // Dropped outside the list
    if (!result.destination) {
      return;
    }

    // Obter array atual
    const items = Array.from(orderedSections);
    
    // Remover o item da posição original
    const [reorderedItem] = items.splice(result.source.index, 1);
    
    // Inserir na nova posição
    items.splice(result.destination.index, 0, reorderedItem);
    
    // Atualizar estado local
    setOrderedSections(items);
    
    // Atualizar configData
    onConfigChange({ homeSectionsOrder: items });
  };

  // Handler para alternar a exibição de uma seção
  const handleToggleSection = (sectionId: string) => {
    const section = allSections[sectionId];
    if (section) {
      const updatedValue = !section.isEnabled;
      
      // Atualizar a configuração específica
      onConfigChange({ 
        [section.configKey]: updatedValue
      });
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col space-y-2">
        <h2 className="text-lg font-medium">Ordem das Seções na Página Inicial</h2>
        <p className="text-sm text-gray-500">
          Arraste e solte para reorganizar as seções da página inicial. As seções aparecerão na ordem definida aqui.
          Você também pode ativar ou desativar cada seção.
        </p>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <Droppable droppableId="sections">
          {(provided) => (
            <div
              {...provided.droppableProps}
              ref={provided.innerRef}
              className="space-y-2"
            >
              {orderedSections.map((sectionId, index) => {
                const section = allSections[sectionId];
                if (!section) return null;
                
                return (
                  <Draggable key={sectionId} draggableId={sectionId} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        className={`flex items-center justify-between p-4 rounded-lg border 
                          ${section.isEnabled 
                            ? 'bg-white border-gray-200' 
                            : 'bg-gray-50 border-gray-200 opacity-70'}`}
                      >
                        <div className="flex items-center flex-1">
                          <div 
                            {...provided.dragHandleProps}
                            className="cursor-move p-2 mr-3 text-gray-400 hover:text-gray-600"
                          >
                            <FontAwesomeIcon icon={faGripVertical} />
                          </div>
                          
                          <div className="flex-1">
                            <div className="flex items-center">
                              <h3 className="font-medium">{section.title}</h3>
                              {section.isEnabled ? (
                                <span className="ml-2 text-xs px-2 py-1 bg-green-100 text-green-800 rounded-full flex items-center">
                                  <FontAwesomeIcon icon={faCheck} className="mr-1" size="xs" />
                                  Ativa
                                </span>
                              ) : (
                                <span className="ml-2 text-xs px-2 py-1 bg-gray-100 text-gray-600 rounded-full flex items-center">
                                  <FontAwesomeIcon icon={faExclamationCircle} className="mr-1" size="xs" />
                                  Desativada
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-gray-500">{section.description}</p>
                          </div>
                        </div>
                        
                        <button
                          type="button"
                          onClick={() => handleToggleSection(sectionId)}
                          className={`ml-4 p-2 rounded-full ${
                            section.isEnabled 
                              ? 'bg-gray-100 text-gray-600 hover:bg-gray-200' 
                              : 'bg-blue-100 text-blue-600 hover:bg-blue-200'
                          }`}
                          title={section.isEnabled ? 'Desativar seção' : 'Ativar seção'}
                        >
                          <FontAwesomeIcon 
                            icon={section.isEnabled ? faEyeSlash : faEye} 
                            className="w-4 h-4"
                          />
                        </button>
                      </div>
                    )}
                  </Draggable>
                );
              })}
              {provided.placeholder}
            </div>
          )}
        </Droppable>
      </DragDropContext>

      <div className="text-sm text-gray-500 p-4 bg-gray-50 rounded-lg border border-gray-200">
        <p>
          <span className="font-medium text-gray-700">Dica:</span> Desative as seções que você não deseja mostrar na página inicial.
          As alterações na ordem serão refletidas no site público imediatamente após salvar.
        </p>
      </div>
    </div>
  );
}