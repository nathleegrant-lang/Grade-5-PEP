import assert from "node:assert/strict"
import { readFileSync } from "node:fs"
import { execFileSync } from "node:child_process"
import vm from "node:vm"
import crypto from "node:crypto"
import test from "node:test"
import ts from "typescript"

const P1="10000000-0000-0000-0000-000000000001", P2="10000000-0000-0000-0000-000000000002"
const C1="20000000-0000-0000-0000-000000000001", C2="20000000-0000-0000-0000-000000000002", C3="20000000-0000-0000-0000-000000000003"
const read=p=>readFileSync(p,"utf8")
const coverage=JSON.parse(read("docs/evidence/g5-o2-implement-001-coverage.json"))
function runtime({role="parent",tokenValid=true,failTable=null,rows={}}={}) {
  const tables={profiles:[{id:P1,role},{id:P2,role:"parent"}],students:[
    {id:C1,parent_id:P1,full_name:"Same Name",grade_level:5},
    {id:C2,parent_id:P1,full_name:"Sibling",grade_level:5},
    {id:C3,parent_id:P2,full_name:"Same Name",grade_level:5},
  ],student_test_results:[],certificates:[],...rows}
  const writes=[]; let fail=failTable
  class Query {
    constructor(table){this.table=table;this.filters=[];this.row=null}
    select(){return this}
    eq(k,v){this.filters.push([k,v]);return this}
    insert(row){this.row=row;return this}
    order(){return this}
    async execute(single=false){
      const data=tables[this.table]||[]
      if(this.row){
        if(fail===this.table){fail=null;return {data:null,error:{code:"TEST_FAILURE"}}}
        if(data.some(r=>r.id===this.row.id))return {data:null,error:{code:"23505"}}
        data.push({...this.row});writes.push({table:this.table,row:this.row});return {data:{...this.row},error:null}
      }
      const matching=data.filter(r=>this.filters.every(([k,v])=>r[k]===v))
      return {data:single?(matching[0]||null):matching,error:null}
    }
    maybeSingle(){return this.execute(true)}
    single(){return this.execute(true)}
    then(resolve,reject){return this.execute().then(resolve,reject)}
  }
  const db={from:table=>new Query(table)}
  const cache=new Map()
  function load(path){
    if(cache.has(path))return cache.get(path)
    const module={exports:{}};cache.set(path,module.exports)
    const require=name=>{
      if(name==="next/server")return {NextResponse:{json:(body,options={})=>({body,status:options.status||200,headers:options.headers||{}})}}
      if(name==="@supabase/supabase-js")return {createClient:()=>({auth:{getUser:async token=>({data:{user:tokenValid&&token==="parent-token"?{id:P1}:null},error:null})}})}
      if(name==="@/lib/supabase/admin")return {getSupabaseAdminClient:()=>db}
      if(name==="@/lib/supabase/client")return {getSupabaseBrowserClient:()=>({auth:{getSession:async()=>({data:{session:{access_token:"parent-token"}},error:null})}})}
      if(name==="node:crypto")return crypto
      if(name.startsWith("@/"))return load(name.slice(2)+".ts")
      throw Error("Unexpected dependency "+name)
    }
    vm.runInNewContext(ts.transpileModule(read(path),{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022}}).outputText,
      {module,exports:module.exports,require,process:{env:{NEXT_PUBLIC_SUPABASE_URL:"https://synthetic.invalid",NEXT_PUBLIC_SUPABASE_ANON_KEY:"synthetic"}},URL,Date,Map,Set,console,fetch:async(path,options)=>{
        const request=new Request("https://synthetic.invalid"+path,options)
        const response=path.startsWith("/api/dashboard/results") ? await load("app/api/dashboard/results/route.ts").GET(request) :
          await load("lib/assessment-result-handler.ts").submitAssessmentResult(request,path==="/api/performance/save-result")
        return {ok:response.status<400,status:response.status,json:async()=>response.body}
      }},{filename:path})
    cache.set(path,module.exports);return module.exports
  }
  return {tables,writes,load}
}
const payload=(studentId=C2)=>({parentId:P1,studentId,grade:"grade5",subject:"Science",testName:"Easy 1",difficulty:"Easy",score:32,totalQuestions:40,percentage:80,completedAt:"2026-10-08T20:00:00.000Z"})
const request=(body,token="parent-token")=>new Request("https://synthetic.invalid/api/assessment/results",{method:"POST",headers:token?{Authorization:"Bearer "+token}:{},body:JSON.stringify(body)})
async function submit(r,body=payload(),performance=false,token="parent-token"){
  return r.load("lib/assessment-result-handler.ts").submitAssessmentResult(request(body,token),performance)
}
const GET=(r,id=C2,token="parent-token")=>r.load("app/api/dashboard/results/route.ts").GET(new Request("https://synthetic.invalid/api/dashboard/results"+(id===null?"":"?student_id="+id),{headers:token?{Authorization:"Bearer "+token}:{}}))

