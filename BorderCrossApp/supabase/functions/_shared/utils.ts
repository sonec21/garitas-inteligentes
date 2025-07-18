export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers':
    'authorization, x-client-info, apikey, content-type',
};

export function errorResponse(message: string, status: number = 400) {
  return new Response(
    JSON.stringify({
      success: false,
      error: message,
      timestamp: new Date().toISOString(),
    }),
    {
      headers: {
        ...corsHeaders,
        'Content-Type': 'application/json',
      },
      status,
    },
  );
}