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

  console.log("Estado de carregamento:", { isLoading, dataExists: !!data, defaultFunnel, stagesCount: sortedStages.length });
  
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
      <div className="mt-6 flex items-center justify-center">
        <div className="w-full px-8 relative">
          {/* Total leads no topo do funil */}
          <div className="text-center mb-3">
            <span className="text-sm font-medium bg-blue-50 px-3 py-1 rounded-full">
              Total de Leads: {funnel.leads}
            </span>
          </div>
          
          {/* Desenho visual do funil */}
          <div className="relative flex flex-col items-center">
            {sortedStages.map((stage, index) => {
              const count = stageCounts[stage.id] || 0;
              const percentage = getPercentage(count);
              const isLastStage = index === sortedStages.length - 1;
              
              // Calcular a largura do funil - diminui gradualmente
              const width = 100 - (index * (70 / sortedStages.length));
              // Altura fixa para cada estágio
              const height = 50;
              
              const color = getStageBackgroundColor(index, sortedStages.length);
              
              return (
                <div 
                  key={stage.id}
                  className="relative mb-1 flex flex-col items-center justify-center text-center transition-all"
                  style={{ 
                    width: `${width}%`,
                    height: `${height}px`,
                    backgroundColor: color,
                    borderRadius: '4px',
                    marginBottom: '8px',
                    transition: 'all 0.3s ease',
                    // Conectar os estágios com linhas trapezoidais
                    clipPath: isLastStage 
                      ? 'polygon(0 0, 100% 0, 100% 100%, 0 100%)' 
                      : `polygon(0 0, 100% 0, ${100 - (60 / sortedStages.length)}% 100%, ${(60 / sortedStages.length)}% 100%)`,
                    zIndex: sortedStages.length - index
                  }}
                >
                  <div className="z-10 text-white font-medium">
                    {stage.name} ({count})
                  </div>
                  <div className="z-10 text-white text-xs">
                    {percentage}%
                  </div>
                </div>
              );
            })}
          </div>
          
          {/* Legenda abaixo do funil */}
          <div className="mt-6 text-center text-xs text-gray-500">
            As porcentagens mostram a taxa de conversão em cada estágio
          </div>
        </div>
      </div>
    </div>
  );
}

// Helper function to get a background color based on stage position
function getStageBackgroundColor(index: number, totalStages: number): string {
  // Se for o último estágio (conversão), usar verde
  if (index === totalStages - 1) return "#16a34a"; // Verde para o último estágio
  
  // Cores do funil em gradiente de azul para azul mais claro, depois laranja
  if (totalStages <= 3) {
    // Para funis pequenos, usar cores mais distintas
    const colors = ["#2563eb", "#3b82f6", "#f59e0b"];
    return colors[Math.min(index, colors.length - 1)];
  } else {
    // Para funis maiores, criar um gradiente
    if (index < totalStages / 2) {
      // Primeira metade - tons de azul
      const blueValue = 120 + Math.round((120 * index) / (totalStages / 2));
      return `rgb(14, ${blueValue}, 246)`;
    } else {
      // Segunda metade - transição para laranja/âmbar
      const progress = (index - totalStages / 2) / (totalStages / 2);
      // Interpolação de azul para laranja
      const r = Math.round(14 + (245 - 14) * progress);
      const g = Math.round(165 + (158 - 165) * progress);
      const b = Math.round(233 + (11 - 233) * progress);
      return `rgb(${r}, ${g}, ${b})`;
    }
  }
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
