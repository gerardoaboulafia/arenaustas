import { METRICS } from "../metrics";
import type { EvidenceRecord, ExplanationOutput, Finding } from "../types";

/** Resolve exact manifest IDs; ambiguous IDs and non-NASA/non-HTTPS links are omitted. */
export function resolveEvidence(sourceIds: readonly string[], catalog: readonly EvidenceRecord[]): EvidenceRecord[] {
  const counts = new Map<string, number>();
  for (const record of catalog) counts.set(record.source_id, (counts.get(record.source_id) ?? 0) + 1);
  return [...new Set(sourceIds)].flatMap((sourceId) => {
    if (counts.get(sourceId) !== 1) return [];
    const record = catalog.find((entry) => entry.source_id === sourceId);
    if (!record) return [];
    try {
      const url = new URL(record.url);
      if (url.protocol !== "https:" || url.username || url.password || (url.hostname !== "nasa.gov" && !url.hostname.endsWith(".nasa.gov"))) return [];
      return [{ ...record }];
    } catch { return []; }
  });
}

export function explainFinding(finding: Finding, evidenceCatalog: readonly EvidenceRecord[] = []): ExplanationOutput {
  const evidence = resolveEvidence(finding.sourceIds, evidenceCatalog);
  const paragraphs = ["These readings are synthetic and describe a fictional astronaut, not real NASA measurements."];
  for (const deviation of finding.deviations) {
    const definition = METRICS[deviation.metric];
    const difference = Math.abs(deviation.absoluteChange).toFixed(2);
    paragraphs.push(
      `Over mission days ${deviation.windowStart}–${deviation.windowEnd}, ${definition.label} averaged ${deviation.recentMean.toFixed(2)} ${deviation.unit} across ${deviation.availableDays} available readings, compared with ${deviation.baselineMean.toFixed(2)} ${deviation.unit} from available baseline days 120–133 as of day ${finding.missionDay}. ` +
      `That is ${difference} ${deviation.unit} ${deviation.direction} than baseline and crosses ASTRA's illustrative personalized deviation rule (${definition.ruleDescription}; ${deviation.ruleId}). ` +
      (deviation.persistent ? `${deviation.thresholdDays.length} individual days crossed the same threshold: a persistent deviation in this fixture.` : "This is a short-term fluctuation; it does not meet the persistence rule.") +
      (deviation.quality !== "high" ? " Missing readings limit certainty." : "") +
      (deviation.metric === "cabinCo2Ppm" ? " This is habitat context only; no toxicity or health outcome is inferred." : ""),
    );
  }
  if (finding.state === "insufficient_data") {
    const missing = finding.missingMetrics.map((metric) => METRICS[metric].label).join(", ") || "the evaluated signals";
    paragraphs.push(`Data is insufficient for ${missing}: a metric needs at least 10 baseline readings and 2 readings in the latest 3 calendar days. Unknown values do not establish normality. Any available deviations remain visible; check measurement quality and missing records.`);
  } else if (finding.state === "normal") {
    paragraphs.push("No persistent health-related deviations were detected by the available fixture-only rules. This is not a medical clearance or a statement about real health.");
  }
  if (finding.quality === "limited") paragraphs.push("Some baseline or recent readings are missing. The assessment uses available observations and has limited data quality.");
  if (finding.action === "discuss_with_medical_officer") {
    paragraphs.push("Consider reviewing measurement quality and the relevant activity and sleep log, and discussing the trend with the crew medical officer. This is not a diagnosis.");
  } else if (finding.action === "review_measurements") {
    paragraphs.push("Review measurement quality and the relevant recorded context. This is not a diagnosis or a treatment recommendation.");
  } else paragraphs.push("Continue observing the synthetic timeline; no automated medical action is generated.");
  for (const record of evidence) {
    paragraphs.push(`Research context [${record.source_id}]: ${record.title}. Source used for: ${record.used_for}. ${record.summary}`);
  }
  if (evidence.length) paragraphs.push("NASA resources provide research context only. NASA has not validated ASTRA's demo thresholds, scenario assumptions, or individual findings.");
  else paragraphs.push("No catalog-backed NASA citation is attached to this finding; the thresholds remain fixture-only prototype rules.");
  const sourceIds = evidence.map((record) => record.source_id);
  return {
    findingId: finding.id, narrative: paragraphs.join("\n\n"), citations: evidence.map((record) => record.url), sourceIds, evidence,
    trace: {
      agent: "explanation", inputSummary: `${finding.id}; ${finding.deviations.length} structured deviations; ${finding.sourceIds.length} requested evidence IDs.`,
      outputSummary: `Deterministic template; ${evidence.length} catalog-resolved context citations; synthetic provenance and uncertainty disclosed.`,
      rules: ["STRUCTURED_FINDINGS_ONLY", "EXACT_CATALOG_IDS_ONLY", "HTTPS_NASA_CONTEXT_LINKS_ONLY", "NASA_CONTEXT_NOT_THRESHOLD_VALIDATION", "NO_DIAGNOSIS_OR_PRESCRIPTION"], sourceIds,
    },
  };
}
