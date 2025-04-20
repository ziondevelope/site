import { Search, Filter, Home, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface LeadFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  sourceFilter: string;
  setSourceFilter: (value: string) => void;
  interestTypeFilter: string;
  setInterestTypeFilter: (value: string) => void;
}

export function LeadFilters({ 
  searchTerm, 
  setSearchTerm, 
  sourceFilter, 
  setSourceFilter, 
  interestTypeFilter, 
  setInterestTypeFilter 
}: LeadFiltersProps) {
  return (
    <div className="w-full p-4 bg-gray-50 border border-gray-100 rounded-[10px] mb-6" style={{ fontFamily: 'Montserrat, sans-serif' }}>
      <div className="flex flex-col md:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Input
              placeholder="Pesquisar por nome, email ou telefone..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-9 bg-white border-gray-200 h-10"
              style={{ fontSize: '14px' }}
            />
          </div>
        </div>
        
        <div className="w-full md:w-[220px]">
          <div className="relative">
            <Tag className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={sourceFilter} onValueChange={setSourceFilter}>
              <SelectTrigger className="pl-9 bg-white border-gray-200 h-10" style={{ fontSize: '14px' }}>
                <SelectValue placeholder="Filtrar por origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todas as origens</SelectItem>
                <SelectItem value="whatsapp">WhatsApp</SelectItem>
                <SelectItem value="email">E-mail</SelectItem>
                <SelectItem value="website">Website</SelectItem>
                <SelectItem value="manual">Manual</SelectItem>
                <SelectItem value="reference">Indicação</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <div className="w-full md:w-[220px]">
          <div className="relative">
            <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
            <Select value={interestTypeFilter} onValueChange={setInterestTypeFilter}>
              <SelectTrigger className="pl-9 bg-white border-gray-200 h-10" style={{ fontSize: '14px' }}>
                <SelectValue placeholder="Tipo de interesse" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Todos os tipos</SelectItem>
                <SelectItem value="rent">Aluguel</SelectItem>
                <SelectItem value="purchase">Compra</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </div>
    </div>
  );
}