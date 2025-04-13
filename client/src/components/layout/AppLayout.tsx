import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  
  // Extrair o nome da página atual da URL
  const getPageTitle = () => {
    const path = location.split('/').filter(Boolean);
    if (path.length <= 1) return "Dashboard";
    
    const pageMap: Record<string, string> = {
      'imoveis': 'Imóveis',
      'crm': 'Gestão de Leads',
      'corretores': 'Corretores',
      'site': 'Configuração do Site'
    };
    
    return pageMap[path[1]] || path[1].charAt(0).toUpperCase() + path[1].slice(1);
  };
  
  const getBreadcrumbs = () => {
    const path = location.split('/').filter(Boolean);
    const breadcrumbs = [];
    
    if (path.length <= 1) {
      return [{ label: "Dashboard", href: "/admin" }];
    }
    
    breadcrumbs.push({ label: "Home", href: "/admin" });
    
    const pageMap: Record<string, string> = {
      'imoveis': 'Imóveis',
      'crm': 'Gestão de Leads',
      'corretores': 'Corretores',
      'site': 'Configuração do Site'
    };
    
    breadcrumbs.push({ 
      label: pageMap[path[1]] || path[1], 
      href: `/${path[0]}/${path[1]}` 
    });
    
    return breadcrumbs;
  };
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-dark">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto">
        {/* Header */}
        <header className="bg-white border-b border-gray-200 py-3 px-6 flex justify-between items-center">
          <div className="flex items-center text-sm">
            {breadcrumbs.map((crumb, index) => (
              <div key={crumb.href} className="flex items-center">
                {index > 0 && <span className="mx-2 text-gray-400">›</span>}
                <a href={crumb.href} className={index === breadcrumbs.length - 1 
                  ? "text-gray-600 font-medium" 
                  : "text-gray-400 hover:text-gray-600"
                }>
                  {crumb.label}
                </a>
              </div>
            ))}
          </div>
          
          <div className="flex items-center gap-4">
            <Button variant="outline" size="sm" className="rounded-full bg-green-100 text-green-700 border-0 hover:bg-green-200">
              <span className="w-2 h-2 bg-green-500 rounded-full mr-2"></span>
              Desempenho padrão
            </Button>
            <div className="flex items-center text-sm">
              <span className="mr-2 text-gray-600">Usuário: Gabriel Teste</span>
              <Button variant="ghost" size="icon" className="text-gray-500 hover:text-gray-800">
                <i className="ri-settings-line text-lg"></i>
              </Button>
            </div>
          </div>
        </header>
        
        <div className="p-6 pb-16">
          <div className="flex justify-between items-center mb-6">
            <h1 className="text-2xl font-semibold text-gray-800">{getPageTitle()}</h1>
            
            {location.includes('/crm') && (
              <Button className="bg-indigo-600 hover:bg-indigo-700">
                <i className="ri-add-line mr-1"></i> Cadastrar usuário
              </Button>
            )}
          </div>
          
          <div className="bg-white rounded-lg border border-gray-200 shadow-sm overflow-hidden">
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
