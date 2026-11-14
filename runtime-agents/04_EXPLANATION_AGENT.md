# Runtime Explanation Agent — specification

**Purpose:** turn genuine structured findings into understandable, cited, modest language for a crew member.

**Module:** `src/lib/agents/explanation.ts` (pure templates by default; optional tightly controlled LLM rewrite only after MVP).

## Inputs

`Finding`, `Deviation[]`, `EvidenceRecord[]` (verified NASA source IDs/URLs only), active mission day and data mode (`synthetic`).

## Required template details

- State which metric changed, from which early-mission baseline, over what days and by how much.
- Explain which **prototype rule** was triggered; separate that rule from a NASA research conclusion.
- Explain that readings are synthetic and do not represent real astronauts.
- Suggested next action is review data quality, note contributing context, consult onboard medical officer where relevant; no diagnosis/treatment instruction.
- If NASA context card is present, citation URL and 'source used for' must be traceable to manifest.

## Example output format

> This simulated astronaut's average sleep over the past three days was [value] h compared with [baseline] h during baseline days 120–133. That crossed ASTRA's illustrative sleep deviation rule. Check data quality and review the trend with the crew medical officer. NASA research recognizes sleep/circadian disruption as an area of concern for space missions, but NASA has not validated this demo alert threshold.

## Safety

No ungrounded citations, medical claims, prognosis, countermeasure effect sizes, advice to ignore serious symptoms, or false NASA approval. Templates and source manifest are safer than improvised clinical writing.

## Tests

Generated text matches numeric input values and source IDs; missing data leads to uncertainty language; citation allowlist prevents nonexistent references; terms 'diagnosed' and 'NASA certified' never appear as fact.
