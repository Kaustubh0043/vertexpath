interface Env {
  ASSETS: {
    fetch: (request: Request) => Promise<Response>;
  };
  API: {
    fetch: (request: Request) => Promise<Response>;
  };
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    // Forward API requests via direct memory Service Binding to pathpilot-api worker
    if (url.pathname.startsWith('/api/')) {
      return env.API.fetch(request);
    }

    // Serve static frontend assets with automatic SPA fallback
    const response = await env.ASSETS.fetch(request);
    
    // Prevent browser from caching index.html so updates are immediate
    if (url.pathname === '/' || url.pathname.startsWith('/dashboard') || url.pathname.startsWith('/auth')) {
      const headers = new Headers(response.headers);
      headers.set('Cache-Control', 'no-cache, no-store, must-revalidate');
      headers.set('Pragma', 'no-cache');
      headers.set('Expires', '0');
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers,
      });
    }

    return response;
  }
};
