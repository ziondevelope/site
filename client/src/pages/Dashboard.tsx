import { useQuery } from "@tanstack/react-query";
import StatsRow from "@/components/dashboard/StatsRow";
import SalesFunnel from "@/components/dashboard/SalesFunnel";
import RecentContacts from "@/components/dashboard/RecentContacts";
import ScheduledTasks from "@/components/dashboard/ScheduledTasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

// Dados de exemplo para o gráfico de torta usando a paleta de cores
const pieData = [
  { name: 'Venda', value: 412, color: '#15616D' }, // Ciano
  { name: 'Locação', value: 412, color: '#FF7D00' }, // Laranja
  { name: 'Temporada', value: 98, color: '#78290F' }, // Marrom avermelhado
];

// Dados de exemplo para o gráfico de linha usando a paleta de cores
const lineData = [
  { month: 'DEZ', valor1: 500, valor2: 700 },
  { month: 'JAN', valor1: 800, valor2: 900 },
  { month: 'FEV', valor1: 1000, valor2: 700 },
  { month: 'MAR', valor1: 1500, valor2: 950 },
];

export default function Dashboard() {
  // Obter a data atual para o cabeçalho
  const today = new Date();
  const formattedDate = format(today, "EEEE, dd 'de' MMMM 'de' yyyy", { locale: ptBR });
  
  // Fetch dashboard statistics
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ['/api/dashboard/stats'],
  });

  // Fetch funnel data
  const { data: funnelData, isLoading: funnelLoading } = useQuery({
    queryKey: ['/api/dashboard/funnel'],
  });
  
  // Fetch scheduled tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/scheduled'],
  });

  // Fetch recent contacts
  const { data: recentContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts/recent'],
  });
  
  // Fetch all leads para o funil
  const { data: leads } = useQuery({
    queryKey: ['/api/leads'],
  });
  
  // Buscar todos os funis
  const { data: salesFunnels } = useQuery({
    queryKey: ['/api/sales-funnels'],
  });
  
  // Encontrar o funil padrão
  const defaultFunnel = salesFunnels?.find(f => f.isDefault) || salesFunnels?.[0];
  
  // Buscar os estágios do funil
  const { data: funnelStages, isLoading: stagesLoading } = useQuery({
    queryKey: ['/api/funnel-stages'],
    queryFn: async () => {
      if (!defaultFunnel?.id) return [];
      const response = await fetch(`/api/funnel-stages?funnelId=${defaultFunnel.id}`);
      if (!response.ok) throw new Error('Failed to fetch funnel stages');
      return response.json();
    },
    enabled: !!defaultFunnel?.id,
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Barra do topo com nome e data */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-semibold" style={{ color: '#15616D' }}>Bom dia, Walter!</h2>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </div>
      </div>
      
      {/* Grid principal de painéis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Tarefas Agendadas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold" style={{ color: '#001524' }}>Tarefas Agendadas</h3>
            <button className="text-sm font-medium" style={{ color: '#15616D' }}>
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="inline-block mr-1"><path d="M12 5v14M5 12h14"/></svg>
              Nova Tarefa
            </button>
          </div>
          
          {tasksLoading ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Carregando tarefas...</p>
            </div>
          ) : !Array.isArray(tasks) || tasks.length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Nenhuma tarefa agendada.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {tasks.map((task) => (
                <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800">{task.title}</div>
                      <div className="text-sm text-gray-500 mt-1">{task.description}</div>
                    </div>
                    <div className={`text-xs font-medium rounded-full px-2.5 py-1 inline-flex items-center justify-center
                      ${task.status === 'pending' ? 'bg-yellow-50 text-yellow-700' : 
                        task.status === 'completed' ? 'bg-green-50 text-green-700' : 
                        task.status === 'cancelled' ? 'bg-red-50 text-red-700' : 
                        task.status === 'confirmed' ? 'bg-blue-50 text-blue-700' :
                        'bg-gray-50 text-gray-700'}`}
                    >
                      {task.status === 'pending' ? 'Pendente' : 
                       task.status === 'completed' ? 'Concluída' :
                       task.status === 'cancelled' ? 'Cancelada' :
                       task.status === 'confirmed' ? 'Confirmada' :
                       task.status}
                    </div>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-xs text-gray-500">
                      <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>
                      {new Date(task.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <div className="flex space-x-2">
                      <span className="text-xs px-2 py-1 rounded bg-blue-50 text-blue-700 capitalize">
                        {task.type === 'call' ? 'Ligação' :
                         task.type === 'visit' ? 'Visita' :
                         task.type === 'whatsapp' ? 'WhatsApp' :
                         task.type === 'meeting' ? 'Reunião' :
                         task.type}
                      </span>
                      {task.leadId && (
                        <span className="text-xs px-2 py-1 rounded bg-purple-50 text-purple-700">
                          Lead
                        </span>
                      )}
                      {task.propertyId && (
                        <span className="text-xs px-2 py-1 rounded bg-green-50 text-green-700">
                          Imóvel
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Painel de Funil de Vendas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-2" style={{ color: '#001524' }}>Funil de Vendas</h3>
          
          <div className="mt-2 mb-4">
            <div className="flex justify-between">
              <div className="text-sm text-gray-600">Valor total do funil</div>
              <div className="text-sm text-teal-600">Negócios ativos</div>
            </div>
            <div className="flex justify-between">
              <div className="text-xl font-bold text-gray-800">R$ 6.423.010,00</div>
              <div className="text-xl font-bold text-gray-800">433</div>
            </div>
          </div>
          
          {/* Funil de Leads - Usando os estágios configurados */}
          <div className="mt-6 mb-8">
            {stagesLoading ? (
              <div className="py-6 text-center">
                <p className="text-gray-500">Carregando estágios do funil...</p>
              </div>
            ) : (
              <>
                {Array.isArray(funnelStages) && funnelStages.length > 0 ? (
                  funnelStages
                    .sort((a, b) => a.position - b.position)
                    .map((stage, index, allStages) => {
                      // Determine a largura do elemento baseado na posição
                      const maxWidth = 100;
                      const minWidth = 55;
                      const width = maxWidth - (index * ((maxWidth - minWidth) / (allStages.length - 1 || 1)));
                      
                      // Calcula a porcentagem de leads neste estágio
                      const stageLeads = Array.isArray(leads) ? leads.filter(lead => lead.stageId === stage.id).length : 0;
                      const totalLeads = Array.isArray(leads) ? leads.length : 1;
                      const percentage = Math.round((stageLeads / totalLeads) * 100);
                      
                      // Define cores para os diferentes estágios usando a nova paleta
                      const stageColors = [
                        '#15616D', // Ciano
                        '#001524', // Azul escuro
                        '#FF7D00', // Laranja
                        '#78290F'  // Marrom avermelhado
                      ];
                      
                      const color = stageColors[index % stageColors.length];
                      
                      return (
                        <div
                          key={stage.id}
                          className="relative cursor-pointer mb-3"
                          style={{ width: `${width}%` }}
                          onClick={() => window.location.href = '/crm'}
                        >
                          <div
                            className="h-14 w-full rounded-sm flex items-center pl-4 pr-16"
                            style={{ backgroundColor: color }}
                          >
                            <div className="flex flex-col text-white">
                              <div className="text-xs uppercase">{stage.name}</div>
                              <div className="font-bold">{percentage}%</div>
                            </div>
                          </div>
                          <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold">
                            {stageLeads}
                          </div>
                        </div>
                      );
                    })
                ) : (
                  <div className="py-6 text-center">
                    <p className="text-gray-500">Nenhum estágio do funil encontrado.</p>
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Raio-X */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold mb-3" style={{ color: '#001524' }}>Raio-X</h4>
            <div className="flex text-sm mb-4">
              <div className="flex-1 text-center py-1 border-b-2 font-medium" style={{ borderColor: '#15616D', color: '#15616D' }}>MÊS</div>
              <div className="flex-1 text-center py-1 text-gray-500">ANO</div>
              <div className="flex-1 text-center py-1 text-gray-500">GERAL</div>
            </div>
            
            {/* Informações do sistema */}
            <div className="mt-4 flex items-center">
              <div className="flex-1">
                <div className="text-5xl font-bold" style={{ color: '#15616D' }}>23</div>
                <div className="flex items-center mt-2">
                  <div className="text-white text-xs px-1 rounded flex items-center mr-2" style={{ backgroundColor: '#FF7D00' }}>
                    <i className="fas fa-arrow-up mr-1"></i>3
                  </div>
                  <div className="text-gray-500 text-xs">10 esperados</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        
        {/* Painel de Faturamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold mb-4" style={{ color: '#001524' }}>Faturamento</h3>
          
          {/* Gráfico de linhas */}
          <div className="h-[240px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={lineData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="month" axisLine={false} tickLine={false} />
                <YAxis axisLine={false} tickLine={false} />
                <Tooltip />
                <Line 
                  type="monotone" 
                  dataKey="valor1" 
                  stroke="#15616D" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor2" 
                  stroke="#FF7D00" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          {/* Valores */}
          <div className="grid grid-cols-2 gap-4 mt-8">
            <div>
              <h4 className="text-sm" style={{ color: '#15616D' }}>Venda</h4>
              <div className="font-bold text-xl text-gray-800">R$ 1.763.900,00</div>
              <div className="text-xs text-gray-600 mt-1">Total faturado</div>
              <div className="font-medium text-sm mt-1">R$ 1.792.800,00</div>
            </div>
            <div>
              <h4 className="text-sm" style={{ color: '#FF7D00' }}>Locação</h4>
              <div className="font-bold text-xl text-gray-800">R$ 28.900,00</div>
              <div className="text-xs text-gray-600 mt-1">Previsão</div>
              <div className="font-medium text-sm mt-1">R$ 2.100.000,00</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
