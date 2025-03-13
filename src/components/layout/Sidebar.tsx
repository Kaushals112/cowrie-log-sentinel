
import { useEffect, useState } from "react";
import { NavLink, useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { 
  BarChart3, 
  Activity, 
  Database, 
  Shield, 
  Terminal, 
  Brain, 
  Menu, 
  X, 
  ChevronRight,
  AlertTriangle,
  GitPullRequest,
  Users
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useIsMobile } from "@/hooks/use-mobile";

interface SidebarProps {
  className?: string;
}

export function Sidebar({ className }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const isMobile = useIsMobile();
  
  useEffect(() => {
    // Auto-collapse on mobile
    if (isMobile) {
      setCollapsed(true);
    }
  }, [isMobile]);
  
  // Close sidebar when navigating on mobile
  useEffect(() => {
    if (isMobile) {
      setCollapsed(true);
    }
  }, [location.pathname, isMobile]);

  return (
    <>
      {/* Mobile overlay */}
      {!collapsed && isMobile && (
        <div 
          className="fixed inset-0 bg-black/40 backdrop-blur-sm z-30"
          onClick={() => setCollapsed(true)}
        />
      )}
    
      {/* Sidebar */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full bg-sidebar z-40 border-r border-sidebar-border transition-all duration-300 ease-in-out",
          collapsed ? "w-[60px]" : "w-[250px]",
          isMobile && collapsed && "-translate-x-full",
          className
        )}
      >
        <div className="flex flex-col h-full">
          {/* Header */}
          <div className="h-[70px] border-b border-sidebar-border flex items-center px-4 justify-between">
            {!collapsed && (
              <h1 className="text-xl font-semibold text-sidebar-foreground">Cowrie Sentinel</h1>
            )}
            <Button 
              variant="ghost" 
              size="icon" 
              className="text-sidebar-foreground" 
              onClick={() => setCollapsed(!collapsed)}
            >
              {isMobile && !collapsed ? <X size={20} /> : <Menu size={20} />}
            </Button>
          </div>
          
          {/* Navigation */}
          <nav className="flex-1 py-5 overflow-y-auto flex flex-col">
            <div className="px-3 pb-2">
              <p className={cn(
                "text-xs text-sidebar-foreground/60 font-medium px-3 mb-2 transition-opacity duration-200",
                collapsed && "opacity-0"
              )}>
                DASHBOARD
              </p>
              <div className="space-y-1">
                <SidebarLink to="/" icon={Activity} label="Overview" collapsed={collapsed} />
                <SidebarLink to="/sessions" icon={Database} label="Sessions" collapsed={collapsed} />
                <SidebarLink to="/threats" icon={AlertTriangle} label="Threats" collapsed={collapsed} />
              </div>
            </div>
            
            <div className="px-3 py-2 mt-4">
              <p className={cn(
                "text-xs text-sidebar-foreground/60 font-medium px-3 mb-2 transition-opacity duration-200",
                collapsed && "opacity-0"
              )}>
                ML ANALYSIS
              </p>
              <div className="space-y-1">
                <SidebarLink to="/ml-dashboard" icon={Brain} label="ML Dashboard" collapsed={collapsed} />
                <SidebarLink to="/commands" icon={Terminal} label="Command Analysis" collapsed={collapsed} />
                <SidebarLink to="/attackers" icon={Users} label="Attacker Profiles" collapsed={collapsed} />
              </div>
            </div>
            
            <div className="px-3 py-2 mt-4">
              <p className={cn(
                "text-xs text-sidebar-foreground/60 font-medium px-3 mb-2 transition-opacity duration-200",
                collapsed && "opacity-0"
              )}>
                SYSTEM
              </p>
              <div className="space-y-1">
                <SidebarLink to="/logs" icon={GitPullRequest} label="Cowrie Logs" collapsed={collapsed} />
                <SidebarLink to="/settings" icon={Shield} label="Security" collapsed={collapsed} />
              </div>
            </div>
          </nav>
          
          {/* Footer */}
          <div className="h-[60px] border-t border-sidebar-border flex items-center px-4">
            <Button
              variant="outline"
              size="sm"
              className={cn(
                "w-full bg-sidebar-accent border-none text-sidebar-foreground hover:bg-sidebar-accent/80 transition-all duration-200",
                collapsed && "px-2"
              )}
            >
              {collapsed ? (
                <BarChart3 size={18} />
              ) : (
                <>
                  <BarChart3 size={18} className="mr-2" />
                  <span>Live Monitor</span>
                </>
              )}
            </Button>
          </div>
        </div>
      </aside>
      
      {/* Toggle button for larger screens */}
      {!isMobile && (
        <button
          className={cn(
            "fixed z-50 top-[85px] bg-sidebar text-sidebar-foreground rounded-r-md p-1 transition-all duration-300",
            collapsed ? "left-[60px]" : "left-[250px]"
          )}
          onClick={() => setCollapsed(!collapsed)}
        >
          <ChevronRight
            size={18}
            className={cn(
              "transition-transform duration-300",
              !collapsed && "rotate-180"
            )}
          />
        </button>
      )}
    </>
  );
}

interface SidebarLinkProps {
  to: string;
  icon: React.ElementType;
  label: string;
  collapsed: boolean;
}

function SidebarLink({ to, icon: Icon, label, collapsed }: SidebarLinkProps) {
  return (
    <NavLink
      to={to}
      className={({ isActive }) => cn(
        "sidebar-link group",
        isActive && "active"
      )}
    >
      <Icon size={20} />
      <span className={cn(
        "transition-all duration-200",
        collapsed && "opacity-0 invisible w-0"
      )}>
        {label}
      </span>
    </NavLink>
  );
}
