import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

interface ProductCardProps {
  id: string;
  name: string;
  brand: string;
  price: number;
  imageUrl: string;
  category?: string;
  isNew?: boolean;
}

export function ProductCard({ id, name, brand, price, imageUrl, category, isNew }: ProductCardProps) {
  const [isFavorite, setIsFavorite] = useState(false);
  const navigate = useNavigate();

  return (
    <Card 
      className="group overflow-hidden transition-all hover:shadow-lg cursor-pointer"
      onClick={() => navigate(`/product/${id}`)}
    >
      <div className="relative aspect-[3/4] overflow-hidden bg-muted">
        <img 
          src={imageUrl} 
          alt={name}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
        <Button
          size="icon"
          variant="ghost"
          className="absolute top-2 right-2 bg-background/80 hover:bg-background"
          onClick={(e) => {
            e.preventDefault();
            setIsFavorite(!isFavorite);
          }}
        >
          <Heart className={isFavorite ? "fill-primary text-primary" : ""} />
        </Button>
        {isNew && (
          <Badge className="absolute top-2 left-2 bg-accent text-accent-foreground">
            New
          </Badge>
        )}
      </div>
      <CardContent className="p-4">
        <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">{brand}</p>
        <h3 className="font-medium text-foreground line-clamp-2 mb-2">{name}</h3>
        {category && (
          <p className="text-xs text-muted-foreground mb-2">{category}</p>
        )}
        <p className="text-lg font-semibold text-primary">${price.toFixed(2)}</p>
      </CardContent>
      <CardFooter className="p-4 pt-0">
        <Button className="w-full" size="sm">
          <ShoppingCart className="mr-2 h-4 w-4" />
          Add to Cart
        </Button>
      </CardFooter>
    </Card>
  );
}