test("two siblings and identical names across families remain separate; issued certificates follow explicit child",async()=>{
 const r=runtime()
 assert.equal((await submit(r)).status,200)
 assert.equal(r.tables.student_test_results[0].student_id,C2)
 assert.equal(r.tables.certificates[0].student_id,C2)
 assert.equal(r.tables.certificates[0].test_result_id,r.tables.student_test_results[0].id)
 assert.equal((await GET(r,C1)).body.testResults.length,0)
 assert.equal((await GET(r,C2)).body.earnedCertificates.length,1)
 assert.equal((await GET(r,C3)).status,404)
})
test("missing, malformed, forged, contradictory, unauthenticated and non-Parent submissions persist nothing",async()=>{
 for(const [patch,status,token,role] of [
  [{studentId:undefined},400], [{studentId:null},400], [{studentId:"Same Name"},400], [{studentId:P1},404],
  [{studentId:C3},404], [{parentId:P2},403], [{parentId:null},403],
  [{student_id:C1},400], [{parent_id:P2},403], [{},401,""], [{},401,"forged-token"], [{},403,"parent-token","admin"],
 ]){
  const r=runtime({role:role||"parent"}); const response=await submit(r,{...payload(),...patch},false,token===undefined?"parent-token":token)
  assert.equal(response.status,status,JSON.stringify(patch));assert.equal(r.writes.length,0)
 }
})
test("result reader requires explicit owned child and rejects missing or unowned identities",async()=>{
 const r=runtime();assert.equal((await GET(r,null)).status,400);assert.equal((await GET(r,C3)).status,404);assert.equal((await GET(r,C2,"")).status,401);assert.equal(r.writes.length,0)
})
test("ambiguous and contradictory legacy rows never enter dashboard statistics or certificate output",async()=>{
 const r=runtime();await submit(r)
 const result=r.tables.student_test_results[0]
 r.tables.student_test_results.push(
  {...result,id:"foreign",parent_id:P2,student_id:C3,student_name:"Sibling"},
  {...result,id:"legacy-name",student_id:null,student_name:"Sibling"},
  {...result,id:"wrong-parent",parent_id:P2},
  {...result,id:"legacy-grade",grade:null},
  {...result,id:"sibling",student_id:C1},
 )
 r.tables.certificates.push(
  {...r.tables.certificates[0],id:"fabricated",test_result_id:"unknown"},
  {...r.tables.certificates[0],id:"wrong-result",test_result_id:"sibling"},
  {...r.tables.certificates[0],id:"wrong-score",score:1},
 )
 const out=(await GET(r)).body
 assert.deepEqual(Array.from(out.testResults,x=>x.id),[result.id])
 assert.equal(out.earnedCertificates.length,1)
 assert.equal(out.selectedStudent.id,C2)
 assert.equal(r.tables.student_test_results.length,6)
})
test("certificate thresholds remain at least 80 percent AND 40 questions, never synthetic from scores alone",async()=>{
 for(const [percentage,total,expected] of [[79,40,0],[80,39,0],[80,40,1],[100,40,1]]){
  const r=runtime();assert.equal((await submit(r,{...payload(),percentage,totalQuestions:total,score:Math.floor(percentage*total/100)})).status,200)
  assert.equal(r.tables.certificates.length,expected)
 }
 const r=runtime();assert.equal((await submit(r,{...payload(),percentage:100},true)).status,200);assert.equal(r.tables.certificates.length,0);assert.equal(r.tables.student_test_results[0].score,100);assert.equal(r.tables.student_test_results[0].total_questions,1)
})
test("exact and concurrent retries persist one result and one certificate; conflicting retry fails closed",async()=>{
 const r=runtime();const responses=await Promise.all([submit(r),submit(r),submit(r)])
 assert.ok(responses.every(x=>x.status===200));assert.equal(r.tables.student_test_results.length,1);assert.equal(r.tables.certificates.length,1)
 assert.equal((await submit(r,{...payload(),score:33,percentage:82})).status,409)
 assert.equal(r.tables.student_test_results[0].score,32)
 // PostgreSQL timestamp serialization differs from browser ISO spelling.
 r.tables.student_test_results[0].completed_at="2026-10-08T20:00:00+00:00"
 r.tables.certificates[0].issued_at="2026-10-08T20:00:00+00:00"
 assert.equal((await submit(r)).status,200)
})
test("failed result writes persist nothing; partial certificate failure retries same attempt without duplicate result",async()=>{
 const failed=runtime({failTable:"student_test_results"});assert.equal((await submit(failed)).status,500);assert.equal(failed.writes.length,0);assert.equal((await submit(failed)).status,200)
 const partial=runtime({failTable:"certificates"});assert.equal((await submit(partial)).status,500);assert.equal(partial.tables.student_test_results.length,1);assert.equal(partial.tables.certificates.length,0)
 assert.equal((await submit(partial)).status,200);assert.equal(partial.tables.student_test_results.length,1);assert.equal(partial.tables.certificates.length,1)
})
test("attempt capture survives selection switching; session changes cannot reattribute; retries retain completion identity",()=>{
 const {beginLearnerAttempt,completeLearnerAttempt}=runtime().load("lib/learner-attempt.ts")
 const attempt=beginLearnerAttempt(P1,C2);const nextSelection=C1
 assert.equal(completeLearnerAttempt(attempt,P1,()=>"first").studentId,C2)
 assert.equal(completeLearnerAttempt(attempt,P1,()=>"second").completedAt,"first")
 assert.notEqual(attempt.studentId,nextSelection)
 assert.throws(()=>completeLearnerAttempt(attempt,P2))
 assert.throws(()=>beginLearnerAttempt(P1,""))
})
test("admin matching uses both parent and child; no name/sole-child fallback for ambiguous legacy",()=>{
 const {resolveResultStudentMatch}=runtime().load("lib/result-matching.ts")
 const students=new Map([[C1,{id:C1,parent_id:P1,full_name:"Same Name"}],[C3,{id:C3,parent_id:P2,full_name:"Same Name"}]])
 assert.equal(resolveResultStudentMatch({student_id:C1,parent_id:P2,grade:"grade5"},students,new Map()),null)
 assert.equal(resolveResultStudentMatch({parent_id:P1,student_name:"Same Name"},students,new Map()),null)
 assert.equal(resolveResultStudentMatch({student_id:C1,parent_id:P1,grade:"grade5"},students,new Map()).matchedStudentId,C1)
 assert.match(read("app/api/admin/reports/route.ts"),/profile\.role !== "admin"/)
 assert.doesNotMatch(read("app/api/admin/reports/route.ts"),/studentIdsForParent\[0\]|candidates\[0\]/)
})
test("actual admin reporting keeps administrative authorization and excludes contradictory ownership attribution",async()=>{
 const parent=runtime()
 const req=()=>new Request("https://synthetic.invalid/api/admin/reports",{headers:{Authorization:"Bearer parent-token"}})
 assert.equal((await parent.load("app/api/admin/reports/route.ts").GET(req())).status,403)
 const valid={id:"result",parent_id:P2,student_id:C3,grade:"grade5",subject:"Science",test_name:"Easy 1",score:32,total_questions:40,percentage:80,completed_at:payload().completedAt}
 const r=runtime({role:"admin",rows:{
   student_test_results:[valid,{...valid,id:"contradictory",parent_id:P1},{...valid,id:"legacy",student_id:null,student_name:"Same Name"}],
   certificates:[{...valid,id:"certificate",test_result_id:"result",issued_at:payload().completedAt},{...valid,id:"wrong-certificate",test_result_id:"contradictory",issued_at:payload().completedAt}],
 }})
 const out=await r.load("app/api/admin/reports/route.ts").GET(req())
 assert.equal(out.status,200)
 const child=out.body.students.find(s=>s.id===C3), owner=out.body.parents.find(p=>p.id===P2)
 assert.equal(child.resultsCount,1);assert.equal(child.certificatesCount,1)
 assert.equal(owner.resultsCount,1);assert.equal(owner.certificatesCount,1)
 assert.equal(r.writes.length,0)
})
test("dashboard/certificates cancel stale requests and never synthesize certificates or parent-wide progress",()=>{
 for(const path of ["app/dashboard/page.tsx","app/certificates/page.tsx"]){
  const source=read(path);assert.match(source,/selectedStudentId/);assert.match(source,/controller\.signal\.aborted/);assert.match(source,/return \(\) => controller\.abort\(\)/)
 }
 assert.doesNotMatch(read("app/certificates/page.tsx"),/results\s*\.filter|Excellence Certificate/)
 assert.doesNotMatch(read("app/dashboard/page.tsx"),/getTopicProgress|students\[0\]/)
 assert.match(read("lib/student-results.ts"),/data\.student_id !== studentId/)
})
test("all 225 accepted census entries have exact implementation evidence and protected assessment data",async(t)=>{
 assert.equal(coverage.entries.length,225);assert.equal(coverage.counts.shared_saver,142);assert.equal(coverage.counts.direct_performance,78)
 for(const item of coverage.entries)await t.test(item.accepted_entry.path+":"+item.accepted_entry.line+" "+item.accepted_entry.kind,async()=>{
  const {path,line,function:fn}=item.implementation;const source=read(path),sf=ts.createSourceFile(path,source,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
  assert.equal(sf.parseDiagnostics.length,0,path)
  let calls=[];function walk(n){if(ts.isCallExpression(n)&&n.expression.getText(sf)===fn)calls.push(n);ts.forEachChild(n,walk)}walk(sf)
  const call=calls.find(n=>sf.getLineAndCharacterOfPosition(n.getStart(sf)).line+1===line)
  assert.ok(call,path+":"+line);assert.equal(call.getText(sf),item.implementation.call_site)
  if(item.accepted_entry.path.startsWith("app/mock-tests/")){
   assert.match(call.getText(sf),/learnerAttempt\.studentId/);assert.match(call.getText(sf),/learnerAttempt\.completedAt\(\)/)
   assert.match(source,/learnerAttempt\.capture\(\)/);assert.match(source,/<\s*LearnerSelector/)
   assert.doesNotMatch(source,/\.from\("student_test_results"\)\.insert/)
   const old=execFileSync("git",["show",coverage.baseline_sha+":"+path],{encoding:"utf8"}),before=ts.createSourceFile(path,old,ts.ScriptTarget.Latest,true,ts.ScriptKind.TSX)
   const constants=sf=>sf.statements.filter(ts.isVariableStatement).map(n=>n.getText(sf))
   assert.deepEqual(constants(sf),constants(before),"Question/task content changed")
   const runtimeFixture=runtime(), helper=runtimeFixture.load("lib/student-test-results.ts")
   if(item.accepted_entry.kind==="shared_saver_caller"){
     await helper.saveStudentTestResult(payload())
   }else if(item.accepted_entry.kind==="direct_result_writer"){
     await helper.savePerformanceTaskResult({parentId:P1,studentId:C2,subject:"Mathematics",test_name:"Performance Task",score:91,total_questions:1,correct_answers:91,difficulty:"Easy",category:"performance-task",completed_at:payload().completedAt})
     assert.equal(runtimeFixture.tables.student_test_results[0].percentage,91)
     assert.equal(runtimeFixture.tables.student_test_results[0].score,91)
   }else assert.equal((await submit(runtimeFixture,payload(),true)).status,200)
   assert.equal(runtimeFixture.tables.student_test_results[0].student_id,C2)
   assert.equal(runtimeFixture.tables.student_test_results[0].parent_id,P1)
  }
 })
})
test("client dashboard retrieval switches siblings and returns only genuine issued certificates",async()=>{
 const r=runtime();await submit(r)
 const api=r.load("lib/student-results.ts"), client={auth:{getSession:async()=>({data:{session:{access_token:"parent-token"}},error:null})}}
 const second=await api.fetchLearnerDashboard(client,C2)
 const first=await api.fetchLearnerDashboard(client,C1)
 assert.equal(second.selectedStudent.id,C2);assert.equal(second.testResults.length,1);assert.equal(second.earnedCertificates.length,1)
 assert.equal(first.selectedStudent.id,C1);assert.equal(first.testResults.length,0);assert.equal(first.earnedCertificates.length,0)
 await assert.rejects(()=>api.fetchLearnerDashboard(client,C3))
})
test("seven frozen UX files, database, scoring/commercial modules and production configuration remain untouched",()=>{
 const changed=execFileSync("git",["diff","--name-only",coverage.baseline_sha],{encoding:"utf8"}).trim().split("\n")
 const protectedPaths=["app/language-arts/page.tsx","app/learn/page.tsx","app/mathematics/page.tsx","app/science/page.tsx","app/social-studies/page.tsx","components/learning/learning-shell.tsx","tests/g5-learn-002-ux-001-entry.test.mjs"]
 for(const path of changed){assert.ok(!protectedPaths.includes(path),path);assert.ok(!/^(supabase\/|lib\/subscriptions|lib\/payments|app\/api\/mark-response|app\/api\/admin\/payments|contexts\/progress-context|next\.config|package)/.test(path),path)}
})
