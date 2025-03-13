
import { ReactNode } from "react";
import { Sidebar } from "./Sidebar";
import { Header } from "./Header";
import { useIsMobile } from "@/hooks/use-mobile";

interface LayoutProps {
  children: ReactNode;
}

export function Layout({ children }: LayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      
      <div className={`transition-all duration-300 ml-[60px]`}>
        <Header />
        <main className="pt-[70px] min-h-screen">
          {children}
        </main>
      </div>
    </div>
  );
}
