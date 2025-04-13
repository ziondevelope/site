import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

type NavItem = {
  href: string;
  label: string;
  icon: string;
};

const navItems: NavItem[] = [
  { href: "/", label: "Dashboard", icon: "ri-dashboard-line" },
  { href: "/imoveis", label: "Imóveis", icon: "ri-building-line" },
  { href: "/crm", label: "CRM", icon: "ri-customer-service-line" },
  { href: "/corretores", label: "Corretores", icon: "ri-user-line" },
  { href: "/site", label: "Site", icon: "ri-global-line" },
];

export default function MobileMenu() {
  const [isOpen, setIsOpen] = useState(false);
  const [location] = useLocation();

  const toggleMenu = () => setIsOpen(!isOpen);
  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Header */}
      <div className="md:hidden fixed top-0 left-0 right-0 bg-dark text-white z-10 p-4 flex justify-between items-center">
        <div className="flex items-center space-x-3">
          <div className="h-8 w-8 rounded bg-primary flex items-center justify-center text-white">
            <i className="ri-home-line"></i>
          </div>
          <h1 className="text-lg font-semibold">Imob Admin</h1>
        </div>
        <button onClick={toggleMenu} className="text-white">
          <i className="ri-menu-line text-2xl"></i>
        </button>
      </div>
      
      {/* Mobile Menu */}
      <div className={cn(
        "fixed inset-0 bg-dark text-white z-20 transform transition-transform duration-300 md:hidden",
        isOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="p-4 flex justify-between items-center border-b border-gray-700">
          <h1 className="text-lg font-semibold">Menu</h1>
          <button onClick={closeMenu} className="text-white">
            <i className="ri-close-line text-2xl"></i>
          </button>
        </div>
        
        <nav className="mt-6 px-4">
          <ul className="space-y-2">
            {navItems.map((item) => (
              <li key={item.href}>
                <Link href={item.href}>
                  <a 
                    className={cn(
                      "flex items-center space-x-3 p-3 rounded-lg transition",
                      location === item.href
                        ? "bg-primary text-white"
                        : "hover:bg-gray-700 text-white"
                    )}
                    onClick={closeMenu}
                  >
                    <i className={cn(item.icon, "text-xl")}></i>
                    <span>{item.label}</span>
                  </a>
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
    </>
  );
}
