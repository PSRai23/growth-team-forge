import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { Separator } from "@/components/ui/separator";
import { toast } from "@/hooks/use-toast";
import { Minus, Plus, Trash2, ShoppingBag, ArrowRight } from "lucide-react";

interface CartItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  product: {
    id: string;
    name: string;
    brand: string;
    base_price: number;
  };
  variant: {
    id: string;
    size: string;
    color: string;
    color_hex: string;
    price_adjustment: number;
  };
  image_url: string;
}

export default function Cart() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingItems, setUpdatingItems] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (user) {
      fetchCartItems();
    }
  }, [user]);

  const fetchCartItems = async () => {
    if (!user) return;
    
    try {
      const { data: items, error } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id);

      if (error) throw error;

      if (!items || items.length === 0) {
        setCartItems([]);
        setLoading(false);
        return;
      }

      // Fetch product and variant details for each item
      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const [productRes, variantRes, imageRes] = await Promise.all([
            supabase
              .from("products")
              .select("id, name, brand, base_price")
              .eq("id", item.product_id)
              .maybeSingle(),
            supabase
              .from("product_variants")
              .select("id, size, color, color_hex, price_adjustment")
              .eq("id", item.variant_id)
              .maybeSingle(),
            supabase
              .from("product_images")
              .select("image_url")
              .eq("product_id", item.product_id)
              .eq("is_primary", true)
              .maybeSingle(),
          ]);

          return {
            ...item,
            product: productRes.data,
            variant: variantRes.data,
            image_url: imageRes.data?.image_url || "/placeholder.svg",
          };
        })
      );

      setCartItems(enrichedItems.filter((item) => item.product && item.variant) as CartItem[]);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart items",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;

    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const { error } = await supabase
        .from("cart_items")
        .update({ quantity: newQuantity })
        .eq("id", itemId);

      if (error) throw error;

      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: newQuantity } : item
        )
      );
    } catch (error) {
      console.error("Error updating quantity:", error);
      toast({
        title: "Error",
        description: "Failed to update quantity",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const removeItem = async (itemId: string) => {
    setUpdatingItems((prev) => new Set(prev).add(itemId));

    try {
      const { error } = await supabase
        .from("cart_items")
        .delete()
        .eq("id", itemId);

      if (error) throw error;

      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      toast({
        title: "Removed",
        description: "Item removed from cart",
      });
    } catch (error) {
      console.error("Error removing item:", error);
      toast({
        title: "Error",
        description: "Failed to remove item",
        variant: "destructive",
      });
    } finally {
      setUpdatingItems((prev) => {
        const next = new Set(prev);
        next.delete(itemId);
        return next;
      });
    }
  };

  const getItemPrice = (item: CartItem) => {
    return Number(item.product.base_price) + Number(item.variant.price_adjustment || 0);
  };

  const subtotal = cartItems.reduce(
    (sum, item) => sum + getItemPrice(item) * item.quantity,
    0
  );

  const shipping = subtotal > 100 ? 0 : 9.99;
  const total = subtotal + shipping;

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-4">
          <Skeleton className="h-8 w-32" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex gap-4">
              <Skeleton className="w-24 h-24 rounded-lg" />
              <div className="flex-1 space-y-2">
                <Skeleton className="h-5 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
                <Skeleton className="h-4 w-1/4" />
              </div>
            </div>
          ))}
        </div>
      </Layout>
    );
  }

  if (cartItems.length === 0) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4 text-center">
          <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center mb-4">
            <ShoppingBag className="w-10 h-10 text-muted-foreground" />
          </div>
          <h2 className="text-xl font-display font-semibold mb-2">Your cart is empty</h2>
          <p className="text-muted-foreground mb-6">
            Discover beautiful pieces and add them to your cart
          </p>
          <Button onClick={() => navigate("/discover")} className="gap-2">
            Start Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 pb-32">
        <h1 className="text-2xl font-display font-semibold mb-6">Shopping Cart</h1>

        {/* Cart Items */}
        <div className="space-y-4 mb-8">
          {cartItems.map((item) => (
            <div
              key={item.id}
              className="flex gap-4 p-3 bg-card rounded-xl border border-border"
            >
              {/* Product Image */}
              <img
                src={item.image_url}
                alt={item.product.name}
                className="w-24 h-24 object-cover rounded-lg cursor-pointer"
                onClick={() => navigate(`/product/${item.product_id}`)}
              />

              {/* Product Details */}
              <div className="flex-1 min-w-0">
                <h3
                  className="font-medium text-foreground truncate cursor-pointer hover:text-primary transition-colors"
                  onClick={() => navigate(`/product/${item.product_id}`)}
                >
                  {item.product.name}
                </h3>
                <p className="text-sm text-muted-foreground">{item.product.brand}</p>

                {/* Variant Info */}
                <div className="flex items-center gap-2 mt-1">
                  <div
                    className="w-4 h-4 rounded-full border border-border"
                    style={{ backgroundColor: item.variant.color_hex }}
                  />
                  <span className="text-xs text-muted-foreground">
                    {item.variant.color} • {item.variant.size}
                  </span>
                </div>

                {/* Price and Quantity */}
                <div className="flex items-center justify-between mt-3">
                  <span className="font-semibold text-primary">
                    ${getItemPrice(item).toFixed(2)}
                  </span>

                  {/* Quantity Controls */}
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1 || updatingItems.has(item.id)}
                    >
                      <Minus className="w-3 h-3" />
                    </Button>
                    <span className="w-8 text-center font-medium">{item.quantity}</span>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-8 w-8"
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={updatingItems.has(item.id)}
                    >
                      <Plus className="w-3 h-3" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive hover:text-destructive hover:bg-destructive/10"
                      onClick={() => removeItem(item.id)}
                      disabled={updatingItems.has(item.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 space-y-3">
          <h3 className="font-display font-semibold text-lg">Order Summary</h3>
          <Separator />
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Subtotal ({cartItems.reduce((sum, item) => sum + item.quantity, 0)} items)</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Shipping</span>
            <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
          </div>
          
          {subtotal < 100 && (
            <p className="text-xs text-muted-foreground">
              Add ${(100 - subtotal).toFixed(2)} more for free shipping
            </p>
          )}
          
          <Separator />
          
          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Fixed Checkout Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            className="w-full h-12 text-base font-semibold gap-2"
            onClick={() => navigate("/checkout")}
          >
            Proceed to Checkout
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </Layout>
  );
}
