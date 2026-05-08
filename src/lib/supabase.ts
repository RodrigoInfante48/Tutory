/// <reference types="vite/client" />
import { createClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL as string | undefined
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

export let supabase: ReturnType<typeof createClient> | null = null
export let configError: string | null = null

if (!supabaseUrl || !supabaseAnonKey) {
  configError = 'Error de configuración: faltan variables de entorno. Contacta al administrador.'
} else {
  supabase = createClient(supabaseUrl, supabaseAnonKey)
}
