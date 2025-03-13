
import { useState } from "react";
import { useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { 
  Search, 
  Bell, 
  Download,
  Shield, 
  Calendar 
} from "lucide-react";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useToast } from "@/hooks/use-toast";

export function Header() {
  const [searchQuery, setSearchQuery] = useState("");
  const { toast } = useToast();
  const location = useLocation();
  
  // Get page title based on current route
  const getPageTitle = () => {
    const path = location.pathname;
    if (path === "/") return "Dashboard";
    if (path === "/sessions") return "Sessions";
    if (path === "/threats") return "Threat Analysis";
    if (path === "/ml-dashboard") return "ML Dashboard";
    if (path === "/commands") return "Command Analysis";
    if (path === "/attackers") return "Attacker Profiles";
    if (path === "/logs") return "Cowrie Logs";
    if (path === "/settings") return "Security Settings";
    return "Cowrie Sentinel";
  };
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      toast({
        title: "Searching logs",
        description: `Searching for "${searchQuery}"`,
      });
      // Implement actual search functionality here
    }
  };
  
  const handleExport = () => {
    toast({
      title: "Export started",
      description: "Preparing log export. This may take a moment.",
    });
    // Implement actual export functionality here
  };

  return (
    <header className="h-[70px] border-b border-border bg-background/80 backdrop-blur-sm fixed top-0 right-0 left-0 z-20 ml-[60px] lg:ml-[60px]">
      <div className="flex items-center justify-between h-full px-6">
        <div className="flex items-center gap-2">
          <h1 className="text-xl font-medium">{getPageTitle()}</h1>
          <div className="ml-2 flex items-center">
            <span className="inline-flex h-2 w-2 animate-pulse rounded-full bg-cowrie-green mr-2"></span>
            <span className="text-xs text-muted-foreground">System active</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <form onSubmit={handleSearch} className="relative max-w-sm hidden md:block">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Search logs or sessions..."
              className="pl-8 w-[240px] bg-background border-border"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>
          
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Calendar className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Date range filter</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="relative" onClick={handleExport}>
                  <Download className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Export logs</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="outline" size="icon" className="relative">
                  <Bell className="h-4 w-4" />
                  <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-cowrie-red text-[10px] text-white">
                    3
                  </span>
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Notifications</p>
              </TooltipContent>
            </Tooltip>
            
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" size="icon" className="bg-cowrie-blue text-white hover:bg-cowrie-blue/90">
                  <Shield className="h-4 w-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>
                <p>Security status</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </div>
    </header>
  );
}
