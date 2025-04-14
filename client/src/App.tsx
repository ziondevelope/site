import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import CRM from "@/pages/CRM";
import Agents from "@/pages/Agents";
import Website from "@/pages/Website";
import Home from "@/pages/Home";
import AppLayout from "@/components/layout/AppLayout";
import { queryClient } from "./lib/queryClient";

function AdminRouter() {
  // Usando useLocation para determinar a rota atual
  const [location] = useLocation();
  
  // Componente padrão é Dashboard
  let CurrentComponent = Dashboard;
  
  // Seleciona o componente baseado na URL atual
  if (location.includes("/admin/imoveis")) {
    CurrentComponent = Properties;
  } else if (location.includes("/admin/crm")) {
    CurrentComponent = CRM;
  } else if (location.includes("/admin/corretores")) {
    CurrentComponent = Agents;
  } else if (location.includes("/admin/site")) {
    CurrentComponent = Website;
  } else if (location !== "/admin") {
    CurrentComponent = NotFound;
  }
  
  return (
    <AppLayout>
      <CurrentComponent />
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/admin" component={AdminRouter} />
      <Route path="/admin/:path*" component={AdminRouter} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
