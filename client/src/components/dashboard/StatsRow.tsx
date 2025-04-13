import { Skeleton } from "@/components/ui/skeleton";
import { Card, CardContent } from "@/components/ui/card";

interface StatsRowProps {
  isLoading: boolean;
  stats?: {
    totalProperties: number;
    activeLeads: number;
    monthlySales: number;
    activeAgents: number;
    propertyTrend: number;
    leadsTrend: number;
    salesTrend: number;
    agentsTrend: number;
  };
}

export default function StatsRow({ isLoading, stats }: StatsRowProps) {
  if (isLoading || !stats) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Array.from({ length: 4 }).map((_, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between items-start">
                <div className="space-y-2">
                  <Skeleton className="h-4 w-24" />
                  <Skeleton className="h-8 w-16" />
                </div>
                <Skeleton className="h-10 w-10 rounded-lg" />
              </div>
              <div className="mt-4">
                <Skeleton className="h-4 w-32" />
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const stats_data = [
    {
      title: "Imóveis Cadastrados",
      value: stats.totalProperties,
      trend: stats.propertyTrend,
      icon: "ri-building-line",
      bgColor: "bg-blue-100",
      iconColor: "text-primary"
    },
    {
      title: "Leads Ativos",
      value: stats.activeLeads,
      trend: stats.leadsTrend,
      icon: "ri-user-follow-line",
      bgColor: "bg-green-100",
      iconColor: "text-secondary"
    },
    {
      title: "Vendas do Mês",
      value: stats.monthlySales,
      trend: stats.salesTrend,
      icon: "ri-exchange-dollar-line",
      bgColor: "bg-orange-100",
      iconColor: "text-warning"
    },
    {
      title: "Corretores Ativos",
      value: stats.activeAgents,
      trend: stats.agentsTrend,
      icon: "ri-team-line",
      bgColor: "bg-purple-100",
      iconColor: "text-purple-500"
    }
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
      {stats_data.map((stat, index) => (
        <div key={index} className="bg-white p-6 rounded-xl shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-sm text-gray-500">{stat.title}</p>
              <h3 className="text-2xl font-semibold mt-1">{stat.value}</h3>
            </div>
            <div className={`${stat.bgColor} p-2 rounded-lg`}>
              <i className={`${stat.icon} ${stat.iconColor} text-xl`}></i>
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className={`flex items-center ${stat.trend >= 0 ? 'text-success' : 'text-danger'}`}>
              <i className={`${stat.trend >= 0 ? 'ri-arrow-up-line' : 'ri-arrow-down-line'} mr-1`}></i> 
              {Math.abs(stat.trend)}%
            </span>
            <span className="text-gray-500 ml-2">desde o mês passado</span>
          </div>
        </div>
      ))}
    </div>
  );
}
