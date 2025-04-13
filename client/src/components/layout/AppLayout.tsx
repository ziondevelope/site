import { ReactNode } from "react";
import Sidebar from "./Sidebar";
import MobileMenu from "./MobileMenu";

interface AppLayoutProps {
  children: ReactNode;
}

export default function AppLayout({ children }: AppLayoutProps) {
  return (
    <div className="flex h-screen overflow-hidden bg-light text-dark">
      <Sidebar />
      <MobileMenu />
      
      <main className="flex-1 overflow-y-auto pt-6 md:pt-0">
        <div className="p-6 pb-16 md:mt-0 mt-14">
          {children}
        </div>
      </main>
    </div>
  );
}
