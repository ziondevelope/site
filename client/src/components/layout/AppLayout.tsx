import { ReactNode, useState, useEffect } from "react";
import Sidebar, { useSidebar } from "./Sidebar";
import MobileMenu from "./MobileMenu";
import { Button } from "@/components/ui/button";
import { useLocation } from "wouter";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  const [location] = useLocation();
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  
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
  
  // Detectar quando o sidebar é expandido/retraído
  useEffect(() => {
    const handleSidebarChange = (e: MouseEvent) => {
      // Verificamos se o evento ocorreu dentro do sidebar
      const target = e.target as HTMLElement;
      const sidebar = document.querySelector('aside');
      
      if (sidebar && sidebar.contains(target)) {
        setIsSidebarHovered(true);
      } else {
        setIsSidebarHovered(false);
      }
    };

    window.addEventListener('mousemove', handleSidebarChange);
    return () => {
      window.removeEventListener('mousemove', handleSidebarChange);
    };
  }, []);
  
  const breadcrumbs = getBreadcrumbs();

  return (
    <div className="flex h-screen overflow-hidden bg-gray-50 text-dark">
      <Sidebar />
      <MobileMenu />
      
      <main className={cn(
        "flex-1 overflow-y-auto transition-all duration-300 ease-in-out",
      )}>
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
        
        <div className="p-4 pb-16">
          <div>
            {children}
          </div>
        </div>
      </main>
    </div>
  );
}
