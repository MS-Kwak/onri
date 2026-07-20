import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import crypto from 'crypto';

export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
  );
}

export async function verifyAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get('admin_token')?.value;
  const hmac = cookieStore.get('admin_hmac')?.value;
  const adminPassword = process.env.ADMIN_PASSWORD;

  if (!token || !hmac || !adminPassword) return null;

  const expectedHmac = crypto
    .createHmac('sha256', adminPassword)
    .update(token)
    .digest('hex');

  if (hmac !== expectedHmac) return null;

  return { id: 'admin' };
}
