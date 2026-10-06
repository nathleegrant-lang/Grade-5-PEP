import assert from 'node:assert/strict'
import { execFileSync } from 'node:child_process'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import test from 'node:test'
import vm from 'node:vm'

const root = fileURLToPath(new URL('../', import.meta.url))
const baseline = '1db0650ac05e0d1b92082a0afaadb8dcd801621e'
const subjects = ['language-arts', 'mathematics', 'science', 'social-studies']
const paths = ['components/quiz.tsx', ...subjects.map(s => `app/${s}/page.tsx`), 'tests/g5-learner-ux-001-o4-n-onward-actions.test.mjs'].sort()
const git = (...args) => execFileSync('git', args, { cwd: root, encoding: 'utf8' })
const read = path => readFileSync(new URL(`../${path}`, import.meta.url), 'utf8')
const before = path => git('show', `${baseline}:${path}`)
const quiz = read('components/quiz.tsx')
const result = quiz.slice(quiz.indexOf('  if (showResult) {'), quiz.indexOf('  const question = questions[currentQuestion]'))
const oldRestart = `          <Button onClick={handleRestart} className="bg-[#0d9488] hover:bg-[#0d4a5f]">
            <RotateCcw className="w-4 h-4 mr-2" />
            Try Again
          </Button>`
const newActions = `          <div className="flex flex-col sm:flex-row flex-wrap justify-center gap-3">
            <Button onClick={handleRestart} className="bg-[#0d9488] hover:bg-[#0d4a5f]">
              <RotateCcw className="w-4 h-4 mr-2" />
              Try Again
            </Button>
            <Button onClick={onReviewTopic} variant="outline">
              Review Topic
            </Button>
            <Button onClick={onChooseAnotherTopic} variant="outline">
              Choose Another Topic
            </Button>
          </div>`
const oldInvocation = '              <Quiz questions={selectedTopic.questions} title={selectedTopic.title} />'
const newInvocation = `              <Quiz
                questions={selectedTopic.questions}
                title={selectedTopic.title}
                onReviewTopic={() => setShowQuiz(false)}
                onChooseAnotherTopic={() => { setSelectedTopic(null); setShowQuiz(false) }}
              />`

// Execute the actual source callback expressions, rather than duplicated logic.
const callback = (source, prop) => {
  const match = source.match(new RegExp(`${prop}=\\{(\\(\\) => (?:\\{[^}]*\\}|[^\\n}]+))\\}`))
  assert.ok(match, `missing ${prop} callback`)
  return match[1]
}
const handlerBody = name => {
  const match = quiz.match(new RegExp(`const ${name} = \\(\\) => \\{([\\s\\S]*?)\\n  \\}`))
  assert.ok(match, `missing ${name}`)
  return match[1]
}

test('O4-N completed state has exactly three direct onward actions; active journey is unchanged', () => {
  assert.deepEqual([...result.matchAll(/<Button onClick=\{([^}]+)\}/g)].map(m => m[1]), ['handleRestart', 'onReviewTopic', 'onChooseAnotherTopic'])
  for (const label of ['Try Again', 'Review Topic', 'Choose Another Topic']) assert.equal(result.split(label).length - 1, 1)
  assert.equal(quiz.slice(quiz.indexOf('  const question = questions[currentQuestion]')), before('components/quiz.tsx').slice(before('components/quiz.tsx').indexOf('  const question = questions[currentQuestion]')))
  const calls = []
  for (const name of ['onReviewTopic', 'onChooseAnotherTopic']) {
    const handler = result.match(new RegExp(`<Button onClick=\\{(${name})\\}`))[1]
    vm.runInNewContext(`${handler}()`, { [name]: () => calls.push(name) })
  }
  assert.deepEqual(calls, ['onReviewTopic', 'onChooseAnotherTopic'])
})

