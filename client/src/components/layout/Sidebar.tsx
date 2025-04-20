import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useState, useEffect } from "react";

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
  { id: "properties", href: "/admin/imoveis", label: "Imóveis", icon: "ri-building-line" },
  { id: "agents", href: "/admin/corretores", label: "Corretores", icon: "ri-team-line" },
  { id: "settings", href: "/admin/configuracoes", label: "Configurações", icon: "ri-settings-line" },
  { id: "website", href: "/admin/site", label: "Site", icon: "ri-global-line" },
  { id: "back", href: "/", label: "Voltar ao Site", icon: "ri-arrow-left-line" },
];

export default function Sidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);

  useEffect(() => {
    // Se o mouse saiu, recolhe o menu após um pequeno delay
    if (!hovered) {
      const timer = setTimeout(() => {
        setHovered(false);
      }, 300);
      return () => clearTimeout(timer);
    }
  }, [hovered]);

  return (
      <aside 
        className={cn(
          "bg-[#001524] text-white hidden md:block h-screen overflow-y-auto transition-all duration-500 ease-in-out",
          hovered ? "w-[260px]" : "w-[70px]"
        )}
        onMouseEnter={() => setHovered(true)}
        onMouseLeave={() => setHovered(false)}
      >
        <div className={cn(
          "p-4 flex items-center transition-all duration-500 ease-in-out",
          hovered ? "justify-between" : "justify-end"
        )}>
          <div className={cn(
            "font-bold text-white transition-all duration-500 ease-in-out",
            hovered ? "text-2xl mr-auto" : "text-xl"
          )}>
            {hovered ? "arbo" : "a"}
          </div>
        </div>
        
        <nav className="mt-4">
          <ul className={cn(
            "space-y-1",
            hovered ? "px-2" : "px-1"
          )}>
            {navItems.map((item) => (
              <li key={item.id} className="mb-1">
                <Link href={item.href}>
                  <div className={cn(
                    "flex items-center px-4 py-2 text-sm rounded transition-all duration-500 ease-in-out cursor-pointer",
                    hovered ? "justify-start space-x-3" : "justify-center",
                    location === item.href
                      ? "bg-[#15616D] text-white"
                      : "text-white text-opacity-80 hover:bg-[#15616D] hover:text-white"
                  )}>
                    <i className={cn(item.icon, "text-lg transition-transform duration-500 ease-in-out", hovered ? "" : "transform scale-110")}></i>
                    <div 
                      className={cn(
                        "overflow-hidden transition-all duration-500 ease-in-out flex-1 flex",
                        hovered ? "max-w-[200px] opacity-100" : "max-w-0 opacity-0"
                      )}
                    >
                      <span className="whitespace-nowrap ml-3">{item.label}</span>
                      {item.children && (
                        <i className="ri-arrow-right-s-line ml-auto"></i>
                      )}
                    </div>
                  </div>
                </Link>
                
                {hovered && item.children && (
                  <ul className="ml-8 mt-1 space-y-1 overflow-hidden animate-fadeIn">
                    {item.children.map((child) => (
                      <li key={child.id} className="animate-slideRight">
                        <Link href={child.href}>
                          <div className={cn(
                            "flex items-center space-x-3 px-4 py-2 text-sm rounded transition-all duration-300 ease-in-out cursor-pointer",
                            location === child.href
                              ? "bg-[#15616D] text-white"
                              : "text-white text-opacity-70 hover:bg-[#15616D] hover:text-white"
                          )}>
                            <i className={cn(child.icon, "text-lg")}></i>
                            <span className="transition-all duration-300 ease-in-out">{child.label}</span>
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
