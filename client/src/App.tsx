import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from "react-helmet-async";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import PropertyDetails from "@/pages/PropertyDetails";
import AllProperties from "@/pages/AllProperties";
import CRM from "@/pages/CRM";
import Clients from "@/pages/Clients";
import Agents from "@/pages/Agents";
import Website from "@/pages/Website";
import Settings from "@/pages/Settings";
import Home from "@/pages/Home";
import Contact from "@/pages/Contact";
import AuthPage from "@/pages/auth-page";
import AppLayout from "@/components/layout/AppLayout";
import { queryClient } from "./lib/queryClient";
import { LoadingProvider } from "./contexts/LoadingContext";
import { UIProvider } from "./contexts/UIContext";
import PageLoadingController from "@/components/ui/PageLoadingController";
import ScrollToTop from "@/components/ui/scroll-to-top";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import MarketingTags from "@/components/MarketingTags";
import WhatsAppChat from "@/components/website/WhatsAppChat";
import InitialSetup from "./pages/InitialSetup";


function AdminRouter() {
  const [location] = useLocation();
  let CurrentComponent = Dashboard;

  if (location.includes("/admin/imoveis")) {
    CurrentComponent = Properties;
  } else if (location.includes("/admin/crm")) {
    CurrentComponent = CRM;
  } else if (location.includes("/admin/clientes")) {
    CurrentComponent = Clients;
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
      <Route path="/contact" component={Contact} />
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
  const isInitialSetupComplete = localStorage.getItem("INITIAL_SETUP_COMPLETE") === "true";
  const [location, setLocation] = useLocation();

  if (!isInitialSetupComplete && location !== "/setup") {
    setLocation("/setup");
  }

  return (
    <>
      <Route path="/setup" component={InitialSetup} />
      <QueryClientProvider client={queryClient}>
        <HelmetProvider>
          <LoadingProvider>
            <UIProvider>
              <MarketingTags />
              <Router />
              {!location.startsWith('/admin') && <WhatsAppChat />}
              <ScrollToTop />
              <PageLoadingController />
              <Toaster />
            </UIProvider>
          </LoadingProvider>
        </HelmetProvider>
      </QueryClientProvider>
    </>
  );
}

export default App;