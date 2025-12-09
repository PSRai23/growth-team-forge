import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "@/hooks/use-toast";
import { ArrowLeft, CreditCard, Wallet, Building2, Check } from "lucide-react";
import type { Json } from "@/integrations/supabase/types";

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
    price_adjustment: number;
  };
}

interface ShippingAddress {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

const paymentMethods = [
  { id: "card", name: "Credit Card", icon: CreditCard, description: "Visa, Mastercard, Amex" },
  { id: "wallet", name: "Digital Wallet", icon: Wallet, description: "Apple Pay, Google Pay" },
  { id: "bank", name: "Bank Transfer", icon: Building2, description: "Direct bank transfer" },
];

export default function Checkout() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState("card");
  const [shippingAddress, setShippingAddress] = useState<ShippingAddress>({
    fullName: "",
    email: user?.email || "",
    phone: "",
    address: "",
    city: "",
    state: "",
    zipCode: "",
    country: "United States",
  });

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
        navigate("/cart");
        return;
      }

      const enrichedItems = await Promise.all(
        items.map(async (item) => {
          const [productRes, variantRes] = await Promise.all([
            supabase
              .from("products")
              .select("id, name, brand, base_price")
              .eq("id", item.product_id)
              .maybeSingle(),
            supabase
              .from("product_variants")
              .select("id, size, color, price_adjustment")
              .eq("id", item.variant_id)
              .maybeSingle(),
          ]);

          return {
            ...item,
            product: productRes.data,
            variant: variantRes.data,
          };
        })
      );

      setCartItems(enrichedItems.filter((item) => item.product && item.variant) as CartItem[]);
    } catch (error) {
      console.error("Error fetching cart items:", error);
      toast({
        title: "Error",
        description: "Failed to load cart",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
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
  const tax = subtotal * 0.08;
  const total = subtotal + shipping + tax;

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setShippingAddress((prev) => ({ ...prev, [name]: value }));
  };

  const validateForm = () => {
    const required = ["fullName", "email", "phone", "address", "city", "state", "zipCode"];
    for (const field of required) {
      if (!shippingAddress[field as keyof ShippingAddress]?.trim()) {
        toast({
          title: "Missing Information",
          description: `Please fill in your ${field.replace(/([A-Z])/g, " $1").toLowerCase()}`,
          variant: "destructive",
        });
        return false;
      }
    }
    return true;
  };

  const handlePlaceOrder = async () => {
    if (!validateForm() || !user) return;

    setSubmitting(true);

    try {
      // Create the order
      const { data: order, error: orderError } = await supabase
        .from("orders")
        .insert({
          user_id: user.id,
          shipping_address: JSON.parse(JSON.stringify(shippingAddress)) as Json,
          payment_method: paymentMethod,
          subtotal,
          shipping_cost: shipping,
          tax,
          total,
          status: "confirmed",
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = cartItems.map((item) => ({
        order_id: order.id,
        product_id: item.product_id,
        variant_id: item.variant_id,
        quantity: item.quantity,
        unit_price: getItemPrice(item),
        total_price: getItemPrice(item) * item.quantity,
      }));

      const { error: itemsError } = await supabase
        .from("order_items")
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Clear the cart
      const { error: clearError } = await supabase
        .from("cart_items")
        .delete()
        .eq("user_id", user.id);

      if (clearError) throw clearError;

      // Navigate to confirmation
      navigate(`/order-confirmation/${order.id}`);
    } catch (error) {
      console.error("Error placing order:", error);
      toast({
        title: "Error",
        description: "Failed to place order. Please try again.",
        variant: "destructive",
      });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-6">
          <Skeleton className="h-8 w-32" />
          <div className="space-y-4">
            {[1, 2, 3, 4].map((i) => (
              <Skeleton key={i} className="h-12 w-full" />
            ))}
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 pb-32">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Button variant="ghost" size="icon" onClick={() => navigate("/cart")}>
            <ArrowLeft className="w-5 h-5" />
          </Button>
          <h1 className="text-2xl font-display font-semibold">Checkout</h1>
        </div>

        {/* Shipping Address Form */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Shipping Address</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input
                  id="fullName"
                  name="fullName"
                  value={shippingAddress.fullName}
                  onChange={handleInputChange}
                  placeholder="John Doe"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  value={shippingAddress.email}
                  onChange={handleInputChange}
                  placeholder="john@example.com"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="phone">Phone</Label>
                <Input
                  id="phone"
                  name="phone"
                  value={shippingAddress.phone}
                  onChange={handleInputChange}
                  placeholder="(555) 123-4567"
                  className="mt-1"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="address">Street Address</Label>
              <Input
                id="address"
                name="address"
                value={shippingAddress.address}
                onChange={handleInputChange}
                placeholder="123 Main Street, Apt 4B"
                className="mt-1"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  value={shippingAddress.city}
                  onChange={handleInputChange}
                  placeholder="New York"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="state">State</Label>
                <Input
                  id="state"
                  name="state"
                  value={shippingAddress.state}
                  onChange={handleInputChange}
                  placeholder="NY"
                  className="mt-1"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="zipCode">ZIP Code</Label>
                <Input
                  id="zipCode"
                  name="zipCode"
                  value={shippingAddress.zipCode}
                  onChange={handleInputChange}
                  placeholder="10001"
                  className="mt-1"
                />
              </div>
              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  name="country"
                  value={shippingAddress.country}
                  onChange={handleInputChange}
                  placeholder="United States"
                  className="mt-1"
                  disabled
                />
              </div>
            </div>
          </div>
        </div>

        {/* Payment Method */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Payment Method</h2>
          
          <RadioGroup value={paymentMethod} onValueChange={setPaymentMethod} className="space-y-3">
            {paymentMethods.map((method) => (
              <div
                key={method.id}
                className={`flex items-center gap-4 p-4 rounded-lg border transition-colors cursor-pointer ${
                  paymentMethod === method.id
                    ? "border-primary bg-primary/5"
                    : "border-border hover:border-muted-foreground/50"
                }`}
                onClick={() => setPaymentMethod(method.id)}
              >
                <RadioGroupItem value={method.id} id={method.id} />
                <method.icon className="w-5 h-5 text-muted-foreground" />
                <div className="flex-1">
                  <Label htmlFor={method.id} className="font-medium cursor-pointer">
                    {method.name}
                  </Label>
                  <p className="text-sm text-muted-foreground">{method.description}</p>
                </div>
                {paymentMethod === method.id && (
                  <Check className="w-5 h-5 text-primary" />
                )}
              </div>
            ))}
          </RadioGroup>
        </div>

        {/* Order Summary */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Order Summary</h2>
          
          <div className="space-y-3 mb-4">
            {cartItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {item.product.name} ({item.variant.size}, {item.variant.color}) × {item.quantity}
                </span>
                <span>${(getItemPrice(item) * item.quantity).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${subtotal.toFixed(2)}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Shipping</span>
              <span>{shipping === 0 ? <span className="text-green-600">Free</span> : `$${shipping.toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Tax (8%)</span>
              <span>${tax.toFixed(2)}</span>
            </div>
          </div>

          <Separator className="my-4" />

          <div className="flex justify-between font-semibold text-lg">
            <span>Total</span>
            <span className="text-primary">${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Place Order Button */}
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background border-t border-border">
          <Button
            className="w-full h-12 text-base font-semibold"
            onClick={handlePlaceOrder}
            disabled={submitting}
          >
            {submitting ? "Processing..." : `Place Order • $${total.toFixed(2)}`}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
