import React, { useState, useEffect, useMemo } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog";
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
      return property.images[0];
    }
  }
  
  // Compatibilidade com o campo featuredImage (formato antigo)
  if (property.featuredImage) {
    return property.featuredImage;
  }
  
  // Compatibilidade com o campo imageUrl (formato mais antigo)
  if ('imageUrl' in property && property.imageUrl) {
    return property.imageUrl;
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
  const [typeFilter, setTypeFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  
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
      const matchesType = typeFilter === "" || property.type === typeFilter;
      
      // Status filter
      const matchesStatus = statusFilter === "" || property.status === statusFilter;
      
      return matchesSearch && matchesType && matchesStatus;
    });
  }, [properties, searchQuery, typeFilter, statusFilter]);

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
    let formattedImages = [];
    if (property.images) {
      // Se já estiver no formato { url, isFeatured }
      if (typeof property.images[0] === 'object' && 'url' in property.images[0]) {
        formattedImages = property.images as {url: string, isFeatured?: boolean}[];
      } 
      // Se for um array de strings (formato antigo)
      else if (Array.isArray(property.images)) {
        formattedImages = property.images.map((url: string, index: number) => ({
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
    <div className="space-y-8 max-w-5xl mx-auto">
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
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Apartamento 3 quartos" {...field} />
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
                              placeholder="Descreva o imóvel" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
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
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
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
                              placeholder="350000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <FormItem className="mb-6">
                          <FormLabel className="font-medium">Corretor Responsável</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value) || null)} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
                                <SelectValue placeholder="Selecione o corretor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allAgents?.map((agent) => (
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

                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel className="font-medium">Status do Imóvel</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value} 
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
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
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área (m²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="80"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="2"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de Garagem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <PropertyFeatures
                          features={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <CepInput form={form} field={field} />
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua Exemplo, 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagens</FormLabel>
                          <FormControl>
                            <MultipleImageUpload 
                              value={field.value}
                              onChange={field.onChange}
                              maxImages={10}
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
                  >
                    {addPropertyMutation.isPending ? "Salvando..." : "Salvar Imóvel"}
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
              Modifique os dados do imóvel
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
                          <FormLabel>Título</FormLabel>
                          <FormControl>
                            <Input placeholder="Apartamento 3 quartos" {...field} />
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
                              placeholder="Descreva o imóvel" 
                              className="min-h-[120px]" 
                              {...field} 
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="type"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Tipo</FormLabel>
                            <Select 
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
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
                              onValueChange={field.onChange} 
                              defaultValue={field.value}
                              value={field.value}
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
                              placeholder="350000"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
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
                        <FormItem className="mb-6">
                          <FormLabel className="font-medium">Corretor Responsável</FormLabel>
                          <Select 
                            onValueChange={(value) => field.onChange(Number(value) || null)} 
                            value={field.value?.toString() || ""}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
                                <SelectValue placeholder="Selecione o corretor" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {allAgents?.map((agent) => (
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
                    
                    <FormField
                      control={form.control}
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel className="font-medium">Status do Imóvel</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value}
                            defaultValue={field.value}
                          >
                            <FormControl>
                              <SelectTrigger className="bg-white border border-gray-300 shadow-sm">
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
                    <FormField
                      control={form.control}
                      name="area"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Área (m²)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number" 
                              placeholder="80"
                              {...field}
                              onChange={(e) => field.onChange(Number(e.target.value))}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="2"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
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
                                placeholder="0"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de Garagem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="features"
                      render={({ field }) => (
                        <PropertyFeatures
                          features={field.value || []}
                          onChange={field.onChange}
                        />
                      )}
                    />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <FormField
                      control={form.control}
                      name="zipCode"
                      render={({ field }) => (
                        <CepInput form={form} field={field} />
                      )}
                    />
                    
                    <div className="grid grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Cidade</FormLabel>
                            <FormControl>
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Centro" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>
                    
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Endereço</FormLabel>
                          <FormControl>
                            <Input placeholder="Rua Exemplo, 123" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="images"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Imagens</FormLabel>
                          <FormControl>
                            <MultipleImageUpload 
                              value={field.value}
                              onChange={field.onChange}
                              maxImages={10}
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
                    onClick={() => setIsEditDialogOpen(false)}
                    className="mr-2"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={updatePropertyMutation.isPending}
                  >
                    {updatePropertyMutation.isPending ? "Salvando..." : "Salvar Alterações"}
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Property Alert */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este imóvel? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteAlertOpen(false)}>
              Cancelar
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              className="bg-red-500 hover:bg-red-600"
              disabled={deletePropertyMutation.isPending}
            >
              {deletePropertyMutation.isPending ? "Excluindo..." : "Excluir Imóvel"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      {/* Property Listing */}
      <div className="flex items-center justify-between mb-6">
        <Button 
          onClick={handleAddClick}
          className="bg-[#15616D] hover:bg-[#15616D]/90 rounded-full px-5">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
          Adicionar Imóvel
        </Button>
        
        <div className="flex space-x-4 items-center">
          <div className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
            <input 
              type="search" 
              placeholder="Buscar imóveis..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
            />
          </div>
          
          <select 
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="py-2 px-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Todos os tipos</option>
            <option value="apartment">Apartamentos</option>
            <option value="house">Casas</option>
            <option value="commercial">Comerciais</option>
            <option value="land">Terrenos</option>
          </select>
          
          <select 
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="py-2 px-3 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
          >
            <option value="">Todos os status</option>
            <option value="available">Disponíveis</option>
            <option value="sold">Vendidos</option>
            <option value="rented">Alugados</option>
          </select>
        </div>
      </div>
      
      {isLoading ? (
        <div className="flex justify-center p-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      ) : !properties || properties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 border border-dashed border-gray-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-4"><path d="M17 21h-10a2 2 0 0 1 -2 -2v-14a2 2 0 0 1 2 -2h14a2 2 0 0 1 2 2v14a2 2 0 0 1 -2 2z"></path><path d="M7 10h10"></path><path d="M7 14h10"></path><path d="M7 18h10"></path></svg>
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum imóvel cadastrado</h3>
          <p className="text-gray-500 mb-4 text-center max-w-md">Adicione imóveis para exibi-los em seu site e gerenciá-los de forma eficiente.</p>
          <Button
            onClick={handleAddClick}
            size="sm"
            className="rounded-full bg-[#15616D] hover:bg-[#15616D]/90"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M5 12h14"/><path d="M12 5v14"/></svg>
            Adicionar Imóvel
          </Button>
        </div>
      ) : filteredProperties.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-12 border border-dashed border-gray-200 rounded-lg">
          <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" strokeLinecap="round" strokeLinejoin="round" className="text-gray-300 mb-3"><circle cx="11" cy="11" r="8"></circle><path d="m21 21-4.3-4.3"></path></svg>
          <h3 className="text-lg font-medium text-gray-400 mb-2">Nenhum resultado encontrado</h3>
          <p className="text-gray-500 mb-3 text-center max-w-md">Tente ajustar seus filtros para encontrar o que está procurando.</p>
          <Button
            onClick={() => {
              setSearchQuery("");
              setTypeFilter("");
              setStatusFilter("");
            }}
            size="sm"
            variant="outline"
            className="rounded-full"
          >
            Limpar filtros
          </Button>
        </div>
      ) : (
        <div className="overflow-hidden rounded-lg border border-gray-100">
          <Table className="min-w-full divide-y divide-gray-100">
            <TableHeader>
              <TableRow className="bg-gray-50">
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Imóvel</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Finalidade</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Destaque</TableHead>
                <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody className="bg-white divide-y divide-gray-100">
              {filteredProperties.map((property) => (
                <TableRow key={property.id} className="bg-white hover:bg-gray-50">
                  <TableCell className="flex items-center space-x-3 py-3">
                    <div className="w-12 h-12 rounded-full overflow-hidden shadow-sm border border-gray-100 bg-white flex-shrink-0">
                      {getFeaturedImage(property) ? (
                        <img 
                          src={getFeaturedImage(property)}
                          alt={property.title} 
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M5 7h14"/><path d="M5 12h14"/><path d="M5 17h14"/></svg>
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">{property.title}</div>
                      <div className="text-xs text-gray-500 mt-0.5">{property.address || 'Sem endereço'}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {property.type === 'apartment' ? 'Apartamento' :
                       property.type === 'house' ? 'Casa' :
                       property.type === 'commercial' ? 'Comercial' :
                       property.type === 'land' ? 'Terreno' :
                       property.type}
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className="capitalize">
                      {property.purpose === 'sale' ? 'Venda' :
                       property.purpose === 'rent' ? 'Aluguel' :
                       property.purpose}
                    </span>
                  </TableCell>
                  <TableCell className="font-medium">
                    {property.price?.toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL',
                      minimumFractionDigits: 0,
                      maximumFractionDigits: 0,
                    })}
                  </TableCell>
                  <TableCell>
                    <div className={`text-xs font-medium rounded-full px-2.5 py-1 inline-flex items-center justify-center w-24
                      ${property.status === 'available' ? 'bg-green-50 text-green-700' : 
                        property.status === 'sold' ? 'bg-blue-50 text-blue-700' : 
                        property.status === 'rented' ? 'bg-purple-50 text-purple-700' : 
                        'bg-gray-50 text-gray-700'}`}
                    >
                      {property.status === 'available' ? 'Disponível' : 
                       property.status === 'sold' ? 'Vendido' :
                       property.status === 'rented' ? 'Alugado' :
                       property.status}
                    </div>
                  </TableCell>
                  <TableCell>
                    {property.isFeatured ? (
                      <div className="text-indigo-500 flex items-center">
                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-1.5"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
                        <span className="text-sm">Destaque</span>
                      </div>
                    ) : (
                      <span className="text-gray-400 text-sm">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end space-x-2">
                      <Button 
                        onClick={() => handleEditClick(property)} 
                        size="sm"
                        variant="ghost"
                      >
                        <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                      </Button>
                      <Button 
                        onClick={() => handleDeleteClick(property)} 
                        size="sm"
                        variant="ghost"
                        className="text-red-500 hover:text-red-700 hover:bg-red-50"
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
      
      {/* Seção de Tarefas Agendadas */}
      <div className="mt-10 bg-white rounded-lg shadow p-6">
        <div className="mb-4 flex justify-between items-center">
          <h2 className="text-xl font-semibold text-gray-800">Tarefas Agendadas</h2>
          <Button className="bg-[#15616D] hover:bg-[#15616D]/90">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M12 5v14M5 12h14"/></svg>
            Nova Tarefa
          </Button>
        </div>
        
        {tasksLoading ? (
          <div className="py-6 text-center">
            <div className="spinner mx-auto"></div>
            <p className="mt-2 text-gray-500">Carregando tarefas...</p>
          </div>
        ) : !Array.isArray(tasks) || tasks.length === 0 ? (
          <div className="py-6 text-center">
            <p className="text-gray-500">Nenhuma tarefa agendada para imóveis.</p>
          </div>
        ) : (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <Table className="min-w-full divide-y divide-gray-100">
              <TableHeader>
                <TableRow className="bg-gray-50">
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Descrição</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Data/Hora</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody className="bg-white divide-y divide-gray-100">
                {tasks.filter(task => task.propertyId).map((task) => (
                  <TableRow key={task.id} className="bg-white hover:bg-gray-50">
                    <TableCell className="font-medium">{task.title}</TableCell>
                    <TableCell>{task.description}</TableCell>
                    <TableCell>
                      {new Date(task.date).toLocaleString('pt-BR', {
                        day: '2-digit',
                        month: '2-digit',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })}
                    </TableCell>
                    <TableCell>
                      <span className="capitalize">
                        {task.type === 'call' ? 'Ligação' :
                         task.type === 'visit' ? 'Visita' :
                         task.type === 'whatsapp' ? 'WhatsApp' :
                         task.type === 'meeting' ? 'Reunião' :
                         task.type}
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className={`text-xs font-medium rounded-full px-2.5 py-1 inline-flex items-center justify-center w-24
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
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <Button 
                          size="sm"
                          variant="ghost"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path></svg>
                        </Button>
                        <Button 
                          size="sm"
                          variant="ghost"
                          className="text-green-500 hover:text-green-700 hover:bg-green-50"
                        >
                          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
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