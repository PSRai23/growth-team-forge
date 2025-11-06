import { Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export function WelcomeBanner() {
  const navigate = useNavigate();

  return (
    <div className="bg-gradient-to-r from-secondary to-accent/20 p-6 rounded-xl mb-6">
      <h2 className="text-2xl font-serif font-bold text-primary mb-2">
        Welcome Back!
      </h2>
      <p className="text-sm text-primary/80 mb-4">
        Ready to discover your perfect style today?
      </p>
      <Button 
        onClick={() => navigate("/chat")}
        className="bg-accent hover:bg-accent/90 text-accent-foreground font-ui gap-2"
      >
        <Sparkles className="h-4 w-4" />
        Quick Style Check
      </Button>
    </div>
  );
}
