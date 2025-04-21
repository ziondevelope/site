import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import AllProperties from "@/pages/AllProperties";
import CRM from "@/pages/CRM";
import Agents from "@/pages/Agents";
import Website from "@/pages/Website";
import Settings from "@/pages/Settings";
import Home from "@/pages/Home";
import AuthPage from "@/pages/auth-page";
import AppLayout from "@/components/layout/AppLayout";
import { queryClient } from "./lib/queryClient";
import { LoadingProvider } from "./contexts/LoadingContext";
import PageLoadingController from "@/components/ui/PageLoadingController";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

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
  } else if (location.includes("/admin/configuracoes")) {
    CurrentComponent = Settings;
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
      <Route path="/properties" component={AllProperties} />
      <Route path="/properties/:id" component={PropertyDetails} />
      <Route path="/auth" component={AuthPage} />
      <Route path="/admin">
        <ProtectedRoute component={AdminRouter} />
      </Route>
      <Route path="/admin/:path*">
        <ProtectedRoute component={AdminRouter} />
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <LoadingProvider>
        <Router />
        <ScrollToTop />
        <PageLoadingController />
        <Toaster />
      </LoadingProvider>
    </QueryClientProvider>
  );
}

export default App;
