import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

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
  { id: "owners", href: "/admin/proprietarios", label: "Proprietários", icon: "ri-user-star-line" },
  { id: "website", href: "/admin/site", label: "Site", icon: "ri-global-line" },
  { id: "back", href: "/", label: "Voltar ao Site", icon: "ri-arrow-left-line" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-[260px] bg-indigo-700 text-white hidden md:block h-screen overflow-y-auto">
      <div className="p-4 flex items-center space-x-3">
        <div className="text-2xl font-bold text-white">arbo</div>
      </div>
      
      <nav className="mt-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.id} className="mb-1">
              <Link href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 px-4 py-2 text-sm rounded transition cursor-pointer",
                  location === item.href
                    ? "bg-indigo-800 text-white"
                    : "text-white text-opacity-80 hover:bg-indigo-800 hover:text-white"
                )}>
                  <i className={cn(item.icon, "text-lg")}></i>
                  <span>{item.label}</span>
                  {item.children && (
                    <i className="ri-arrow-right-s-line ml-auto"></i>
                  )}
                </div>
              </Link>
              
              {item.children && (
                <ul className="ml-8 mt-1 space-y-1">
                  {item.children.map((child) => (
                    <li key={child.id}>
                      <Link href={child.href}>
                        <div className={cn(
                          "flex items-center space-x-3 px-4 py-2 text-sm rounded transition cursor-pointer",
                          location === child.href
                            ? "bg-indigo-800 text-white"
                            : "text-white text-opacity-70 hover:bg-indigo-800 hover:text-white"
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
  );
}
