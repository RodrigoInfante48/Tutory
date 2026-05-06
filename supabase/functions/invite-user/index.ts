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
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      return Response.json({ error: 'Missing authorization header' }, { status: 401, headers: corsHeaders })
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!

    // Verify caller is authenticated and is an admin
    const callerClient = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: authHeader } },
    })
    const { data: { user: caller }, error: callerError } = await callerClient.auth.getUser()
    if (callerError || !caller) {
      return Response.json({ error: 'Unauthorized' }, { status: 401, headers: corsHeaders })
    }

    const adminClient = createClient(supabaseUrl, serviceRoleKey)
    const { data: callerProfile, error: profileError } = await adminClient
      .from('users')
      .select('role')
      .eq('id', caller.id)
      .single()

    if (profileError || callerProfile?.role !== 'admin') {
      return Response.json({ error: 'Forbidden: admin role required' }, { status: 403, headers: corsHeaders })
    }

    const { email, name, role } = await req.json() as { email: string; name: string; role: string }

    if (!email || !name || !role) {
      return Response.json({ error: 'email, name and role are required' }, { status: 400, headers: corsHeaders })
    }
    if (!['teacher', 'student'].includes(role)) {
      return Response.json({ error: 'role must be teacher or student' }, { status: 400, headers: corsHeaders })
    }

    // Send invite email via Supabase Auth admin API
    const { data: inviteData, error: inviteError } = await adminClient.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${Deno.env.get('SITE_URL') ?? 'https://tutory.vercel.app'}/reset-password`,
    })
    if (inviteError) {
      return Response.json({ error: inviteError.message }, { status: 400, headers: corsHeaders })
    }

    // Insert profile row so it exists when the user activates their account
    const { error: insertError } = await adminClient
      .from('users')
      .upsert({ id: inviteData.user.id, email, name, role }, { onConflict: 'id' })

    if (insertError) {
      return Response.json({ error: insertError.message }, { status: 500, headers: corsHeaders })
    }

    return Response.json({ success: true, userId: inviteData.user.id }, { headers: corsHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
