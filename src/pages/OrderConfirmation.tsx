import { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Skeleton } from "@/components/ui/skeleton";
import { CheckCircle2, Package, ArrowRight, Home } from "lucide-react";

interface Order {
  id: string;
  status: string;
  shipping_address: {
    fullName: string;
    email: string;
    phone: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    country: string;
  };
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
}

interface OrderItem {
  id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
  product: {
    name: string;
    brand: string;
  };
  variant: {
    size: string;
    color: string;
  };
}

export default function OrderConfirmation() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [order, setOrder] = useState<Order | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user && orderId) {
      fetchOrder();
    }
  }, [user, orderId]);

  const fetchOrder = async () => {
    if (!user || !orderId) return;

    try {
      // Fetch order
      const { data: orderData, error: orderError } = await supabase
        .from("orders")
        .select("*")
        .eq("id", orderId)
        .eq("user_id", user.id)
        .maybeSingle();

      if (orderError) throw orderError;

      if (!orderData) {
        navigate("/");
        return;
      }

      // Cast shipping_address from JSON
      const shippingAddr = orderData.shipping_address as unknown as Order["shipping_address"];

      setOrder({ ...orderData, shipping_address: shippingAddr } as Order);

      // Fetch order items
      const { data: items, error: itemsError } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", orderId);

      if (itemsError) throw itemsError;

      // Enrich with product/variant data
      const enrichedItems = await Promise.all(
        (items || []).map(async (item) => {
          const [productRes, variantRes] = await Promise.all([
            supabase
              .from("products")
              .select("name, brand")
              .eq("id", item.product_id)
              .maybeSingle(),
            supabase
              .from("product_variants")
              .select("size, color")
              .eq("id", item.variant_id)
              .maybeSingle(),
          ]);

          return {
            ...item,
            product: productRes.data || { name: "Unknown", brand: "Unknown" },
            variant: variantRes.data || { size: "Unknown", color: "Unknown" },
          };
        })
      );

      setOrderItems(enrichedItems as OrderItem[]);
    } catch (error) {
      console.error("Error fetching order:", error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getPaymentMethodLabel = (method: string) => {
    const labels: Record<string, string> = {
      card: "Credit Card",
      wallet: "Digital Wallet",
      bank: "Bank Transfer",
    };
    return labels[method] || method;
  };

  if (loading) {
    return (
      <Layout>
        <div className="p-4 space-y-6">
          <div className="flex flex-col items-center">
            <Skeleton className="w-16 h-16 rounded-full" />
            <Skeleton className="h-6 w-48 mt-4" />
            <Skeleton className="h-4 w-32 mt-2" />
          </div>
          <Skeleton className="h-48 w-full" />
        </div>
      </Layout>
    );
  }

  if (!order) {
    return (
      <Layout>
        <div className="flex flex-col items-center justify-center min-h-[60vh] p-4">
          <p className="text-muted-foreground">Order not found</p>
          <Button onClick={() => navigate("/")} className="mt-4">
            Go Home
          </Button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="p-4 pb-32">
        {/* Success Header */}
        <div className="flex flex-col items-center text-center py-8">
          <div className="w-20 h-20 rounded-full bg-green-100 dark:bg-green-900/30 flex items-center justify-center mb-4">
            <CheckCircle2 className="w-12 h-12 text-green-600" />
          </div>
          <h1 className="text-2xl font-display font-semibold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground">
            Thank you for your purchase. Your order has been received.
          </p>
          <p className="text-sm text-muted-foreground mt-2">
            Order #{order.id.slice(0, 8).toUpperCase()}
          </p>
        </div>

        {/* Order Details */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <Package className="w-5 h-5 text-primary" />
            <h2 className="font-display font-semibold text-lg">Order Details</h2>
          </div>

          <div className="space-y-3 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Order Date</span>
              <span>{formatDate(order.created_at)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Status</span>
              <span className="capitalize text-green-600 font-medium">{order.status}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payment Method</span>
              <span>{getPaymentMethodLabel(order.payment_method)}</span>
            </div>
          </div>
        </div>

        {/* Items */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Items Ordered</h2>

          <div className="space-y-3">
            {orderItems.map((item) => (
              <div key={item.id} className="flex justify-between text-sm py-2 border-b border-border last:border-0">
                <div>
                  <p className="font-medium">{item.product.name}</p>
                  <p className="text-muted-foreground text-xs">
                    {item.product.brand} • {item.variant.size} • {item.variant.color} × {item.quantity}
                  </p>
                </div>
                <span className="font-medium">${Number(item.total_price).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <Separator className="my-4" />

          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span>${Number(order.subtotal).toFixed(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Shipping</span>
              <span>{Number(order.shipping_cost) === 0 ? "Free" : `$${Number(order.shipping_cost).toFixed(2)}`}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Tax</span>
              <span>${Number(order.tax).toFixed(2)}</span>
            </div>
            <Separator className="my-2" />
            <div className="flex justify-between font-semibold text-base">
              <span>Total</span>
              <span className="text-primary">${Number(order.total).toFixed(2)}</span>
            </div>
          </div>
        </div>

        {/* Shipping Address */}
        <div className="bg-card rounded-xl border border-border p-4 mb-6">
          <h2 className="font-display font-semibold text-lg mb-4">Shipping Address</h2>
          <div className="text-sm space-y-1">
            <p className="font-medium">{order.shipping_address.fullName}</p>
            <p className="text-muted-foreground">{order.shipping_address.address}</p>
            <p className="text-muted-foreground">
              {order.shipping_address.city}, {order.shipping_address.state} {order.shipping_address.zipCode}
            </p>
            <p className="text-muted-foreground">{order.shipping_address.country}</p>
            <p className="text-muted-foreground mt-2">{order.shipping_address.phone}</p>
            <p className="text-muted-foreground">{order.shipping_address.email}</p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex flex-col gap-3">
          <Button onClick={() => navigate("/discover")} className="w-full gap-2">
            Continue Shopping
            <ArrowRight className="w-4 h-4" />
          </Button>
          <Button variant="outline" onClick={() => navigate("/")} className="w-full gap-2">
            <Home className="w-4 h-4" />
            Back to Home
          </Button>
        </div>
      </div>
    </Layout>
  );
}
