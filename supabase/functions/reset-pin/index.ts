import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    const adminClient = createClient(supabaseUrl, serviceRoleKey)

    // Verify caller is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const { data: callerProfile, error: profileError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (profileError || callerProfile?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin role required' }, { status: 403, headers: corsHeaders })
    }

    const { userId, pin } = await req.json() as { userId: string; pin: string }

    if (!userId || !pin) {
      return Response.json({ error: 'userId and pin are required' }, { status: 400, headers: corsHeaders })
    }
    if (!/^\d{4}$/.test(pin)) {
      return Response.json({ error: 'PIN must be exactly 4 digits' }, { status: 400, headers: corsHeaders })
    }

    const { error: updateError } = await adminClient.auth.admin.updateUserById(userId, {
      password: pin + '00',
    })

    if (updateError) {
      return Response.json({ error: updateError.message }, { status: 400, headers: corsHeaders })
    }

    return Response.json({ success: true }, { headers: corsHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
