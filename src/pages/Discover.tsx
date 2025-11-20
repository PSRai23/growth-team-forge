import { Layout } from "@/components/layout/Layout";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet";
import { Filter, Search, SlidersHorizontal } from "lucide-react";
import { ProductCard } from "@/components/discover/ProductCard";
import { ProductFilters } from "@/components/discover/ProductFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface Product {
  id: string;
  name: string;
  brand: string | null;
  base_price: number;
  category_id: string | null;
  created_at: string;
}

interface ProductImage {
  image_url: string;
  is_primary: boolean;
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function Discover() {
  const { toast } = useToast();
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [productImages, setProductImages] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [priceRange, setPriceRange] = useState<[number, number]>([0, 1000]);
  const [maxPrice, setMaxPrice] = useState(1000);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    try {
      setLoading(true);
      
      // Fetch products
      const { data: productsData, error: productsError } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true)
        .order("created_at", { ascending: false });

      if (productsError) throw productsError;

      // Fetch categories
      const { data: categoriesData, error: categoriesError } = await supabase
        .from("categories")
        .select("id, name, slug")
        .order("display_order", { ascending: true });

      if (categoriesError) throw categoriesError;

      // Fetch primary images for all products
      if (productsData && productsData.length > 0) {
        const { data: imagesData, error: imagesError } = await supabase
          .from("product_images")
          .select("product_id, image_url, is_primary")
          .in("product_id", productsData.map(p => p.id));

        if (imagesError) throw imagesError;

        // Map primary images to products
        const imagesMap: Record<string, string> = {};
        imagesData?.forEach((img) => {
          if (img.is_primary && !imagesMap[img.product_id]) {
            imagesMap[img.product_id] = img.image_url;
          }
        });

        // Fallback to first available image if no primary
        imagesData?.forEach((img) => {
          if (!imagesMap[img.product_id]) {
            imagesMap[img.product_id] = img.image_url;
          }
        });

        setProductImages(imagesMap);
      }

      setProducts(productsData || []);
      setCategories(categoriesData || []);

      // Calculate max price
      if (productsData && productsData.length > 0) {
        const max = Math.max(...productsData.map(p => Number(p.base_price)));
        setMaxPrice(Math.ceil(max / 100) * 100);
        setPriceRange([0, Math.ceil(max / 100) * 100]);
      }
    } catch (error: any) {
      toast({
        title: "Error loading products",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleCategoryChange = (categoryId: string) => {
    setSelectedCategories((prev) =>
      prev.includes(categoryId)
        ? prev.filter((id) => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredProducts = products.filter((product) => {
    // Search filter
    const matchesSearch =
      searchQuery === "" ||
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.brand?.toLowerCase().includes(searchQuery.toLowerCase());

    // Category filter
    const matchesCategory =
      selectedCategories.length === 0 ||
      (product.category_id && selectedCategories.includes(product.category_id));

    // Price filter
    const matchesPrice =
      Number(product.base_price) >= priceRange[0] &&
      Number(product.base_price) <= priceRange[1];

    return matchesSearch && matchesCategory && matchesPrice;
  });

  const isNew = (createdAt: string) => {
    const daysSinceCreation = Math.floor(
      (Date.now() - new Date(createdAt).getTime()) / (1000 * 60 * 60 * 24)
    );
    return daysSinceCreation <= 7;
  };

  return (
    <Layout>
      <div className="px-4 py-6 space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-3xl font-serif font-bold text-primary mb-2">
            Discover
          </h1>
          <p className="text-muted-foreground">
            Explore our curated collection
          </p>
        </div>

        {/* Search and Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent>
              <SheetHeader>
                <SheetTitle>Filters</SheetTitle>
              </SheetHeader>
              <div className="mt-6">
                <ProductFilters
                  categories={categories}
                  selectedCategories={selectedCategories}
                  onCategoryChange={handleCategoryChange}
                  priceRange={priceRange}
                  onPriceRangeChange={setPriceRange}
                  maxPrice={maxPrice}
                />
              </div>
            </SheetContent>
          </Sheet>
        </div>

        {/* Active Filters */}
        {selectedCategories.length > 0 && (
          <div className="flex gap-2 flex-wrap">
            {selectedCategories.map((catId) => {
              const category = categories.find((c) => c.id === catId);
              return (
                <Button
                  key={catId}
                  variant="secondary"
                  size="sm"
                  onClick={() => handleCategoryChange(catId)}
                >
                  {category?.name}
                  <span className="ml-2">×</span>
                </Button>
              );
            })}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSelectedCategories([])}
            >
              Clear all
            </Button>
          </div>
        )}

        {/* Results Count */}
        <p className="text-sm text-muted-foreground">
          {filteredProducts.length} {filteredProducts.length === 1 ? "product" : "products"} found
        </p>

        {/* Product Grid */}
        {loading ? (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="space-y-3">
                <Skeleton className="aspect-[3/4] w-full" />
                <Skeleton className="h-4 w-3/4" />
                <Skeleton className="h-4 w-1/2" />
              </div>
            ))}
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center py-12">
            <Filter className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
            <h3 className="text-lg font-semibold mb-2">No products found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your filters or search query
            </p>
            <Button
              variant="outline"
              onClick={() => {
                setSearchQuery("");
                setSelectedCategories([]);
                setPriceRange([0, maxPrice]);
              }}
            >
              Clear filters
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4">
            {filteredProducts.map((product) => (
              <ProductCard
                key={product.id}
                id={product.id}
                name={product.name}
                brand={product.brand || ""}
                price={Number(product.base_price)}
                imageUrl={productImages[product.id] || "https://images.unsplash.com/photo-1523381210434-271e8be1f52b?w=800&auto=format&fit=crop"}
                category={categories.find((c) => c.id === product.category_id)?.name}
                isNew={isNew(product.created_at)}
              />
            ))}
          </div>
        )}
      </div>
    </Layout>
  );
}
