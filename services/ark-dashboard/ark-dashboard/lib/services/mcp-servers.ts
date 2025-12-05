import { apiClient } from '@/lib/api/client';
import type { components } from '@/lib/api/generated/types';

export type MCPServerResponse = components['schemas']['MCPServerResponse'];
export type MCPServerDetailResponse =
  components['schemas']['MCPServerDetailResponse'];
export type MCPServerListResponse =
  components['schemas']['MCPServerListResponse'];
export type MCPServerCreateRequest =
  components['schemas']['MCPServerCreateRequest'];
export type MCPServerSpec = components['schemas']['MCPServerSpec'];
export type MCPHeader =
  components['schemas']['ark_api__models__mcp_servers__Header-Output'];
//export type MCPServerListResponse = components['schemas']['MCPServerListResponse']

export type MCPServer = MCPServerResponse & { id: string };
export type MCPServerDetail = MCPServerDetailResponse & { id: string };

// MCP Server interface for UI compatibility
/*export interface MCPServer {
  id: string;
  name: string;
  namespace: string;
  type?: string;
  spec?: MCPServerSpec;
  description?: string;
  address?: string;
  transport?: string;
  available: boolean;
  discovering?: boolean;
  status_message?: string;
  tool_count?: number;
  annotations?: Record<string, string>;
}*


// MCP Server list response
interface MCPServerListResponse {
  items: MCPServer[];
  count: number;
}*/

export type DirectHeader = {
  name: string;
  value: {
    value: string;
  };
};

export type SecretHeader = {
  name: string;
  value: {
    valueFrom: {
      secretKeyRef: {
        name: string;
        key: string;
      };
    };
  };
};

/*export type Header = DirectHeader | SecretHeader;
export interface MCPServerSpec {
  address: {
    value: string;
  };
  description?: string;
  headers?: Header[];
  transport: 'http' | 'sse';
  timeout?: string;
}

export interface MCPServerConfiguration {
  name: string;
  namespace: string;
  spec: MCPServerSpec;
}*/

// Service for MCP server operations
export const mcpServersService = {
  // Get all MCP servers in a namespace
  async getAll(): Promise<MCPServer[]> {
    const response =
      await apiClient.get<MCPServerListResponse>(`/api/v1/mcp-servers`);

    const mcpservers = await Promise.all(
      response.items.map(async item => {
        if (item.available !== 'True') {
          const mcp = await mcpServersService.get(item.name);
          item.available = mcp?.available;
        }
        return {
          ...item,
          id: item.name,
        };
      }),
    );
    return mcpservers;
    // Map the response items to include id for UI compatibility
    /*return response.items.map(item => ({
      ...item,
      id: item.name, // Use name as id for UI compatibility
    }));*/
  },

  async get(mcpServerName: string): Promise<MCPServerDetail | null> {
    try {
      const response = await apiClient.get<MCPServerDetailResponse>(
        `/api/v1/mcp-servers/${mcpServerName}`,
      );
      return {
        ...response,
        id: response.name, // Use name as id for UI compatibility
      };
    } catch (error) {
      throw error;
    }
  },

  // Delete an MCP server
  async delete(identifier: string): Promise<void> {
    await apiClient.delete(`/api/v1/mcp-servers/${identifier}`);
  },

  async create(mcpSever: MCPServerCreateRequest): Promise<MCPServer> {
    const response = await apiClient.post<MCPServerDetailResponse>(
      `/api/v1/mcp-servers`,
      mcpSever,
    );
    return {
      ...response,
      id: response.name,
    };
  },

  /*async create(mcpSever: MCPServerConfiguration): Promise<MCPServer> {
    const response = await apiClient.post<MCPServer>(
      `/api/v1/mcp-servers`,
      mcpSever,
    );
    return response;
  },*/

  async update(
    mcpServerName: string,
    spec: { spec: MCPServerSpec },
  ): Promise<MCPServer> {
    const response = await apiClient.put<MCPServerDetailResponse>(
      `/api/v1/mcp-servers/${mcpServerName}`,
      spec,
    );
    return {
      ...response,
      id: response.name,
    };
  },
};
