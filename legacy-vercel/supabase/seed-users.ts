#!/usr/bin/env -S deno run --allow-net --allow-env
/**
 * Creates Tutory seed users via the Supabase Admin API.
 *
 * Usage:
 *   SUPABASE_URL=https://xxx.supabase.co \
 *   SUPABASE_SERVICE_ROLE_KEY=eyJ... \
 *   deno run --allow-net --allow-env supabase/seed-users.ts
 *
 * For local dev (supabase start):
 *   SUPABASE_URL=http://127.0.0.1:54321 \
 *   SUPABASE_SERVICE_ROLE_KEY=<local service role key> \
 *   deno run --allow-net --allow-env supabase/seed-users.ts
 *
 * The stable UUIDs here match the FKs in seed.sql — do not change them.
 * Password for all seed users: PIN 1234 (internally stored as "123400").
 */

import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!SUPABASE_URL || !SERVICE_ROLE_KEY) {
  console.error(
    "Missing env vars: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY are required."
  );
  Deno.exit(1);
}

const supabase = createClient(SUPABASE_URL, SERVICE_ROLE_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

// PIN "1234" → password "123400" (signInWithPin appends '00')
const DEFAULT_PASSWORD = "123400";

const SEED_USERS = [
  {
    id: "00000000-0000-0000-0000-000000000001",
    email: "admin@tutory.com",
    name: "Admin Tutory",
    role: "admin",
  },
  {
    id: "00000000-0000-0000-0000-000000000002",
    email: "valentina@tutory.com",
    name: "Valentina García",
    role: "teacher",
  },
  {
    id: "00000000-0000-0000-0000-000000000003",
    email: "carlos@tutory.com",
    name: "Carlos Mendoza",
    role: "teacher",
  },
  {
    id: "00000000-0000-0000-0000-000000000004",
    email: "ana@tutory.com",
    name: "Ana Rodríguez",
    role: "student",
  },
  {
    id: "00000000-0000-0000-0000-000000000005",
    email: "pedro@tutory.com",
    name: "Pedro Martínez",
    role: "student",
  },
  {
    id: "00000000-0000-0000-0000-000000000006",
    email: "maria@tutory.com",
    name: "María López",
    role: "student",
  },
  {
    id: "00000000-0000-0000-0000-000000000007",
    email: "juan@tutory.com",
    name: "Juan Pérez",
    role: "student",
  },
] as const;

for (const u of SEED_USERS) {
  // createUser with a specific id requires the id to be passed via options
  const { data, error } = await supabase.auth.admin.createUser({
    email: u.email,
    password: DEFAULT_PASSWORD,
    email_confirm: true,
    user_metadata: { name: u.name, role: u.role },
    // Supabase admin API accepts `id` to preserve stable UUIDs
    // @ts-ignore — `id` is supported by the REST API even if not in the TS types
    id: u.id,
  });

  if (error) {
    if (error.message?.includes("already registered")) {
      console.log(`  skip  ${u.email} (already exists)`);
    } else {
      console.error(`  error ${u.email}:`, error.message);
    }
    continue;
  }

  // Upsert profile into public.users (trigger may not run for admin-created users)
  const { error: profileError } = await supabase
    .from("users")
    .upsert(
      { id: data.user.id, email: u.email, role: u.role, name: u.name },
      { onConflict: "id" }
    );

  if (profileError) {
    console.error(`  profile error ${u.email}:`, profileError.message);
  }

  console.log(`  created ${u.email} (${u.role})`);
}

console.log("\nDone. All seed users processed.");
console.log(`Default PIN for all seed users: 1234`);
