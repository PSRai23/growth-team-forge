import { ReactNode } from "react";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

interface LayoutProps {
  children: ReactNode;
  showHeader?: boolean;
  showBottomNav?: boolean;
}

export function Layout({ children, showHeader = true, showBottomNav = true }: LayoutProps) {
  return (
    <div className="flex flex-col min-h-screen bg-background">
      {showHeader && <Header />}
      <main className="flex-1 pb-16 max-w-lg mx-auto w-full">
        {children}
      </main>
      {showBottomNav && <BottomNav />}
    </div>
  );
}
