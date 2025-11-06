import { Search, Bell, User } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useNavigate } from "react-router-dom";

export function Header() {
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-40 bg-background border-b border-border">
      <div className="flex items-center justify-between h-16 px-4 max-w-lg mx-auto">
        <h1 className="text-xl font-serif font-bold text-primary">
          Samarasa
        </h1>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="ghost" 
            size="icon"
            onClick={() => navigate("/search")}
            className="text-muted-foreground hover:text-primary"
          >
            <Search className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="ghost" 
            size="icon"
            className="text-muted-foreground hover:text-primary"
          >
            <Bell className="h-5 w-5" />
          </Button>
          
          <Avatar 
            className="h-8 w-8 cursor-pointer border-2 border-accent"
            onClick={() => navigate("/profile")}
          >
            <AvatarImage src="" />
            <AvatarFallback className="bg-secondary text-primary">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    </header>
  );
}
