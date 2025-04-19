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
    <div className="h-auto w-full relative" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="text-center mb-2">
        <h3 className="text-xl font-semibold mb-2">Seu funil</h3>
      </div>
      
      <div className="flex items-center justify-center">
        <div className="w-full max-w-2xl relative">
          {/* Desenho visual do funil */}
          <div className="relative flex flex-col items-center space-y-3">
            {sortedStages.map((stage, index) => {
              const count = stageCounts[stage.id] || 0;
              const percentage = getPercentage(count);
              
              // Calcular a largura do funil - diminui gradualmente
              // Primeira etapa mais larga, última mais estreita
              const maxWidth = 95;
              const minWidth = 60;
              const width = maxWidth - (index * ((maxWidth - minWidth) / (sortedStages.length - 1 || 1)));
              
              // Altura fixa para cada estágio
              const height = 68;
              
              const color = getStageBackgroundColor(index, sortedStages.length);
              
              // Determine se deve mostrar a porcentagem na lateral direita
              const showSidePercentage = index < sortedStages.length - 1;
              
              return (
                <div 
                  key={stage.id}
                  className="relative w-full"
                  style={{ 
                    height: `${height}px`,
                    marginBottom: '2px',
                  }}
                >
                  {/* Forma do trapézio */}
                  <div 
                    className="absolute left-1/2 transform -translate-x-1/2 shadow-md transition-all duration-300"
                    style={{
                      width: `${width}%`,
                      height: '100%',
                      backgroundColor: color,
                      clipPath: 'polygon(0% 0%, 100% 0%, 95% 100%, 5% 100%)',
                      borderRadius: '2px',
                    }}
                  />
                  
                  {/* Conteúdo do estágio */}
                  <div 
                    className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2 z-10 flex flex-col items-center text-center" 
                    style={{ width: '100%' }}
                  >
                    <div className="text-white text-sm font-medium">
                      {stage.name}
                    </div>
                    <div className="text-white text-2xl font-bold mt-1">
                      {count}
                    </div>
                  </div>
                  
                  {/* Indicador de porcentagem na lateral */}
                  {showSidePercentage && (
                    <div 
                      className="absolute right-0 top-1/2 transform translate-x-[110%] -translate-y-1/2 z-20"
                      style={{ 
                        backgroundColor: index === 0 ? '#FCD34D' : index === 1 ? '#34D399' : '#F87171',
                        width: '48px',
                        height: '48px',
                        borderRadius: '100%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
                      }}
                    >
                      {percentage}%
                    </div>
                  )}
                </div>
              );
            })}
          </div>
          
          {/* Ticket médio abaixo do funil */}
          <div className="mt-6 text-center">
            <div className="text-sm text-gray-500 mb-1">Ticket médio</div>
            <div className="text-2xl font-bold">250.000,00</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get a background color based on stage position
function getStageBackgroundColor(index: number, totalStages: number): string {
  // Cores baseadas na imagem de referência
  const colors = [
    "#9ADE4D",  // Verde claro (Visitantes)
    "#36C3B0",  // Verde-água (Leads) 
    "#40A1D3",  // Azul claro (Oportunidades)
    "#A37CCB",  // Roxo (Vendas)
  ];
  
  // Se tivermos mais estágios que cores, repetir as cores
  return colors[index % colors.length];
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
