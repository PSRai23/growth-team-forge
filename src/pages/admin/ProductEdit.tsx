import { useParams, useNavigate, Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ProductForm, ProductFormData } from "@/components/admin/ProductForm";
import { VariantManager } from "@/components/admin/VariantManager";
import { ImageUploader } from "@/components/admin/ImageUploader";
import { ArrowLeft } from "lucide-react";
import { toast } from "sonner";

export default function ProductEdit() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const isNew = id === "new";

  const { data: product, isLoading } = useQuery({
    queryKey: ["admin-product", id],
    queryFn: async () => {
      if (isNew) return null;
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();
      if (error) throw error;
      return data;
    },
    enabled: !isNew,
  });

  const createMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const { data: newProduct, error } = await supabase
        .from("products")
        .insert({
          name: data.name,
          brand: data.brand || null,
          description: data.description || null,
          base_price: data.base_price,
          category_id: data.category_id || null,
          is_active: data.is_active,
          tags,
        })
        .select()
        .single();

      if (error) throw error;
      return newProduct;
    },
    onSuccess: (newProduct) => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      toast.success("Product created successfully");
      navigate(`/admin/products/${newProduct.id}`);
    },
    onError: (error) => {
      console.error("Error creating product:", error);
      toast.error("Failed to create product");
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: ProductFormData) => {
      const tags = data.tags
        ? data.tags.split(",").map((t) => t.trim()).filter(Boolean)
        : [];

      const { error } = await supabase
        .from("products")
        .update({
          name: data.name,
          brand: data.brand || null,
          description: data.description || null,
          base_price: data.base_price,
          category_id: data.category_id || null,
          is_active: data.is_active,
          tags,
        })
        .eq("id", id);

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["admin-products"] });
      queryClient.invalidateQueries({ queryKey: ["admin-product", id] });
      toast.success("Product updated successfully");
    },
    onError: (error) => {
      console.error("Error updating product:", error);
      toast.error("Failed to update product");
    },
  });

  const handleSubmit = (data: ProductFormData) => {
    if (isNew) {
      createMutation.mutate(data);
    } else {
      updateMutation.mutate(data);
    }
  };

  if (!isNew && isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b bg-card">
        <div className="container mx-auto px-4 py-4 flex items-center gap-4">
          <Link to="/admin/products">
            <Button variant="ghost" size="icon">
              <ArrowLeft className="h-4 w-4" />
            </Button>
          </Link>
          <div>
            <h1 className="text-2xl font-serif font-semibold">
              {isNew ? "New Product" : "Edit Product"}
            </h1>
            <p className="text-muted-foreground">
              {isNew
                ? "Add a new product to your catalog"
                : `Editing: ${product?.name}`}
            </p>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Product Details</CardTitle>
          </CardHeader>
          <CardContent>
            <ProductForm
              initialData={
                product
                  ? {
                      name: product.name,
                      brand: product.brand || "",
                      description: product.description || "",
                      base_price: Number(product.base_price),
                      category_id: product.category_id || "",
                      is_active: product.is_active ?? true,
                      tags: product.tags?.join(", ") || "",
                    }
                  : undefined
              }
              onSubmit={handleSubmit}
              isLoading={createMutation.isPending || updateMutation.isPending}
            />
          </CardContent>
        </Card>

        {!isNew && id && (
          <>
            <ImageUploader productId={id} />
            <VariantManager productId={id} />
          </>
        )}
      </main>
    </div>
  );
}
