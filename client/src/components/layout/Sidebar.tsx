import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, createContext, useContext } from "react";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  children?: NavItem[];
};

// Contexto para compartilhar o estado do sidebar com outros componentes
export const SidebarContext = createContext({
  expanded: false,
  setExpanded: (value: boolean) => {},
  toggleExpanded: () => {}
});

export const useSidebar = () => useContext(SidebarContext);

const navItems: NavItem[] = [
  { id: "home", href: "/admin", label: "Página Inicial", icon: "ri-home-line" },
  { id: "leads", href: "/admin/crm", label: "Leads", icon: "ri-user-heart-line" },
  { id: "properties", href: "/admin/imoveis", label: "Imóveis", icon: "ri-building-line" },
  { id: "agents", href: "/admin/corretores", label: "Corretores", icon: "ri-team-line" },
  { id: "settings", href: "/admin/configuracoes", label: "Configurações", icon: "ri-settings-line" },
  { id: "website", href: "/admin/site", label: "Site", icon: "ri-global-line" },
  { id: "back", href: "/", label: "Voltar ao Site", icon: "ri-arrow-left-line" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);
  const [hovered, setHovered] = useState(false);

  // Função para alternar a expansão do sidebar
  const toggleExpanded = () => {
    setExpanded(!expanded);
  };

  useEffect(() => {
    // Se o mouse saiu e não está em modo expanded permanente, recolhe o menu
    if (!hovered && !expanded) {
      const timer = setTimeout(() => {
        setHovered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hovered, expanded]);

  return (
    <SidebarContext.Provider value={{ expanded, setExpanded, toggleExpanded }}>
      <aside 
        className={cn(
          "bg-[#001524] text-white hidden md:block h-screen overflow-y-auto transition-all duration-300 ease-in-out",
          expanded || hovered ? "w-[260px]" : "w-[70px]"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={cn(
          "p-4 flex items-center space-x-3 transition-all duration-300",
          expanded || hovered ? "justify-start" : "justify-center"
        )}>
          <div className={cn(
            "font-bold text-white transition-all duration-300",
            expanded || hovered ? "text-2xl" : "text-xl"
          )}>
            {expanded || hovered ? "arbo" : "a"}
          </div>
          
          {(expanded || hovered) && (
            <button 
              onClick={toggleExpanded}
              className="ml-auto text-white opacity-60 hover:opacity-100 flex items-center justify-center transition-all duration-200"
            >
              <i className={`ri-${expanded ? 'arrow-left-s-line' : 'arrow-right-s-line'} text-lg`}></i>
            </button>
          )}
        </div>
        
        <nav className="mt-4">
          <ul className={cn(
            "space-y-1",
            expanded || hovered ? "px-2" : "px-1"
          )}>
            {navItems.map((item) => (
              <li key={item.id} className="mb-1">
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-4 py-2 text-sm rounded transition cursor-pointer",
                    expanded || hovered ? "justify-start space-x-3" : "justify-center",
                    location === item.href
                      ? "bg-[#15616D] text-white"
                      : "text-white text-opacity-80 hover:bg-[#15616D] hover:text-white"
                  )}>
                    <i className={cn(item.icon, "text-lg")}></i>
                    {(expanded || hovered) && (
                      <>
                        <span className="transition-all duration-300 whitespace-nowrap opacity-100">{item.label}</span>
                        {item.children && (
                          <i className="ri-arrow-right-s-line ml-auto"></i>
                        )}
                      </>
                    )}
                  </div>
                </Link>
                
                {(expanded || hovered) && item.children && (
                  <ul className="ml-8 mt-1 space-y-1">
                    {item.children.map((child) => (
                      <li key={child.id}>
                        <Link href={child.href}>
                          <div className={cn(
                            "flex items-center space-x-3 px-4 py-2 text-sm rounded transition cursor-pointer",
                            location === child.href
                              ? "bg-[#15616D] text-white"
                              : "text-white text-opacity-70 hover:bg-[#15616D] hover:text-white"
                          )}>
                            <i className={cn(child.icon, "text-lg")}></i>
                            <span>{child.label}</span>
                          </div>
                        </Link>
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>
    </SidebarContext.Provider>
  );
}
