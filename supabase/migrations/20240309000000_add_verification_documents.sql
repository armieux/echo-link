
-- Create storage bucket for identity verification
insert into storage.buckets (id, name, public) 
values ('identity_verification', 'identity_verification', false);

-- Enable RLS on identity_verification bucket
alter table storage.objects enable row level security;

-- Create RLS policy for reading own identity documents
create policy "Users can read own identity documents"
on storage.objects for select
to authenticated
using ( bucket_id = 'identity_verification' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Create RLS policy for uploading own identity documents
create policy "Users can upload own identity documents"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'identity_verification' AND (storage.foldername(name))[1] = auth.uid()::text );

-- Create table for verification documents if it doesn't exist
create table if not exists public.verification_documents (
    id uuid default extensions.uuid_generate_v4() primary key,
    user_id uuid references auth.users(id) not null,
    status text not null check (status in ('pending', 'verified', 'rejected')),
    id_document_path text,
    selfie_path text,
    submitted_at timestamp with time zone not null default now(),
    rejection_reason text,
    created_at timestamp with time zone not null default now(),
    updated_at timestamp with time zone not null default now()
);

-- Enable RLS on verification_documents
alter table public.verification_documents enable row level security;

-- Create RLS policy for reading own verification documents
create policy "Users can read own verification documents"
on public.verification_documents for select
to authenticated
using (user_id = auth.uid());

-- Create RLS policy for inserting own verification documents
create policy "Users can insert own verification documents"
on public.verification_documents for insert
to authenticated
with check (user_id = auth.uid());

-- Create RLS policy for updating own verification documents
create policy "Users can update own verification documents"
on public.verification_documents for update
to authenticated
using (user_id = auth.uid());

-- Create index on user_id for faster lookups
create index if not exists verification_documents_user_id_idx 
on public.verification_documents(user_id);
