import { Card } from "@/components/ui/card";
import { Heart, ShoppingCart } from "lucide-react";
import { Button } from "@/components/ui/button";

const products = [
  {
    id: 1,
    name: "Floral Summer Dress",
    brand: "Elegance Co.",
    price: 89.99,
    image: "https://images.unsplash.com/photo-1515372039744-b8f02a3ae446?w=300&h=400&fit=crop",
    rating: 4.5,
  },
  {
    id: 2,
    name: "Classic Denim Jacket",
    brand: "Urban Style",
    price: 129.99,
    image: "https://images.unsplash.com/photo-1551028719-00167b16eac5?w=300&h=400&fit=crop",
    rating: 4.8,
  },
  {
    id: 3,
    name: "Silk Evening Blouse",
    brand: "Luxe Fashion",
    price: 159.99,
    image: "https://images.unsplash.com/photo-1564584217132-2271feaeb3c5?w=300&h=400&fit=crop",
    rating: 4.6,
  },
  {
    id: 4,
    name: "High-Waist Trousers",
    brand: "Modern Fit",
    price: 79.99,
    image: "https://images.unsplash.com/photo-1506629082955-511b1aa562c8?w=300&h=400&fit=crop",
    rating: 4.7,
  },
];

export function TodaysPicks() {
  return (
    <section className="mb-8 px-4">
      <h3 className="text-lg font-serif font-semibold text-primary mb-4">
        Today's Picks for You
      </h3>
      
      <div className="grid grid-cols-2 gap-4">
        {products.map((product) => (
          <Card key={product.id} className="overflow-hidden border-border hover:shadow-lg transition-shadow">
            <div className="relative">
              <img 
                src={product.image} 
                alt={product.name}
                className="w-full h-48 object-cover"
              />
              <Button
                size="icon"
                variant="ghost"
                className="absolute top-2 right-2 bg-background/80 hover:bg-background/90 backdrop-blur-sm"
              >
                <Heart className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="p-3">
              <p className="text-xs text-muted-foreground font-ui mb-1">
                {product.brand}
              </p>
              <h4 className="text-sm font-medium text-primary mb-2 line-clamp-2">
                {product.name}
              </h4>
              
              <div className="flex items-center justify-between">
                <span className="text-lg font-semibold text-accent">
                  ${product.price}
                </span>
                <Button size="icon" variant="ghost" className="h-8 w-8">
                  <ShoppingCart className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </section>
  );
}
