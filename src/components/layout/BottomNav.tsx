import { Home, Search, Shirt, MessageCircle, User } from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { cn } from "@/lib/utils";

const navItems = [
  { icon: Home, label: "Home", to: "/" },
  { icon: Search, label: "Discover", to: "/discover" },
  { icon: Shirt, label: "Outfits", to: "/outfits" },
  { icon: MessageCircle, label: "Chat", to: "/chat" },
  { icon: User, label: "Profile", to: "/profile" },
];

export function BottomNav() {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-background border-t border-border">
      <div className="flex justify-around items-center h-16 max-w-lg mx-auto px-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className="flex flex-col items-center justify-center flex-1 py-2 px-1 text-muted-foreground transition-colors"
            activeClassName="text-accent"
          >
            {({ isActive }) => (
              <>
                <item.icon className={cn("h-5 w-5 mb-1", isActive && "text-accent")} />
                <span className={cn("text-xs font-ui", isActive && "font-semibold text-accent")}>
                  {item.label}
                </span>
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
