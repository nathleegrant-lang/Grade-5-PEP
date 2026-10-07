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
const uxBaseline = 'de672d5b53b8991ea1937439a27afcb8a62d609d'
for (const subject of grade5Manifest.subjects) test(`${subject.label}: prominent contextual entry and direct Term selection`, () => {
 const source = fs.readFileSync(`app/${subject.id}/page.tsx`, 'utf8')
 assert.ok(source.includes(`href="/learn?subject=${subject.id}"`))
 assert.ok(source.includes(`Explore ${subject.label} by Term &amp; Topic`))
 assert.match(source, /min-h-12.*bg-\[#1e3a5f\].*text-white.*focus-visible/)
 assert.match(source, /Learn by Term &amp; Topic/)
 const restored = source.replace(/<section aria-label="Explore [\s\S]*?<\/section>/, '<p className="mb-4 text-center"><Link href="/learn" className="font-semibold text-blue-700 underline">Browse Term Topics</Link></p>')
 assert.equal(restored, execFileSync('git', ['show', `${uxBaseline}:app/${subject.id}/page.tsx`], {encoding:'utf8'}))
 const h = harness('components/learning/learning-shell.tsx', 'LearningShell', {grade:grade5Manifest, provider:grade5PracticeProvider, initialSubjectId:subject.id})
 assert.ok(h.text().includes('Choose a Term')); assert.ok(!h.text().includes('Choose a Subject'))
 for(const term of subject.terms) assert.ok(h.text().includes(term.label))
 h.click('Term 1'); assert.ok(h.text().includes('Choose a Topic'))
 h.click(subject.label); assert.ok(h.text().includes('Choose a Term')); h.unmount()
})
test('missing and unknown subject retain safe generic entry', () => {
 for(const initialSubjectId of [undefined,'foreign-subject']) {
 const h=harness('components/learning/learning-shell.tsx','LearningShell',{grade:grade5Manifest,provider:grade5PracticeProvider,initialSubjectId});assert.ok(h.text().includes('Choose a Subject'));h.unmount()
 }
 const page=fs.readFileSync('app/learn/page.tsx','utf8'); assert.match(page,/useSearchParams\(\)\.get\("subject"\)/);assert.match(page,/<Suspense/);assert.match(page,/key=\{subjectId/)
})
test('all curriculum, practice and assessment implementation is unchanged', () => {
 for(const file of ['lib/learning/grade5/manifest.ts','lib/learning/grade5/as003-taxonomy.json','lib/learning/contracts.ts','lib/learning/practice-provider.ts','lib/learning/navigation.ts','components/learning/practice-runner.tsx','components/quiz.tsx']) assert.equal(fs.readFileSync(file,'utf8'),execFileSync('git',['show',`${uxBaseline}:${file}`],{encoding:'utf8'}))
})
