import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Layout } from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { ImageGallery } from "@/components/product/ImageGallery";
import { VariantSelector } from "@/components/product/VariantSelector";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { ArrowLeft, Heart, ShoppingCart, Share2 } from "lucide-react";
import { Separator } from "@/components/ui/separator";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  description: string | null;
  base_price: number;
  category_id: string | null;
}

interface ProductImage {
  image_url: string;
  display_order: number;
}

interface ProductVariant {
  id: string;
  size: string;
  color: string;
  color_hex: string | null;
  price_adjustment: number;
  is_available: boolean;
}

interface InventoryData {
  quantity: number;
  reserved_quantity: number;
}

interface VariantWithStock extends ProductVariant {
  stock: number;
}

export default function ProductDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();

  const [product, setProduct] = useState<Product | null>(null);
  const [images, setImages] = useState<string[]>([]);
  const [variants, setVariants] = useState<VariantWithStock[]>([]);
  const [selectedVariantId, setSelectedVariantId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [addingToCart, setAddingToCart] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);

  useEffect(() => {
    if (id) {
      fetchProductDetails();
    }
  }, [id]);

  const fetchProductDetails = async () => {
    try {
      setLoading(true);

      // Fetch product
      const { data: productData, error: productError } = await supabase
        .from("products")
        .select("*")
        .eq("id", id)
        .single();

      if (productError) throw productError;

      // Fetch images
      const { data: imagesData, error: imagesError } = await supabase
        .from("product_images")
        .select("image_url, display_order")
        .eq("product_id", id)
        .order("display_order", { ascending: true });

      if (imagesError) throw imagesError;

      // Fetch variants
      const { data: variantsData, error: variantsError } = await supabase
        .from("product_variants")
        .select("*")
        .eq("product_id", id)
        .eq("is_available", true)
        .order("size", { ascending: true });

      if (variantsError) throw variantsError;

      // Fetch inventory for each variant
      const variantsWithStock: VariantWithStock[] = [];
      if (variantsData) {
        for (const variant of variantsData) {
          const { data: inventoryData } = await supabase
            .from("inventory")
            .select("quantity, reserved_quantity")
            .eq("variant_id", variant.id)
            .single();

          const stock = inventoryData
            ? inventoryData.quantity - inventoryData.reserved_quantity
            : 0;

          variantsWithStock.push({
            ...variant,
            stock,
          });
        }
      }

      setProduct(productData);
      setImages(imagesData?.map((img) => img.image_url) || []);
      setVariants(variantsWithStock);

      // Auto-select first available variant
      const firstAvailable = variantsWithStock.find(
        (v) => v.is_available && v.stock > 0
      );
      if (firstAvailable) {
        setSelectedVariantId(firstAvailable.id);
      }
    } catch (error: any) {
      toast({
        title: "Error loading product",
        description: error.message,
        variant: "destructive",
      });
      navigate("/discover");
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCart = async () => {
    if (!selectedVariantId) {
      toast({
        title: "Select a variant",
        description: "Please select size and color before adding to cart",
        variant: "destructive",
      });
      return;
    }

    const selectedVariant = variants.find((v) => v.id === selectedVariantId);
    if (!selectedVariant || selectedVariant.stock <= 0) {
      toast({
        title: "Out of stock",
        description: "This variant is currently out of stock",
        variant: "destructive",
      });
      return;
    }

    try {
      setAddingToCart(true);

      const {
        data: { user },
      } = await supabase.auth.getUser();
      if (!user) throw new Error("Not authenticated");

      // Check if item already in cart
      const { data: existingItem } = await supabase
        .from("cart_items")
        .select("*")
        .eq("user_id", user.id)
        .eq("variant_id", selectedVariantId)
        .maybeSingle();

      if (existingItem) {
        // Update quantity
        const { error: updateError } = await supabase
          .from("cart_items")
          .update({ quantity: existingItem.quantity + 1 })
          .eq("id", existingItem.id);

        if (updateError) throw updateError;
      } else {
        // Insert new item
        const { error: insertError } = await supabase
          .from("cart_items")
          .insert({
            user_id: user.id,
            product_id: product!.id,
            variant_id: selectedVariantId,
            quantity: 1,
          });

        if (insertError) throw insertError;
      }

      toast({
        title: "Added to cart",
        description: `${product?.name} has been added to your cart`,
      });
    } catch (error: any) {
      toast({
        title: "Failed to add to cart",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setAddingToCart(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: product?.name,
          text: product?.description || "",
          url: window.location.href,
        });
      } catch (error) {
        // User cancelled share
      }
    } else {
      // Fallback: copy to clipboard
      navigator.clipboard.writeText(window.location.href);
      toast({
        title: "Link copied",
        description: "Product link copied to clipboard",
      });
    }
  };

  if (loading) {
    return (
      <Layout>
        <div className="px-4 py-6 space-y-6">
          <Skeleton className="h-8 w-24" />
          <Skeleton className="aspect-square w-full rounded-lg" />
          <div className="space-y-4">
            <Skeleton className="h-8 w-3/4" />
            <Skeleton className="h-4 w-1/4" />
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-32 w-full" />
          </div>
        </div>
      </Layout>
    );
  }

  if (!product) {
    return (
      <Layout>
        <div className="flex items-center justify-center min-h-[60vh] px-4">
          <div className="text-center">
            <h2 className="text-2xl font-semibold mb-2">Product not found</h2>
            <Button onClick={() => navigate("/discover")}>
              Back to Discover
            </Button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate("/discover")}
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div className="flex gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsFavorite(!isFavorite)}
            >
              <Heart
                className={isFavorite ? "fill-primary text-primary" : ""}
              />
            </Button>
            <Button variant="ghost" size="icon" onClick={handleShare}>
              <Share2 />
            </Button>
          </div>
        </div>

        {/* Image Gallery */}
        <ImageGallery images={images} productName={product.name} />

        {/* Product Info */}
        <div className="space-y-4">
          {product.brand && (
            <p className="text-sm text-muted-foreground uppercase tracking-wide">
              {product.brand}
            </p>
          )}
          <h1 className="text-2xl font-serif font-bold text-primary">
            {product.name}
          </h1>
        </div>

        <Separator />

        {/* Variant Selector */}
        {variants.length > 0 ? (
          <VariantSelector
            variants={variants}
            selectedVariantId={selectedVariantId}
            onVariantChange={setSelectedVariantId}
            basePrice={Number(product.base_price)}
          />
        ) : (
          <p className="text-muted-foreground">No variants available</p>
        )}

        <Separator />

        {/* Description */}
        {product.description && (
          <div className="space-y-2">
            <h2 className="text-lg font-semibold">Description</h2>
            <p className="text-muted-foreground leading-relaxed">
              {product.description}
            </p>
          </div>
        )}

        {/* Add to Cart Button */}
        <div className="sticky bottom-20 bg-background pt-4 pb-2">
          <Button
            className="w-full h-12"
            size="lg"
            onClick={handleAddToCart}
            disabled={
              addingToCart ||
              !selectedVariantId ||
              variants.find((v) => v.id === selectedVariantId)?.stock === 0
            }
          >
            <ShoppingCart className="mr-2 h-5 w-5" />
            {addingToCart ? "Adding..." : "Add to Cart"}
          </Button>
        </div>
      </div>
    </Layout>
  );
}
