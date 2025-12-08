-- Insert categories
INSERT INTO public.categories (id, name, slug, description, display_order) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'Dresses', 'dresses', 'Beautiful dresses for every occasion', 1),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'Tops', 'tops', 'Stylish tops and blouses', 2),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'Bottoms', 'bottoms', 'Skirts, pants, and more', 3),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'Accessories', 'accessories', 'Complete your look', 4);

-- Insert products
INSERT INTO public.products (id, name, brand, description, base_price, category_id, tags, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'Floral Maxi Dress', 'Bloom', 'Elegant floral print maxi dress perfect for summer occasions. Features a flattering V-neckline and flowy silhouette.', 89.99, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', ARRAY['summer', 'floral', 'elegant'], true),
  ('22222222-2222-2222-2222-222222222222', 'Silk Blouse', 'Luxe', 'Luxurious silk blouse with delicate button details. Perfect for office or evening wear.', 129.99, 'b2c3d4e5-f6a7-8901-bcde-f12345678901', ARRAY['silk', 'office', 'elegant'], true),
  ('33333333-3333-3333-3333-333333333333', 'High-Waist Wide Leg Pants', 'Chic Studio', 'Flattering high-waist pants with a modern wide leg cut. Made from premium stretch fabric.', 79.99, 'c3d4e5f6-a7b8-9012-cdef-123456789012', ARRAY['office', 'casual', 'comfortable'], true),
  ('44444444-4444-4444-4444-444444444444', 'Wrap Midi Dress', 'Elegance', 'Timeless wrap dress in a midi length. Flattering for all body types with adjustable waist tie.', 95.00, 'a1b2c3d4-e5f6-7890-abcd-ef1234567890', ARRAY['classic', 'versatile', 'date-night'], true),
  ('55555555-5555-5555-5555-555555555555', 'Statement Earrings', 'Adorn', 'Bold geometric statement earrings in gold finish. Lightweight and comfortable for all-day wear.', 45.00, 'd4e5f6a7-b8c9-0123-defa-234567890123', ARRAY['jewelry', 'statement', 'gold'], true);

-- Insert product variants
INSERT INTO public.product_variants (id, product_id, size, color, color_hex, sku, is_available) VALUES
  ('a1111111-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'S', 'Blush Pink', '#F8B4B8', 'FMD-BP-S', true),
  ('a1111112-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'M', 'Blush Pink', '#F8B4B8', 'FMD-BP-M', true),
  ('a1111113-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'L', 'Blush Pink', '#F8B4B8', 'FMD-BP-L', true),
  ('a1111114-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'S', 'Navy Floral', '#1E3A5F', 'FMD-NF-S', true),
  ('a1111115-1111-1111-1111-111111111111', '11111111-1111-1111-1111-111111111111', 'M', 'Navy Floral', '#1E3A5F', 'FMD-NF-M', true),
  ('a2222221-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'XS', 'Ivory', '#FFFFF0', 'SB-IV-XS', true),
  ('a2222222-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'S', 'Ivory', '#FFFFF0', 'SB-IV-S', true),
  ('a2222223-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'M', 'Ivory', '#FFFFF0', 'SB-IV-M', true),
  ('a2222224-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'S', 'Black', '#000000', 'SB-BK-S', true),
  ('a2222225-2222-2222-2222-222222222222', '22222222-2222-2222-2222-222222222222', 'M', 'Black', '#000000', 'SB-BK-M', true),
  ('a3333331-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '26', 'Charcoal', '#36454F', 'HWP-CH-26', true),
  ('a3333332-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '28', 'Charcoal', '#36454F', 'HWP-CH-28', true),
  ('a3333333-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '30', 'Charcoal', '#36454F', 'HWP-CH-30', true),
  ('a3333334-3333-3333-3333-333333333333', '33333333-3333-3333-3333-333333333333', '28', 'Camel', '#C19A6B', 'HWP-CM-28', true),
  ('a4444441-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'S', 'Emerald', '#50C878', 'WMD-EM-S', true),
  ('a4444442-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'M', 'Emerald', '#50C878', 'WMD-EM-M', true),
  ('a4444443-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'L', 'Emerald', '#50C878', 'WMD-EM-L', true),
  ('a4444444-4444-4444-4444-444444444444', '44444444-4444-4444-4444-444444444444', 'M', 'Burgundy', '#722F37', 'WMD-BG-M', true),
  ('a5555551-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'One Size', 'Gold', '#FFD700', 'SE-GD-OS', true),
  ('a5555552-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'One Size', 'Rose Gold', '#B76E79', 'SE-RG-OS', true),
  ('a5555553-5555-5555-5555-555555555555', '55555555-5555-5555-5555-555555555555', 'One Size', 'Silver', '#C0C0C0', 'SE-SV-OS', true);

-- Insert inventory
INSERT INTO public.inventory (variant_id, quantity, reserved_quantity, low_stock_threshold) VALUES
  ('a1111111-1111-1111-1111-111111111111', 15, 0, 5),
  ('a1111112-1111-1111-1111-111111111111', 20, 2, 5),
  ('a1111113-1111-1111-1111-111111111111', 10, 0, 5),
  ('a1111114-1111-1111-1111-111111111111', 8, 1, 5),
  ('a1111115-1111-1111-1111-111111111111', 12, 0, 5),
  ('a2222221-2222-2222-2222-222222222222', 6, 0, 3),
  ('a2222222-2222-2222-2222-222222222222', 10, 0, 3),
  ('a2222223-2222-2222-2222-222222222222', 8, 0, 3),
  ('a2222224-2222-2222-2222-222222222222', 5, 0, 3),
  ('a2222225-2222-2222-2222-222222222222', 7, 0, 3),
  ('a3333331-3333-3333-3333-333333333333', 12, 0, 5),
  ('a3333332-3333-3333-3333-333333333333', 18, 3, 5),
  ('a3333333-3333-3333-3333-333333333333', 15, 0, 5),
  ('a3333334-3333-3333-3333-333333333333', 10, 0, 5),
  ('a4444441-4444-4444-4444-444444444444', 7, 0, 3),
  ('a4444442-4444-4444-4444-444444444444', 14, 0, 3),
  ('a4444443-4444-4444-4444-444444444444', 9, 0, 3),
  ('a4444444-4444-4444-4444-444444444444', 11, 0, 3),
  ('a5555551-5555-5555-5555-555555555555', 25, 0, 10),
  ('a5555552-5555-5555-5555-555555555555', 20, 0, 10),
  ('a5555553-5555-5555-5555-555555555555', 22, 0, 10);

-- Insert product images
INSERT INTO public.product_images (product_id, image_url, alt_text, is_primary, display_order) VALUES
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=600', 'Floral Maxi Dress - Front View', true, 1),
  ('11111111-1111-1111-1111-111111111111', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600', 'Floral Maxi Dress - Side View', false, 2),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1551163943-3f6a855d1153?w=600', 'Silk Blouse - Front View', true, 1),
  ('22222222-2222-2222-2222-222222222222', 'https://images.unsplash.com/photo-1564257631407-4deb1f99d992?w=600', 'Silk Blouse - Detail', false, 2),
  ('33333333-3333-3333-3333-333333333333', 'https://images.unsplash.com/photo-1594938298603-c8148c4dae35?w=600', 'High-Waist Wide Leg Pants', true, 1),
  ('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1585487000160-6ebcfceb0d03?w=600', 'Wrap Midi Dress - Front', true, 1),
  ('44444444-4444-4444-4444-444444444444', 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600', 'Wrap Midi Dress - Styled', false, 2),
  ('55555555-5555-5555-5555-555555555555', 'https://images.unsplash.com/photo-1535632066927-ab7c9ab60908?w=600', 'Statement Earrings - Display', true, 1);