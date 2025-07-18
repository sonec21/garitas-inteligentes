ALTER TABLE public.lanes
ADD CONSTRAINT unique_lane_per_crossing UNIQUE (crossing_id, name);