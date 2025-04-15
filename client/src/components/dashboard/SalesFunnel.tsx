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
  
  if (isLoading || !data || !defaultFunnel || !sortedStages.length) {
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

  // Calculate percentages for the funnel
  const total = data.leads;
  const getPercentage = (value: number) => (total > 0 ? Math.round((value / total) * 100) : 0);

  // Estimate lead counts per stage 
  // Note: This is a simplified approach based on the counts we already have
  const stageCounts = stagesToCounts(sortedStages, data);
  
  return (
    <div className="h-auto w-full relative">
      <div className="absolute top-0 right-0">
        <span className="text-sm font-medium text-gray-600">
          Funil: {defaultFunnel.name}
        </span>
      </div>
      <div className="mt-6 flex items-center justify-center">
        <div className="space-y-4 w-full px-8">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Total de Leads ({data.leads})</span>
              <span className="text-sm font-medium">100%</span>
            </div>
            <Progress value={100} className="h-1 mb-6" />
          </div>
          
          {sortedStages.map((stage, index) => {
            const count = stageCounts[stage.id] || 0;
            const percentage = getPercentage(count);
            const isLastStage = index === sortedStages.length - 1;
            
            return (
              <div key={stage.id}>
                <div className="flex justify-between mb-1">
                  <span className="text-sm font-medium">{stage.name} ({count})</span>
                  <span className="text-sm font-medium">{percentage}%</span>
                </div>
                <Progress 
                  value={percentage} 
                  className={`h-5 ${isLastStage ? 'bg-green-200' : ''}`}
                  style={{ 
                    backgroundColor: percentage > 0 ? `${getStageBackgroundColor(index, sortedStages.length)}20` : undefined,
                    color: getStageBackgroundColor(index, sortedStages.length)
                  }}
                />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// Helper function to get a background color based on stage position
function getStageBackgroundColor(index: number, totalStages: number): string {
  if (index === totalStages - 1) return "#16a34a"; // Green for last stage
  
  // Create a gradient from blue to green
  const blueComponent = Math.round(10 + (80 * (totalStages - index - 1)) / totalStages);
  return `rgb(0, ${blueComponent}, 220)`;
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
