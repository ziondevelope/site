import { useQuery } from "@tanstack/react-query";
import StatsRow from "@/components/dashboard/StatsRow";
import SalesFunnel from "@/components/dashboard/SalesFunnel";
import RecentContacts from "@/components/dashboard/RecentContacts";
import ScheduledTasks from "@/components/dashboard/ScheduledTasks";

export default function Dashboard() {
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['/api/dashboard/funnel'],
  });

  // Fetch recent contacts
  const { data: recentContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts/recent'],
  });

  // Fetch scheduled tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/scheduled'],
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-semibold">Dashboard</h2>
        <div className="flex space-x-2">
          <button className="bg-white text-dark px-4 py-2 rounded-lg text-sm font-medium border border-gray-300 hover:bg-gray-50 transition">
            <i className="ri-download-line mr-1"></i> Exportar
          </button>
          <button className="bg-primary text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-600 transition">
            <i className="ri-refresh-line mr-1"></i> Atualizar
          </button>
        </div>
      </div>
      
      {/* Stats Row */}
      <StatsRow isLoading={statsLoading} stats={stats} />
      
      {/* Charts and Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Funnel Chart */}
        <div className="bg-white p-6 rounded-xl shadow-sm lg:col-span-2">
          <h3 className="text-lg font-semibold mb-4">Funil de Vendas</h3>
          <SalesFunnel data={funnelData} isLoading={funnelLoading} />
        </div>
        
        {/* Recent Contacts */}
        <RecentContacts contacts={recentContacts} isLoading={contactsLoading} />
      </div>
      
      {/* Scheduled Tasks */}
      <ScheduledTasks tasks={tasks} isLoading={tasksLoading} />
    </div>
  );
}
