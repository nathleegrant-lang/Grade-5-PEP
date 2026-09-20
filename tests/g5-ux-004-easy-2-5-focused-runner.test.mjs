import assert from "node:assert/strict"
import { createHash } from "node:crypto"
import { readFile } from "node:fs/promises"
import test from "node:test"

const read = (path) => readFile(new URL(`../${path}`, import.meta.url), "utf8")

const expectedAssessmentHashes = new Map([
  [2, "ac441d5d08536c7ed1658e1d7e33960fede88615d12d7f8cbaebd37cad111085"],
  [3, "6d6c85e709a6d634aa11871a349ec1025bb475a6f3490532a6869f67f66207e3"],
  [4, "d6714e198ee50b2fffdb2325714bb10652c9c0e6f9a696a9f97581128f6d3253"],
  [5, "dcd73123a3f0d43d87d839fa4ea0f1b5c95b39061249f26bc915b0cfdeddfd68"],
])

const assessmentBlock = (source, assessmentNumber) => {
  const start = source.indexOf(`const g5LaEasy${assessmentNumber}Questions`)
  const end = source.indexOf("\n]\n", start)
  assert.notEqual(start, -1)
  assert.notEqual(end, -1)
  return source.slice(start, end + 3)
}

test("Easy 2-5 use the production focused runner with page-owned navigation", async () => {
  for (let assessmentNumber = 2; assessmentNumber <= 5; assessmentNumber += 1) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)

    assert.match(source, /import \{ FocusedActiveRunner \} from "@\/components\/assessment\/focused-active-runner"/)
    assert.match(source, /<FocusedActiveRunner/)
    if (assessmentNumber === 3) {
      assert.match(source, /question=\{q\}/)
      assert.doesNotMatch(source, /stimulus=/)
    } else {
      assert.match(source, /question=\{\{ \.\.\.q, question: displayedQuestion \?\? q\.question \}\}/)
      assert.match(source, /stimulus=\{passageText && passageNumber/)
    }
    assert.match(source, /questions=\{availableQuestions\}/)
    assert.match(source, /onNavigate=\{\(questionIndex\) => setCurrentQuestion/)
    assert.match(source, /onSubmit=\{handleSubmit\}/)
    assert.equal(source.match(/<Header\s*\/>/g)?.length, 3)
    assert.equal(source.match(/<Footer\s*\/>/g)?.length, 3)
  }
})

test("Easy 2, 4 and 5 resolve stable passage groups from the full certified source bank", async () => {
  const expectations = new Map([
    [2, { sourceIds: [1, 11], boundaries: [10, 15], checks: [[2, 1], [10, 1], [11, 2], [12, 2], [15, 2], [16, null]] }],
    [4, { sourceIds: [1, 11], boundaries: [10, 15], checks: [[2, 1], [10, 1], [11, 2], [12, 2], [15, 2], [16, null]] }],
    [5, { sourceIds: [1, 9], boundaries: [8, 15], checks: [[2, 1], [8, 1], [9, 2], [11, 2], [15, 2], [16, null]] }],
  ])

  for (const [assessmentNumber, expectation] of expectations) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)
    const sourceIds = [...source.matchAll(/g5LaEasy\dQuestions\.find\(\(question\) => question\.id === (\d+)\)/g)]
      .map((match) => Number(match[1]))
    const boundaries = [...source.matchAll(/if \(question\.id <= (\d+)\) return [12]/g)]
      .map((match) => Number(match[1]))

    assert.deepEqual(sourceIds, expectation.sourceIds)
    assert.deepEqual(boundaries, expectation.boundaries)
    assert.match(source, /if \(question\?\.type !== "reading"\) return null/)

    const resolvePassage = (questionId, type = "reading") => {
      if (type !== "reading") return null
      if (questionId <= boundaries[0]) return 1
      if (questionId <= boundaries[1]) return 2
      return null
    }

    for (const [questionId, expectedPassage] of expectation.checks) {
      assert.equal(resolvePassage(questionId), expectedPassage)
    }
    assert.equal(resolvePassage(2, "grammar"), null)
  }
})

test("passage access is independent of the prepared five-question attempt", async () => {
  for (const assessmentNumber of [2, 4, 5]) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)
    const passageMapStart = source.indexOf("const READING_PASSAGES")
    const passageMapEnd = source.indexOf("const PASSAGE_BEARING_QUESTION_IDS", passageMapStart)
    const passageMap = source.slice(passageMapStart, passageMapEnd)

    assert.match(passageMap, new RegExp(`g5LaEasy${assessmentNumber}Questions\\.find`))
    assert.doesNotMatch(passageMap, /availableQuestions|randomizedQuestions|preparePreview/)
    assert.match(source, /const passageNumber = getPassageNumber\(q\)/)
  }
})

test("Easy 2-5 certified assessment arrays remain byte-for-byte stable", async () => {
  for (const [assessmentNumber, expectedHash] of expectedAssessmentHashes) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)
    const actualHash = createHash("sha256").update(assessmentBlock(source, assessmentNumber)).digest("hex")
    assert.equal(actualHash, expectedHash)
  }
})

test("Easy 2-5 retain page-owned preparation, timing, scoring and results", async () => {
  for (let assessmentNumber = 2; assessmentNumber <= 5; assessmentNumber += 1) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)

    assert.match(source, new RegExp(`prepareAssessment\\(g5LaEasy${assessmentNumber}Questions\\)`))
    assert.match(source, new RegExp(`preparePreview\\(g5LaEasy${assessmentNumber}Questions, FREE_QUESTION_LIMIT\\)`))
    assert.match(source, /setTimeLeft\(60 \* 60\)/)
    assert.match(source, /setInterval\(\(\) => setTimeLeft/)
    assert.match(source, /const calcScore/)
    assert.match(source, /saveStudentTestResult/)
    assert.match(source, /if \(showResults\)/)
    assert.match(source, /const resetTest/)
  }
})

test("Easy 6-10 remain outside G5-UX-004", async () => {
  for (let assessmentNumber = 6; assessmentNumber <= 10; assessmentNumber += 1) {
    const source = await read(`app/mock-tests/literacy/easy-${assessmentNumber}/page.tsx`)
    assert.doesNotMatch(source, /FocusedActiveRunner/)
  }
})
