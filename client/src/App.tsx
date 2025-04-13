import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import CRM from "@/pages/CRM";
import Agents from "@/pages/Agents";
import Website from "@/pages/Website";
import AppLayout from "@/components/layout/AppLayout";
import { queryClient } from "./lib/queryClient";

function Router() {
  const [location] = useLocation();
  
  return (
    <AppLayout>
      <Switch>
        <Route path="/" component={Dashboard} />
        <Route path="/imoveis" component={Properties} />
        <Route path="/crm" component={CRM} />
        <Route path="/corretores" component={Agents} />
        <Route path="/site" component={Website} />
        <Route component={NotFound} />
      </Switch>
    </AppLayout>
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
