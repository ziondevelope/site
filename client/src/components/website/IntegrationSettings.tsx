import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useToast } from '@/hooks/use-toast';
import { queryClient } from '@/lib/queryClient';
import axios from 'axios';
import { useQuery } from '@tanstack/react-query';

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { AlertCircle, FileText, RefreshCw, CheckCircle2 } from 'lucide-react';

// Schema para validação de formulário
const integrationFormSchema = z.object({
  enableVivaRealIntegration: z.boolean().default(false),
  vivaRealUsername: z.string().optional(),
  xmlAutomaticUpdate: z.boolean().default(true),
  customXmlPath: z.string().optional(),
  includeInactiveProperties: z.boolean().default(false),
  includeSoldProperties: z.boolean().default(false),
  lastXmlUpdate: z.string().optional(),
});

type IntegrationFormValues = z.infer<typeof integrationFormSchema>;

export default function IntegrationSettings() {
  const { toast } = useToast();
  const [isGeneratingXml, setIsGeneratingXml] = useState(false);
  const [xmlUrl, setXmlUrl] = useState('');

  // Buscar configurações atuais
  const { data: config, isLoading } = useQuery({
    queryKey: ['/api/website/config'],
    select: (data) => data || {},
  });

  const form = useForm<IntegrationFormValues>({
    resolver: zodResolver(integrationFormSchema),
    defaultValues: {
      enableVivaRealIntegration: false,
      xmlAutomaticUpdate: true,
      includeInactiveProperties: false,
      includeSoldProperties: false,
    },
  });

  // Atualizar form quando os dados chegarem
  useEffect(() => {
    if (config) {
      form.reset({
        enableVivaRealIntegration: config.enableVivaRealIntegration || false,
        vivaRealUsername: config.vivaRealUsername || '',
        xmlAutomaticUpdate: config.xmlAutomaticUpdate !== false, // default true
        customXmlPath: config.customXmlPath || '',
        includeInactiveProperties: config.includeInactiveProperties || false,
        includeSoldProperties: config.includeSoldProperties || false,
        lastXmlUpdate: config.lastXmlUpdate || '',
      });
      
      // Gerar URL do XML
      const host = window.location.host;
      const protocol = window.location.protocol;
      const xmlPath = config.customXmlPath || 'xml_imoveis.xml';
      setXmlUrl(`${protocol}//${host}/${xmlPath}`);
    }
  }, [config, form]);

  const onSubmit = async (values: IntegrationFormValues) => {
    try {
      await axios.patch('/api/website/config', values);
      
      queryClient.invalidateQueries({ queryKey: ['/api/website/config'] });
      
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de integração foram atualizadas com sucesso.',
      });
    } catch (error) {
      console.error('Erro ao salvar configurações:', error);
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações. Tente novamente.',
        variant: 'destructive',
      });
    }
  };

  const handleGenerateXml = async () => {
    setIsGeneratingXml(true);
    try {
      await axios.post('/api/integrations/generate-xml');
      
      queryClient.invalidateQueries({ queryKey: ['/api/website/config'] });
      
      toast({
        title: 'XML gerado com sucesso',
        description: `O arquivo XML foi gerado e está disponível em ${xmlUrl}`,
      });
    } catch (error) {
      console.error('Erro ao gerar XML:', error);
      toast({
        title: 'Erro ao gerar XML',
        description: 'Ocorreu um erro ao gerar o arquivo XML. Verifique os logs do sistema.',
        variant: 'destructive',
      });
    } finally {
      setIsGeneratingXml(false);
    }
  };

  const copyXmlUrl = () => {
    navigator.clipboard.writeText(xmlUrl);
    toast({
      title: 'URL copiada',
      description: 'A URL do arquivo XML foi copiada para a área de transferência.',
    });
  };

  if (isLoading) {
    return <div className="flex items-center justify-center p-8">Carregando configurações...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Configurações de Integração</h2>
          <p className="text-muted-foreground">
            Configure a integração com portais imobiliários
          </p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Integração VivaReal/ZAP</CardTitle>
          <CardDescription>
            Configure a exportação de imóveis para o VivaReal no formato ZAP/VivaReal 4.0
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <div className="space-y-4">
                <FormField
                  control={form.control}
                  name="enableVivaRealIntegration"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                      <div className="space-y-0.5">
                        <FormLabel>Ativar integração com VivaReal</FormLabel>
                        <FormDescription>
                          Gera e mantém atualizado um arquivo XML no padrão VivaReal
                        </FormDescription>
                      </div>
                      <FormControl>
                        <Switch
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />

                {form.watch("enableVivaRealIntegration") && (
                  <>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-4">
                      <FormField
                        control={form.control}
                        name="vivaRealUsername"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Nome de usuário VivaReal (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="Seu usuário no VivaReal" {...field} />
                            </FormControl>
                            <FormDescription>
                              Utilizado para identificação no arquivo XML
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="customXmlPath"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Caminho personalizado do XML (opcional)</FormLabel>
                            <FormControl>
                              <Input placeholder="xml_imoveis.xml" {...field} />
                            </FormControl>
                            <FormDescription>
                              Se não informado, será usado "xml_imoveis.xml"
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <FormField
                        control={form.control}
                        name="xmlAutomaticUpdate"
                        render={({ field }) => (
                          <FormItem className="flex flex-row items-center justify-between p-3 border rounded-lg">
                            <div className="space-y-0.5">
                              <FormLabel>Atualização automática</FormLabel>
                              <FormDescription>
                                Atualiza o XML automaticamente quando houver alterações nos imóveis
                              </FormDescription>
                            </div>
                            <FormControl>
                              <Switch
                                checked={field.value}
                                onCheckedChange={field.onChange}
                              />
                            </FormControl>
                          </FormItem>
                        )}
                      />

                      <div className="space-y-4">
                        <FormField
                          control={form.control}
                          name="includeInactiveProperties"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Incluir imóveis inativos no XML
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />

                        <FormField
                          control={form.control}
                          name="includeSoldProperties"
                          render={({ field }) => (
                            <FormItem className="flex flex-row items-center space-x-3 space-y-0">
                              <FormControl>
                                <Checkbox
                                  checked={field.value}
                                  onCheckedChange={field.onChange}
                                />
                              </FormControl>
                              <div className="space-y-1 leading-none">
                                <FormLabel>
                                  Incluir imóveis vendidos/alugados no XML
                                </FormLabel>
                              </div>
                            </FormItem>
                          )}
                        />
                      </div>
                    </div>

                    <div className="p-4 bg-muted rounded-lg">
                      <p className="text-sm font-medium mb-2">Status do XML</p>
                      <div className="flex flex-col md:flex-row md:items-center gap-4">
                        <div className="flex-grow">
                          <p className="text-sm text-muted-foreground">URL do arquivo XML:</p>
                          <div className="flex items-center mt-1">
                            <code className="bg-secondary px-2 py-1 rounded text-sm flex-grow">
                              {xmlUrl}
                            </code>
                            <Button 
                              variant="outline" 
                              size="sm" 
                              className="ml-2" 
                              onClick={copyXmlUrl}
                              type="button"
                            >
                              Copiar
                            </Button>
                          </div>
                          {config?.lastXmlUpdate && (
                            <p className="text-xs text-muted-foreground mt-2">
                              Última atualização: {new Date(config.lastXmlUpdate).toLocaleString()}
                            </p>
                          )}
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleGenerateXml}
                          disabled={isGeneratingXml}
                          type="button"
                          className="ml-auto"
                        >
                          {isGeneratingXml ? (
                            <>
                              <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                              Gerando XML...
                            </>
                          ) : (
                            <>
                              <FileText className="mr-2 h-4 w-4" />
                              Gerar XML Agora
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    <Alert className="mt-4">
                      <AlertCircle className="h-4 w-4" />
                      <AlertTitle>Importante</AlertTitle>
                      <AlertDescription>
                        Verifique se todos os imóveis possuem os campos obrigatórios preenchidos: 
                        título, descrição, preço, endereço, fotos e código do imóvel.
                        Imóveis com dados incompletos podem ser rejeitados pelo portal VivaReal.
                      </AlertDescription>
                    </Alert>
                  </>
                )}
              </div>

              <Button type="submit" className="mt-6">
                Salvar Configurações
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}