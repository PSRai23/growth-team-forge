import { Layout } from "@/components/layout/Layout";
import { useWishlist } from "@/hooks/useWishlist";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Heart, ShoppingCart, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { Skeleton } from "@/components/ui/skeleton";

export default function Wishlist() {
  const { user } = useAuth();
  const { wishlistItems, isLoading, removeFromWishlist } = useWishlist();
  const navigate = useNavigate();

  if (!user) {
    return (
      <Layout>
        <div className="px-4 py-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif mb-2">Your Wishlist</h1>
          <p className="text-muted-foreground mb-4">
            Sign in to save your favorite items
          </p>
          <Button onClick={() => navigate("/auth")}>Sign In</Button>
        </div>
      </Layout>
    );
  }

  if (isLoading) {
    return (
      <Layout>
        <div className="px-4 py-6">
          <h1 className="text-2xl font-serif mb-6">My Wishlist</h1>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-64 rounded-lg" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  if (wishlistItems.length === 0) {
    return (
      <Layout>
        <div className="px-4 py-12 text-center">
          <Heart className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
          <h1 className="text-2xl font-serif mb-2">Your Wishlist is Empty</h1>
          <p className="text-muted-foreground mb-4">
            Start saving items you love
          </p>
          <Button onClick={() => navigate("/discover")}>
            Discover Products
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6">
        <h1 className="text-2xl font-serif mb-6">
          My Wishlist ({wishlistItems.length})
        </h1>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {wishlistItems.map((item) => {
            const product = item.products as any;
            const primaryImage = product?.product_images?.find(
              (img: any) => img.is_primary
            ) || product?.product_images?.[0];

            return (
              <Card
                key={item.id}
                className="group overflow-hidden cursor-pointer"
                onClick={() => navigate(`/product/${product?.id}`)}
              >
                <div className="relative aspect-[3/4] overflow-hidden bg-muted">
                  <img
                    src={primaryImage?.image_url || "/placeholder.svg"}
                    alt={product?.name}
                    className="h-full w-full object-cover transition-transform group-hover:scale-105"
                  />
                </div>
                <CardContent className="p-4">
                  <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">
                    {product?.brand}
                  </p>
                  <h3 className="font-medium text-foreground line-clamp-2 mb-2">
                    {product?.name}
                  </h3>
                  <p className="text-lg font-semibold text-primary mb-3">
                    ${product?.base_price?.toFixed(2)}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      size="sm"
                      className="flex-1"
                      onClick={(e) => {
                        e.stopPropagation();
                        navigate(`/product/${product?.id}`);
                      }}
                    >
                      <ShoppingCart className="mr-2 h-4 w-4" />
                      View
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFromWishlist.mutate(item.product_id);
                      }}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </Layout>
  );
}
