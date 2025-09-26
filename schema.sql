-- Creating table: users
CREATE TABLE public.users (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  username text,
  email text,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  age smallint CHECK (age > 0),
  CONSTRAINT users_pkey PRIMARY KEY (id)
);

-- Creating table: rooms
CREATE TABLE public.rooms (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rooms_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id)
);

-- Creating table: rooms_usage_periods
CREATE TABLE public.rooms_usage_periods (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  room_id uuid NOT NULL,
  start_timestamp timestamp without time zone NOT NULL,
  end_timestamp timestamp without time zone NOT NULL,
  value smallint NOT NULL,
  created_at timestamp with time zone NOT NULL DEFAULT now(),
  CONSTRAINT rooms_usage_periods_pkey PRIMARY KEY (id),
  CONSTRAINT rooms_usage_periods_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id),
  CONSTRAINT rooms_usage_periods_room_id_fkey FOREIGN KEY (room_id) REFERENCES public.rooms(id)
);

-- Creating indexes
CREATE INDEX idx_rooms_usage_periods_user_id_timestamps ON public.rooms_usage_periods USING btree (user_id, start_timestamp, end_timestamp);
CREATE UNIQUE INDEX unique_user_room ON public.rooms USING btree (user_id, name);

-- Enabling Row Level Security (RLS) for all tables
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rooms_usage_periods ENABLE ROW LEVEL SECURITY;

-- Creating policies for users table
CREATE POLICY "Allow authenticated users to insert their own profile" ON public.users
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = id));

CREATE POLICY "Authenticated user can only update their own data" ON public.users
  FOR UPDATE TO authenticated
  USING ((auth.uid() = id));

CREATE POLICY "Enable users to view their own data only" ON public.users
  FOR SELECT TO authenticated
  USING ((auth.uid() = id));

-- Creating policies for rooms table
CREATE POLICY "Enable insert for users based on user_id" ON public.rooms
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable users to view their own data only" ON public.rooms
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "Users can only update their own rooms" ON public.rooms
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

-- Creating policies for rooms_usage_periods table
CREATE POLICY "Authenticated users can only update their data" ON public.rooms_usage_periods
  FOR UPDATE TO authenticated
  USING ((auth.uid() = user_id))
  WITH CHECK ((auth.uid() = user_id));

CREATE POLICY "Enable delete for users based on user_id" ON public.rooms_usage_periods
  FOR DELETE TO authenticated
  USING ((auth.uid() = user_id));

CREATE POLICY "Enable insert for authenticated users only" ON public.rooms_usage_periods
  FOR INSERT TO authenticated
  WITH CHECK ((auth.uid() = user_id) AND (room_id IN (SELECT rooms.id FROM rooms WHERE rooms.user_id = auth.uid())));

CREATE POLICY "Enable users to view their own data only" ON public.rooms_usage_periods
  FOR SELECT TO authenticated
  USING ((auth.uid() = user_id));

-- Enabling Realtime for rooms_usage_periods table
ALTER TABLE public.rooms_usage_periods ENABLE ROW LEVEL SECURITY;
SELECT supabase_realtime.publications_add_table('public.rooms_usage_periods');