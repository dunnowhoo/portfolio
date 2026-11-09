import 'server-only';
import { functionBaseUrl } from '@neon/env';

// Memanggil Neon Function di branch yang tertaut. URL dibangun dari NEON_BRANCH_ID +
// NEON_FUNCTION_HOST_SUFFIX (diisi `neon env pull`), sesuai skill neon-functions.
export async function callNeonFunction(slug: string, path = '/', init?: RequestInit): Promise<Response> {
  const base = functionBaseUrl(slug);
  return fetch(`${base}${path}`, { cache: 'no-store', ...init });
}
