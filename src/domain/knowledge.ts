// AI-assisted: written with Claude Code, reviewed by the team.
// Every threshold, action and model parameter lives in src/data/knowledge/*.json, never in code.
import sourcesJson from '../data/knowledge/sources.json';
import hazardsJson from '../data/knowledge/hazards.json';
import indicatorsJson from '../data/knowledge/indicators.json';
import systemsJson from '../data/knowledge/systems.json';
import modelsJson from '../data/knowledge/models.json';
import rulesJson from '../data/knowledge/rules.json';
import type { Hazard, Indicator, ProjectionModel, Rules, Source, SystemDef } from './types';

export const sources = sourcesJson as Source[];
export const hazards = hazardsJson as Hazard[];
export const indicators = indicatorsJson as Indicator[];
export const systems = systemsJson as SystemDef[];
export const models = modelsJson as unknown as ProjectionModel[];
export const rules = rulesJson as unknown as Rules;

export const sourceById = (id?: string) => sources.find((s) => s.id === id);
export const hazardById = (id: string) => hazards.find((h) => h.id === id);
export const indicatorById = (id: string) => indicators.find((i) => i.id === id);

export function modelById(id: string): ProjectionModel {
  const model = models.find((m) => m.id === id);
  if (!model) throw new Error(`Unknown model: ${id}`);
  return model;
}
