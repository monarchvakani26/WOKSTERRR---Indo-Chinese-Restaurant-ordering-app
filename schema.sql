-- Woksterrr Indo-Chinese: Supabase Database Schema

-- 1. Create Tables
CREATE TABLE public.tables (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_number INTEGER NOT NULL UNIQUE,
    qr_code_url TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.menu_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    name TEXT NOT NULL,
    category TEXT NOT NULL,
    price DECIMAL(10, 2) NOT NULL,
    type TEXT NOT NULL DEFAULT 'veg', -- 'veg', 'jain', etc.
    image_url TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- status can be: pending, preparing, ready, completed
CREATE TABLE public.orders (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    table_id UUID REFERENCES public.tables(id) NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending',
    total_amount DECIMAL(10, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

CREATE TABLE public.order_items (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    order_id UUID REFERENCES public.orders(id) ON DELETE CASCADE,
    item_id UUID REFERENCES public.menu_items(id),
    quantity INTEGER NOT NULL DEFAULT 1,
    customizations TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Setup Row Level Security (RLS)
-- Enable RLS
ALTER TABLE public.tables ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.orders ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.order_items ENABLE ROW LEVEL SECURITY;

-- Allow anonymous read access (since customers don't log in)
CREATE POLICY "Allow public read access to tables" ON public.tables FOR SELECT USING (true);
CREATE POLICY "Allow public read access to menu_items" ON public.menu_items FOR SELECT USING (true);

-- Allow anonymous users to place orders and read their own orders
CREATE POLICY "Allow public insert to orders" ON public.orders FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read to orders" ON public.orders FOR SELECT USING (true);
CREATE POLICY "Allow public update to orders" ON public.orders FOR UPDATE USING (true);

CREATE POLICY "Allow public insert to order_items" ON public.order_items FOR INSERT WITH CHECK (true);
CREATE POLICY "Allow public read to order_items" ON public.order_items FOR SELECT USING (true);

-- 3. Insert Initial Data: Tables (1 to 10)
INSERT INTO public.tables (table_number) VALUES 
(1), (2), (3), (4), (5), (6), (7), (8), (9), (10);

-- 4. Insert Menu Items
-- Momo Mania
INSERT INTO public.menu_items (name, category, price) VALUES 
('Veg Momos Steam', 'Momo Mania', 149),
('Veg Momos Kurkure', 'Momo Mania', 159),
('Paneer Momos Steam', 'Momo Mania', 179),
('Paneer Momos Kurkure', 'Momo Mania', 189),
('Chilli Cheese Momos Steam', 'Momo Mania', 199),
('Chilli Cheese Momos Kurkure', 'Momo Mania', 219);

-- Noodles
INSERT INTO public.menu_items (name, category, price) VALUES 
('Classic Hakka Noodles', 'Noodles', 179),
('Schezwan Noodles', 'Noodles', 189),
('Burnt Garlic Noodles', 'Noodles', 199),
('Chilli Basil Noodles', 'Noodles', 199),
('Street Style Chowmein', 'Noodles', 189),
('Triple / Chopper / Pot Noodles', 'Noodles', 249);

-- Rice
INSERT INTO public.menu_items (name, category, price) VALUES 
('Classic Fried Rice', 'Rice', 179),
('Schezwan Fried Rice', 'Rice', 189),
('Burnt Garlic Rice', 'Rice', 189),
('Combination Rice', 'Rice', 209),
('Bombay Style Rice', 'Rice', 209),
('Triple Rice', 'Rice', 219),
('Chopper Rice', 'Rice', 249),
('Pot Rice', 'Rice', 249);

-- Wok Bowls
INSERT INTO public.menu_items (name, category, price) VALUES 
('Chilli Paneer Wok Bowl', 'Wok Bowls', 259),
('Manchurian Wok Bowl', 'Wok Bowls', 259),
('Shanghai Wok Bowl', 'Wok Bowls', 259),
('Green Thai Curry Bowl', 'Wok Bowls', 269);

-- Starters / Classic
INSERT INTO public.menu_items (name, category, price) VALUES 
('Heaven Cottage Cheese', 'Starters', 239),
('Paneer Bomb Toss', 'Starters', 239),
('Chilly Paneer', 'Starters', 239),
('Paneer 65', 'Starters', 239),
('Crispy Chilly Mushroom', 'Starters', 219),
('Veg / Paneer Crispy', 'Starters', 199),
('Veg Manchurian', 'Starters', 199),
('Veg Hot Garlic Schezwan', 'Starters', 199),
('Stir Fry Vegetables', 'Starters', 199),
('Spring Roll', 'Starters', 169),
('Chinese Bhel', 'Starters', 199),
('Andhra Volcano Veggies', 'Starters', 199),
('Butter Garlic Wok Toss', 'Starters', 199),
('Honey Chilly Potatoes', 'Starters', 199);

-- Soups
INSERT INTO public.menu_items (name, category, price) VALUES 
('Manchow Soup', 'Soups', 139),
('Lemon Coriander Soup', 'Soups', 139),
('Hot & Sour Soup', 'Soups', 139);

-- Sides
INSERT INTO public.menu_items (name, category, price) VALUES 
('Classic Salted Fries', 'Sides', 89),
('Peri Peri Fries', 'Sides', 99),
('Wok Tossed Fries', 'Sides', 159);

-- Ramen Bowls
INSERT INTO public.menu_items (name, category, price) VALUES 
('Thukpa Ramen', 'Ramen Bowls', 289),
('Spinach Dhol Momo Bowl', 'Ramen Bowls', 289),
('Schezwan Ramen', 'Ramen Bowls', 289);

-- Desserts
INSERT INTO public.menu_items (name, category, price) VALUES 
('Vanilla Tres Leches', 'Desserts', 159),
('Biscoff Cheesecake', 'Desserts', 189),
('Chocolate Mousse', 'Desserts', 129);

-- Add Ons
INSERT INTO public.menu_items (name, category, price) VALUES 
('Cheese', 'Add Ons', 20),
('Schezwan Sauce', 'Add Ons', 20),
('Veggies', 'Add Ons', 20);

-- Enable Realtime for orders
alter publication supabase_realtime add table public.orders;
