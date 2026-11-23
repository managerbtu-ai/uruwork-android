import { test } from "node:test";
import assert from "node:assert/strict";
import {
  activeJobs,
  filterJobs,
  normalizeJob,
  whatsappUrl,
  fetchJobs,
} from "../src/lib/jobs.ts";
test("reject malformed jobs and unsafe image URLs", () => {
  assert.equal(normalizeJob(null), null);
  assert.equal(normalizeJob({ title: "A" }), null);
  assert.equal(
    normalizeJob({ id: 1, title: "A", image_url: "javascript:alert(1)" })
      ?.image_url,
    "",
  );
  assert.equal(
    normalizeJob({ id: 1, title: "A", image_url: "/uploads/1.png" })?.image_url,
    "https://uruwork.com/uploads/1.png",
  );
});
test("exclude expired and malformed expiry dates", () => {
  assert.equal(
    activeJobs(
      [
        { id: 1, title: "Expired", expires_at: "2020-01-01" },
        { id: 2, title: "Live" },
        { id: 3, title: "Bad", expires_at: "bad" },
      ],
      Date.parse("2026-11-07"),
    ).length,
    1,
  );
});
test("search folds accents and combines category and location filters", () => {
  const jobs = activeJobs([
    {
      id: 1,
      title: "Atención al público",
      category: "Ventas",
      location: "Colón",
    },
    { id: 2, title: "Cocina", category: "Gastronomía", location: "Centro" },
  ]);
  assert.equal(filterJobs(jobs, "atencion", "Ventas", "Colón").length, 1);
  assert.equal(filterJobs(jobs, "atencion", "Ventas", "Centro").length, 0);
});
test("Uruguay local mobile phones gain country code", () => {
  assert.equal(whatsappUrl("099 123 456"), "https://wa.me/59899123456");
  assert.equal(whatsappUrl("+598 99 123 456"), "https://wa.me/59899123456");
  assert.equal(whatsappUrl(""), null);
});
test("API empty list is valid; API error and invalid schemas reject", async () => {
  const original = globalThis.fetch;
  try {
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: true, items: [] }));
    assert.deepEqual(await fetchJobs(), []);
    globalThis.fetch = async () =>
      new Response(JSON.stringify({ ok: false, items: [] }));
    await assert.rejects(fetchJobs());
    globalThis.fetch = async () => new Response("unavailable", { status: 503 });
    await assert.rejects(fetchJobs());
  } finally {
    globalThis.fetch = original;
  }
});
