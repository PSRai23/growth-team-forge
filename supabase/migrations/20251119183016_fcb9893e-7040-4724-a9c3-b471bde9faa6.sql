-- Create categories table
CREATE TABLE public.categories (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  slug text UNIQUE NOT NULL,
  parent_category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  image_url text,
  display_order integer DEFAULT 0,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create products table
CREATE TABLE public.products (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id uuid REFERENCES public.categories(id) ON DELETE SET NULL,
  name text NOT NULL,
  description text,
  brand text,
  base_price decimal(10,2) NOT NULL CHECK (base_price >= 0),
  is_active boolean DEFAULT true,
  tags text[] DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create product_variants table (size and color combinations)
CREATE TABLE public.product_variants (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  size text NOT NULL,
  color text NOT NULL,
  color_hex text,
  sku text UNIQUE NOT NULL,
  price_adjustment decimal(10,2) DEFAULT 0,
  is_available boolean DEFAULT true,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  updated_at timestamp with time zone NOT NULL DEFAULT now(),
  UNIQUE(product_id, size, color)
);

-- Create product_images table
CREATE TABLE public.product_images (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  image_url text NOT NULL,
  alt_text text,
  display_order integer DEFAULT 0,
  is_primary boolean DEFAULT false,
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create inventory table
CREATE TABLE public.inventory (
  id uuid NOT NULL PRIMARY KEY DEFAULT gen_random_uuid(),
  variant_id uuid NOT NULL UNIQUE REFERENCES public.product_variants(id) ON DELETE CASCADE,
  quantity integer NOT NULL DEFAULT 0 CHECK (quantity >= 0),
  reserved_quantity integer NOT NULL DEFAULT 0 CHECK (reserved_quantity >= 0),
  low_stock_threshold integer DEFAULT 10,
  updated_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Create indexes for performance
CREATE INDEX idx_products_category ON public.products(category_id);
CREATE INDEX idx_products_brand ON public.products(brand);
CREATE INDEX idx_products_active ON public.products(is_active);
CREATE INDEX idx_products_tags ON public.products USING gin(tags);
CREATE INDEX idx_product_variants_product ON public.product_variants(product_id);
CREATE INDEX idx_product_variants_size ON public.product_variants(size);
CREATE INDEX idx_product_variants_color ON public.product_variants(color);
CREATE INDEX idx_product_variants_sku ON public.product_variants(sku);
CREATE INDEX idx_product_images_product ON public.product_images(product_id);
CREATE INDEX idx_product_images_order ON public.product_images(display_order);
CREATE INDEX idx_inventory_variant ON public.inventory(variant_id);
CREATE INDEX idx_categories_parent ON public.categories(parent_category_id);
CREATE INDEX idx_categories_slug ON public.categories(slug);

-- Enable RLS on all tables
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_variants ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inventory ENABLE ROW LEVEL SECURITY;

-- RLS Policies: Products and related data are publicly readable
CREATE POLICY "Categories are viewable by everyone"
  ON public.categories FOR SELECT USING (true);

CREATE POLICY "Products are viewable by everyone"
  ON public.products FOR SELECT USING (true);

CREATE POLICY "Product variants are viewable by everyone"
  ON public.product_variants FOR SELECT USING (true);

CREATE POLICY "Product images are viewable by everyone"
  ON public.product_images FOR SELECT USING (true);

CREATE POLICY "Inventory is viewable by everyone"
  ON public.inventory FOR SELECT USING (true);

-- Note: INSERT, UPDATE, DELETE policies for admin users can be added later
-- when role-based access control is implemented

-- Triggers for updated_at columns
CREATE TRIGGER update_categories_updated_at
  BEFORE UPDATE ON public.categories
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_product_variants_updated_at
  BEFORE UPDATE ON public.product_variants
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inventory_updated_at
  BEFORE UPDATE ON public.inventory
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Function to get available stock for a variant
CREATE OR REPLACE FUNCTION public.get_available_stock(variant_uuid uuid)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(quantity - reserved_quantity, 0)
  FROM public.inventory
  WHERE variant_id = variant_uuid;
$$;

-- Function to check if product is in stock
CREATE OR REPLACE FUNCTION public.is_in_stock(variant_uuid uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.inventory
    WHERE variant_id = variant_uuid
    AND (quantity - reserved_quantity) > 0
  );
$$;