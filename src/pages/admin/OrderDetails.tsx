import { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ArrowLeft, Package, MapPin, CreditCard, Save } from "lucide-react";
import { format } from "date-fns";
import { toast } from "sonner";

interface OrderItem {
  id: string;
  product_id: string;
  variant_id: string;
  quantity: number;
  unit_price: number;
  total_price: number;
}

interface Order {
  id: string;
  user_id: string;
  status: string;
  payment_method: string;
  subtotal: number;
  shipping_cost: number;
  tax: number;
  total: number;
  created_at: string;
  updated_at: string;
  shipping_address: {
    firstName?: string;
    lastName?: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
    country?: string;
    phone?: string;
    email?: string;
  };
}

const ORDER_STATUSES = ["pending", "processing", "shipped", "delivered", "cancelled"];

export default function OrderDetails() {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [selectedStatus, setSelectedStatus] = useState<string>("");

  const { data: order, isLoading: orderLoading } = useQuery({
    queryKey: ["admin-order", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("orders")
        .select("*")
        .eq("id", id)
        .maybeSingle();
      if (error) throw error;
      if (data) setSelectedStatus(data.status);
      return data as Order | null;
    },
    enabled: !!id,
  });

  const { data: orderItems, isLoading: itemsLoading } = useQuery({
    queryKey: ["admin-order-items", id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("order_items")
        .select("*")
        .eq("order_id", id);
      if (error) throw error;
      return data as OrderItem[];
    },
    enabled: !!id,
  });

  const { data: products } = useQuery({
    queryKey: ["order-products", orderItems],
    queryFn: async () => {
      if (!orderItems?.length) return {};
      const productIds = [...new Set(orderItems.map((item) => item.product_id))];
      const { data, error } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);
      if (error) throw error;
      return Object.fromEntries(data.map((p) => [p.id, p.name]));
    },
    enabled: !!orderItems?.length,
  });

  const { data: variants } = useQuery({
    queryKey: ["order-variants", orderItems],
    queryFn: async () => {
      if (!orderItems?.length) return {};
      const variantIds = [...new Set(orderItems.map((item) => item.variant_id))];
      const { data, error } = await supabase
        .from("product_variants")
        .select("id, size, color")
        .in("id", variantIds);
      if (error) throw error;
      return Object.fromEntries(data.map((v) => [v.id, v]));
    },
    enabled: !!orderItems?.length,
  });

  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: string) => {
      const { error } = await supabase
        .from("orders")
        .update({ status: newStatus })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-order", id] });
      queryClient.invalidateQueries({ queryKey: ["admin-orders"] });
      toast.success("Order status updated successfully");
    },
    onError: () => {
      toast.error("Failed to update order status");
    },
  });

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "pending":
        return "secondary";
      case "processing":
        return "default";
      case "shipped":
        return "outline";
      case "delivered":
        return "default";
      case "cancelled":
        return "destructive";
      default:
        return "secondary";
    }
  };

  const getPaymentMethodLabel = (method: string) => {
    switch (method) {
      case "credit_card":
        return "Credit Card";
      case "debit_card":
        return "Debit Card";
      case "upi":
        return "UPI";
      case "cash_on_delivery":
        return "Cash on Delivery";
      default:
        return method;
    }
  };

  if (orderLoading || itemsLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-background">
        <header className="border-b bg-card">
          <div className="container mx-auto px-4 py-4">
            <Link to="/admin/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
          </div>
        </header>
        <main className="container mx-auto px-4 py-8 text-center">
          <p className="text-muted-foreground">Order not found</p>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin/orders">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold">Order Details</h1>
              <p className="text-muted-foreground font-mono text-sm">{order.id}</p>
            </div>
          </div>
          <Badge variant={getStatusBadgeVariant(order.status)} className="text-sm">
            {order.status}
          </Badge>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Status Update */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Package className="h-5 w-5" />
              Update Order Status
            </CardTitle>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Select value={selectedStatus} onValueChange={setSelectedStatus}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                {ORDER_STATUSES.map((status) => (
                  <SelectItem key={status} value={status}>
                    {status.charAt(0).toUpperCase() + status.slice(1)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button
              onClick={() => updateStatusMutation.mutate(selectedStatus)}
              disabled={selectedStatus === order.status || updateStatusMutation.isPending}
            >
              <Save className="h-4 w-4 mr-2" />
              Save Status
            </Button>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Order Info */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <CreditCard className="h-5 w-5" />
                Order Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Order Date</span>
                <span>{format(new Date(order.created_at), "MMM dd, yyyy 'at' h:mm a")}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Payment Method</span>
                <span>{getPaymentMethodLabel(order.payment_method)}</span>
              </div>
              <Separator />
              <div className="flex justify-between">
                <span className="text-muted-foreground">Subtotal</span>
                <span>${Number(order.subtotal).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Shipping</span>
                <span>${Number(order.shipping_cost).toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">Tax</span>
                <span>${Number(order.tax).toFixed(2)}</span>
              </div>
              <Separator />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total</span>
                <span>${Number(order.total).toFixed(2)}</span>
              </div>
            </CardContent>
          </Card>

          {/* Shipping Address */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <MapPin className="h-5 w-5" />
                Shipping Address
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <p className="font-medium">
                {order.shipping_address?.firstName} {order.shipping_address?.lastName}
              </p>
              <p className="text-muted-foreground">{order.shipping_address?.address}</p>
              <p className="text-muted-foreground">
                {order.shipping_address?.city}, {order.shipping_address?.state}{" "}
                {order.shipping_address?.zipCode}
              </p>
              <p className="text-muted-foreground">{order.shipping_address?.country}</p>
              {order.shipping_address?.phone && (
                <p className="text-muted-foreground mt-4">
                  Phone: {order.shipping_address.phone}
                </p>
              )}
              {order.shipping_address?.email && (
                <p className="text-muted-foreground">Email: {order.shipping_address.email}</p>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Order Items */}
        <Card>
          <CardHeader>
            <CardTitle>Order Items ({orderItems?.length ?? 0})</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {orderItems?.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div>
                    <p className="font-medium">{products?.[item.product_id] ?? "Unknown Product"}</p>
                    <p className="text-sm text-muted-foreground">
                      {variants?.[item.variant_id]?.color} / {variants?.[item.variant_id]?.size}
                    </p>
                    <p className="text-sm text-muted-foreground">Qty: {item.quantity}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">${Number(item.total_price).toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">
                      ${Number(item.unit_price).toFixed(2)} each
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
