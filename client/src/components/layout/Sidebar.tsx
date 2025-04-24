import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect, useRef } from "react";

type NavItem = {
  id: string;
  href: string;
  label: string;
  icon: string;
  children?: NavItem[];
};

const navItems: NavItem[] = [
  { id: "home", href: "/admin", label: "Página Inicial", icon: "ri-home-line" },
  { id: "leads", href: "/admin/crm", label: "Leads", icon: "ri-user-heart-line" },
  { id: "clients", href: "/admin/clientes", label: "Clientes", icon: "ri-user-star-line" },
  { id: "properties", href: "/admin/imoveis", label: "Imóveis", icon: "ri-building-line" },
  { id: "agents", href: "/admin/corretores", label: "Corretores", icon: "ri-team-line" },
  { id: "settings", href: "/admin/configuracoes", label: "Configurações", icon: "ri-settings-line" },
  { id: "website", href: "/admin/site", label: "Site", icon: "ri-global-line" },
  { id: "back", href: "/", label: "Voltar ao Site", icon: "ri-arrow-left-line" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  
  // Variável para rastrear quando o usuário está realmente interagindo com o menu
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
  
  // Função para lidar com o hover com um pequeno atraso de entrada e saída
  const handleMouseEnter = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Pequeno atraso para entrar, evita expansões acidentais em movimentos rápidos do mouse
    hoverTimeoutRef.current = setTimeout(() => {
      setHovered(true);
    }, 30); // Reduzido para tornar mais responsivo
  };
  
  const handleMouseLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    
    // Atraso maior para sair, dá mais tempo para o usuário interagir
    hoverTimeoutRef.current = setTimeout(() => {
      setHovered(false);
    }, 500); // Aumentado para dar mais tempo
  };
  
  // Atualizar a posição do mouse para animações mais suaves
  const handleMouseMove = (e: React.MouseEvent) => {
    setMousePosition({ 
      x: e.clientX, 
      y: e.clientY 
    });
  };
  
  // Limpar os timeouts quando o componente é desmontado
  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) {
        clearTimeout(hoverTimeoutRef.current);
      }
    };
  }, []);

  return (
    <aside 
      className={cn(
        "bg-[#001524] text-white hidden md:block h-screen overflow-y-auto fixed top-0 left-0 z-40",
        "transition-all duration-300",
        hovered ? "w-[260px]" : "w-[70px]"
      )}
      style={{
        transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
      }}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      onMouseMove={handleMouseMove}
    >
      <div className={cn(
        "p-4 flex items-center gap-3",
        "transition-all duration-300",
        hovered ? "justify-start" : "justify-center"
      )}>
        <div className={cn(
          "font-extrabold text-white font-asap",
          "transition-all duration-300",
          hovered ? "text-2xl" : "text-xl"
        )}
        style={{
          fontFamily: "Asap, sans-serif",
          fontWeight: 800,
          letterSpacing: "0.03em",
          transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
        }}>
          {hovered ? "zimob" : "z"}
        </div>
      </div>
      
      <nav className="mt-4">
        <ul className={cn(
          "space-y-1",
          hovered ? "px-2" : "px-1",
          "transition-all duration-300"
        )}
        style={{
          transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
        }}>
          {navItems.map((item) => (
            <li key={item.id} className="mb-1">
              <Link href={item.href}>
                <div className={cn(
                  "flex items-center px-4 py-2 text-sm rounded cursor-pointer",
                  "transition-all duration-300",
                  hovered ? "justify-start gap-3" : "justify-center",
                  location === item.href
                    ? "bg-[#15616D] text-white"
                    : "text-white text-opacity-80 hover:bg-[#15616D] hover:text-white"
                )}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
                }}>
                  <i className={cn(
                    item.icon, 
                    "text-lg transition-all duration-300",
                    hovered ? "" : "transform scale-110"
                  )}
                  style={{
                    // Adiciona um movimento suave ao ícone
                    transform: hovered 
                      ? "translateX(0)" 
                      : "translateX(0) scale(1.1)",
                    transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
                  }}></i>
                  
                  {/* Animação de opacidade e largura para labels */}
                  <div 
                    className={cn(
                      "whitespace-nowrap overflow-hidden transition-all duration-300",
                      hovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                    )}
                    style={{
                      transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)",
                      transform: hovered ? "translateX(0)" : "translateX(-5px)",
                      transitionDelay: hovered ? "50ms" : "0ms"
                    }}
                  >
                    <span>{item.label}</span>
                    {item.children && (
                      <i className="ri-arrow-right-s-line ml-auto"></i>
                    )}
                  </div>
                </div>
              </Link>
              
              {hovered && item.children && (
                <ul className={cn(
                  "ml-8 mt-1 space-y-1",
                  "transition-all duration-300"
                )}
                style={{
                  transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
                }}>
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link href={child.href}>
                        <div className={cn(
                          "flex items-center gap-3 px-4 py-2 text-sm rounded transition-all duration-300 cursor-pointer",
                          location === child.href
                            ? "bg-[#15616D] text-white"
                            : "text-white text-opacity-70 hover:bg-[#15616D] hover:text-white"
                        )}
                        style={{
                          transitionTimingFunction: "cubic-bezier(0.25, 0.1, 0.25, 1)"
                        }}>
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
  );
}
