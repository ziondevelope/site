import { useQuery } from "@tanstack/react-query";
import StatsRow from "@/components/dashboard/StatsRow";
import SalesFunnel from "@/components/dashboard/SalesFunnel";
import RecentContacts from "@/components/dashboard/RecentContacts";
import ScheduledTasks from "@/components/dashboard/ScheduledTasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';
import { Home, Store } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

// Dados de exemplo para o gráfico de torta
const pieData = [
  { name: 'Venda', value: 412, color: '#FF5C75' },
  { name: 'Locação', value: 412, color: '#FFA757' },
  { name: 'Temporada', value: 98, color: '#18D0C6' },
];

// Dados de exemplo para o gráfico de linha
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

  // Fetch all properties for property counters
  const { data: allProperties, isLoading: propertiesLoading } = useQuery<any[]>({
    queryKey: ['/api/properties'],
    queryFn: () => apiRequest('/api/properties')
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Componente de contagem de imóveis */}
      <div className="bg-white p-6 rounded-lg shadow-sm mb-4" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-medium text-gray-700">Total de Imóveis Cadastrados</h3>
        </div>
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="bg-blue-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Imóveis para Venda</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {propertiesLoading ? (
                    <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                  ) : (
                    allProperties?.filter(prop => prop.purpose === 'sale').length || 0
                  )}
                </h3>
              </div>
              <div className="bg-blue-100 p-2 rounded-lg">
                <Home className="h-6 w-6 text-blue-500" />
              </div>
            </div>
          </div>
          
          <div className="bg-green-50 p-4 rounded-lg">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-sm text-gray-500">Imóveis para Locação</p>
                <h3 className="text-2xl font-semibold mt-1">
                  {propertiesLoading ? (
                    <div className="animate-pulse h-8 w-12 bg-gray-200 rounded"></div>
                  ) : (
                    allProperties?.filter(prop => prop.purpose === 'rent').length || 0
                  )}
                </h3>
              </div>
              <div className="bg-green-100 p-2 rounded-lg">
                <Store className="h-6 w-6 text-green-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Grid principal de painéis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Atividades */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z" stroke="rgb(21, 97, 109)" strokeWidth="1.5"/>
              <path d="M8 12L10.5 14.5L16 9" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Atividades</h3>
          </div>
          
          {tasksLoading ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Carregando atividades...</p>
            </div>
          ) : !Array.isArray(tasks) || tasks.filter(task => task.status === 'pending').length === 0 ? (
            <div className="py-6 text-center">
              <p className="text-gray-500">Nenhuma atividade pendente.</p>
            </div>
          ) : (
            <div className="space-y-3 overflow-y-auto max-h-[350px] pr-1">
              {tasks
                .filter(task => task.status === 'pending')
                .filter(task => {
                  const today = new Date();
                  const taskDate = new Date(task.date);
                  const diffTime = taskDate.getTime() - today.getTime();
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  return diffDays <= 2 && diffDays >= -1; // Mostrar tarefas com vencimento em 2 dias ou que venceram ontem
                })
                .map((task) => (
                <div key={task.id} className="p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <div className="flex justify-between items-start">
                    <div>
                      <div className="font-medium text-gray-800" style={{ fontSize: '14px' }}>
                        {task.type === 'call' || task.type === 'ligacao' ? 'Ligação' :
                         task.type === 'visit' || task.type === 'visita' ? 'Visita' :
                         task.type === 'whatsapp' ? 'WhatsApp' :
                         task.type === 'meeting' || task.type === 'reuniao' ? 'Reunião' :
                         task.type === 'email' ? 'E-mail' :
                         task.type}
                      </div>
                      <div className="text-xs text-gray-500 mt-1">{task.description}</div>
                    </div>

                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-[10px] text-gray-500">
                      {(() => {
                        // Calcula a diferença entre a data atual e a data da tarefa em dias
                        const today = new Date();
                        const taskDate = new Date(task.date);
                        const diffTime = taskDate.getTime() - today.getTime();
                        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                        
                        // Exibe uma bolinha vermelha se faltar menos de 2 dias
                        if (diffDays <= 2 && diffDays >= 0) {
                          return <div className="w-2 h-2" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#EF4444', borderRadius: '50%', marginRight: '0.25rem' }}></div>;
                        } 
                        // Exibe uma bolinha amarela se faltar entre 3 e 4 dias
                        else if (diffDays > 2 && diffDays <= 4) {
                          return <div className="w-2 h-2" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#F59E0B', borderRadius: '50%', marginRight: '0.25rem' }}></div>;
                        }
                        // Exibe uma bolinha verde se faltar mais de 4 dias
                        else if (diffDays > 4) {
                          return <div className="w-2 h-2" style={{ width: '0.5rem', height: '0.5rem', backgroundColor: '#10B981', borderRadius: '50%', marginRight: '0.25rem' }}></div>;
                        }
                        // Exibe o ícone de relógio se o prazo já passou
                        else {
                          return <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><circle cx="12" cy="12" r="10"/><path d="M12 6v6l4 2"/></svg>;
                        }
                      })()}
                      {new Date(task.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </div>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        fetch(`/api/tasks/${task.id}/complete`, {
                          method: 'PATCH',
                          headers: { 'Content-Type': 'application/json' },
                          body: JSON.stringify({ 
                            status: 'completed'
                          })
                        })
                        .then(response => response.json())
                        .then(() => {
                          // Recarregar os dados após marcar como concluído
                          setTimeout(() => {
                            window.location.reload();
                          }, 300);
                        })
                        .catch(error => console.error('Erro ao atualizar tarefa:', error));
                      }}
                      className="text-xs bg-green-50 hover:bg-green-100 text-green-700 font-medium rounded-full w-7 h-7 flex items-center justify-center transition-colors"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
        
        {/* Painel de Funil de Vendas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-2">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path d="M3 4C3 3.44772 3.44772 3 4 3H20C20.5523 3 21 3.44772 21 4V6C21 6.26522 20.8946 6.51957 20.7071 6.70711L14 13.4142V18.5C14 18.7761 13.8881 19.0378 13.6913 19.2124L10.6913 21.5124C10.3998 21.7437 10.0088 21.8228 9.64018 21.7209C9.27157 21.619 9 21.2848 9 20.9V13.4142L2.29289 6.70711C2.10536 6.51957 2 6.26522 2 6V4C2 3.44772 2.44772 3 3 3" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Funil de Vendas</h3>
          </div>
          
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
                      
                      // Define cores para os diferentes estágios
                      const stageColors = [
                        '#FED659', // Amarelo
                        '#FEE659', // Amarelo claro
                        '#39ADDC', // Azul
                        '#FF3A7C'  // Rosa
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
        </div>
        
        {/* Painel de Faturamento */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <div className="flex items-center mb-4">
            <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" className="mr-2">
              <path d="M16 22C11.5817 22 8 18.4183 8 14C8 9.58172 11.5817 6 16 6C20.4183 6 24 9.58172 24 14C24 18.4183 20.4183 22 16 22Z" stroke="rgb(21, 97, 109)" strokeWidth="1.5"/>
              <path d="M8 22C3.58172 22 0 18.4183 0 14C0 9.58172 3.58172 6 8 6C12.4183 6 16 9.58172 16 14C16 18.4183 12.4183 22 8 22Z" stroke="rgb(21, 97, 109)" strokeWidth="1.5"/>
              <path d="M7 14.5V12" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M15 14.5V12" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M19 14.5V12" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round"/>
              <path d="M11 14.5V12" stroke="rgb(21, 97, 109)" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
            <h3 className="text-lg font-semibold text-gray-800">Faturamento</h3>
          </div>
          
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
                  stroke="#357DEB" 
                  strokeWidth={2}
                  dot={{ r: 4 }}
                  activeDot={{ r: 6 }}
                />
                <Line 
                  type="monotone" 
                  dataKey="valor2" 
                  stroke="#FF3A7C" 
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
              <h4 className="text-sm text-teal-500">Venda</h4>
              <div className="font-bold text-xl text-gray-800">R$ 1.763.900,00</div>
              <div className="text-xs text-gray-600 mt-1">Total faturado</div>
              <div className="font-medium text-sm mt-1">R$ 1.792.800,00</div>
            </div>
            <div>
              <h4 className="text-sm text-pink-500">Locação</h4>
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
