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
    return env.ASSETS.fetch(request);
  }
};
