/**
 * Skill Plugin Interface
 *
 * A skill is a modular capability that any beacon can install.
 * It adds protocol types, database tables, API routes, DHT message handlers,
 * and MCP tools in one package.
 */

/** Generic database type — maps to better-sqlite3 Database at runtime */
// eslint-disable-next-line @typescript-eslint/no-empty-interface
export interface SkillDatabase {
  exec(sql: string): void;
  prepare(sql: string): unknown;
  pragma(pragma: string): unknown;
}

export interface SkillManifest {
  id: string;                    // "reverse-auction"
  name: string;                  // "Reverse Auction"
  version: string;               // "1.0.0"
  description: string;
  author: string;
  icon?: string;                 // emoji or URL
  tags?: string[];               // ["commerce", "buyer", "auction"]
}

export interface SkillContext {
  db: SkillDatabase;             // beacon's SQLite instance
  beaconId: string;
  dht: {                         // DHT access for P2P messaging
    sendMessage(targetBeaconId: string, message: unknown): void;
    onMessage(type: string, handler: (fromBeaconId: string, payload: unknown) => void): void;
    broadcastMessage(message: unknown): void;
  };
}

export interface Skill {
  manifest: SkillManifest;
  /** Run DB migrations — called once on install and on every startup */
  migrate(db: SkillDatabase): void;
  /** Return Express router for this skill's HTTP endpoints */
  createRouter(ctx: SkillContext): unknown;
  /** Register DHT message handlers */
  registerDht?(ctx: SkillContext): void;
  /** Return MCP tool definitions for this skill */
  getMcpTools?(): McpToolDef[];
  /** Return MCP prompt definitions */
  getMcpPrompts?(): McpPromptDef[];
  /** Return cross-platform distribution artifacts */
  getDistribution?(): SkillDistribution;
}

export interface McpToolDef {
  name: string;
  description: string;
  schema: Record<string, unknown>;  // Zod-compatible JSON schema
  handler: (params: Record<string, unknown>, beaconUrl: string) => Promise<unknown>;
}

export interface McpPromptDef {
  name: string;
  description: string;
  arguments?: { name: string; description: string; required?: boolean }[];
  template: string | ((args: Record<string, string>) => string);
}

/** Cross-platform distribution metadata */
export interface SkillDistribution {
  /** OpenAPI 3.0 spec for the skill's HTTP routes — enables OpenAI GPT Actions */
  openApiSpec?: Record<string, unknown>;
  /** ClawHub-compatible SKILL.md content (YAML frontmatter + markdown instructions) */
  clawHubSkillMd?: string;
  /** Claude Code plugin manifest for Anthropic marketplace */
  claudePluginManifest?: Record<string, unknown>;
}
