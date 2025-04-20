import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Search, Filter } from "lucide-react";

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  interestTypeFilter: string;
  setInterestTypeFilter: (value: string) => void;
  filteredLeadsCount?: number;
}

export function LeadFilters({ 
  searchTerm, 
  setSearchTerm, 
  sourceFilter, 
  setSourceFilter, 
  interestTypeFilter, 
  setInterestTypeFilter,
  filteredLeadsCount = 0
}: LeadFiltersProps) {
  return (
    <div className="mb-6">
      {/* Barra de filtros no estilo da página de imóveis */}
      <div className="bg-white rounded-lg border border-gray-200 overflow-hidden mb-4">
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
              className="pl-10 h-10 border-gray-300 rounded-lg w-full"
            />
          </div>
        </div>
        
        {/* Filtros */}
        <div className="p-4 border-b border-gray-100">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
            {/* Fonte do Lead */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Fonte</div>
              <Select 
                value={sourceFilter} 
                onValueChange={setSourceFilter}
              >
                <SelectTrigger className="h-10 w-full border-gray-300 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-tag mr-2 text-gray-400 text-sm"></i>
                    <SelectValue placeholder="Todas as fontes" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="manual">Cadastro manual</SelectItem>
                  <SelectItem value="website">Website</SelectItem>
                  <SelectItem value="whatsapp">WhatsApp</SelectItem>
                  <SelectItem value="instagram">Instagram</SelectItem>
                  <SelectItem value="facebook">Facebook</SelectItem>
                  <SelectItem value="indicacao">Indicação</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            {/* Tipo de Interesse */}
            <div>
              <div className="text-xs font-medium text-gray-500 mb-1 ml-1">Tipo de Interesse</div>
              <Select 
                value={interestTypeFilter} 
                onValueChange={setInterestTypeFilter}
              >
                <SelectTrigger className="h-10 w-full border-gray-300 rounded-lg">
                  <div className="flex items-center">
                    <i className="fas fa-home mr-2 text-gray-400 text-sm"></i>
                    <SelectValue placeholder="Todos os interesses" />
                  </div>
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os interesses</SelectItem>
                  <SelectItem value="purchase">Compra</SelectItem>
                  <SelectItem value="rent">Aluguel</SelectItem>
                  <SelectItem value="sale">Venda</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>
        
        {/* Contagem de resultados */}
        <div className="flex justify-between items-center p-4 bg-gray-50 border-t border-gray-200">
          <div className="text-sm flex items-center">
            <i className="fas fa-user-alt mr-2 text-gray-500"></i>
            <span className="font-medium">{filteredLeadsCount}</span>
            <span className="text-gray-500 ml-1">leads encontrados</span>
          </div>
        </div>
      </div>
    </div>
  );
}