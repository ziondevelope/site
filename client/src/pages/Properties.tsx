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
import { ImageUpload } from "@/components/ui/image-upload";
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
  imageUrl: z.string().optional(),
  parkingSpots: z.number().min(0).default(0),
  suites: z.number().min(0).default(0),
});

type PropertyFormValues = z.infer<typeof propertyFormSchema>;

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
      imageUrl: "",
    },
  });

  // Initialize edit form with property data
  const initEditForm = (property: Property) => {
    setSelectedProperty(property);
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
      imageUrl: property.imageUrl || "",
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
      imageUrl: "",
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
                    
                    <div className="grid grid-cols-2 gap-4">
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
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
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
                    <div className="grid grid-cols-2 gap-4">
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="w-full flex flex-col items-center mt-4">
                          <FormLabel className="text-center mb-2 text-gray-700">Imagem Principal</FormLabel>
                          <FormControl>
                            <ImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={addPropertyMutation.isPending}
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
                    
                    <div className="grid grid-cols-2 gap-4">
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
                        <FormItem>
                          <FormLabel>Status</FormLabel>
                          <Select 
                            onValueChange={field.onChange} 
                            defaultValue={field.value}
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
                    <div className="grid grid-cols-2 gap-4">
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
                      name="imageUrl"
                      render={({ field }) => (
                        <FormItem className="w-full flex flex-col items-center mt-4">
                          <FormLabel className="text-center mb-2 text-gray-700">Imagem Principal</FormLabel>
                          <FormControl>
                            <ImageUpload 
                              onChange={field.onChange}
                              value={field.value}
                              disabled={updatePropertyMutation.isPending}
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
                <TableRow className="bg-gray-50">
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
                  <TableRow key={property.id} className="hover:bg-gray-50">
                    <TableCell className="py-4 whitespace-nowrap">
                      <div className="font-medium text-gray-900">{property.title}</div>
                      <div className="text-xs text-gray-500">{property.address}, {property.neighborhood}</div>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      {property.type === "apartment" && "Apartamento"}
                      {property.type === "house" && "Casa"}
                      {property.type === "commercial" && "Comercial"}
                      {property.type === "land" && "Terreno"}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      {property.purpose === "sale" ? "Venda" : "Aluguel"}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap font-medium">
                      {new Intl.NumberFormat('pt-BR', {
                        style: 'currency',
                        currency: 'BRL'
                      }).format(property.price)}
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap">
                      <span className={`px-2 py-1 rounded-full text-xs font-semibold ${
                        property.status === "available" ? "bg-green-100 text-green-800" :
                        property.status === "sold" ? "bg-blue-100 text-blue-800" :
                        "bg-yellow-100 text-yellow-800"
                      }`}>
                        {property.status === "available" ? "Disponível" :
                         property.status === "sold" ? "Vendido" : "Alugado"}
                      </span>
                    </TableCell>
                    <TableCell className="py-4 whitespace-nowrap text-right text-sm font-medium">
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
          <div className="text-center py-10 bg-white rounded-lg border border-gray-100">
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
