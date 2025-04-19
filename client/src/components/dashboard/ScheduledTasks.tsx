import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface Agent {
  id: number;
  name: string;
  avatar?: string;
}

interface Task {
  id: number;
  title: string;
  description: string;
  date: string;
  status: "pending" | "completed" | "cancelled" | "confirmed";
  client: string;
  agent: Agent;
  propertyId?: number;
  propertyType?: string;
  propertyName?: string;
}

interface ScheduledTasksProps {
  isLoading: boolean;
  tasks?: Task[];
}

export default function ScheduledTasks({ isLoading, tasks }: ScheduledTasksProps) {
  const getStatusBadgeClass = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "completed":
        return "bg-blue-100 text-blue-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case "confirmed":
        return "Confirmada";
      case "pending":
        return "Pendente";
      case "completed":
        return "Concluída";
      case "cancelled":
        return "Cancelada";
      default:
        return status;
    }
  };

  const formatTaskDate = (dateString: string) => {
    const date = new Date(dateString);
    const today = new Date();
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    if (date.toDateString() === today.toDateString()) {
      return `Hoje, ${format(date, "HH:mm")}`;
    } else if (date.toDateString() === tomorrow.toDateString()) {
      return `Amanhã, ${format(date, "HH:mm")}`;
    } else {
      return format(date, "dd/MM, HH:mm");
    }
  };

  return (
    <div style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="overflow-x-auto">
        <div className="flex justify-between items-center mb-4">
          <Button variant="ghost" className="text-primary hover:text-blue-700">
            <i className="ri-add-line mr-1"></i> Nova Tarefa
          </Button>
        </div>
        
        <div className="overflow-x-auto">
          {isLoading ? (
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="w-full">
                  <Skeleton className="h-12 w-full" />
                </div>
              ))}
            </div>
          ) : tasks && tasks.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tarefa</TableHead>
                  <TableHead>Corretor</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tasks.map((task) => (
                  <TableRow key={task.id}>
                    <TableCell>
                      <div className="text-sm font-medium">{task.title}</div>
                      <div className="text-xs text-gray-500">
                        {task.propertyType && task.propertyName && (
                          `${task.propertyType} - ${task.propertyName}`
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center">
                        {task.agent ? (
                          <>
                            {task.agent.avatar ? (
                              <img 
                                src={task.agent.avatar} 
                                alt={task.agent.name} 
                                className="h-6 w-6 rounded-full mr-2 object-cover" 
                              />
                            ) : (
                              <div className="h-6 w-6 rounded-full bg-primary flex items-center justify-center text-white text-xs mr-2">
                                {task.agent.name.charAt(0)}
                              </div>
                            )}
                            <div className="text-sm">{task.agent.name}</div>
                          </>
                        ) : (
                          <div className="text-sm">Não atribuído</div>
                        )}
                      </div>
                    </TableCell>
                    <TableCell className="text-sm">{task.client}</TableCell>
                    <TableCell className="text-sm">{formatTaskDate(task.date)}</TableCell>
                    <TableCell>
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(task.status)}`}>
                        {getStatusText(task.status)}
                      </span>
                    </TableCell>
                    <TableCell className="text-right text-sm font-medium">
                      <Button variant="ghost" size="sm" className="text-primary hover:text-blue-700">
                        Editar
                      </Button>
                      <Button variant="ghost" size="sm" className="text-gray-500 hover:text-gray-700">
                        Cancelar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="py-6 text-center">
              <p className="text-gray-500">Nenhuma tarefa agendada.</p>
              <Button className="mt-4">
                <i className="ri-add-line mr-1"></i> Nova Tarefa
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
