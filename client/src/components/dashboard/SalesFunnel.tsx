import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";
import { useQuery } from "@tanstack/react-query";
import { FunnelStage, SalesFunnel as SalesFunnelType } from "@shared/schema";
import { useMemo } from "react";
import { apiRequest } from "@/lib/queryClient";

interface SalesFunnelProps {
  isLoading: boolean;
  data?: {
    leads: number;
    contacts: number;
    visits: number;
    proposals: number;
    sales: number;
  };
}

export default function SalesFunnel({ isLoading: initialLoading, data }: SalesFunnelProps) {
  // Fetch all sales funnels
  const { data: funnels, isLoading: funnelsLoading } = useQuery<SalesFunnelType[]>({
    queryKey: ['/api/sales-funnels'],
  });

  // Get the default funnel
  const defaultFunnel = useMemo(() => {
    if (!funnels) return null;
    return funnels.find(f => f.isDefault) || funnels[0];
  }, [funnels]);

  // Fetch funnel stages for the default funnel
  const { data: stages, isLoading: stagesLoading } = useQuery<FunnelStage[]>({
    queryKey: ['/api/funnel-stages', defaultFunnel?.id],
    queryFn: async () => {
      if (!defaultFunnel?.id) throw new Error("No default funnel ID");
      return apiRequest(`/api/funnel-stages?funnelId=${defaultFunnel.id}`);
    },
    enabled: !!defaultFunnel,
  });

  // Sort stages by position
  const sortedStages = useMemo(() => {
    if (!stages) return [];
    return [...stages].sort((a, b) => a.position - b.position);
  }, [stages]);

  const isLoading = initialLoading || funnelsLoading || stagesLoading;

  console.log("Estado de carregamento:", { isLoading, dataExists: !!data, defaultFunnel, stagesCount: sortedStages.length, stages });
  
  // Forçar renderização de exemplo se não houver estágios
  let hasStages = stages && stages.length > 0;
  
  // Verificar se temos dados suficientes para renderizar o funil
  if (isLoading || !defaultFunnel || !sortedStages.length) {
    return (
      <div className="h-80 w-full space-y-6 p-4">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="space-y-2">
            <div className="flex justify-between">
              <Skeleton className="h-4 w-24" />
              <Skeleton className="h-4 w-12" />
            </div>
            <Skeleton className="h-5 w-full" />
          </div>
        ))}
      </div>
    );
  }

  // Se não temos dados, usar valores padrão
  const funnel = data || { leads: 3, contacts: 2, visits: 1, proposals: 1, sales: 0 };
  
  // Calculate percentages for the funnel
  const total = funnel.leads || 0;
  const getPercentage = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  // Estimate lead counts per stage 
  // Note: This is a simplified approach based on the counts we already have
  const stageCounts = stagesToCounts(sortedStages, funnel);
  
  return (
    <div className="h-auto w-full relative">
      <div className="absolute top-0 right-0">
        <span className="text-sm font-medium text-gray-600">
          Funil: {defaultFunnel.name}
        </span>
      </div>
      <div className="mt-10 flex items-center justify-center">
        <div className="w-full max-w-2xl px-4 lg:px-0 relative">
          {/* Total leads no topo do funil */}
          <div className="text-center mb-4">
            <span className="text-sm font-medium bg-blue-50 px-4 py-1.5 rounded-full shadow-sm">
              Total de Leads: {funnel.leads}
            </span>
          </div>
          
          {/* Desenho visual do funil */}
          <div className="relative flex flex-col items-center space-y-6">
            {sortedStages.map((stage, index) => {
              const count = stageCounts[stage.id] || 0;
              const percentage = getPercentage(count);
              const isLastStage = index === sortedStages.length - 1;
              
              // Calcular a largura do funil - diminui gradualmente
              // Primeira etapa mais larga, última mais estreita
              const maxWidth = 85;
              const minWidth = 40;
              const width = maxWidth - (index * ((maxWidth - minWidth) / (sortedStages.length - 1 || 1)));
              
              // Altura fixa para cada estágio
              const height = 65;
              
              const color = getStageBackgroundColor(index, sortedStages.length);
              
              return (
                <div 
                  key={stage.id}
                  className="relative flex flex-col items-center justify-center text-center"
                  style={{ 
                    width: `${width}%`,
                    height: `${height}px`,
                    marginBottom: '5px',
                  }}
                >
                  {/* Forma do trapézio */}
                  <div 
                    className="absolute inset-0 shadow-md transition-all duration-300"
                    style={{
                      backgroundColor: color,
                      clipPath: 'polygon(0% 0%, 100% 0%, 85% 100%, 15% 100%)',
                      borderRadius: '3px',
                    }}
                  />
                  
                  {/* Conteúdo do estágio */}
                  <div className="z-10 flex flex-col items-center">
                    <div className="text-white font-medium text-base">
                      {stage.name}
                    </div>
                    <div className="text-white text-sm mt-1 flex items-center">
                      <span className="mr-2 font-bold">{count}</span>
                      <span className="opacity-80">({percentage}%)</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legenda abaixo do funil */}
          <div className="mt-8 text-center text-xs text-gray-500">
            As porcentagens mostram a taxa de conversão em cada estágio do funil
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get a background color based on stage position
function getStageBackgroundColor(index: number, totalStages: number): string {
  // Usar uma paleta fixa e mais simples para maior contraste e melhor visualização
  const colors = [
    "#3565E7", // Azul principal (primeiro estágio)
    "#4B74E8", // Azul ligeiramente mais claro
    "#6183EA", // Azul médio
    "#7692EC", // Azul claro
    "#8BA1ED", // Azul muito claro
    "#34C38F", // Verde (último estágio)
  ];
  
  // Se tivermos menos estágios que cores, usar apenas as cores necessárias
  if (totalStages <= colors.length) {
    // Para poucos estágios, usar cores específicas
    if (index === totalStages - 1 && totalStages > 1) {
      // Último estágio sempre verde
      return colors[colors.length - 1];
    }
    
    // Mapear o índice para cores disponíveis excluindo o verde (último)
    const availableColors = colors.slice(0, colors.length - 1);
    const colorIndex = Math.min(index, availableColors.length - 1);
    return availableColors[colorIndex];
  } 
  
  // Para muitos estágios, calcular cores intermediárias
  if (index === 0) {
    return colors[0]; // Primeiro estágio: azul escuro
  }
  
  if (index === totalStages - 1) {
    return colors[colors.length - 1]; // Último estágio: verde
  }
  
  // Estágios intermediários: interpolação entre cores disponíveis
  const nonEdgeColors = colors.slice(0, colors.length - 1); // Todas as cores exceto o verde
  const segmentCount = nonEdgeColors.length - 1;
  const progress = (index / (totalStages - 1)) * segmentCount;
  
  const lowerIndex = Math.floor(progress);
  const upperIndex = Math.ceil(progress);
  
  // Se estivermos exatamente em uma cor definida
  if (lowerIndex === upperIndex) {
    return nonEdgeColors[lowerIndex];
  }
  
  // Interpolar entre as duas cores mais próximas
  const weight = progress - lowerIndex;
  
  // Função para converter hex em RGB
  const hexToRgb = (hex: string) => {
    const r = parseInt(hex.slice(1, 3), 16);
    const g = parseInt(hex.slice(3, 5), 16);
    const b = parseInt(hex.slice(5, 7), 16);
    return { r, g, b };
  };
  
  const color1 = hexToRgb(nonEdgeColors[lowerIndex]);
  const color2 = hexToRgb(nonEdgeColors[upperIndex]);
  
  const r = Math.round(color1.r * (1 - weight) + color2.r * weight);
  const g = Math.round(color1.g * (1 - weight) + color2.g * weight);
  const b = Math.round(color1.b * (1 - weight) + color2.b * weight);
  
  return `rgb(${r}, ${g}, ${b})`;
}

// Helper function to estimate stage counts based on existing data
function stagesToCounts(
  stages: FunnelStage[], 
  data: { leads: number; contacts: number; visits: number; proposals: number; sales: number; }
): Record<number, number> {
  const counts: Record<number, number> = {};
  const stageCount = stages.length;
  
  if (stageCount <= 1) {
    if (stages[0]) counts[stages[0].id] = data.leads;
    return counts;
  }
  
  // This is a simplified mapping of standard funnels to custom stages
  const standardData = [data.leads, data.contacts, data.visits, data.proposals, data.sales];
  
  stages.forEach((stage, index) => {
    // Map stages based on position in funnel
    const dataIndex = Math.min(index, standardData.length - 1);
    counts[stage.id] = standardData[dataIndex] || 0;
  });
  
  return counts;
}
