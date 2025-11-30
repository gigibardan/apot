import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify request is from authenticated admin
    const authHeader = req.headers.get('Authorization')!
    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: authError } = await supabaseAdmin.auth.getUser(token)
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Check if user is admin
    const { data: roleData } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleData?.role !== 'admin') {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })
    }

    // Get total users count
    const { data: { users }, error: usersError } = await supabaseAdmin.auth.admin.listUsers()
    const totalUsers = users?.length || 0

    // Get users by role
    const { data: roles } = await supabaseAdmin
      .from('user_roles')
      .select('role')

    const roleStats = roles?.reduce((acc, r) => {
      acc[r.role] = (acc[r.role] || 0) + 1
      return acc
    }, {} as Record<string, number>) || {}

    // Get active bans
    const { count: bannedCount } = await supabaseAdmin
      .from('user_bans')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('ban_type', 'ban')

    // Get active suspensions
    const { count: suspendedCount } = await supabaseAdmin
      .from('user_bans')
      .select('*', { count: 'exact', head: true })
      .eq('is_active', true)
      .eq('ban_type', 'suspend')

    // Get new users last 30 days
    const thirtyDaysAgo = new Date()
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)
    const newUsers = users?.filter(u => 
      new Date(u.created_at) > thirtyDaysAgo
    ).length || 0

    // Get active users (signed in last 30 days)
    const activeUsers = users?.filter(u => 
      u.last_sign_in_at && new Date(u.last_sign_in_at) > thirtyDaysAgo
    ).length || 0

    return new Response(JSON.stringify({
      totalUsers,
      roleStats,
      bannedCount: bannedCount || 0,
      suspendedCount: suspendedCount || 0,
      newUsers,
      activeUsers
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
