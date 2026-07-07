/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export const configError: string | null =
  !supabaseUrl || !supabaseAnonKey
    ? 'Error de configuración: faltan variables de entorno. Contacta al administrador.'
    : null

// Always initialise a client so the type is never null throughout the app.
// When env vars are missing configError is set and main.tsx renders a fallback.
export const supabase = createClient(supabaseUrl ?? '', supabaseAnonKey ?? '')
