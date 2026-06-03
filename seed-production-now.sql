-- Insert products directly into production database
INSERT INTO shop_products (name, description, price, image_url, category, stock, is_featured, tags) VALUES
('Ashwagandha Capsules', 'Premium quality Ashwagandha for stress relief and vitality', 599, '/images/ashwagandha.jpg', 'Supplements', 100, true, ARRAY['organic', 'ayurvedic', 'stress-relief']),
('Triphala Powder', 'Traditional Ayurvedic digestive formula', 399, '/images/triphala.jpg', 'Digestive Health', 150, true, ARRAY['organic', 'digestive', 'detox']),
('Brahmi Capsules', 'Natural brain tonic for memory and focus', 549, '/images/brahmi.jpg', 'Brain Health', 80, true, ARRAY['organic', 'cognitive', 'memory']),
('Turmeric Powder', 'Pure organic turmeric with high curcumin', 299, '/images/turmeric.jpg', 'Spices', 200, false, ARRAY['organic', 'anti-inflammatory']),
('Neem Capsules', 'Natural blood purifier and immune booster', 449, '/images/neem.jpg', 'Immunity', 120, false, ARRAY['organic', 'immunity', 'detox']),
('Giloy Juice', 'Immunity boosting Ayurvedic juice', 499, '/images/giloy.jpg', 'Immunity', 90, true, ARRAY['immunity', 'fever', 'ayurvedic']),
('Amla Powder', 'Rich in Vitamin C for immunity and skin', 349, '/images/amla.jpg', 'Superfoods', 180, false, ARRAY['organic', 'vitamin-c', 'antioxidant']),
('Herbal Hair Oil', 'Nourishing oil for strong and healthy hair', 649, '/images/hair-oil.jpg', 'Hair Care', 70, true, ARRAY['natural', 'hair-growth', 'ayurvedic'])
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description,
  price = EXCLUDED.price,
  image_url = EXCLUDED.image_url,
  category = EXCLUDED.category,
  stock = EXCLUDED.stock,
  is_featured = EXCLUDED.is_featured,
  tags = EXCLUDED.tags;
