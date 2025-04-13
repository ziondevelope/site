import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/admin", label: "Dashboard", icon: "ri-dashboard-line" },
  { href: "/admin/imoveis", label: "Imóveis", icon: "ri-building-line" },
  { href: "/admin/crm", label: "CRM", icon: "ri-customer-service-line" },
  { href: "/admin/corretores", label: "Corretores", icon: "ri-user-line" },
  { href: "/admin/site", label: "Site", icon: "ri-global-line" },
  { href: "/", label: "Voltar ao Site", icon: "ri-arrow-left-line" },
];

export default function Sidebar() {
  const [location] = useLocation();

  return (
    <aside className="w-64 bg-dark text-white hidden md:block h-screen">
      <div className="p-4 border-b border-gray-700 flex items-center space-x-3">
        <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white">
          <i className="ri-home-line"></i>
        </div>
        <h1 className="text-lg font-semibold">Imob Admin</h1>
      </div>
      
      <nav className="mt-6 px-4">
        <ul className="space-y-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link href={item.href}>
                <div className={cn(
                  "flex items-center space-x-3 p-3 rounded-lg transition cursor-pointer",
                  location === item.href
                    ? "bg-primary text-white"
                    : "hover:bg-gray-700 text-white"
                )}>
                  <i className={cn(item.icon, "text-xl")}></i>
                  <span>{item.label}</span>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      
      <div className="absolute bottom-0 w-64 p-4 border-t border-gray-700">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-white">
            <i className="ri-user-line"></i>
          </div>
          <div>
            <p className="text-sm font-medium">João Silva</p>
            <p className="text-xs text-gray-400">Administrador</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
