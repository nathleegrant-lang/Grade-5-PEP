import test from 'node:test'
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'
import vm from 'node:vm'
import { execFileSync } from 'node:child_process'
import { createRequire } from 'node:module'
import { createHash } from 'node:crypto'
import ts from 'typescript'
import React from 'react'
import { renderToStaticMarkup } from 'react-dom/server'

const require = createRequire(import.meta.url)
const root = process.cwd()
const baseline = '44d20a4f00f9ea5c7bb2622e35249a5eca7a0d18'
function loader(react = React) {
  const cache = new Map()
  function load(relative) {
    let file = path.resolve(root, relative)
    if (!fs.existsSync(file)) file += fs.existsSync(file + '.ts') ? '.ts' : '.tsx'
    if (file.endsWith('.json')) return JSON.parse(fs.readFileSync(file, 'utf8'))
    if (cache.has(file)) return cache.get(file).exports
    const module = { exports: {} }; cache.set(file, module)
    const output = ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: {
      module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2022,
      jsx: ts.JsxEmit.ReactJSX, esModuleInterop: true, resolveJsonModule: true,
    }}).outputText
    const localRequire = name => name === 'react' ? react : name.startsWith('.') ? load(path.resolve(path.dirname(file), name)) : require(name)
    vm.runInNewContext(`(function(require,module,exports){${output}\n})`, { structuredClone, setTimeout, clearTimeout, AbortController, console })(localRequire, module, module.exports)
    return module.exports
  }
  return load
}
function harness(file, exportName, props) {
  const state = [], deps = [], cleanups = []
  let cursor = 0, effects = [], tree
  const react = { ...React,
    useState(initial) { const i = cursor++; if (!(i in state)) state[i] = typeof initial === 'function' ? initial() : initial; return [state[i], value => { state[i] = typeof value === 'function' ? value(state[i]) : value }] },
    useEffect(effect, next) { const i = cursor++; if (!deps[i] || next.some((value, index) => !Object.is(value, deps[i][index]))) { deps[i] = next; effects.push(() => { cleanups[i]?.(); cleanups[i] = effect() }) } },
  }
  const component = loader(react)(file)[exportName]
  const render = () => { cursor = 0; effects = []; tree = component(props); for (const effect of effects) effect(); return tree }
  const nodes = () => { const found = []; function walk(value) { if (!value) return; if (Array.isArray(value)) return value.forEach(walk); if (typeof value === 'object') { found.push(value); walk(value.props?.children) } } walk(tree); return found }
  const text = value => { if (Array.isArray(value)) return value.map(text).join(''); if (value && typeof value === 'object') return text(value.props?.children); return value === null || value === undefined || typeof value === 'boolean' ? '' : String(value) }
  const click = label => { const button = nodes().find(n => n.type === 'button' && text(n) === label); assert.ok(button, `button ${label}`); assert.ok(!button.props.disabled); button.props.onClick(); render() }
  render()
  return { render, click, nodes, text: () => text(tree), async settle() { await new Promise(resolve => setTimeout(resolve, 0)); render() }, unmount() { cleanups.forEach(cleanup => cleanup?.()) } }
}
const load = loader()
const { grade5Manifest, grade5PracticeProvider } = load('lib/learning/grade5/manifest.ts')
const { navigate, initialNavigation, selectedScope } = load('lib/learning/navigation.ts')
const { createCertifiedPracticeProvider, resolvePractice } = load('lib/learning/practice-provider.ts')
const scope = { gradeId: 'fixture', subjectId: 'subject', termId: 'term', topicId: 'topic' }
const reference = { status: 'certified', setId: 'set', revision: 'rev1', certificationId: 'fixture-certification' }
const question = { id: 1, question: 'Fixture question?', options: ['Yes', 'No'], correctAnswer: 0, explanation: 'Fixture explanation.' }
function fixture(gradeId = 'fixture', activities = []) {
  return { id: gradeId, label: `Fixture ${gradeId}`, subjects: [{ id: 'subject', label: 'Fixture Subject', terms: [{ id: 'term', label: 'Fixture Term', topics: [{ id: 'topic', label: 'Fixture Topic', authoritativeIdentity: 'Fixture Identity', objectives: [], activities, practiceEligibility: reference }] }] }] }
}
function certified(overrides = {}) { return { scope, reference, semanticStatus: 'certified', mode: 'topic-practice', expiresAt: 1000, questions: [question], ...overrides } }
function provider(overrides = {}) { return createCertifiedPracticeProvider([certified(overrides)], [reference.certificationId], () => 100) }
function openTopic(h) { h.click('Fixture Subject'); h.click('Fixture Term'); h.click('Fixture TopicFixture Identity') }

