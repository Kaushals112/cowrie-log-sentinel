
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import Index from "./pages/Index";
import Dashboard from "./pages/Dashboard";
import MLDashboard from "./pages/MLDashboard";
import CommandsPage from "./pages/CommandsPage";
import SessionsPage from "./pages/SessionsPage";
import SessionPage from "./pages/SessionPage";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Index />} />
          
          {/* Main routes wrapped in layout */}
          <Route path="/sessions" element={
            <Layout>
              <SessionsPage />
            </Layout>
          } />
          
          <Route path="/sessions/:sessionId" element={
            <Layout>
              <SessionPage />
            </Layout>
          } />
          
          <Route path="/threats" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-medium mb-4">Threat Analysis</h1>
                <p>Threat analysis content will appear here.</p>
              </div>
            </Layout>
          } />
          
          <Route path="/ml-dashboard" element={
            <Layout>
              <MLDashboard />
            </Layout>
          } />
          
          <Route path="/commands" element={
            <Layout>
              <CommandsPage />
            </Layout>
          } />
          
          <Route path="/attackers" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-medium mb-4">Attacker Profiles</h1>
                <p>Attacker profiles content will appear here.</p>
              </div>
            </Layout>
          } />
          
          <Route path="/logs" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-medium mb-4">Cowrie Logs</h1>
                <p>Raw Cowrie logs will appear here.</p>
              </div>
            </Layout>
          } />
          
          <Route path="/settings" element={
            <Layout>
              <div className="p-6">
                <h1 className="text-2xl font-medium mb-4">Security Settings</h1>
                <p>Security settings will appear here.</p>
              </div>
            </Layout>
          } />
          
          {/* Not found route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
