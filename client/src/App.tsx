import { Switch, Route, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import Dashboard from "@/pages/Dashboard";
import Properties from "@/pages/Properties";
import CRM from "@/pages/CRM";
import Agents from "@/pages/Agents";
import Website from "@/pages/Website";
import Home from "@/pages/Home";
import AppLayout from "@/components/layout/AppLayout";
import { queryClient } from "./lib/queryClient";

function AdminRouter() {
  const [location] = useLocation();
  
  return (
    <AppLayout>
      <Switch>
        <Route path="/admin" component={Dashboard} />
        <Route path="/admin/imoveis" component={Properties} />
        <Route path="/admin/crm" component={CRM} />
        <Route path="/admin/corretores" component={Agents} />
        <Route path="/admin/site" component={Website} />
        <Route path="/admin/*" component={NotFound} />
      </Switch>
    </AppLayout>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/admin/*" component={AdminRouter} />
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
