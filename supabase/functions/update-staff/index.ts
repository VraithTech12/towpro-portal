import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    // Create admin client for user management
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    });

    // Create regular client to verify the caller
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(
        JSON.stringify({ error: 'No authorization header' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(supabaseUrl, Deno.env.get('SUPABASE_ANON_KEY')!, {
      global: { headers: { Authorization: authHeader } },
    });

    // Get the calling user
    const { data: { user: caller }, error: userError } = await supabase.auth.getUser();
    if (userError || !caller) {
      console.error('Auth error:', userError);
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { userId, name, phone, email, password } = await req.json();
    console.log('Updating staff member:', { userId, name, email: email ? 'provided' : 'not provided' });

    // Check if caller is updating themselves or has admin/owner permissions
    const isSelfUpdate = caller.id === userId;
    
    if (!isSelfUpdate) {
      // Check if caller is owner or admin
      const { data: callerRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', caller.id)
        .in('role', ['owner', 'admin'])
        .maybeSingle();

      if (!callerRole) {
        console.error('Caller is not owner or admin and not updating self');
        return new Response(
          JSON.stringify({ error: 'Insufficient permissions' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

      // Check target user's role - admins can only update employees
      const { data: targetRole } = await supabaseAdmin
        .from('user_roles')
        .select('role')
        .eq('user_id', userId)
        .maybeSingle();

      if (callerRole.role === 'admin' && targetRole?.role !== 'employee') {
        return new Response(
          JSON.stringify({ error: 'Admins can only update employees' }),
          { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    // Update auth user if email or password provided
    if (email || password) {
      const updateData: { email?: string; password?: string } = {};
      if (email) updateData.email = email;
      if (password) updateData.password = password;

      const { error: authUpdateError } = await supabaseAdmin.auth.admin.updateUserById(
        userId,
        updateData
      );

      if (authUpdateError) {
        console.error('Auth update error:', authUpdateError);
        return new Response(
          JSON.stringify({ error: authUpdateError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Auth credentials updated');
    }

    // Update profile
    const profileUpdate: { name?: string; phone?: string | null } = {};
    if (name) profileUpdate.name = name;
    if (phone !== undefined) profileUpdate.phone = phone || null;

    if (Object.keys(profileUpdate).length > 0) {
      const { error: profileError } = await supabaseAdmin
        .from('profiles')
        .update(profileUpdate)
        .eq('user_id', userId);

      if (profileError) {
        console.error('Profile update error:', profileError);
        return new Response(
          JSON.stringify({ error: profileError.message }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      console.log('Profile updated');
    }

    console.log('Staff member updated successfully');
    return new Response(
      JSON.stringify({ success: true }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
