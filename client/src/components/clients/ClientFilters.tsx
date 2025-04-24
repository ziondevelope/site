import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, X } from 'lucide-react';
import {
  Card,
  CardContent,
} from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';

interface ClientFiltersProps {
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  activeStatus: string;
  setActiveStatus: (value: string) => void;
  activeOrigin: string;
  setActiveOrigin: (value: string) => void;
}

export default function ClientFilters({
  searchTerm,
  setSearchTerm,
  activeStatus,
  setActiveStatus,
  activeOrigin,
  setActiveOrigin,
}: ClientFiltersProps) {
  // Função para limpar todos os filtros
  const clearFilters = () => {
    setSearchTerm('');
    setActiveStatus('all');
    setActiveOrigin('all');
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="grid md:grid-cols-4 gap-4">
          {/* Filtro de pesquisa */}
          <div className="space-y-2">
            <Label htmlFor="search">Pesquisa</Label>
            <div className="relative">
              <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="search"
                placeholder="Buscar por nome, email, telefone..."
                className="pl-8"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              {searchTerm && (
                <Button
                  variant="ghost"
                  size="sm"
                  className="absolute right-1 top-1.5 h-6 w-6 rounded-full p-0"
                  onClick={() => setSearchTerm('')}
                >
                  <X className="h-4 w-4" />
                  <span className="sr-only">Limpar pesquisa</span>
                </Button>
              )}
            </div>
          </div>

          {/* Filtro de status */}
          <div className="space-y-2">
            <Label htmlFor="status-filter">Status</Label>
            <Select
              value={activeStatus}
              onValueChange={setActiveStatus}
            >
              <SelectTrigger id="status-filter">
                <SelectValue placeholder="Filtrar por status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                <SelectItem value="active">Ativos</SelectItem>
                <SelectItem value="inactive">Inativos</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Filtro de origem */}
          <div className="space-y-2">
            <Label htmlFor="origin-filter">Origem</Label>
            <Select
              value={activeOrigin}
              onValueChange={setActiveOrigin}
            >
              <SelectTrigger id="origin-filter">
                <SelectValue placeholder="Filtrar por origem" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                <SelectItem value="leads">Convertidos de Lead</SelectItem>
                <SelectItem value="direct">Cadastrados Diretamente</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Botão para limpar os filtros */}
          <div className="flex items-end">
            <Button
              variant="outline"
              onClick={clearFilters}
              className="w-full"
            >
              Limpar Filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}