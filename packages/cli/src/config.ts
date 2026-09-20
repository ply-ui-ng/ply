import fs from 'fs';
import path from 'path';
import { CLI_NPX } from './brand';
import { CONFIG_FILE, LEGACY_CONFIG_FILE, configFilePath } from './paths';

export interface Config {
  aliases: {
    components: string;
  };
}

export function readConfig(): Config | null {
  const resolved = configFilePath();
  if (!resolved) {
    console.error(
      `${CONFIG_FILE} not found (also looked for ${LEGACY_CONFIG_FILE}). Please run "${CLI_NPX} init" first.`,
    );
    return null;
  }
  try {
    const config = JSON.parse(fs.readFileSync(resolved, 'utf8'));
    if (!config || !config.aliases || !config.aliases.components) {
      throw new Error(`Missing aliases.components in ${path.basename(resolved)}`);
    }
    return config;
  } catch (err: any) {
    console.error(`Error reading ${path.basename(resolved)}: ${err.message}`);
    return null;
  }
}
