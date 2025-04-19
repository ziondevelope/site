import { useQuery } from "@tanstack/react-query";
import StatsRow from "@/components/dashboard/StatsRow";
import SalesFunnel from "@/components/dashboard/SalesFunnel";
import RecentContacts from "@/components/dashboard/RecentContacts";
import ScheduledTasks from "@/components/dashboard/ScheduledTasks";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from 'recharts';
import { PieChart, Pie, Cell, Legend } from 'recharts';

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

  // Fetch recent contacts
  const { data: recentContacts, isLoading: contactsLoading } = useQuery({
    queryKey: ['/api/contacts/recent'],
  });

  // Fetch scheduled tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/scheduled'],
  });

  return (
    <div className="space-y-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      {/* Barra do topo com nome e data */}
      <div className="flex justify-between items-center bg-white p-5 rounded-lg shadow-sm">
        <div>
          <h2 className="text-xl font-semibold text-[#357deb]">Bom dia, Walter!</h2>
          <p className="text-sm text-gray-600">{formattedDate}</p>
        </div>
      </div>
      
      {/* Grid principal de painéis */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Painel de Imóveis com gráfico de pizza */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Imóveis</h3>
          <div className="flex items-center mb-4">
            <div className="text-4xl font-bold text-gray-800">350</div>
            <div className="ml-2 text-sm text-gray-600">Disponível</div>
          </div>
          
          {/* Gráfico de pizza */}
          <div className="h-[200px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={0}
                  dataKey="value"
                  label={false}
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          {/* Legendas */}
          <div className="mt-2 space-y-2">
            <div className="flex items-center">
              <div className="w-full bg-[#FF5C75] rounded-sm px-2 py-1 text-white flex justify-between">
                <span>Venda</span>
                <span>30% (412)</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-[#FFA757] rounded-sm px-2 py-1 text-white flex justify-between">
                <span>Locação</span>
                <span>30% (412)</span>
              </div>
            </div>
            <div className="flex items-center">
              <div className="w-full bg-[#18D0C6] rounded-sm px-2 py-1 text-white flex justify-between">
                <span>Temporada</span>
                <span>13% (98)</span>
              </div>
            </div>
          </div>
          
          {/* Lista de status */}
          <div className="mt-4 space-y-2">
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-sm">11</span>
              <span className="text-sm text-gray-700">Aguardando aprovação</span>
              <span className="text-gray-400">
                <i className="fas fa-chevron-right"></i>
              </span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-sm">290</span>
              <span className="text-sm text-gray-700">Atualizados</span>
              <span className="text-gray-400">
                <i className="fas fa-chevron-right"></i>
              </span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-sm">123</span>
              <span className="text-sm text-gray-700">Vencendo</span>
              <span className="text-gray-400">
                <i className="fas fa-chevron-right"></i>
              </span>
            </div>
            <div className="flex justify-between items-center p-2 border-b border-gray-100">
              <span className="text-sm">8</span>
              <span className="text-sm text-gray-700">Desatualizados</span>
              <span className="text-gray-400">
                <i className="fas fa-chevron-right"></i>
              </span>
            </div>
          </div>
        </div>
        
        {/* Painel de Funil de Vendas */}
        <div className="bg-white p-6 rounded-lg shadow-sm">
          <h3 className="text-lg font-semibold text-gray-800 mb-2">Funil de Vendas</h3>
          
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
          
          {/* Funil visual */}
          <div className="mt-6 mb-8">
            {/* Estágio 1 */}
            <div className="relative w-full mb-3">
              <div className="bg-[#FED659] h-14 w-full rounded-sm flex items-center pl-4 pr-16">
                <div className="flex flex-col text-white">
                  <div className="text-xs uppercase">INTERESSADOS</div>
                  <div className="font-bold">43%</div>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold">
                (238)
              </div>
            </div>
            
            {/* Estágio 2 */}
            <div className="relative w-[85%] mb-3">
              <div className="bg-[#FEE659] h-14 w-full rounded-sm flex items-center pl-4 pr-16">
                <div className="flex flex-col text-white">
                  <div className="text-xs uppercase">VISITAS</div>
                  <div className="font-bold">29%</div>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold">
                (144)
              </div>
            </div>
            
            {/* Estágio 3 */}
            <div className="relative w-[70%] mb-3">
              <div className="bg-[#39ADDC] h-14 w-full rounded-sm flex items-center pl-4 pr-16">
                <div className="flex flex-col text-white">
                  <div className="text-xs uppercase">PROPOSTAS</div>
                  <div className="font-bold">17%</div>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold">
                (39)
              </div>
            </div>
            
            {/* Estágio 4 */}
            <div className="relative w-[55%] mb-3">
              <div className="bg-[#FF3A7C] h-14 w-full rounded-sm flex items-center pl-4 pr-16">
                <div className="flex flex-col text-white">
                  <div className="text-xs uppercase">CONTRATO ASSINADO</div>
                  <div className="font-bold">8%</div>
                </div>
              </div>
              <div className="absolute right-4 top-1/2 transform -translate-y-1/2 text-white font-bold">
                (12)
              </div>
            </div>
          </div>
          
          {/* Raio-X */}
          <div className="mt-8">
            <h4 className="text-lg font-semibold text-gray-800 mb-3">Raio-X</h4>
            <div className="flex text-sm mb-4">
              <div className="flex-1 text-center py-1 border-b-2 border-blue-500 font-medium text-blue-500">MÊS</div>
              <div className="flex-1 text-center py-1 text-gray-500">ANO</div>
              <div className="flex-1 text-center py-1 text-gray-500">GERAL</div>
            </div>
            
            {/* Informações do sistema */}
            <div className="mt-4 flex items-center">
              <div className="flex-1">
                <div className="text-5xl font-bold text-purple-600">23</div>
                <div className="flex items-center mt-2">
                  <div className="bg-green-500 text-white text-xs px-1 rounded flex items-center mr-2">
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
          <h3 className="text-lg font-semibold text-gray-800 mb-4">Faturamento</h3>
          
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
