import { Skeleton } from "@/components/ui/skeleton";
import { Progress } from "@/components/ui/progress";

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

export default function SalesFunnel({ isLoading, data }: SalesFunnelProps) {
  if (isLoading || !data) {
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

  const contactsPercentage = getPercentage(data.contacts);
  const visitsPercentage = getPercentage(data.visits);
  const proposalsPercentage = getPercentage(data.proposals);
  const salesPercentage = getPercentage(data.sales);

  return (
    <div className="h-80 w-full relative">
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="space-y-4 w-full px-8">
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Leads ({data.leads})</span>
              <span className="text-sm font-medium">100%</span>
            </div>
            <Progress value={100} className="h-5" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Contatos ({data.contacts})</span>
              <span className="text-sm font-medium">{contactsPercentage}%</span>
            </div>
            <Progress value={contactsPercentage} className="h-5" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Visitas ({data.visits})</span>
              <span className="text-sm font-medium">{visitsPercentage}%</span>
            </div>
            <Progress value={visitsPercentage} className="h-5" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Propostas ({data.proposals})</span>
              <span className="text-sm font-medium">{proposalsPercentage}%</span>
            </div>
            <Progress value={proposalsPercentage} className="h-5" />
          </div>
          
          <div>
            <div className="flex justify-between mb-1">
              <span className="text-sm font-medium">Vendas ({data.sales})</span>
              <span className="text-sm font-medium">{salesPercentage}%</span>
            </div>
            <Progress value={salesPercentage} className="h-5 bg-green-200" />
          </div>
        </div>
      </div>
    </div>
  );
}
