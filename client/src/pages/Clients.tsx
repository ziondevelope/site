import { useEffect } from "react";
import { Helmet } from "react-helmet-async";
import { useQuery } from "@tanstack/react-query";
import { useLoading } from "@/contexts/LoadingContext";
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";

export default function Clients() {
  const { setIsLoading: setLoading } = useLoading();
  
  // Busca os clientes do sistema
  const { data: clients = [], isLoading: isLoadingClients, error: clientsError } = useQuery({
    queryKey: ["/api/leads"],
    retry: 1,
  });
  
  // Atualiza o estado de carregamento baseado na consulta
  useEffect(() => {
    setLoading(isLoadingClients);
    return () => setLoading(false);
  }, [isLoadingClients, setLoading]);

  return (
    <div className="py-6 px-6 space-y-6">
      <Helmet>
        <title>Gestão de Clientes | Zimob</title>
      </Helmet>

      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Gestão de Clientes</h1>
          <p className="text-muted-foreground mt-1">Gerenciamento de clientes, prospecção e atendimento</p>
        </div>
      </div>

      <Tabs defaultValue="todos" className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="todos">Todos os Clientes</TabsTrigger>
          <TabsTrigger value="ativos">Clientes Ativos</TabsTrigger>
          <TabsTrigger value="prospeccao">Em Prospecção</TabsTrigger>
          <TabsTrigger value="inativos">Inativos</TabsTrigger>
        </TabsList>

        <TabsContent value="todos" className="space-y-4">
          {clientsError ? (
            <Alert variant="destructive" className="mb-4">
              <AlertTitle>Erro ao carregar clientes</AlertTitle>
              <AlertDescription>
                Não foi possível carregar a lista de clientes. Tente novamente mais tarde.
              </AlertDescription>
            </Alert>
          ) : (
            <>
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle>Lista de Clientes</CardTitle>
                  <CardDescription>
                    Total de {clients?.length || 0} clientes cadastrados no sistema
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {clients && clients.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="w-full text-sm">
                        <thead>
                          <tr className="bg-muted">
                            <th className="py-3 px-4 text-left font-medium">Nome</th>
                            <th className="py-3 px-4 text-left font-medium">Email</th>
                            <th className="py-3 px-4 text-left font-medium">Telefone</th>
                            <th className="py-3 px-4 text-left font-medium">Fonte</th>
                            <th className="py-3 px-4 text-left font-medium">Status</th>
                            <th className="py-3 px-4 text-center font-medium">Ações</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y">
                          {clients.map((client: any) => (
                            <tr key={client.id} className="hover:bg-muted/50">
                              <td className="py-3 px-4">{client.name}</td>
                              <td className="py-3 px-4">{client.email}</td>
                              <td className="py-3 px-4">{client.phone || "Não informado"}</td>
                              <td className="py-3 px-4">
                                {client.source === "whatsapp" && "WhatsApp"}
                                {client.source === "contact-form" && "Formulário de Contato"}
                                {client.source === "property-contact-form" && "Formulário de Imóvel"}
                                {!client.source && "Manual"}
                              </td>
                              <td className="py-3 px-4">
                                <span className={`px-2 py-1 rounded text-xs font-medium ${
                                  client.status === "active" 
                                    ? "bg-green-100 text-green-800" 
                                    : client.status === "lead" 
                                      ? "bg-blue-100 text-blue-800" 
                                      : "bg-gray-100 text-gray-800"
                                }`}>
                                  {client.status === "active" && "Ativo"}
                                  {client.status === "lead" && "Lead"}
                                  {client.status === "inactive" && "Inativo"}
                                  {!client.status && "Novo"}
                                </span>
                              </td>
                              <td className="py-3 px-4 text-center">
                                <div className="flex justify-center space-x-2">
                                  <button className="text-blue-600 hover:text-blue-800 transition-colors">
                                    <i className="ri-eye-line text-lg"></i>
                                  </button>
                                  <button className="text-gray-600 hover:text-gray-800 transition-colors">
                                    <i className="ri-edit-line text-lg"></i>
                                  </button>
                                </div>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-8">
                      <p className="text-muted-foreground">Nenhum cliente cadastrado</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </>
          )}
        </TabsContent>

        <TabsContent value="ativos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Ativos</CardTitle>
              <CardDescription>Clientes com negócios em andamento</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Em desenvolvimento. Esta funcionalidade estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="prospeccao" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Em Prospecção</CardTitle>
              <CardDescription>Leads e potenciais clientes</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Em desenvolvimento. Esta funcionalidade estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="inativos" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Clientes Inativos</CardTitle>
              <CardDescription>Clientes sem interação recente</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <p className="text-muted-foreground">
                  Em desenvolvimento. Esta funcionalidade estará disponível em breve.
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}