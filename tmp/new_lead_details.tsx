          <DialogContent className="max-w-6xl w-[90vw] max-h-[90vh] overflow-y-auto p-0">
            <VisuallyHidden>
              <DialogTitle>Detalhes do Lead</DialogTitle>
            </VisuallyHidden>
            
            <div className="flex flex-col">
              {/* Header no estilo RD Station */}
              <div className="bg-white py-4 px-6 border-b border-gray-200 flex justify-between items-center">
                <div className="flex items-center">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3 text-blue-600">
                    <i className="fas fa-user"></i>
                  </div>
                  <div>
                    <h2 className="text-lg font-semibold">{lead.name}</h2>
                    <p className="text-xs text-gray-500">
                      {lead.source === 'manual' ? 'Lead manual' :
                      lead.source === 'website' ? 'Lead do website' :
                      lead.source === 'whatsapp' ? 'Lead do WhatsApp' :
                      lead.source === 'instagram' ? 'Lead do Instagram' :
                      lead.source === 'facebook' ? 'Lead do Facebook' :
                      lead.source === 'indicacao' ? 'Lead por indicação' :
                      'Lead'} · Criado em {lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2">
                  <Button variant="outline" size="sm" className="h-8 px-3 text-xs">
                    <i className="fas fa-pen mr-1.5"></i>Editar
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    className="h-8 px-3 text-xs text-red-600 hover:text-red-700"
                    onClick={() => {
                      setLeadToDelete(lead);
                      setIsDeleteConfirmOpen(true);
                    }}
                  >
                    <i className="fas fa-trash-alt mr-1.5"></i>Excluir
                  </Button>
                  <DialogClose className="h-8 w-8 rounded-full flex items-center justify-center hover:bg-gray-100 text-gray-500">
                    <i className="fas fa-times text-xs"></i>
                  </DialogClose>
                </div>
              </div>
              
              {/* Barra de Estágios do Funil - Estilo RD Station */}
              {stages && stages.length > 0 ? (
                (() => {
                  // Filtramos e ordenamos os estágios deste funil
                  const currentFunnelId = lead.funnelId || (funnels?.find(f => f.isDefault)?.id || funnels?.[0]?.id);
                  const filteredStages = stages.filter(stage => stage.funnelId === currentFunnelId) || [];
                  const sortedStages = [...filteredStages].sort((a, b) => a.position - b.position);
                  
                  return (
                    <div className="flex w-full border-b border-gray-200">
                      {sortedStages.map((stage, index) => {
                        const isActive = lead.stageId === stage.id || (!lead.stageId && index === 0);
                        const isCompleted = sortedStages.findIndex(s => s.id === lead.stageId) > index;
                        
                        // Definir estilos baseados no estado
                        let bgColor = "bg-gray-50";
                        let textColor = "text-gray-600";
                        let borderColor = "";
                        
                        if (isActive) {
                          bgColor = "bg-blue-50";
                          textColor = "text-blue-700";
                          borderColor = "border-t-2 border-blue-600";
                        } else if (isCompleted) {
                          bgColor = "bg-green-50";
                          textColor = "text-green-700";
                        }
                        
                        return (
                          <div
                            key={stage.id}
                            className={`flex-1 py-3 ${bgColor} ${textColor} ${borderColor} cursor-pointer relative transition-all duration-200 hover:bg-opacity-90`}
                            onClick={() => {
                              apiRequest(`/api/leads/${lead.id}/stage`, {
                                method: "PATCH",
                                body: JSON.stringify({ stageId: stage.id }),
                              })
                                .then(() => {
                                  queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                                  toast({
                                    title: "Estágio atualizado",
                                    description: "O estágio do lead foi atualizado com sucesso.",
                                  });
                                })
                                .catch((error) => {
                                  console.error("Erro ao atualizar estágio:", error);
                                  toast({
                                    title: "Erro ao atualizar estágio",
                                    description: "Não foi possível atualizar o estágio.",
                                    variant: "destructive",
                                  });
                                });
                            }}
                          >
                            <div className="flex flex-col items-center justify-center">
                              {isCompleted ? (
                                <div className="mb-1 text-green-500">
                                  <i className="fas fa-check-circle"></i>
                                </div>
                              ) : isActive ? (
                                <div className="mb-1 text-blue-500">
                                  <i className="fas fa-circle text-[6px]"></i>
                                </div>
                              ) : (
                                <div className="mb-1 text-gray-300">
                                  <i className="far fa-circle text-[6px]"></i>
                                </div>
                              )}
                              <div className="text-center text-xs font-medium">
                                {stage.name}
                              </div>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  );
                })()
              ) : null}
              
              {/* Abas - Estilo RD Station */}
              <div className="bg-white border-b border-gray-200 px-6">
                <div className="flex -mb-px">
                  <button className="py-4 px-4 border-b-2 border-blue-600 text-blue-600 font-medium text-sm relative">
                    Negociação
                    <span className="absolute bottom-0 left-0 w-full h-0.5 bg-blue-600"></span>
                  </button>
                  <button className="py-4 px-4 text-gray-500 font-medium text-sm">
                    Histórico
                  </button>
                  <button className="py-4 px-4 text-gray-500 font-medium text-sm">
                    Tarefas
                  </button>
                </div>
              </div>
              
              {/* Conteúdo Principal - Estilo RD Station */}
              <div className="bg-gray-100 p-4">
                <div className="grid grid-cols-12 gap-4">
                  {/* Coluna Esquerda - Informações */}
                  <div className="col-span-3">
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Nome</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm">{lead.name}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Qualificação</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm font-medium">{lead.interestType === 'purchase' ? 'Compra' : lead.interestType === 'rent' ? 'Aluguel' : lead.interestType || 'Não qualificado'}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Criado em</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm">{lead.createdAt ? new Date(lead.createdAt).toLocaleDateString('pt-BR') : "Data não disponível"}</p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Valor</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm">
                          {(lead as any).priceRangeMin && (lead as any).priceRangeMax ? 
                            `R$ ${(lead as any).priceRangeMin.toLocaleString('pt-BR')} - R$ ${(lead as any).priceRangeMax.toLocaleString('pt-BR')}` : 
                            lead.budget ? 'R$ ' + lead.budget.toLocaleString('pt-BR') : 'Não informado'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="bg-white rounded shadow-sm">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Fonte</h3>
                      </div>
                      <div className="p-4">
                        <p className="text-sm">
                          {lead.source === 'manual' ? 'Manual' :
                          lead.source === 'website' ? 'Website' :
                          lead.source === 'whatsapp' ? 'WhatsApp' :
                          lead.source === 'instagram' ? 'Instagram' :
                          lead.source === 'facebook' ? 'Facebook' :
                          lead.source === 'indicacao' ? 'Indicação' :
                          lead.source || 'Não informado'}
                        </p>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna Central - Detalhes e Próximas Tarefas */}
                  <div className="col-span-6">
                    {/* Próximas Tarefas - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3 flex justify-between items-center">
                        <h3 className="text-sm font-semibold">Próximas tarefas</h3>
                        <Button size="sm" className="h-8 px-3 text-xs bg-blue-600">
                          <i className="fas fa-plus mr-1.5"></i>Criar tarefa
                        </Button>
                      </div>
                      <div className="p-4 flex flex-col items-center justify-center min-h-[180px]">
                        <div className="text-center py-8">
                          <i className="fas fa-tasks text-4xl text-gray-300 mb-3"></i>
                          <p className="text-sm text-gray-600 mb-1">Não existem tarefas pendentes para essa Negociação</p>
                          <p className="text-xs text-gray-500">Crie uma nova tarefa clicando no botão acima.</p>
                        </div>
                      </div>
                    </div>
                    
                    {/* Informações de Contato - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Informações de contato</h3>
                      </div>
                      <div className="p-4">
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Email</label>
                            <p className="text-sm">{lead.email || "Não informado"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Telefone</label>
                            <p className="text-sm">{lead.phone || "Não informado"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">WhatsApp</label>
                            <p className="text-sm">{(lead as any).whatsapp || "Não informado"}</p>
                          </div>
                          <div>
                            <label className="text-xs font-medium text-gray-500 block mb-1">Região</label>
                            <p className="text-sm">{(lead as any).region || "Não informado"}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Anotações - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Anotações</h3>
                      </div>
                      <div className="p-4">
                        <Textarea 
                          placeholder="Adicione informações importantes sobre esta negociação..." 
                          className="resize-none min-h-[120px] text-sm" 
                          defaultValue={lead.notes || ""}
                        />
                        <div className="flex justify-end mt-3">
                          <Button size="sm" className="h-8 px-3 text-xs bg-blue-600">
                            Salvar anotações
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Coluna Direita - Ações e Configurações */}
                  <div className="col-span-3">
                    {/* Botões de Ação Rápida - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Ações rápidas</h3>
                      </div>
                      <div className="p-4">
                        <div className="space-y-2">
                          <Button variant="outline" className="w-full justify-start h-9 text-xs font-medium">
                            <i className="fas fa-envelope mr-2 text-gray-500"></i>Enviar email
                          </Button>
                          <Button variant="outline" className="w-full justify-start h-9 text-xs font-medium">
                            <i className="fab fa-whatsapp mr-2 text-green-500"></i>Enviar WhatsApp
                          </Button>
                          <Button variant="outline" className="w-full justify-start h-9 text-xs font-medium">
                            <i className="fas fa-phone-alt mr-2 text-blue-500"></i>Registrar ligação
                          </Button>
                          <Button variant="outline" className="w-full justify-start h-9 text-xs font-medium">
                            <i className="fas fa-calendar-alt mr-2 text-purple-500"></i>Agendar reunião
                          </Button>
                        </div>
                      </div>
                    </div>
                    
                    {/* Seleção de Funil - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Funil</h3>
                      </div>
                      <div className="p-4">
                        <Select
                          value={String(lead.funnelId || (funnels?.find(f => f.isDefault)?.id || funnels?.[0]?.id || ""))}
                          onValueChange={(value) => {
                            const funnelId = Number(value);
                            
                            apiRequest(`/api/leads/${lead.id}/funnel`, {
                              method: "PATCH",
                              body: JSON.stringify({ funnelId }),
                            })
                              .then(() => {
                                setCurrentLeadFunnelId(funnelId);
                                queryClient.invalidateQueries({ queryKey: ['/api/leads'] });
                                queryClient.invalidateQueries({ queryKey: ['/api/funnel-stages', funnelId] });
                                
                                toast({
                                  title: "Funil atualizado",
                                  description: "O funil de vendas foi atualizado com sucesso.",
                                });
                              })
                              .catch((error) => {
                                console.error("Erro ao atualizar funil:", error);
                                toast({
                                  title: "Erro ao atualizar funil",
                                  description: "Não foi possível atualizar o funil. Tente novamente.",
                                  variant: "destructive",
                                });
                              });
                          }}
                        >
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue placeholder="Selecione um funil" />
                          </SelectTrigger>
                          <SelectContent>
                            {funnels?.map((funnel) => (
                              <SelectItem key={funnel.id} value={String(funnel.id)}>
                                {funnel.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                    
                    {/* Atribuição de Responsável - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm mb-4">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Responsável</h3>
                      </div>
                      <div className="p-4">
                        <Select disabled={true}>
                          <SelectTrigger className="text-xs h-9">
                            <SelectValue placeholder="Selecione um responsável" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="1">João Silva</SelectItem>
                          </SelectContent>
                        </Select>
                        <p className="text-xs text-gray-500 mt-2">Você pode atribuir um agente responsável por este lead.</p>
                      </div>
                    </div>
                    
                    {/* Botões de Marcação - Estilo RD Station */}
                    <div className="bg-white rounded shadow-sm">
                      <div className="border-b border-gray-200 px-4 py-3">
                        <h3 className="text-sm font-semibold">Marcar como</h3>
                      </div>
                      <div className="p-4">
                        <div className="flex gap-2">
                          <Button size="sm" className="h-8 px-3 text-xs bg-green-600 flex-1">
                            <i className="fas fa-check-circle mr-1.5"></i>Ganho
                          </Button>
                          <Button size="sm" variant="destructive" className="h-8 px-3 text-xs flex-1">
                            <i className="fas fa-times-circle mr-1.5"></i>Perda
                          </Button>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>