test('O4-N callbacks are required typed inputs; navigation remains subject-owned', () => {
  assert.match(quiz, /onReviewTopic: \(\) => void/)
  assert.match(quiz, /onChooseAnotherTopic: \(\) => void/)
  assert.match(quiz, /export function Quiz\(\{ questions, title, onReviewTopic, onChooseAnotherTopic \}: QuizProps\)/)
  assert.doesNotMatch(quiz, /setSelectedTopic|setShowQuiz|router\.|history\.|fetch\(|localStorage|sessionStorage/)
})

test('O4-N Try Again executes all five existing resets, without modifying questions', () => {
  const state = { currentQuestion: 3, selectedAnswer: 2, showResult: true, score: 4, answered: true }
  const context = Object.fromEntries(Object.keys(state).map(key => [`set${key[0].toUpperCase()}${key.slice(1)}`, value => { state[key] = value }]))
  const body = handlerBody('handleRestart')
  const original = before('components/quiz.tsx').match(/const handleRestart = \(\) => \{([\s\S]*?)\n  \}/)[1]
  assert.equal(body, original)
  vm.runInNewContext(body, context)
  assert.deepEqual(state, { currentQuestion: 0, selectedAnswer: null, showResult: false, score: 0, answered: false })
})

for (const subject of subjects) test(`O4-N ${subject} callbacks preserve Review topic and clear Choose topic`, () => {
  const source = read(`app/${subject}/page.tsx`)
  const topic = Object.freeze({ id: 'same-topic', questions: Object.freeze([]) })
  for (const [prop, expected] of [['onReviewTopic', topic], ['onChooseAnotherTopic', null]]) {
    let selectedTopic = topic
    let showQuiz = true
    const calls = []
    vm.runInNewContext(`(${callback(source, prop)})()`, {
      setSelectedTopic: value => { selectedTopic = value; calls.push(['topic', value]) },
      setShowQuiz: value => { showQuiz = value; calls.push(['quiz', value]) },
    })
    assert.equal(selectedTopic, expected)
    assert.equal(showQuiz, false)
    assert.deepEqual(calls, prop === 'onReviewTopic' ? [['quiz', false]] : [['topic', null], ['quiz', false]])
  }
  // Whole-file equality after removing the exact authorized invocation change
  // protects every question, explanation, existing transition and learning item.
  assert.ok(source.includes(newInvocation))
  assert.equal(source.replace(newInvocation, oldInvocation), before(`app/${subject}/page.tsx`))
})

test('O4-N scoring and result calculations remain baseline-identical and executable', () => {
  const questions = Object.freeze([Object.freeze({ correctAnswer: 1 }), Object.freeze({ correctAnswer: 0 })])
  for (const [selectedAnswer, expectedScore, expectedAnswered] of [[null, 2, false], [0, 2, true], [1, 3, true]]) {
    let score = 2
    let answered = false
    vm.runInNewContext(`(() => {${handlerBody('handleCheckAnswer')}})()`, {
      selectedAnswer, questions, currentQuestion: 0, score,
      setAnswered: value => { answered = value }, setScore: value => { score = value },
    })
    assert.equal(score, expectedScore)
    assert.equal(answered, expectedAnswered)
  }
  const expression = result.match(/const percentage = (.*)/)[1]
  for (const [score, length, expected] of [[0, 3, 0], [1, 3, 33], [2, 3, 67], [3, 3, 100]]) {
    assert.equal(vm.runInNewContext(expression, { score, questions: { length } }), expected)
  }
  // Undo only callback inputs and completed-state markup. Everything else must
  // equal the immutable baseline byte-for-byte (including answer/next logic).
  assert.ok(quiz.includes(newActions))
  const restored = quiz.replace('  onReviewTopic: () => void\n  onChooseAnotherTopic: () => void\n', '')
    .replace('export function Quiz({ questions, title, onReviewTopic, onChooseAnotherTopic }: QuizProps)', 'export function Quiz({ questions, title }: QuizProps)')
    .replace(newActions, oldRestart)
  assert.equal(restored, before('components/quiz.tsx'))
})

test('O4-N exact six-file boundary excludes Mock Tests, APIs, persistence and assessment banks', () => {
  assert.equal(git('rev-parse', `${baseline}^{tree}`).trim(), '689d2f7c62f7fdd3b2c3004e67ef2efb8e9bfd5e')
  const tracked = git('diff', '--name-only', baseline, '--').trim().split('\n').filter(Boolean)
  const untracked = git('ls-files', '--others', '--exclude-standard').trim().split('\n').filter(Boolean)
  assert.deepEqual([...new Set([...tracked, ...untracked])].sort(), paths)
  git('diff', '--check', baseline, '--')
  for (const path of paths.slice(0, -1)) {
    const added = git('diff', '--unified=0', baseline, '--', path).split('\n').filter(line => line.startsWith('+') && !line.startsWith('+++')).join('\n')
    assert.doesNotMatch(added, /fetch\(|localStorage|sessionStorage|ProgressContext|supabase|\/api\/|mock-tests/)
  }
})