test('AS-003 adapter has 45 exact ordered identities and empty activities/eligibility; no lesson inference', async () => {
  const bytes = fs.readFileSync('lib/learning/grade5/as003-taxonomy.json')
  assert.equal(createHash('sha256').update(bytes).digest('hex'), 'e28a2d0881ff271a08d5ecfb128706ffc606659ffffebbd2a07cbcb73b88bbfe')
  const taxonomy = JSON.parse(bytes)
  assert.equal(taxonomy.length, 45)
  const mapped = grade5Manifest.subjects.flatMap(s => s.terms.flatMap(t => t.topics))
  assert.equal(mapped.length, 45)
  assert.equal(new Set(mapped.map(t => t.id)).size, 45)
  for (const s of grade5Manifest.subjects) {
    assert.deepEqual(Array.from(s.terms, t => t.id), ['T1', 'T2', 'T3'])
    for (const t of s.terms) {
      const rows = taxonomy.filter(r => r.Subject === s.label && `T${r.Term}` === t.id)
      assert.deepEqual(Array.from(t.topics, v => v.id), rows.map(r => r['Curriculum ID']))
      for (const topic of t.topics) {
        const row = rows.find(r => r['Curriculum ID'] === topic.id)
        assert.equal(topic.label, row['Learner-Facing Label'])
        assert.equal(topic.authoritativeIdentity, row['Authoritative Curriculum Identity'])
        assert.equal(topic.activities.length, 0)
        assert.equal(topic.practiceEligibility.status, 'missing')
        const result = await grade5PracticeProvider.resolve({ gradeId: grade5Manifest.id, subjectId: s.id, termId: t.id, topicId: topic.id }, topic.practiceEligibility)
        assert.equal(result.status, 'unavailable'); assert.ok(!('questions' in result))
      }
    }
  }
})
test('all 16 existing lessons/questions and original runner remain byte-preserved except exact navigation entry', () => {
  const insertion = '<p className="mb-4 text-center"><Link href="/learn" className="font-semibold text-blue-700 underline">Browse Term Topics</Link></p>\n          '
  for (const subject of ['language-arts', 'mathematics', 'science', 'social-studies']) {
    const file = `app/${subject}/page.tsx`, source = fs.readFileSync(file, 'utf8')
    assert.equal(source.split(insertion).length, 2)
    assert.equal(source.replace(insertion, ''), execFileSync('git', ['show', `${baseline}:${file}`], { encoding: 'utf8' }))
  }
  assert.equal(fs.readFileSync('components/quiz.tsx', 'utf8'), execFileSync('git', ['show', `${baseline}:components/quiz.tsx`], { encoding: 'utf8' }))
})
test('hierarchy rejects foreign IDs and exact O4 transitions retain subject/term/topic', () => {
  const grade = fixture()
  let state = navigate(grade, initialNavigation, { type: 'subject', id: 'subject' })
  state = navigate(grade, state, { type: 'term', id: 'term' })
  state = navigate(grade, state, { type: 'topic', id: 'topic' })
  assert.equal(JSON.stringify(selectedScope(grade, state)), JSON.stringify(scope))
  assert.strictEqual(navigate(grade, state, { type: 'topic', id: 'foreign' }), state)
  state = navigate(grade, state, { type: 'practice' })
  assert.equal(state.view, 'practice')
  state = navigate(grade, state, { type: 'review-topic' })
  assert.equal(state.topicId, 'topic'); assert.equal(state.view, 'learning')
  state = navigate(grade, state, { type: 'choose-another-topic' })
  assert.equal(state.subjectId, 'subject'); assert.equal(state.termId, 'term'); assert.equal(state.topicId, undefined)
})
test('missing/held/stale/unknown short-circuit even a provider offering raw questions', async () => {
  let calls = 0
  const unsafe = { resolve: async () => { calls++; return { status: 'available', scope, reference, questions: [question] } } }
  for (const status of ['missing', 'held', 'stale', 'unknown']) {
    const result = await resolvePractice(unsafe, scope, { status }, new AbortController().signal)
    assert.equal(result.status, 'unavailable'); assert.ok(!('questions' in result))
  }
  assert.equal(calls, 0)
})
test('only explicit approved semantic certification, exact scope/revision and topic-practice mode can supply questions', async () => {
  assert.equal((await provider().resolve(scope, reference)).status, 'available')
  for (const semanticStatus of ['held', 'stale', 'unknown']) assert.equal((await provider({ semanticStatus }).resolve(scope, reference)).status, 'unavailable')
  for (const overrides of [{ mode: 'mock-test' }, { expiresAt: 50 }, { questions: [] }, { questions: [{ ...question, correctAnswer: 3 }] }]) assert.equal((await provider(overrides).resolve(scope, reference)).status, 'unavailable')
  for (const key of Object.keys(scope)) assert.equal((await provider().resolve({ ...scope, [key]: 'foreign' }, reference)).status, 'unavailable')
  assert.equal((await provider().resolve(scope, { ...reference, revision: 'old' })).status, 'unavailable')
  assert.equal((await createCertifiedPracticeProvider([certified()], [], () => 100).resolve(scope, reference)).status, 'unavailable')
  assert.equal((await createCertifiedPracticeProvider([certified(), certified()], [reference.certificationId], () => 100).resolve(scope, reference)).status, 'unavailable')
})
test('provider snapshots approved content and cannot mutate registry through returned questions', async () => {
  const set = certified(), p = createCertifiedPracticeProvider([set], [reference.certificationId], () => 100)
  set.questions[0] = { ...question, question: 'Changed source' }
  const a = await p.resolve(scope, reference); assert.equal(a.questions[0].question, question.question)
  a.questions[0].question = 'Changed returned content'
  const b = await p.resolve(scope, reference); assert.equal(b.questions[0].question, question.question)
})
test('provider errors, mismatched results, timeout and cancellation fail closed without fallback', async () => {
  for (const p of [
    { resolve: async () => { throw new Error('provider failure') } },
    { resolve: async () => ({ status: 'available', scope: { ...scope, gradeId: 'foreign' }, reference, questions: [question] }) },
    { resolve: async () => new Promise(() => {}) },
  ]) assert.equal((await resolvePractice(p, scope, reference, new AbortController().signal, 5)).status, 'unavailable')
  const controller = new AbortController(); controller.abort()
  assert.equal((await resolvePractice(provider(), scope, reference, controller.signal)).status, 'unavailable')
})
test('Grade 4 and Grade 6 fixture adapters render without Grade 5 truth', () => {
  const { LearningShell } = load('components/learning/learning-shell.tsx')
  for (const id of ['G4', 'G6']) {
    const markup = renderToStaticMarkup(React.createElement(LearningShell, { grade: fixture(id), provider: provider() }))
    assert.ok(markup.includes(`Fixture ${id}`)); assert.ok(!markup.includes('Grade 5')); assert.ok(!markup.includes('G5-'))
  }
})
test('empty subject/term/topic states retain breadcrumb navigation', () => {
  const cases = [
    [{ id: 'fixture', label: 'Fixture', subjects: [] }, [], 'Subjects are not yet available.'],
    [{ id: 'fixture', label: 'Fixture', subjects: [{ id: 'subject', label: 'Subject', terms: [] }] }, ['Subject'], 'Terms are not yet configured'],
    [{ id: 'fixture', label: 'Fixture', subjects: [{ id: 'subject', label: 'Subject', terms: [{ id: 'term', label: 'Term', topics: [] }] }] }, ['Subject', 'Term'], 'Topics are not yet configured'],
  ]
  for (const [grade, actions, expected] of cases) {
    const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade, provider: provider() })
    actions.forEach(a => h.click(a)); assert.ok(h.text().includes(expected)); h.click('Fixture'); assert.ok(h.text().includes('Choose a Subject')); h.unmount()
  }
})
test('unmapped learning and held Practice have usable onward navigation; no question render', async () => {
  const grade = fixture(); grade.subjects[0].terms[0].topics[0].practiceEligibility = { status: 'held' }
  const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade, provider: provider() })
  openTopic(h); assert.ok(h.text().includes('Learning Activities are not yet available.'))
  h.click('Practice'); await h.settle(); assert.ok(h.text().includes('Practice is not yet available')); assert.ok(!h.nodes().some(n => n.type?.name === 'PracticeRunner'))
  h.click('Learning Activities'); assert.ok(h.text().includes('Learning Activities are not yet available.'))
  h.click('Back to Topics'); assert.ok(h.text().includes('Choose a Topic')); h.unmount()
})
test('available Practice integrates exact O4 callbacks and optional explicit learner/events', async () => {
  const events = [], learner = { resolution: 'explicit', parentId: 'fixture-parent', learnerId: 'fixture-learner' }
  const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade: fixture(), provider: provider(), learner, progressSink: event => events.push(event) })
  openTopic(h); h.click('Practice'); await h.settle()
  const runner = h.nodes().find(n => n.type?.name === 'PracticeRunner'); assert.ok(runner)
  runner.props.onComplete({ score: 1, total: 1, percentage: 100 }); runner.props.onRestart()
  assert.equal(events[0].type, 'topic-viewed'); assert.equal(events[1].type, 'practice-started'); assert.equal(events[2].type, 'practice-completed')
  assert.ok(events.every(e => e.learner === learner && e.gradeId === 'fixture'))
  runner.props.onReviewTopic(); h.render(); assert.ok(h.text().includes('Learning Activities are not yet available.'))
  h.click('Practice'); await h.settle(); h.nodes().find(n => n.type?.name === 'PracticeRunner').props.onChooseAnotherTopic(); h.render()
  assert.ok(h.text().includes('Choose a Topic')); assert.ok(h.text().includes('Fixture Term')); h.unmount()
})
test('no sink means no persistence or implicit learner resolution; failing sink does not obstruct navigation', async () => {
  for (const progressSink of [undefined, () => { throw Error('sink error') }]) {
    const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade: fixture(), provider: provider(), progressSink })
    openTopic(h); h.click('Practice'); await h.settle(); assert.ok(h.nodes().some(n => n.type?.name === 'PracticeRunner')); h.unmount()
  }
  for (const file of ['contracts.ts', 'navigation.ts', 'practice-provider.ts']) assert.ok(!/localStorage|sessionStorage|supabase|fetch\(/.test(fs.readFileSync(`lib/learning/${file}`, 'utf8')))
  assert.ok(!/localStorage|sessionStorage|supabase|useAuth|ProgressContext|fetch\(/.test(fs.readFileSync('components/learning/learning-shell.tsx', 'utf8')))
})
test('actual transient runner preserves scoring/percentage, answer lock and exactly three result actions; retry resets same set', () => {
  const results = []; let restarts = 0, reviews = 0, choices = 0
  const h = harness('components/learning/practice-runner.tsx', 'PracticeRunner', {
    gradeLabel: 'Fixture G6', title: 'Fixture Topic', questions: [question, { ...question, id: 2 }],
    onComplete: result => results.push(result), onRestart: () => restarts++, onReviewTopic: () => reviews++, onChooseAnotherTopic: () => choices++,
  })
  h.click('A. Yes'); h.click('Check Answer'); assert.ok(h.text().includes('Correct!')); h.click('Next Question')
  h.click('B. No'); h.click('Check Answer'); assert.ok(h.text().includes('Not quite right.')); h.click('See Results')
  assert.equal(JSON.stringify(results[0]), JSON.stringify({ score: 1, total: 2, percentage: 50 }))
  assert.deepEqual(h.nodes().filter(n => n.type === 'button').map(n => n.props.children), ['Try Again', 'Review Topic', 'Choose Another Topic'])
  h.click('Review Topic'); h.click('Choose Another Topic'); assert.equal(reviews, 1); assert.equal(choices, 1)
  h.click('Try Again'); assert.equal(restarts, 1); assert.ok(h.text().includes('Question 1 of 2')); assert.ok(h.text().includes('Score: 0/2')); h.unmount()
})
test('late provider results after leaving Practice are ignored', async () => {
  let finish
  const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade: fixture(), provider: { resolve: () => new Promise(resolve => { finish = resolve }) } })
  openTopic(h); h.click('Practice'); h.click('Back to Topics')
  finish({ status: 'available', scope, reference, questions: [question] }); await h.settle()
  assert.ok(h.text().includes('Choose a Topic')); assert.ok(!h.nodes().some(n => n.type?.name === 'PracticeRunner')); h.unmount()
})
test('stored-result context requires explicit learner at type boundary and no storage operation exists', () => {
  const file = path.join(root, 'tests/.g5-learn-002-type-fixture.ts')
  const source = `import type { ResultContext } from '../lib/learning/contracts';\nconst transient: ResultContext = {mode:'transient'};\n// @ts-expect-error stored result cannot omit learner\nconst missing: ResultContext = {mode:'stored'};\n// @ts-expect-error implicit identity is prohibited\nconst inferred: ResultContext = {mode:'stored',learner:{parentId:'p',learnerId:'c',resolution:'implicit'}};\nconst explicit: ResultContext = {mode:'stored',learner:{parentId:'p',learnerId:'c',resolution:'explicit'}};`
  try {
    const options = { noEmit: true, strict: true, skipLibCheck: true, target: ts.ScriptTarget.ES2022, moduleResolution: ts.ModuleResolutionKind.Bundler, module: ts.ModuleKind.ESNext }
    const host = ts.createCompilerHost(options)
    const originalSource = host.getSourceFile.bind(host)
    host.getSourceFile = (name, languageVersion, ...rest) => path.resolve(name) === file ? ts.createSourceFile(name, source, languageVersion, true) : originalSource(name, languageVersion, ...rest)
    const program = ts.createProgram([file], options, host)
    assert.equal(ts.getPreEmitDiagnostics(program).length, 0)
  } finally { /* Compiler fixture is virtual; no source tree mutation. */ }
})

