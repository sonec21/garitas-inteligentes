-- Insert sample border crossings
INSERT INTO public.border_crossings (name, latitude, longitude, country_from, country_to) VALUES
('San Ysidro', 32.5422, -117.0309, 'Mexico', 'USA'),
('Otay Mesa', 32.5586, -116.9319, 'Mexico', 'USA'),
('Tecate', 32.5761, -116.6286, 'Mexico', 'USA'),
('Calexico', 32.6759, -115.4989, 'Mexico', 'USA');

-- Insert sample lanes for San Ysidro
INSERT INTO public.lanes (crossing_id, name, type, wait_time, vehicle_count, traffic_flow) VALUES
((SELECT id FROM public.border_crossings WHERE name = 'San Ysidro'), 'General Traffic Lane 1', 'vehicle', 45, 120, 'slow'),
((SELECT id FROM public.border_crossings WHERE name = 'San Ysidro'), 'General Traffic Lane 2', 'vehicle', 50, 135, 'slow'),
((SELECT id FROM public.border_crossings WHERE name = 'San Ysidro'), 'SENTRI Lane', 'sentri', 15, 25, 'fast'),
((SELECT id FROM public.border_crossings WHERE name = 'San Ysidro'), 'Ready Lane', 'ready_lane', 30, 60, 'moderate'),
((SELECT id FROM public.border_crossings WHERE name = 'San Ysidro'), 'Pedestrian', 'pedestrian', 20, 80, 'moderate');

-- Insert sample lanes for Otay Mesa
INSERT INTO public.lanes (crossing_id, name, type, wait_time, vehicle_count, traffic_flow) VALUES
((SELECT id FROM public.border_crossings WHERE name = 'Otay Mesa'), 'General Traffic', 'vehicle', 30, 80, 'moderate'),
((SELECT id FROM public.border_crossings WHERE name = 'Otay Mesa'), 'SENTRI Lane', 'sentri', 10, 15, 'fast'),
((SELECT id FROM public.border_crossings WHERE name = 'Otay Mesa'), 'Pedestrian', 'pedestrian', 15, 40, 'fast');