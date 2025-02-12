
-- First create the enum type for chat topics
CREATE TYPE chat_topic AS ENUM ('autre', 'urgence', 'santé', 'logement', 'nourriture', 'transport');

-- Then create the community_chats table with the correct topic type
CREATE TABLE IF NOT EXISTS public.community_chats (
    id uuid NOT NULL DEFAULT gen_random_uuid(),
    topic chat_topic NOT NULL,
    region text,
    user_id uuid NOT NULL,
    message_text text NOT NULL,
    image_url text,
    created_at timestamp with time zone NOT NULL DEFAULT now(),
    PRIMARY KEY (id)
);

-- Enable Row Level Security
ALTER TABLE public.community_chats ENABLE ROW LEVEL SECURITY;

-- Create policy to allow all authenticated users to read messages
CREATE POLICY "Allow authenticated users to read messages"
ON public.community_chats
FOR SELECT
TO authenticated
USING (true);

-- Create policy to allow authenticated users to insert their own messages
CREATE POLICY "Allow authenticated users to insert messages"
ON public.community_chats
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS community_chats_topic_idx ON public.community_chats(topic);
CREATE INDEX IF NOT EXISTS community_chats_region_idx ON public.community_chats(region);
CREATE INDEX IF NOT EXISTS community_chats_created_at_idx ON public.community_chats(created_at);