test('reselecting Practice does not erase a resolved result or restart indefinite loading', async () => {
  const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade: fixture(), provider: provider() })
  openTopic(h); h.click('Practice'); await h.settle(); h.click('Practice')
  assert.ok(h.nodes().some(n => n.type?.name === 'PracticeRunner')); h.unmount()
})
test('Learning Activities are ordered supplied content and Mock Test remains a link only', () => {
  const activities = [{ id: 'first', kind: 'explanation', title: 'First', text: 'Supplied content' }, { id: 'second', kind: 'worked-example', title: 'Second', text: 'Supplied example', prompt: 'Supplied prompt', answer: 'Supplied answer' }]
  const grade = fixture('G4', activities)
  grade.subjects[0].mockTest = { href: '/fixture-mock', label: 'Fixture Mock Test' }
  const h = harness('components/learning/learning-shell.tsx', 'LearningShell', { grade, provider: provider() })
  openTopic(h)
  const descriptors = h.nodes().filter(n => n.type?.name === 'ActivityView').map(n => n.props.activity)
  assert.deepEqual(descriptors, activities)
  const mockLink = h.nodes().find(n => n.type === 'a' && n.props.href === '/fixture-mock')
  assert.ok(mockLink); assert.equal(mockLink.props.onClick, undefined); h.unmount()
})
