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

    const { action, userId, email, banType, reason, notes, expiresAt } = await req.json()

    if (action === 'ban') {
      // Find user by ID or email
      let targetUserId = userId

      if (!targetUserId && email) {
        // Look up user by email in auth.users
        const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
        const targetUser = users?.find(u => u.email?.toLowerCase() === email.toLowerCase())
        
        if (!targetUser) {
          return new Response(
            JSON.stringify({ error: 'Utilizator cu acest email nu a fost găsit' }),
            { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
          )
        }
        targetUserId = targetUser.id
      }

      if (!targetUserId || !banType || !reason) {
        return new Response(
          JSON.stringify({ error: 'Missing required fields: userId/email, banType, reason' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Prevent banning yourself
      if (targetUserId === user.id) {
        return new Response(
          JSON.stringify({ error: 'Nu te poți bana pe tine însuți' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Check if user is already banned
      const { data: existingBan } = await supabaseAdmin
        .from('user_bans')
        .select('id')
        .eq('user_id', targetUserId)
        .eq('is_active', true)
        .single()

      if (existingBan) {
        return new Response(
          JSON.stringify({ error: 'Utilizatorul este deja banat sau suspendat' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Create ban record
      const { error: banError } = await supabaseAdmin.from('user_bans').insert({
        user_id: targetUserId,
        banned_by: user.id,
        ban_type: banType,
        reason: reason,
        notes: notes || null,
        expires_at: banType === 'suspend' && expiresAt ? expiresAt : null,
        is_active: true
      })

      if (banError) throw banError

      // Log the action
      await supabaseAdmin.from('activity_logs').insert({
        user_id: user.id,
        action: banType === 'ban' ? 'user_banned' : 'user_suspended',
        entity_type: 'user',
        entity_id: targetUserId,
        metadata: {
          admin_id: user.id,
          ban_type: banType,
          reason: reason,
          expires_at: expiresAt || null
        }
      })

      return new Response(JSON.stringify({ 
        success: true,
        message: banType === 'ban' ? 'Utilizator banat cu succes' : 'Utilizator suspendat cu succes'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'unban') {
      if (!userId) {
        return new Response(
          JSON.stringify({ error: 'Missing userId' }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        )
      }

      // Remove ban
      const { error: unbanError } = await supabaseAdmin
        .from('user_bans')
        .update({ is_active: false })
        .eq('user_id', userId)
        .eq('is_active', true)

      if (unbanError) throw unbanError

      // Log the action
      await supabaseAdmin.from('activity_logs').insert({
        user_id: user.id,
        action: 'user_unbanned',
        entity_type: 'user',
        entity_id: userId,
        metadata: {
          admin_id: user.id
        }
      })

      return new Response(JSON.stringify({ 
        success: true,
        message: 'Ban ridicat cu succes'
      }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else if (action === 'get-bans') {
      // Get all active bans with user info
      const { data: bans, error: bansError } = await supabaseAdmin
        .from('user_bans')
        .select('*')
        .eq('is_active', true)
        .order('banned_at', { ascending: false })

      if (bansError) throw bansError

      // Get user details for all banned users
      const { data: { users } } = await supabaseAdmin.auth.admin.listUsers()
      const { data: profiles } = await supabaseAdmin
        .from('profiles')
        .select('id, full_name')

      const bansWithDetails = bans?.map(ban => {
        const authUser = users?.find(u => u.id === ban.user_id)
        const profile = profiles?.find(p => p.id === ban.user_id)
        const bannedByProfile = profiles?.find(p => p.id === ban.banned_by)

        return {
          ...ban,
          user_email: authUser?.email,
          user_name: profile?.full_name || authUser?.user_metadata?.full_name,
          banned_by_name: bannedByProfile?.full_name
        }
      })

      return new Response(JSON.stringify({ bans: bansWithDetails }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      })

    } else {
      return new Response(
        JSON.stringify({ error: 'Invalid action. Use: ban, unban, or get-bans' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

  } catch (error) {
    console.error('Error:', error)
    return new Response(JSON.stringify({ error: (error as Error).message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    })
  }
})
