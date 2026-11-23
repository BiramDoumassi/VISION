// Tests des analyseurs Monde sur des échantillons au format documenté de chaque source.
import { test } from "node:test";
import assert from "node:assert/strict";
import { countryAt, parseAcled, parseGdacs, parseUsgs } from "../world";

test("pays d'un point", () => {
  assert.equal(countryAt(2.35, 48.85), "250"); // Paris → France
  assert.equal(countryAt(139.7, 35.7), "392"); // Tokyo → Japon
  assert.equal(countryAt(-30, 30), "");        // Atlantique
});

test("USGS : séismes M5,5+ seulement, pays déduit, durée 7 jours", () => {
  const out = parseUsgs({ features: [
    { id: "us6000a", properties: { mag: 6.1, place: "18 km N of Honchō, Japan", time: Date.parse("2026-11-20T03:00:00Z"), url: "https://earthquake.usgs.gov/earthquakes/eventpage/us6000a", alert: "yellow" }, geometry: { coordinates: [139.7, 35.7, 10] } },
    { id: "us6000b", properties: { mag: 4.8, place: "south of Tonga", time: Date.parse("2026-11-21T03:00:00Z"), url: "x" }, geometry: { coordinates: [-175, -22, 10] } },
  ] });
  assert.equal(out.length, 1);
  assert.equal(out[0].countryIso, "392");
  assert.equal(out[0].since, "2026-11-20");
  assert.equal(out[0].until, "2026-11-27");
  assert.equal(out[0].severity, "medium");
  assert.match(out[0].title.fr, /Séisme M6,1/);
});

test("GDACS : type, niveau, ISO3 → numérique, épisodes dédoublonnés", () => {
  const f = (episodeid: number) => ({ geometry: { type: "Point", coordinates: [72.6, 23.0] }, properties: { eventtype: "FL", eventid: 1104081, episodeid, name: "", alertlevel: "Orange", fromdate: "2026-11-18T00:00:00", todate: "2026-11-22T00:00:00", iso3: "IND", country: "India", url: { report: "https://www.gdacs.org/report.aspx?eventid=1104081" } } });
  const out = parseGdacs({ features: [f(1), f(2), { geometry: { type: "Polygon", coordinates: [] }, properties: { eventtype: "FL", eventid: 1, alertlevel: "Red", fromdate: "2026-11-01" } } as never] });
  assert.equal(out.length, 1);
  assert.equal(out[0].sub, "flood");
  assert.equal(out[0].countryIso, "356");
  assert.equal(out[0].severity, "medium");
  assert.equal(out[0].until, "2026-11-24");
});

test("ACLED : types retenus, ISO numérique sur 3 chiffres, gravité", () => {
  const out = parseAcled([
    { event_id_cnty: "AZE123", event_date: "2026-11-21", event_type: "Battles", sub_event_type: "Armed clash", country: "Azerbaijan", location: "Ganja", latitude: "40.68", longitude: "46.36", iso: 31, fatalities: "2" },
    { event_id_cnty: "FRA9", event_date: "2026-11-21", event_type: "Protests", sub_event_type: "Peaceful protest", country: "France", location: "Paris", latitude: 48.8, longitude: 2.3, iso: 250, fatalities: 0 },
  ]);
  assert.equal(out.length, 1);
  assert.equal(out[0].countryIso, "031");
  assert.equal(out[0].severity, "high");
  assert.equal(out[0].sub, "clashes");
});
