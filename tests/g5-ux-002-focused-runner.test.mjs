import assert from "node:assert/strict"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

test("shared focused runner is presentation-only and carries Grade 5 identity", async () => {
  const source = await read("components/assessment/focused-active-runner.tsx")

  assert.match(source, /PEP PRACTICE · Grade 5 · Language Arts/)
  assert.match(source, /Question \{currentQuestion \+ 1\}/)
  assert.match(source, /Time remaining/)
  assert.match(source, /role="radiogroup"/)
  assert.match(source, /role="radio"/)
  assert.doesNotMatch(source, /prepareAssessment|preparePreview|setInterval|saveStudentTestResult/)
  assert.doesNotMatch(source, /components\/header|components\/footer/)
})

test("Mixed 10 supplies its existing source and navigator to the shared runner", async () => {
  const source = await read("app/mock-tests/literacy/mixed-10/page.tsx")

  assert.match(source, /<FocusedActiveRunner/)
  assert.match(source, /stimulus=\{\{title:"Reading Passage",content:passage\}\}/)
  assert.match(source, /onNavigate=\{setCurrentQuestion\}/)
  assert.match(source, /onSubmit=\{\(\)=>void submitTest\(\)\}/)
  assert.match(source, /const TEST_SECONDS = 60 \* 60/)
  assert.match(source, /prepareAssessment\(questions\)/)
  assert.match(source, /preparePreview\(questions,FREE_QUESTION_LIMIT\)/)
})

test("Easy 1 keeps embedded question strings intact and supplies no derived stimulus", async () => {
  const source = await read("app/mock-tests/literacy/easy-1/page.tsx")

  assert.match(source, /<FocusedActiveRunner/)
  assert.match(source, /question=\{q\}/)
  assert.match(source, /onSubmit=\{\(\) => setShowResults\(true\)\}/)
  assert.match(source, /prepareAssessment\(g5LaEasy1Questions\)/)
  assert.match(source, /preparePreview\(g5LaEasy1Questions, FREE_QUESTION_LIMIT\)/)
  assert.doesNotMatch(source, /extractPassage|extractQuestionStem|READING_PASSAGES|stimulus=/)
})

test("normal site shell remains on pre-start and results branches only", async () => {
  for (const path of [
    "app/mock-tests/literacy/mixed-10/page.tsx",
    "app/mock-tests/literacy/easy-1/page.tsx",
  ]) {
    const source = await read(path)
    assert.equal(source.match(/<Header\s*\/>/g)?.length, 2)
    assert.equal(source.match(/<Footer\s*\/>/g)?.length, 2)
  }
})
