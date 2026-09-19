import { handleMcpFetch } from './web';

export interface Env {
  PLY_MCP_AUTH_TOKEN?: string;
  BASE_UI_MCP_AUTH_TOKEN?: string;
}

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    return handleMcpFetch(request, {
      authToken: env.PLY_MCP_AUTH_TOKEN || env.BASE_UI_MCP_AUTH_TOKEN,
    });
  },
};
