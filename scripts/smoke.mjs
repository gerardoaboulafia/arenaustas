import assert from "node:assert/strict";
import { startServer } from "./serve.mjs";
const server = startServer(0);
await new Promise((resolve, reject) => {
  server.on("listening", resolve);
  server.on("error", reject);
});
const base = `http://127.0.0.1:${server.address().port}`;
try {
  const routes = [
    "/",
    "/mission/",
    "/mission/crew/maya-torres/",
    "/mission/crew/eli-chen/",
    "/mission/crew/sofia-okafor/",
    "/mission/crew/noah-patel/",
    "/mission/scenarios/",
    "/mission/data/",
    "/about/science/",
  ];
  const assets = new Set();
  for (const route of routes) {
    const response = await fetch(base + route);
    assert.equal(response.status, 200, route);
    const html = await response.text();
    assert.match(html, /ASTRA/);
    assert.match(html, /<html lang="en"/);
    for (const match of html.matchAll(/(?:src|href)="(\/_next\/[^"?]+)/g))
      assets.add(match[1]);
    console.log(`PASS ${route}`);
  }
  const home = await (await fetch(base)).text();
  assert.match(home, /Launch Mission/);
  assert.match(home, /href="\/mission\/?"/);
  const science = await (await fetch(base + "/about/science/")).text();
  assert.match(science, /nasa.gov/);
  assert.match(science, /synthetic/);
  assert.match(science, /No population clinical thresholds/);
  for (const route of ["/mission/crew/unknown/", "/does-not-exist/"]) {
    assert.equal((await fetch(base + route)).status, 404);
    console.log(`PASS 404 ${route}`);
  }
  for (const asset of assets)
    assert.equal((await fetch(base + asset)).status, 200, asset);
  assert.equal((await fetch(base + "/package.json")).status, 404);
  const configResponse = await fetch(base + "/mission-data/config.json");
  assert.equal(configResponse.status, 200);
  assert.equal(configResponse.headers.get("cache-control"), "no-store");
  const config = await configResponse.json();
  assert.equal(config.timeline.durationDays, 180);
  assert.equal(config.timeline.intervalMinutes, 15);
  assert.equal(config.crew.length, 4);
  assert.match(await (await fetch(base + "/mission-data/overrides.csv")).text(), /^end_minute,crew_id,metric_id,value/);
  assert.equal((await fetch(base + "/mission-data/private.txt")).status, 404);
  console.log(
    `PASS ${assets.size} JS/CSS assets; editable data endpoints, CTA, source/provenance, unavailable routes, source isolation.`,
  );
  console.log(
    "Production HTTP smoke passed. Browser interactions are a separate manual/CUA check.",
  );
} finally {
  await new Promise((resolve) => server.close(resolve));
}
