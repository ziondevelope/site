import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { queryClient } from "@/lib/queryClient";
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
import { apiRequest } from "@/lib/queryClient";
import { MultipleImageUpload } from "@/components/ui/multiple-image-upload";
import { FeaturedCheckbox } from "@/components/ui/featured-checkbox";
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
  if (property.imageUrl) {
    return property.imageUrl;
  }
  
  return undefined;
};

export default function Properties() {
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteAlertOpen, setIsDeleteAlertOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const { toast } = useToast();
  
  // Fetch properties
  const { data: properties, isLoading } = useQuery<Property[]>({
    queryKey: ['/api/properties'],
  });

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
      const response = await apiRequest("POST", "/api/properties", data);
      return response.json();
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
      const response = await apiRequest("PATCH", `/api/properties/${id}`, propertyData);
      return response.json();
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
      const response = await apiRequest("DELETE", `/api/properties/${id}`);
      return response.ok;
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
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (m²)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="120"
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
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="3"
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
                        name="parkingSpots"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Vagas de Garagem</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suítes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Destacar na página inicial</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
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
                      
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Jardim América" {...field} />
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
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
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
                        <FormItem className="w-full">
                          <FormLabel className="mb-2 text-gray-700">Galeria de Imagens</FormLabel>
                          <FormControl>
                            <MultipleImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={addPropertyMutation.isPending}
                              label="Adicione imagens do imóvel"
                              maxImages={8}
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
          <div className="flex justify-end space-x-3 border-t border-gray-100 p-4 sticky bottom-0 bg-white z-10">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsAddDialogOpen(false)}
              className="rounded-full px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={addPropertyMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5"
            >
              {addPropertyMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Salvando...
                </>
              ) : "Salvar Imóvel"}
            </Button>
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
                      name="status"
                      render={({ field }) => (
                        <FormItem className="mb-6">
                          <FormLabel className="font-medium">Status do Imóvel</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            value={field.value} defaultValue={field.value}
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
                  </TabsContent>
                  
                  <TabsContent value="details" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
                      <FormField
                        control={form.control}
                        name="area"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Área (m²)</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="120"
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
                        name="bedrooms"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Quartos</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="3"
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
                                value={field.value || 0}
                                onChange={(e) => field.onChange(Number(e.target.value))}
                              />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={form.control}
                        name="suites"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Suítes</FormLabel>
                            <FormControl>
                              <Input 
                                type="number" 
                                placeholder="1"
                                {...field}
                                value={field.value || 0}
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
                        name="isFeatured"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-start space-x-3 space-y-0 pt-6">
                            <FormControl>
                              <input
                                type="checkbox"
                                checked={field.value}
                                onChange={field.onChange}
                                className="h-4 w-4 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
                              />
                            </FormControl>
                            <div className="space-y-1 leading-none">
                              <FormLabel>Destacar na página inicial</FormLabel>
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </TabsContent>
                  
                  <TabsContent value="location" className="space-y-4">
                    <div className="grid grid-cols-3 gap-4">
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
                      
                      <FormField
                        control={form.control}
                        name="neighborhood"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Bairro</FormLabel>
                            <FormControl>
                              <Input placeholder="Jardim América" {...field} />
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
                              <Input placeholder="São Paulo" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      
                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>CEP</FormLabel>
                            <FormControl>
                              <Input placeholder="00000-000" {...field} />
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
                        <FormItem className="w-full">
                          <FormLabel className="mb-2 text-gray-700">Galeria de Imagens</FormLabel>
                          <FormControl>
                            <MultipleImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={updatePropertyMutation.isPending}
                              label="Adicione imagens do imóvel"
                              maxImages={8}
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
          <div className="flex justify-end space-x-3 border-t border-gray-100 p-4 sticky bottom-0 bg-white z-10">
            <Button 
              variant="outline" 
              type="button" 
              onClick={() => setIsEditDialogOpen(false)}
              className="rounded-full px-5"
            >
              Cancelar
            </Button>
            <Button 
              type="button" 
              onClick={form.handleSubmit(onSubmit)}
              disabled={updatePropertyMutation.isPending}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5"
            >
              {updatePropertyMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Salvando...
                </>
              ) : "Atualizar Imóvel"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Alert Dialog */}
      <AlertDialog open={isDeleteAlertOpen} onOpenChange={setIsDeleteAlertOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o imóvel <strong>{selectedProperty?.title}</strong>? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              {deletePropertyMutation.isPending ? (
                <>
                  <div className="animate-spin mr-2 h-4 w-4 border-2 border-b-transparent border-white rounded-full"></div>
                  Excluindo...
                </>
              ) : "Sim, excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      
      <div className="mt-4">
        <div className="flex items-center justify-between mb-6">
          <Button 
            onClick={handleAddClick}
            className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5">
            <i className="ri-add-line mr-1"></i> Adicionar Imóvel
          </Button>
          <div className="flex space-x-4 items-center">
            <div className="relative">
              <i className="ri-search-line absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"></i>
              <input 
                type="text" 
                placeholder="Buscar imóvel"
                className="pl-9 pr-4 py-2 rounded-full border border-gray-200 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-200"
              />
            </div>
          </div>
        </div>
        
        {isLoading ? (
          <div className="flex justify-center p-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
          </div>
        ) : properties && properties.length > 0 ? (
          <div className="overflow-hidden rounded-lg border border-gray-100">
            <Table className="min-w-full divide-y divide-gray-100">
              <TableHeader>
                <TableRow>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Título</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Tipo</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Finalidade</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Preço</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider">Status</TableHead>
                  <TableHead className="py-3 text-xs font-medium text-gray-500 uppercase tracking-wider text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {properties.map((property) => (
                  <TableRow key={property.id} className="hover:bg-gray-50/30">
                    <TableCell className="py-2 whitespace-nowrap bg-white">
                      <div className="flex items-center gap-3.5 pl-1">
                        <div className="w-12 h-12 rounded-full overflow-hidden flex-shrink-0 border-0 bg-white shadow-sm flex items-center justify-center">
                          {getFeaturedImage(property) ? (
                            <img 
                              src={getFeaturedImage(property)} 
                              alt={property.title}
                              className="w-full h-full object-cover rounded-full"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gray-100 rounded-full">
                              <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-gray-400"><path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path><polyline points="9 22 9 12 15 12 15 22"></polyline></svg>
                            </div>
                          )}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900">{property.title}</div>
                          <div className="text-xs text-gray-500">{property.address}, {property.neighborhood}</div>
                        </div>
                      </div>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap bg-white">
                      {property.type === "apartment" && "Apartamento"}
                      {property.type === "house" && "Casa"}
                      {property.type === "commercial" && "Comercial"}
                      {property.type === "land" && "Terreno"}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap bg-white">
                      {property.purpose === "sale" ? "Venda" : "Aluguel"}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap font-medium bg-white">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(property.price)}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap bg-white">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.status === "available" ? "bg-green-100 text-green-800" :
                        property.status === "sold" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {property.status === "available" ? "Disponível" :
                         property.status === "sold" ? "Vendido" : "Alugado"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap text-right text-sm font-medium bg-white">
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-indigo-600"
                        onClick={() => handleEditClick(property)}
                      >
                        <i className="ri-edit-line text-lg"></i>
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        className="h-8 w-8 p-0 text-gray-400 hover:text-red-600"
                        onClick={() => handleDeleteClick(property)}
                      >
                        <i className="ri-delete-bin-line text-lg"></i>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        ) : (
          <div className="text-center py-10 rounded-lg border border-gray-100">
            <div className="text-5xl text-gray-300 mb-4">
              <i className="ri-building-line"></i>
            </div>
            <p className="text-gray-500 mb-4">Nenhum imóvel cadastrado.</p>
            <Button 
              onClick={handleAddClick}
              className="bg-indigo-600 hover:bg-indigo-700 rounded-full px-5">
              Adicionar Imóvel
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
