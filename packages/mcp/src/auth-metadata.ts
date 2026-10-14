/** Canonical auth.md skill. Registration is not offered; see the file. */
export const AUTH_MD_URL = 'https://ply-ui.com/auth.md';

export interface ProtectedResourceMetadata {
  resource: string;
  resource_name: string;
  resource_documentation: string;
  resource_logo_uri: string;
  authorization_servers: string[];
  scopes_supported: string[];
  bearer_methods_supported: string[];
}

/** RFC 9728 metadata for one MCP origin. An empty authorization_servers list means registration is off. */
export function mcpProtectedResource(resource: string, bearer: boolean): ProtectedResourceMetadata {
  return {
    resource,
    resource_name: 'Ply MCP',
    resource_documentation: AUTH_MD_URL,
    resource_logo_uri: 'https://ply-ui.com/assets/pwa/apple-touch-icon.png',
    authorization_servers: [],
    scopes_supported: [],
    bearer_methods_supported: bearer ? ['header'] : [],
  };
}

export function wwwAuthenticate(resourceMetadataUrl: string): string {
  return `Bearer resource_metadata="${resourceMetadataUrl}"`;
}
