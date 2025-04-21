import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { insertPropertySchema, type Property } from "@shared/schema";
import { MultipleImageUpload } from "@/components/ui/multiple-image-upload";
import { CepInput } from "@/components/ui/cep-input";
import { PropertyFeatures } from "@/components/ui/property-features";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Label } from "@/components/ui/label";
import { 
  Loader2, 
  Home,
  Bath,
  Bed,
  Tag,
  Image,
  BadgeInfo,
  SquareFootIcon,
  Plus
} from "lucide-react";
import { cn } from "@/lib/utils";

// Tipo para corrigir o erro de tipagem do agente
type Agent = {
  id: number;
  displayName: string;
  email: string;
  role: string;
};

const propertyFormSchema = insertPropertySchema.extend({
  // Add additional validation as needed
  images: z.array(
    z.object({
      url: z.string(),
      isFeatured: z.boolean().optional().default(false)
    })
  ).optional().default([]),
  parkingSpots: z.number().min(0).default(0),
  suites: z.number().min(0).default(0),
  features: z.array(z.string()).optional().default([]),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

// Função para formatar preços em moeda
const formatCurrency = (value: number | undefined) => {
  if (value === undefined) return "";
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
};

// Função utilitária para obter a imagem de destaque do imóvel
const getFeaturedImage = (property: Property): string | undefined => {
  // Se tiver array de imagens com formato { url, isFeatured }
  if (property.images && Array.isArray(property.images) && property.images.length > 0) {
    // Procura por uma imagem marcada como destaque
    const featuredImage = property.images.find(img => 
      typeof img === 'object' && 'isFeatured' in img && img.isFeatured
    );
    
    // Se encontrou imagem de destaque, retorna sua URL
    if (featuredImage && typeof featuredImage === 'object' && 'url' in featuredImage) {
      return featuredImage.url;
    }
    
    // Caso não encontre, retorna a primeira imagem
    if (property.images[0] && typeof property.images[0] === 'object' && 'url' in property.images[0]) {
      return property.images[0].url;
    }
    
    // Caso seja um array de strings (formato antigo)
    if (typeof property.images[0] === 'string') {
      return property.images[0] as string;
    }
  }
  
  // Compatibilidade com o campo featuredImage (formato antigo)
  if (property.featuredImage) {
    return property.featuredImage;
  }
  
  // Compatibilidade com o campo imageUrl (formato mais antigo)
  if ('imageUrl' in property && property.imageUrl) {
    return property.imageUrl as string;
  }
  
  return undefined;
};

// Componente de destaque personalizado
function FeaturedCheckbox({ field }: { field: any }) {
  return (
    <FormItem className="pt-6">
      <div className={`border rounded-lg p-4 ${field.value ? 'bg-indigo-50 border-indigo-200' : 'border-gray-200'} transition-colors duration-200`}>
        <div className="flex items-center">
          <FormControl>
            <input
              type="checkbox"
              checked={field.value}
              onChange={field.onChange}
              className="h-5 w-5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
            />
          </FormControl>
          <div className="ml-3">
            <FormLabel className="text-base font-medium flex items-center">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5 text-indigo-500"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
              Destacar na página inicial
            </FormLabel>
            <div className="text-sm text-gray-500 mt-1">
              Este imóvel será exibido em destaque na página inicial do site e terá maior visibilidade.
            </div>
          </div>
        </div>
      </div>
    </FormItem>
  );
}

export default function Properties() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  
  // Search and filter states
  const [searchQuery, setSearchQuery] = useState("");
  const [typeFilter, setTypeFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [purposeFilter, setPurposeFilter] = useState("all");
  
  // Fetch properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });
  
  // Fetch agents
  const { data: allAgents } = useQuery<Agent[]>({
    queryKey: ['/api/agents'],
  });
  
  // Fetch tasks
  const { data: tasks, isLoading: tasksLoading } = useQuery({
    queryKey: ['/api/tasks/scheduled'],
  });
  
  // Filtered properties
  const filteredProperties = useMemo(() => {
    if (!properties) return [];
    
    return properties.filter(property => {
      // Text search (title or address)
      const matchesSearch = searchQuery === "" || 
        property.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        property.address?.toLowerCase().includes(searchQuery.toLowerCase());
      
      // Type filter
      const matchesType = typeFilter === "all" || property.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === "all" || property.status === statusFilter;
      
      // Purpose filter
      const matchesPurpose = purposeFilter === "all" || property.purpose === purposeFilter;
      
      return matchesSearch && matchesType && matchesStatus && matchesPurpose;
    });
  }, [properties, searchQuery, typeFilter, statusFilter, purposeFilter]);

  // Form for adding/editing property
  const form = useForm<PropertyFormValues>({
    resolver: zodResolver(propertyFormSchema),
    defaultValues: {
      title: "",
      description: "",
      type: "apartment",
      purpose: "sale",
      price: 0,
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      address: "",
      city: "",
      neighborhood: "",
      zipCode: "",
      isFeatured: false,
      status: "available",
      images: [],
      parkingSpots: 0,
      suites: 0,
      features: [],
    },
  });

  // Initialize edit form with property data
  const initEditForm = (property: Property) => {
    setSelectedProperty(property);
    
    // Converter as imagens para o formato correto se necessário
    let formattedImages: any[] = [];
    if (property.images) {
      // Se já estiver no formato { url, isFeatured }
      if (typeof property.images[0] === 'object' && 'url' in property.images[0]) {
        formattedImages = property.images as {url: string, isFeatured?: boolean}[];
      } 
      // Se for um array de strings (formato antigo)
      else if (Array.isArray(property.images)) {
        formattedImages = (property.images as string[]).map((url: string, index: number) => ({
          url,
          isFeatured: index === 0 // primeira imagem como destaque
        }));
      }
    }
    // Se tiver featuredImage e não tiver imagens, usar como imagem de destaque
    else if (property.featuredImage) {
      formattedImages = [{
        url: property.featuredImage,
        isFeatured: true
      }];
    }
    
    form.reset({
      title: property.title || "",
      description: property.description || "",
      type: property.type || "apartment",
      purpose: property.purpose || "sale",
      price: property.price || 0,
      area: property.area || 0,
      bedrooms: property.bedrooms || 0,
      bathrooms: property.bathrooms || 0,
      address: property.address || "",
      city: property.city || "",
      neighborhood: property.neighborhood || "",
      zipCode: property.zipCode || "",
      isFeatured: property.isFeatured || false,
      status: property.status || "available",
      images: formattedImages,
      parkingSpots: property.parkingSpots || 0,
      suites: property.suites || 0,
      features: property.features || [],
      agentId: property.agentId || null,
    });
    setIsEditDialogOpen(true);
  };

  // Handle adding a new property
  const handleAddClick = () => {
    // Reset form to default values
    form.reset({
      title: "",
      description: "",
      type: "apartment",
      purpose: "sale",
      price: 0,
      area: 0,
      bedrooms: 0,
      bathrooms: 0,
      address: "",
      city: "",
      neighborhood: "",
      zipCode: "",
      isFeatured: false,
      status: "available",
      images: [],
      parkingSpots: 0,
      suites: 0,
      features: [],
      agentId: null,
    });
    setIsAddDialogOpen(true);
  };

  // Handle edit button click
  const handleEditClick = (property: Property) => {
    initEditForm(property);
  };

  // Handle delete button click
  const handleDeleteClick = (property: Property) => {
    setSelectedProperty(property);
    setIsDeleteAlertOpen(true);
  };

  // Add property mutation
  const addPropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues) => {
      return apiRequest("/api/properties", {
        method: "POST",
        body: JSON.stringify(data)
      });
    },
    onSuccess: () => {
      setIsAddDialogOpen(false);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel adicionado",
        description: "O imóvel foi adicionado com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao adicionar imóvel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Update property mutation
  const updatePropertyMutation = useMutation({
    mutationFn: async (data: PropertyFormValues & { id: number }) => {
      const { id, ...propertyData } = data;
      return apiRequest(`/api/properties/${id}`, {
        method: "PATCH",
        body: JSON.stringify(propertyData)
      });
    },
    onSuccess: () => {
      setIsEditDialogOpen(false);
      setSelectedProperty(null);
      form.reset();
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel atualizado",
        description: "As informações do imóvel foram atualizadas com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao atualizar imóvel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  // Delete property mutation
  const deletePropertyMutation = useMutation({
    mutationFn: async (id: number) => {
      return apiRequest(`/api/properties/${id}`, {
        method: "DELETE"
      });
    },
    onSuccess: () => {
      setIsDeleteAlertOpen(false);
      setSelectedProperty(null);
      queryClient.invalidateQueries({ queryKey: ['/api/properties'] });
      toast({
        title: "Imóvel excluído",
        description: "O imóvel foi excluído com sucesso.",
      });
    },
    onError: (error) => {
      toast({
        title: "Erro ao excluir imóvel",
        description: error.message,
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: PropertyFormValues) {
    if (selectedProperty && isEditDialogOpen) {
      // Update existing property
      updatePropertyMutation.mutate({
        ...data,
        id: selectedProperty.id
      });
    } else {
      // Add new property
      addPropertyMutation.mutate(data);
    }
  }

  function handleDeleteConfirm() {
    if (selectedProperty) {
      deletePropertyMutation.mutate(selectedProperty.id);
    }
  }

  return (
    <div className="bg-[#F9FAFB] min-h-screen p-4">
      {/* Add Property Dialog */}
      <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-light text-gray-700">Adicionar Novo Imóvel</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Preencha os dados abaixo para cadastrar um novo imóvel
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 sticky top-0">
                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="location">Localização e Imagem</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do imóvel</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Apartamento com 3 quartos na Barra da Tijuca" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de imóvel</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartamento</SelectItem>
                                <SelectItem value="house">Casa</SelectItem>
                                <SelectItem value="commercial">Comercial</SelectItem>
                                <SelectItem value="land">Terreno</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Finalidade</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a finalidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sale">Venda</SelectItem>
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
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Ex: 450000" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                              value={field.value || 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o imóvel em detalhes" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Disponível</SelectItem>
                              <SelectItem value="sold">Vendido</SelectItem>
                              <SelectItem value="rented">Alugado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FeaturedCheckbox field={field} />
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (m²)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 120" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 3" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="suites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suítes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 2" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banheiros</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 2" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de garagem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 1" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corretor</FormLabel>
                            <Select 
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value) || null)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o corretor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Sem corretor</SelectItem>
                                {allAgents?.map(agent => (
                                  <SelectItem key={agent.id} value={agent.id.toString()}>
                                    {agent.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Características</FormLabel>
                          <FormControl>
                            <PropertyFeatures 
                              value={field.value || []} 
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <CepInput
                              value={field.value}
                              onChange={field.onChange}
                              name={field.name}
                              onBlur={field.onBlur}
                              onAddressFound={(addressData) => {
                                form.setValue("address", addressData.logradouro || "");
                                form.setValue("city", addressData.localidade || "");
                                form.setValue("neighborhood", addressData.bairro || "");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagens do imóvel</FormLabel>
                          <FormControl>
                            <MultipleImageUpload
                              value={field.value || []}
                              onChange={field.onChange}
                              maxFiles={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
                
                <div className="flex justify-end mt-6 pt-4 border-t border-gray-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsAddDialogOpen(false)}
                    className="mr-2"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={addPropertyMutation.isPending}
                    className="bg-[#12636C] hover:bg-[#12636C]/90 rounded-full px-5"
                  >
                    {addPropertyMutation.isPending ? 'Adicionando...' : 'Adicionar Imóvel'}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Edit Property Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-[600px] p-0 max-h-[90vh] overflow-hidden">
          <DialogHeader className="p-4 border-b border-gray-100 sticky top-0 bg-white z-10">
            <DialogTitle className="text-lg font-light text-gray-700">Editar Imóvel</DialogTitle>
            <DialogDescription className="text-sm text-gray-500 mt-1">
              Atualize as informações do imóvel
            </DialogDescription>
          </DialogHeader>
          <div className="overflow-y-auto max-h-[calc(90vh-130px)]">
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="p-4">
                <div className="flex justify-between items-center mb-6">
                  <Button
                    type="button"
                    variant="outline"
                    className="px-3 py-1 h-10 text-xs rounded-full bg-red-50 border-red-200 text-red-500 hover:bg-red-100"
                    onClick={() => handleDeleteClick(selectedProperty!)}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                    Excluir Imóvel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={updatePropertyMutation.isPending}
                    className="ml-auto rounded-full px-5 bg-[#12636C] hover:bg-[#12636C]/90"
                  >
                    {updatePropertyMutation.isPending ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
                
                <Tabs defaultValue="info" className="w-full">
                  <TabsList className="grid grid-cols-3 mb-4 sticky top-0">
                    <TabsTrigger value="info">Informações Básicas</TabsTrigger>
                    <TabsTrigger value="details">Detalhes</TabsTrigger>
                    <TabsTrigger value="location">Localização e Imagem</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="info" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="title"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Título do imóvel</FormLabel>
                          <FormControl>
                            <Input placeholder="Ex: Apartamento com 3 quartos na Barra da Tijuca" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo de imóvel</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o tipo" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="apartment">Apartamento</SelectItem>
                                <SelectItem value="house">Casa</SelectItem>
                                <SelectItem value="commercial">Comercial</SelectItem>
                                <SelectItem value="land">Terreno</SelectItem>
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="purpose"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Finalidade</FormLabel>
                            <Select 
                              value={field.value} 
                              onValueChange={field.onChange}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione a finalidade" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="sale">Venda</SelectItem>
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
                      name="price"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Preço (R$)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="Ex: 450000" 
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                              value={field.value || 0}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="description"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Descrição</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Descreva o imóvel em detalhes" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            value={field.value} 
                            onValueChange={field.onChange}
                          >
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Selecione o status" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              <SelectItem value="available">Disponível</SelectItem>
                              <SelectItem value="sold">Vendido</SelectItem>
                              <SelectItem value="rented">Alugado</SelectItem>
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="isFeatured"
                      render={({ field }) => (
                        <FeaturedCheckbox field={field} />
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (m²)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 120" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 3" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="suites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suítes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 2" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="bathrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Banheiros</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 2" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de garagem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="Ex: 1" 
                                {...field}
                                onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                                value={field.value || 0}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="agentId"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Corretor</FormLabel>
                            <Select 
                              value={field.value?.toString() || ""}
                              onValueChange={(value) => field.onChange(Number(value) || null)}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione o corretor" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                <SelectItem value="none">Sem corretor</SelectItem>
                                {allAgents?.map(agent => (
                                  <SelectItem key={agent.id} value={agent.id.toString()}>
                                    {agent.displayName}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Características</FormLabel>
                          <FormControl>
                            <PropertyFeatures 
                              value={field.value || []} 
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>CEP</FormLabel>
                          <FormControl>
                            <CepInput
                              value={field.value}
                              onChange={field.onChange}
                              name={field.name}
                              onBlur={field.onBlur}
                              onAddressFound={(addressData) => {
                                form.setValue("address", addressData.logradouro || "");
                                form.setValue("city", addressData.localidade || "");
                                form.setValue("neighborhood", addressData.bairro || "");
                              }}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua, número" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Bairro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="Cidade" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagens do imóvel</FormLabel>
                          <FormControl>
                            <MultipleImageUpload
                              value={field.value || []}
                              onChange={field.onChange}
                              maxFiles={10}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </TabsContent>
                </Tabs>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Excluir Imóvel</AlertDialogTitle>
            <AlertDialogDescription>
              Você tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel 
              onClick={() => setIsDeleteAlertOpen(false)}
              className="rounded-full px-5"
            >
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600 rounded-full px-5"
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Excluindo..." : "Excluir Imóvel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Property Management */}
      <div className="bg-white p-6 rounded-lg shadow-sm" style={{ fontFamily: 'Montserrat, sans-serif' }}>
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-lg font-semibold text-gray-800 mb-1">Gerenciamento de Imóveis</h2>
            <p className="text-sm text-gray-500">Cadastre aqui todos os imóveis disponíveis em sua imobiliária.</p>
          </div>
          <div className="flex space-x-2">
            <Button 
              onClick={handleAddClick}
              className="bg-[#12636C] hover:bg-[#12636C]/90 rounded-full px-5">
              <i className="fas fa-plus mr-2"></i> Novo Imóvel
            </Button>
          </div>
        </div>
        
        <div className="p-4 bg-[#F9FAFB] rounded-lg mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="typeFilter" className="text-sm font-medium text-gray-700 mb-1 block">Tipo de Imóvel</Label>
              <Select
                value={typeFilter}
                onValueChange={setTypeFilter}
              >
                <SelectTrigger id="typeFilter" className="bg-white border border-gray-300">
                  <SelectValue placeholder="Todos os tipos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os tipos</SelectItem>
                  <SelectItem value="apartment">Apartamentos</SelectItem>
                  <SelectItem value="house">Casas</SelectItem>
                  <SelectItem value="commercial">Comerciais</SelectItem>
                  <SelectItem value="land">Terrenos</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="statusFilter" className="text-sm font-medium text-gray-700 mb-1 block">Status</Label>
              <Select
                value={statusFilter}
                onValueChange={setStatusFilter}
              >
                <SelectTrigger id="statusFilter" className="bg-white border border-gray-300">
                  <SelectValue placeholder="Todos os status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="available">Disponível</SelectItem>
                  <SelectItem value="sold">Vendido</SelectItem>
                  <SelectItem value="rented">Alugado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="searchQuery" className="text-sm font-medium text-gray-700 mb-1 block">Buscar</Label>
              <div className="relative">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
                <input 
                  id="searchQuery"
                  type="search" 
                  placeholder="Buscar por título ou endereço..." 
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 pr-4 py-2 rounded-md border border-gray-300 w-full text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
                />
              </div>
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center py-8">
            <Loader2 className="h-8 w-8 animate-spin text-[#12636C]" />
          </div>
        ) : !properties || properties.length === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum imóvel cadastrado</h3>
            <p className="text-gray-500">
              Adicione imóveis para exibi-los em seu site e gerenciá-los de forma eficiente.
            </p>
            <Button
              onClick={handleAddClick}
              size="sm"
              className="mt-4 rounded-full px-5 bg-[#12636C] hover:bg-[#12636C]/90"
            >
              <Plus className="mr-2 h-4 w-4" />
              Adicionar Imóvel
            </Button>
          </div>
        ) : filteredProperties.length === 0 ? (
          <div className="py-10 text-center">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-100 mb-4">
              <Home className="h-8 w-8 text-gray-400" />
            </div>
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum resultado encontrado</h3>
            <p className="text-gray-500">
              Tente ajustar seus filtros para encontrar o que está procurando.
            </p>
            <Button
              onClick={() => {
                setSearchQuery("");
                setTypeFilter("all");
                setStatusFilter("all");
                setPurposeFilter("all");
              }}
              size="sm"
              variant="outline"
              className="mt-4 rounded-full px-5"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border">
            <Table>
              <TableHeader className="bg-[#001623] hover:bg-[#001623]">
                <TableRow className="hover:bg-[#001623]">
                  <TableHead className="w-[300px] text-white hover:bg-[#001623] hover:text-white">Imóvel</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white">Tipo</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white">Finalidade</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white">Preço</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white">Status</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white">Destaque</TableHead>
                  <TableHead className="text-white hover:bg-[#001623] hover:text-white text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProperties.map((property) => (
                  <TableRow 
                    key={property.id} 
                    className="cursor-pointer hover:bg-gray-50" 
                    onClick={() => handleEditClick(property)}
                  >
                    <TableCell className="py-3">
                      <div className="flex items-center space-x-3">
                        <div className="h-10 w-10 rounded-md bg-gray-100 overflow-hidden">
                          {getFeaturedImage(property) ? (
                            <img
                              src={getFeaturedImage(property)}
                              alt={property.title}
                              className="h-full w-full object-cover"
                            />
                          ) : (
                            <div className="flex items-center justify-center h-full">
                              <Home className="h-5 w-5 text-gray-400" />
                            </div>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">{property.title}</p>
                          <p className="text-xs text-gray-500">
                            {property.address?.city && `${property.address.city}, `}
                            {property.address?.state || ''}
                          </p>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span>
                        {property.type === 'apartment' ? 'Apartamento' : 
                        property.type === 'house' ? 'Casa' : 
                        property.type === 'commercial' ? 'Comercial' : 'Terreno'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span>
                        {property.purpose === 'sale' ? 'Venda' : 'Aluguel'}
                      </span>
                    </TableCell>
                    <TableCell>
                      <span className="font-medium">{formatCurrency(property.price)}</span>
                    </TableCell>
                    <TableCell>
                      <span
                        className={cn(
                          "text-xs font-medium px-2 py-1 rounded",
                          {
                            "bg-green-100 text-green-800": property.status === 'available',
                            "bg-red-100 text-red-800": property.status === 'sold',
                            "bg-blue-100 text-blue-800": property.status === 'rented',
                          }
                        )}
                      >
                        {property.status === 'available' ? 'Disponível' : 
                        property.status === 'sold' ? 'Vendido' : 'Alugado'}
                      </span>
                    </TableCell>
                    <TableCell>
                      {property.isFeatured ? (
                        <div className="inline-flex items-center text-amber-500">
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="currentColor" stroke="none"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        </div>
                      ) : (
                        <span className="text-gray-300">-</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClick(property);
                          }} 
                          size="sm"
                          variant="ghost"
                          className="text-gray-600 hover:text-gray-900"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </Button>
                        <Button 
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClick(property);
                          }} 
                          size="sm"
                          variant="ghost"
                          className="text-red-500 hover:text-red-700"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"></path><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"></path><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"></path></svg>
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}
      </div>
    </div>
  );
}