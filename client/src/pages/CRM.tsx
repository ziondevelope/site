import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import SimplifiedKanbanBoard from "@/components/crm/SimplifiedKanbanBoard";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
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
    mutationFn: async (data: LeadFormValues) => {
      return apiRequest('POST', '/api/leads', data);
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
      <div className="bg-white p-6 rounded-t-lg border-b">
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
        <div className="bg-white p-6">
          <SimplifiedKanbanBoard 
            newLeads={newLeads || []}
            contactedLeads={contactedLeads || []}
            visitLeads={visitLeads || []}
            proposalLeads={proposalLeads || []}
          />
        </div>
      )}
    </div>
  );
}
