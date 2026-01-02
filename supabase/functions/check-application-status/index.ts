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
    const { applicationId } = await req.json();
    
    // Input validation
    if (!applicationId || typeof applicationId !== 'string') {
      console.error('Invalid application ID provided');
      return new Response(
        JSON.stringify({ error: 'Application ID is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Sanitize and validate application ID format (TOW + 8 hex characters)
    const sanitizedId = applicationId.toUpperCase().trim();
    const validIdPattern = /^TOW[A-F0-9]{8}$/;
    
    if (!validIdPattern.test(sanitizedId)) {
      console.log(`Invalid application ID format: ${sanitizedId}`);
      return new Response(
        JSON.stringify({ error: 'Invalid application ID format' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Create Supabase client with service role for bypassing RLS
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    console.log(`Checking application status for ID: ${sanitizedId}`);

    // Only return non-sensitive status information
    const { data, error } = await supabase
      .from('applications')
      .select('application_id, character_name, status, created_at, reviewed_at, reviewer_notes')
      .eq('application_id', sanitizedId)
      .maybeSingle();

    if (error) {
      console.error('Database error:', error.message);
      return new Response(
        JSON.stringify({ error: 'Failed to check application status' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!data) {
      console.log(`Application not found: ${sanitizedId}`);
      return new Response(
        JSON.stringify({ found: false }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`Application found: ${sanitizedId}, status: ${data.status}`);
    return new Response(
      JSON.stringify({ found: true, application: data }),
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
