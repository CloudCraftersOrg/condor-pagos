const { test } = require("node:test");
const assert = require("node:assert");
const fs = require("node:fs");
const path = require("node:path");

test("no FAIL_BUILD marker", () => {
  const marker = path.join(__dirname, "..", "FAIL_BUILD");
  assert.ok(!fs.existsSync(marker));
});
