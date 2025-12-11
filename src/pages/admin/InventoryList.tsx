import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Link } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Save, AlertTriangle } from "lucide-react";
import { toast } from "sonner";

interface InventoryItem {
  id: string;
  variant_id: string;
  quantity: number;
  reserved_quantity: number;
  low_stock_threshold: number | null;
  variant?: {
    id: string;
    sku: string;
    size: string;
    color: string;
    product?: {
      id: string;
      name: string;
    };
  };
}

export default function InventoryList() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<{
    quantity: number;
    low_stock_threshold: number;
  }>({ quantity: 0, low_stock_threshold: 10 });

  const { data: inventory, isLoading } = useQuery({
    queryKey: ["admin-inventory"],
    queryFn: async () => {
      // First get inventory
      const { data: inventoryData, error: invError } = await supabase
        .from("inventory")
        .select("*")
        .order("updated_at", { ascending: false });

      if (invError) throw invError;

      // Then get variants with products
      const variantIds = inventoryData.map((i) => i.variant_id);
      const { data: variantsData, error: varError } = await supabase
        .from("product_variants")
        .select("id, sku, size, color, product_id")
        .in("id", variantIds);

      if (varError) throw varError;

      // Get products
      const productIds = [...new Set(variantsData.map((v) => v.product_id))];
      const { data: productsData, error: prodError } = await supabase
        .from("products")
        .select("id, name")
        .in("id", productIds);

      if (prodError) throw prodError;

      // Combine data
      const productsMap = Object.fromEntries(productsData.map((p) => [p.id, p]));
      const variantsMap = Object.fromEntries(
        variantsData.map((v) => [
          v.id,
          { ...v, product: productsMap[v.product_id] },
        ])
      );

      return inventoryData.map((inv) => ({
        ...inv,
        variant: variantsMap[inv.variant_id],
      })) as InventoryItem[];
    },
  });

  const updateMutation = useMutation({
    mutationFn: async ({
      id,
      quantity,
      low_stock_threshold,
    }: {
      id: string;
      quantity: number;
      low_stock_threshold: number;
    }) => {
      const { error } = await supabase
        .from("inventory")
        .update({ quantity, low_stock_threshold })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-inventory"] });
      setEditingId(null);
      toast.success("Inventory updated successfully");
    },
    onError: () => {
      toast.error("Failed to update inventory");
    },
  });

  const startEdit = (item: InventoryItem) => {
    setEditingId(item.id);
    setEditValues({
      quantity: item.quantity,
      low_stock_threshold: item.low_stock_threshold ?? 10,
    });
  };

  const saveEdit = (id: string) => {
    updateMutation.mutate({
      id,
      quantity: editValues.quantity,
      low_stock_threshold: editValues.low_stock_threshold,
    });
  };

  const getStockStatus = (item: InventoryItem) => {
    const available = item.quantity - item.reserved_quantity;
    const threshold = item.low_stock_threshold ?? 10;

    if (available <= 0) {
      return { label: "Out of Stock", variant: "destructive" as const };
    }
    if (available <= threshold) {
      return { label: "Low Stock", variant: "secondary" as const };
    }
    return { label: "In Stock", variant: "default" as const };
  };

  const lowStockCount = inventory?.filter((item) => {
    const available = item.quantity - item.reserved_quantity;
    return available <= (item.low_stock_threshold ?? 10) && available > 0;
  }).length ?? 0;

  const outOfStockCount = inventory?.filter((item) => {
    return item.quantity - item.reserved_quantity <= 0;
  }).length ?? 0;

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link to="/admin">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-4 w-4" />
              </Button>
            </Link>
            <div>
              <h1 className="text-2xl font-serif font-semibold">Inventory Management</h1>
              <p className="text-muted-foreground">Track and manage stock levels</p>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-6">
        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total SKUs</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{inventory?.length ?? 0}</div>
            </CardContent>
          </Card>
          <Card className={lowStockCount > 0 ? "border-yellow-500" : ""}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Low Stock</CardTitle>
              {lowStockCount > 0 && <AlertTriangle className="h-4 w-4 text-yellow-500" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{lowStockCount}</div>
            </CardContent>
          </Card>
          <Card className={outOfStockCount > 0 ? "border-destructive" : ""}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-medium">Out of Stock</CardTitle>
              {outOfStockCount > 0 && <AlertTriangle className="h-4 w-4 text-destructive" />}
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{outOfStockCount}</div>
            </CardContent>
          </Card>
        </div>

        {/* Inventory Table */}
        <Card>
          <CardHeader>
            <CardTitle>All Inventory</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
              </div>
            ) : inventory?.length === 0 ? (
              <div className="text-center py-8 text-muted-foreground">
                No inventory records found
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Product</TableHead>
                    <TableHead>SKU</TableHead>
                    <TableHead>Variant</TableHead>
                    <TableHead className="text-center">Quantity</TableHead>
                    <TableHead className="text-center">Reserved</TableHead>
                    <TableHead className="text-center">Available</TableHead>
                    <TableHead className="text-center">Threshold</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {inventory?.map((item) => {
                    const status = getStockStatus(item);
                    const isEditing = editingId === item.id;

                    return (
                      <TableRow key={item.id}>
                        <TableCell className="font-medium">
                          {item.variant?.product?.name ?? "Unknown"}
                        </TableCell>
                        <TableCell className="font-mono text-sm">
                          {item.variant?.sku ?? "—"}
                        </TableCell>
                        <TableCell>
                          {item.variant?.color} / {item.variant?.size}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              min={0}
                              value={editValues.quantity}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  quantity: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-20 mx-auto"
                            />
                          ) : (
                            item.quantity
                          )}
                        </TableCell>
                        <TableCell className="text-center">{item.reserved_quantity}</TableCell>
                        <TableCell className="text-center font-medium">
                          {item.quantity - item.reserved_quantity}
                        </TableCell>
                        <TableCell className="text-center">
                          {isEditing ? (
                            <Input
                              type="number"
                              min={0}
                              value={editValues.low_stock_threshold}
                              onChange={(e) =>
                                setEditValues((v) => ({
                                  ...v,
                                  low_stock_threshold: parseInt(e.target.value) || 0,
                                }))
                              }
                              className="w-20 mx-auto"
                            />
                          ) : (
                            item.low_stock_threshold ?? 10
                          )}
                        </TableCell>
                        <TableCell>
                          <Badge variant={status.variant}>{status.label}</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          {isEditing ? (
                            <div className="flex justify-end gap-2">
                              <Button
                                size="sm"
                                onClick={() => saveEdit(item.id)}
                                disabled={updateMutation.isPending}
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingId(null)}
                              >
                                Cancel
                              </Button>
                            </div>
                          ) : (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => startEdit(item)}
                            >
                              Edit
                            </Button>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
