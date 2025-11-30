import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.86.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    console.log('[Scheduled Actions] Starting execution check...');

    // Get pending actions that should be executed now
    const { data: pendingActions, error: fetchError } = await supabase
      .from('scheduled_actions')
      .select('*')
      .eq('status', 'pending')
      .lte('scheduled_for', new Date().toISOString());

    if (fetchError) throw fetchError;

    console.log(`[Scheduled Actions] Found ${pendingActions?.length || 0} pending actions`);

    const results = {
      executed: 0,
      failed: 0,
      errors: [] as string[],
    };

    // Execute each action
    for (const action of pendingActions || []) {
      try {
        console.log(`[Scheduled Actions] Executing: ${action.action_type} for ${action.entity_type}#${action.entity_id}`);

        // Determine which table to update based on entity type
        const table = action.entity_type === 'blog_article' ? 'blog_articles' : 'objectives';

        // Execute the action based on type
        let updateData: any = {};
        
        switch (action.action_type) {
          case 'publish':
            updateData = { published: true, published_at: new Date().toISOString() };
            break;
          case 'unpublish':
            updateData = { published: false };
            break;
          case 'feature':
            updateData = { featured: true };
            break;
          case 'unfeature':
            updateData = { featured: false };
            break;
          case 'archive':
            updateData = { published: false, archived: true };
            break;
          default:
            throw new Error(`Unknown action type: ${action.action_type}`);
        }

        // Update the entity
        const { error: updateError } = await supabase
          .from(table)
          .update(updateData)
          .eq('id', action.entity_id);

        if (updateError) throw updateError;

        // Mark action as executed
        const { error: statusError } = await supabase
          .from('scheduled_actions')
          .update({
            status: 'executed',
            executed_at: new Date().toISOString(),
          })
          .eq('id', action.id);

        if (statusError) throw statusError;

        // Log activity
        await supabase.rpc('log_activity', {
          p_user_id: action.created_by || null,
          p_action: `scheduled_${action.action_type}`,
          p_entity_type: action.entity_type,
          p_entity_id: action.entity_id,
          p_metadata: { scheduled_action_id: action.id },
          p_severity: 'info',
        });

        results.executed++;
        console.log(`[Scheduled Actions] ✓ Success: ${action.id}`);

      } catch (error: any) {
        console.error(`[Scheduled Actions] ✗ Failed: ${action.id}`, error);
        results.failed++;
        results.errors.push(`${action.id}: ${error.message}`);

        // Mark action as failed
        await supabase
          .from('scheduled_actions')
          .update({
            status: 'failed',
            error_message: error.message,
          })
          .eq('id', action.id);
      }
    }

    console.log('[Scheduled Actions] Execution complete:', results);

    return new Response(
      JSON.stringify({
        success: true,
        message: `Executed ${results.executed} actions, ${results.failed} failed`,
        results,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error: any) {
    console.error('[Scheduled Actions] Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
