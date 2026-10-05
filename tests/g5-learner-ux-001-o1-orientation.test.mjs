import assert from "node:assert/strict"
import { execFileSync } from "node:child_process"
import { readFile } from "node:fs/promises"
import test from "node:test"

const baseline = "07023f19a9c4e701c6d88eb7b555e56cc6a85ec6"
const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")
const sharedMockTestLinks = [
  "components/footer.tsx",
  "components/hero-section.tsx",
  "components/welcome-card.tsx",
]

test("O1-01 homepage explicitly distinguishes Practice from Mock Tests", async () => {
  const home = await read("app/page.tsx")

  assert.match(home, />Practice</)
  assert.match(home, />Mock Tests</)
  assert.match(home, /Learn or review a subject, answer shorter practice questions, and use explanations and feedback to improve\./)
  assert.match(home, /Take broader Grade 5 assessments to check performance and readiness across subject content\./)
})

test("O1-02 Practice uses the existing subject selection and never resolves to Mock Tests", async () => {
  const home = await read("app/page.tsx")
  const subjectCards = await read("components/subject-cards.tsx")

  assert.match(home, /id="subject-practice"/)
  assert.match(home, /href="#subject-practice"[\s\S]*Choose a Practice Subject/)
  assert.match(home, /<SubjectCards \/>/)
  assert.doesNotMatch(home, /href="\/mock-tests"[\s\S]{0,160}>Start Practice</)
  for (const destination of ["/language-arts", "/mathematics", "/science", "/social-studies"]) {
    assert.match(subjectCards, new RegExp(`href: "${destination}"`))
  }
})

test("O1-03 explicit Mock Test entry remains the authoritative route", async () => {
  const home = await read("app/page.tsx")

  assert.match(home, /href="\/mock-tests"[\s\S]*Explore Mock Tests/)
})

test("O1-04 the old generic Start Practice to Mock Tests contract is removed", async () => {
  const home = await read("app/page.tsx")

  assert.doesNotMatch(home, /<Link href="\/mock-tests">[\s\S]{0,180}Start Practice/)
})

test("O1-CORR-001 shared learner navigation identifies every /mock-tests action as Mock Tests", async () => {
  for (const path of sharedMockTestLinks) {
    const source = await read(path)
    assert.doesNotMatch(source, /<Link\b(?=[^>]*\bhref="\/mock-tests")[^>]*>(?:(?!<\/Link>)[\s\S])*?\bStart\s+Practice\b(?:(?!<\/Link>)[\s\S])*?<\/Link>/)
    assert.match(source, /<Link\b(?=[^>]*\bhref="\/mock-tests")[^>]*>(?:(?!<\/Link>)[\s\S])*?\bMock\s+Tests\b(?:(?!<\/Link>)[\s\S])*?<\/Link>/)
  }
})

test("O1-CORR-001 no equivalent static generic Practice to /mock-tests contract remains", async () => {
  const sourcePaths = execFileSync("git", ["ls-files", "app", "components"], { encoding: "utf8" })
    .trim().split("\n").filter((path) => /\.(?:jsx|tsx)$/.test(path))
  const conflictingContract = /<Link\b(?=[^>]*\bhref="\/mock-tests")[^>]*>(?:(?!<\/Link>)[\s\S])*?\b(?:Start\s+Practice|Practice)\b(?:(?!<\/Link>)[\s\S])*?<\/Link>/
  const conflicts = []
  for (const path of sourcePaths) if (conflictingContract.test(await read(path))) conflicts.push(path)
  assert.deepEqual(conflicts, [])
})

test("O1-05 Mock Tests identifies assessment readiness and points learners back to Practice", async () => {
  const mockTests = await read("app/mock-tests/page.tsx")

  assert.match(mockTests, /<h1[\s\S]*Mock Tests/)
  assert.match(mockTests, /check your Grade 5 performance and readiness/)
  assert.match(mockTests, /href="\/#subject-practice"/)
  assert.match(mockTests, /Choose a Practice subject on Home\./)
  assert.doesNotMatch(mockTests, /begin practice/)
})

test("O1-06 through O1-09 protected mechanics, assessments, entitlement, and database remain unchanged", () => {
  const protectedPaths = [
    "app/mock-tests/literacy",
    "app/mock-tests/mathematics",
    "app/mock-tests/science",
    "app/mock-tests/social-studies",
    "components/assessment",
    "contexts",
    "lib/assessment-preparation.ts",
    "supabase",
  ]
  const changed = execFileSync("git", ["diff", "--name-only", baseline, "--", ...protectedPaths], {
    encoding: "utf8",
  }).trim()

  assert.equal(changed, "")
})

test("O1-10 candidate stays inside the authorized static orientation boundary", () => {
  const changed = execFileSync("git", ["diff", "--name-only", baseline], { encoding: "utf8" })
    .trim()
    .split("\n")
    .filter(Boolean)

  assert.deepEqual(changed, [
    "components/footer.tsx",
    "components/hero-section.tsx",
    "components/welcome-card.tsx",
    "tests/g5-learner-ux-001-o1-orientation.test.mjs",
  ])
})
