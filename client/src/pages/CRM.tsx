import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { InsertLead, Lead, insertLeadSchema } from "@shared/schema";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

const leadFormSchema = insertLeadSchema.extend({
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  phone: z.string().optional().nullable(),
  email: z.string().email("Email inválido").optional().nullable(),
});

type LeadFormValues = z.infer<typeof leadFormSchema>;

export default function CRM() {
  const [isAddLeadOpen, setIsAddLeadOpen] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  // Fetch leads with different status
  const { data: newLeads, isLoading: newLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'new'],
  });
  
  const { data: contactedLeads, isLoading: contactedLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'contacted'],
  });
  
  const { data: visitLeads, isLoading: visitLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'visit'],
  });
  
  const { data: proposalLeads, isLoading: proposalLeadsLoading } = useQuery<Lead[]>({
    queryKey: ['/api/leads', 'proposal'],
  });
  
  const isLoading = newLeadsLoading || contactedLeadsLoading || visitLeadsLoading || proposalLeadsLoading;

  const form = useForm<LeadFormValues>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      message: "",
      source: "manual",
      interestType: undefined,
      budget: undefined,
      notes: "",
      status: "new",
    },
  });

  const createLeadMutation = useMutation({
    mutationFn: (data: LeadFormValues) => {
      return apiRequest('/api/leads', {
        method: 'POST',
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      // Invalidate leads queries to update the UI
      queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
      toast({
        title: "Lead criado com sucesso",
        description: "O lead foi adicionado ao CRM.",
      });
      setIsAddLeadOpen(false);
      form.reset();
    },
    onError: (error) => {
      console.error("Erro ao criar lead:", error);
      toast({
        title: "Erro ao criar lead",
        description: "Não foi possível adicionar o lead. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: LeadFormValues) {
    console.log("Submetendo dados do lead:", data);
    createLeadMutation.mutate(data);
  }
  
  return (
    <div className="space-y-2">
      <div className="bg-white p-6">
        <div className="flex justify-between items-center mb-6">
          <div>
            <p className="text-sm text-gray-500 mb-1">Cadastre aqui leads, clientes potenciais, ou pessoas interessadas no seu produto/serviço. No CRM você poderá gerenciar seus leads de forma eficiente.</p>
          </div>
          <div className="flex space-x-2">
            <Button variant="outline" className="border border-gray-300">
              <i className="ri-filter-line mr-1"></i> Filtros
            </Button>
            <Dialog open={isAddLeadOpen} onOpenChange={setIsAddLeadOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <i className="ri-add-line mr-1"></i> Novo Lead
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle>Adicionar Novo Lead</DialogTitle>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome*</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do lead" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="email"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Email</FormLabel>
                            <FormControl>
                              <Input placeholder="email@exemplo.com" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="phone"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Telefone</FormLabel>
                            <FormControl>
                              <Input placeholder="(00) 00000-0000" {...field} value={field.value || ""} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="source"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Origem</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a origem" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="manual">Manual</SelectItem>
                                <SelectItem value="website">Website</SelectItem>
                                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                                <SelectItem value="instagram">Instagram</SelectItem>
                                <SelectItem value="facebook">Facebook</SelectItem>
                                <SelectItem value="indicacao">Indicação</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="interestType"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de Interesse</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="purchase">Compra</SelectItem>
                                <SelectItem value="rent">Aluguel</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <FormField
                      control={form.control}
                      name="budget"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Orçamento (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Informe o orçamento" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : undefined)}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="message"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Mensagem</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Mensagem do lead" 
                              className="resize-none" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="notes"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Observações</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Observações internas" 
                              className="resize-none" 
                              {...field}
                              value={field.value || ""}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button
                        variant="outline"
                        type="button"
                        onClick={() => setIsAddLeadOpen(false)}
                      >
                        Cancelar
                      </Button>
                      <Button 
                        type="submit"
                        disabled={createLeadMutation.isPending}
                        className="bg-indigo-600 hover:bg-indigo-700"
                      >
                        {createLeadMutation.isPending ? (
                          <>
                            <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                            Salvando...
                          </>
                        ) : (
                          'Salvar Lead'
                        )}
                      </Button>
                    </div>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-5 gap-4 mb-2">
          <div className="col-span-2">
            <div className="flex items-center">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">Nome</span>
              </div>
              <div className="relative rounded-md shadow-sm">
                <input 
                  type="text" 
                  placeholder="Filtrar por nome"
                  className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">E-mail</span>
              </div>
              <div className="relative rounded-md shadow-sm">
                <input 
                  type="text" 
                  placeholder="Filtrar por e-mail"
                  className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm"
                />
              </div>
            </div>
          </div>
          <div>
            <div className="flex items-center justify-between">
              <div className="mr-2">
                <span className="text-sm font-medium text-gray-700">Situação</span>
              </div>
              <div className="relative flex-1">
                <select className="border border-gray-300 rounded-md w-full py-1.5 px-3 text-sm appearance-none bg-white">
                  <option>Situação</option>
                  <option value="new">Novo</option>
                  <option value="contacted">Contatado</option>
                  <option value="visit">Visita</option>
                  <option value="proposal">Proposta</option>
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-gray-700">
                  <i className="ri-arrow-down-s-line"></i>
                </div>
              </div>
            </div>
          </div>
          <div className="text-right">
            <Button className="h-9 bg-indigo-600 hover:bg-indigo-700">
              <i className="ri-search-line mr-1"></i> Buscar
            </Button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-96 bg-white">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        </div>
      ) : (
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-100">
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[300px]">Nome / Contato</TableHead>
                  <TableHead>Interesse</TableHead>
                  <TableHead>Origem</TableHead>
                  <TableHead>Orçamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {[
                  ...(newLeads || []), 
                  ...(contactedLeads || []), 
                  ...(visitLeads || []), 
                  ...(proposalLeads || [])
                ]
                .sort((a, b) => {
                  // Ordenar por data (do mais recente para o mais antigo)
                  const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0;
                  const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0;
                  return dateB - dateA;
                })
                .map((lead) => (
                  <TableRow key={lead.id}>
                    <TableCell>
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 text-gray-600">
                          <i className="fas fa-user-alt"></i>
                        </div>
                        <div>
                          <div className="font-medium">{lead.name}</div>
                          <div className="text-xs text-gray-500 mt-0.5">
                            {lead.email || lead.phone || 'Sem contato'}
                          </div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {lead.interestType === 'purchase' ? 'Compra' :
                        lead.interestType === 'rent' ? 'Aluguel' :
                        lead.interestType || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {lead.source === 'manual' ? 'Manual' :
                        lead.source === 'website' ? 'Website' :
                        lead.source === 'whatsapp' ? 'WhatsApp' :
                        lead.source === 'instagram' ? 'Instagram' :
                        lead.source === 'facebook' ? 'Facebook' :
                        lead.source === 'indicacao' ? 'Indicação' :
                        lead.source || 'Não informado'}
                      </span>
                    </TableCell>
                    <TableCell className="font-medium">
                      {lead.budget ? lead.budget.toLocaleString('pt-BR', {
                        style: 'currency',
                        currency: 'BRL',
                        minimumFractionDigits: 0,
                        maximumFractionDigits: 0,
                      }) : 'Não informado'}
                    </TableCell>
                    <TableCell>
                      <div className={`text-xs font-medium rounded-full px-2.5 py-1 inline-flex items-center justify-center w-24
                        ${lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 
                          lead.status === 'contacted' ? 'bg-yellow-50 text-yellow-700' : 
                          lead.status === 'visit' ? 'bg-green-50 text-green-700' : 
                          lead.status === 'proposal' ? 'bg-purple-50 text-purple-700' : 
                          'bg-gray-50 text-gray-700'}`}
                      >
                        {lead.status === 'new' ? 'Novo' : 
                        lead.status === 'contacted' ? 'Contatado' :
                        lead.status === 'visit' ? 'Visita' :
                        lead.status === 'proposal' ? 'Proposta' :
                        lead.status}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm" className="mr-2">
                            <i className="fas fa-eye mr-1 text-xs"></i> Detalhes
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[550px]">
                          <DialogHeader>
                            <DialogTitle className="flex items-center gap-2">
                              Detalhes do Lead
                              <div className={`text-xs font-medium rounded-full px-2.5 py-0.5 inline-flex items-center ml-2
                                ${lead.status === 'new' ? 'bg-blue-50 text-blue-700' : 
                                  lead.status === 'contacted' ? 'bg-yellow-50 text-yellow-700' : 
                                  lead.status === 'visit' ? 'bg-green-50 text-green-700' : 
                                  lead.status === 'proposal' ? 'bg-purple-50 text-purple-700' : 
                                  'bg-gray-50 text-gray-700'}`}
                              >
                                {lead.status === 'new' ? 'Novo' : 
                                lead.status === 'contacted' ? 'Contatado' :
                                lead.status === 'visit' ? 'Visita' :
                                lead.status === 'proposal' ? 'Proposta' :
                                lead.status}
                              </div>
                            </DialogTitle>
                          </DialogHeader>
                          
                          <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Nome</h4>
                                <p className="text-gray-900">{lead.name}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Status</h4>
                                <Select 
                                  value={lead.status}
                                  onValueChange={(value) => {
                                    // Implementar alteração de status
                                  }}
                                >
                                  <SelectTrigger className="h-9">
                                    <SelectValue placeholder="Selecione o status" />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="new">Novo</SelectItem>
                                    <SelectItem value="contacted">Contatado</SelectItem>
                                    <SelectItem value="visit">Visita</SelectItem>
                                    <SelectItem value="proposal">Proposta</SelectItem>
                                  </SelectContent>
                                </Select>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Email</h4>
                                <p className="text-gray-900">{lead.email || "Não informado"}</p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Telefone</h4>
                                <p className="text-gray-900">{lead.phone || "Não informado"}</p>
                              </div>
                            </div>
                            
                            <div className="grid grid-cols-2 gap-4">
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Tipo de Interesse</h4>
                                <p className="text-gray-900">
                                  {lead.interestType === 'purchase' ? 'Compra' :
                                  lead.interestType === 'rent' ? 'Aluguel' :
                                  lead.interestType || 'Não informado'}
                                </p>
                              </div>
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Orçamento</h4>
                                <p className="text-gray-900">
                                  {lead.budget ? lead.budget.toLocaleString('pt-BR', {
                                    style: 'currency',
                                    currency: 'BRL',
                                    minimumFractionDigits: 0,
                                    maximumFractionDigits: 0,
                                  }) : 'Não informado'}
                                </p>
                              </div>
                            </div>
                            
                            <div>
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Origem</h4>
                              <p className="text-gray-900">
                                {lead.source === 'manual' ? 'Manual' :
                                lead.source === 'website' ? 'Website' :
                                lead.source === 'whatsapp' ? 'WhatsApp' :
                                lead.source === 'instagram' ? 'Instagram' :
                                lead.source === 'facebook' ? 'Facebook' :
                                lead.source === 'indicacao' ? 'Indicação' :
                                lead.source || 'Não informado'}
                              </p>
                            </div>
                            
                            {lead.message && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Mensagem</h4>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                                  {lead.message}
                                </div>
                              </div>
                            )}
                            
                            {lead.notes && (
                              <div>
                                <h4 className="text-sm font-medium text-gray-700 mb-1">Observações</h4>
                                <div className="bg-gray-50 p-3 rounded border border-gray-200 text-gray-700">
                                  {lead.notes}
                                </div>
                              </div>
                            )}
                            
                            <div className="mt-2">
                              <h4 className="text-sm font-medium text-gray-700 mb-1">Data de Criação</h4>
                              <p className="text-gray-900">
                                {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                              </p>
                            </div>
                          </div>
                        </DialogContent>
                      </Dialog>
                      
                      <Select 
                        value={lead.status}
                        onValueChange={(value) => {
                          // Implementar alteração de status
                        }}
                      >
                        <SelectTrigger className="w-[140px] h-9 inline-flex">
                          <SelectValue placeholder="Atualizar status" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="new">Novo</SelectItem>
                          <SelectItem value="contacted">Contatado</SelectItem>
                          <SelectItem value="visit">Visita</SelectItem>
                          <SelectItem value="proposal">Proposta</SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  );
}
