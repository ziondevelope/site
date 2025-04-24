import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  statusFilter: string;
  setStatusFilter: (value: string) => void;
  filteredClientsCount?: number;
}

export function ClientFilters({ 
  searchTerm, 
  setSearchTerm, 
  sourceFilter, 
  setSourceFilter, 
  statusFilter, 
  setStatusFilter,
  filteredClientsCount = 0
}: ClientFiltersProps) {
  return (
    <div className="mb-6">
      {/* Barra de filtros */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mb-4">
        {/* Seção de busca */}
        <div className="p-4 border-b border-gray-100">
          <div className="relative">
            <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">
              <Search size={16} />
            </div>
            <Input
              placeholder="Buscar por nome, email, telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 h-10 border-gray-300 rounded-full w-full"
            />
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Fonte do Cliente */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Fonte</div>
              <Select 
                value={sourceFilter} 
                onValueChange={setSourceFilter}
              >
                <SelectTrigger className="h-10 w-full border-gray-300 rounded-full">
                  <div className="flex items-center">
                    <i className="ri-price-tag-3-line mr-2 text-gray-400 text-sm"></i>
                    <SelectValue placeholder="Todas as fontes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="manual">Cadastro manual</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="property-contact-form">Formulário de Imóvel</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Status do Cliente */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Status</div>
              <Select 
                value={statusFilter} 
                onValueChange={setStatusFilter}
              >
                <SelectTrigger className="h-10 w-full border-gray-300 rounded-full">
                  <div className="flex items-center">
                    <i className="ri-user-star-line mr-2 text-gray-400 text-sm"></i>
                    <SelectValue placeholder="Todos os status" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os status</SelectItem>
                  <SelectItem value="active">Ativo</SelectItem>
                  <SelectItem value="lead">Lead</SelectItem>
                  <SelectItem value="inactive">Inativo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Contagem de resultados */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm flex items-center">
            <i className="ri-user-star-line mr-2 text-gray-500"></i>
            <span className="font-medium">{filteredClientsCount}</span>
            <span className="text-gray-500 ml-1">clientes encontrados</span>
          </div>
        </div>
      </div>
    </div>
  );
}