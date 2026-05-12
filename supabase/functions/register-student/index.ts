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

    // Allow calls from authenticated admins OR from the service role directly
    const authHeader = req.headers.get('Authorization')
    if (authHeader) {
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
    }

    const { email, password, name, role = 'student' } = await req.json() as {
      email: string
      password: string
      name: string
      role?: 'student' | 'teacher'
    }

    if (!email || !password || !name) {
      return Response.json({ error: 'email, password and name are required' }, { status: 400, headers: corsHeaders })
    }
    if (!['student', 'teacher'].includes(role)) {
      return Response.json({ error: 'role must be student or teacher' }, { status: 400, headers: corsHeaders })
    }

    // Create user via admin API, bypassing signup restrictions
    const { data: authData, error: createError } = await adminClient.auth.admin.createUser({
      email: email.trim(),
      password,
      email_confirm: true,
      user_metadata: { name: name.trim() },
    })

    if (createError) {
      const msg = createError.message.toLowerCase()
      if (msg.includes('already registered') || msg.includes('already exists') || msg.includes('already been registered')) {
        return Response.json({ error: 'Ya existe una cuenta con ese correo' }, { status: 409, headers: corsHeaders })
      }
      return Response.json({ error: createError.message }, { status: 400, headers: corsHeaders })
    }

    const userId = authData.user.id

    // Insert profile row
    const { error: userInsertError } = await adminClient
      .from('users')
      .upsert({ id: userId, email: email.trim(), name: name.trim(), role }, { onConflict: 'id' })

    if (userInsertError) {
      return Response.json({ error: userInsertError.message }, { status: 500, headers: corsHeaders })
    }

    if (role === 'student') {
      let demoPlanId: string | null = null
      const { data: demoPlan } = await adminClient
        .from('study_plans')
        .select('id')
        .eq('name', 'Demo')
        .maybeSingle()
      if (demoPlan) demoPlanId = demoPlan.id

      const { error: studentInsertError } = await adminClient
        .from('students')
        .upsert({ id: userId, teacher_id: null, plan_id: demoPlanId, active: true }, { onConflict: 'id' })

      if (studentInsertError) {
        return Response.json({ error: studentInsertError.message }, { status: 500, headers: corsHeaders })
      }
    } else {
      const { error: teacherInsertError } = await adminClient
        .from('teachers')
        .upsert({ id: userId }, { onConflict: 'id' })

      if (teacherInsertError) {
        return Response.json({ error: teacherInsertError.message }, { status: 500, headers: corsHeaders })
      }
    }

    return Response.json({ success: true, userId }, { headers: corsHeaders })
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Internal server error'
    return Response.json({ error: message }, { status: 500, headers: corsHeaders })
  }
})
