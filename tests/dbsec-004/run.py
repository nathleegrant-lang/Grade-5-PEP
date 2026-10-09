#!/usr/bin/env python3
"""Disposable local-only PostgreSQL harness. A mismatch prevents every security execution."""
import concurrent.futures,hashlib,json,os,pathlib,re,subprocess,sys,traceback,threading
from catalog import build,diff
ROOT=pathlib.Path(__file__).resolve().parent
OUT=pathlib.Path('evidence');OUT.mkdir(exist_ok=True)
RESULTS=[]
WRITE_LOCK=threading.Lock()

def write(name,value):
    with WRITE_LOCK:
        (OUT/name).write_text(value if isinstance(value,str) else json.dumps(value,indent=2)+'\n')
def sql(text,label,check=True):
    r=subprocess.run(['psql','-X','-qAt','-v','ON_ERROR_STOP=1','-v','VERBOSITY=verbose'],input=text,text=True,capture_output=True)
    safe=re.sub(r'[^A-Za-z0-9_.-]','_',label)
    write(safe+'.sql',text);write(safe+'.stdout',r.stdout);write(safe+'.stderr',r.stderr)
    if check and r.returncode:raise RuntimeError(label+': '+r.stderr)
    return r

def capture(label):
    r=sql(ART['capture_query'],label);c=json.loads(r.stdout.strip());write(label+'.json',c);return c

def claims(role,parent):
    data=json.dumps({'sub':parent,'role':role})
    return "begin; set local role "+role+"; set local request.jwt.claim.sub = '"+parent+"'; set local request.jwt.claims = '"+data+"';\n"

def case(id,query,role='authenticated',parent=None,error=None,value=None,commit=False):
    parent=parent or P1
    text=claims(role,parent)+query+'\n'+('commit;' if commit else 'rollback;')
    r=sql(text,id,False);m=re.search(r'ERROR:\s+([A-Z0-9]{5}):',r.stderr);state=m.group(1) if m else None
    good=(r.returncode!=0 and state in error) if error else (r.returncode==0 and (value is None or r.stdout.strip()==value))
    item={'id':id,'role':role,'parent':parent,'sqlstate':state,'returncode':r.returncode,'expected_error':error,'expected_value':value,'pass':good}
    RESULTS.append(item);write('test-results.json',RESULTS)
    if not good:print('FAIL',id,state,r.stdout,r.stderr,file=sys.stderr)
    return r

P1='10000000-0000-0000-0000-000000000001';P2='10000000-0000-0000-0000-000000000002';AD='10000000-0000-0000-0000-000000000003';P0='10000000-0000-0000-0000-000000000004';PC='10000000-0000-0000-0000-000000000005'
S11='20000000-0000-0000-0000-000000000011';S12='20000000-0000-0000-0000-000000000012';S21='20000000-0000-0000-0000-000000000021'
R11='30000000-0000-0000-0000-000000000011';R12='30000000-0000-0000-0000-000000000012';R21='30000000-0000-0000-0000-000000000021'

def result(student=S11,parent=P1,id=None):
    return "insert into public.student_test_results("+('id,' if id else '')+"parent_id,student_id,grade,subject,test_name,score,total_questions,percentage) values ("+("'"+id+"'," if id else '')+"'"+parent+"',"+("'"+student+"'" if student else 'null')+",'grade5','science','Synthetic',32,40,80);"

def cert(student=S11,res=R11,parent=P1):
    return "insert into public.certificates(parent_id,student_id,test_result_id,grade,student_name,subject,test_name,score,total_questions,percentage) values ('"+parent+"',"+("'"+student+"'" if student else 'null')+","+("'"+res+"'" if res else 'null')+",'grade5','Synthetic','science','Synthetic',32,40,80);"

def seed():
    q=[]
    for p in [P1,P2,AD,P0,PC]:q.append("insert into auth.users(id,email,email_confirmed_at,raw_user_meta_data) values ('"+p+"','synthetic-"+p[-2:]+"@example.invalid',now(),'{\"full_name\":\"Synthetic Parent\",\"phone\":\"synthetic\",\"role\":\"parent\"}');")
    q.append("update public.profiles set role='admin' where id='"+AD+"';")
    q.append("insert into public.grade5_plan_configuration(code,price_jmd,duration_months,duration_days,max_students,is_public) values ('free',0,0,0,1,true),('premium_family_monthly',10000,1,0,4,true);")
    for p,s,name,source in [(P1,S11,'Same Name',"'grade5_signup'"),(P1,S12,'Sibling','null'),(P2,S21,'Same Name','null')]:
        q.append("set request.jwt.claim.sub='"+p+"'; insert into public.students(id,parent_id,full_name,grade_level,creation_source) values ('"+s+"','"+p+"','"+name+"',5,"+source+");")
    q += [result(S11,P1,R11),result(S12,P1,R12),result(S21,P2,R21),cert()]
    q += [result(None),cert(None,None),cert(None,R11),result(S21,P1)]
    sql('\n'.join(q),'synthetic-baseline-fixtures')

def matrix():
    case('A1-update',"update profiles set role='admin' where id='"+P1+"';",error=['42501'])
    case('A1-upsert',"insert into profiles(id,role) values ('"+P1+"','admin') on conflict(id) do update set role=excluded.role;",error=['42501'])
    case('A2-edit',"update profiles set full_name='Edited',email='edited@example.invalid',phone='synthetic' where id='"+P1+"'; select full_name from profiles where id='"+P1+"';",value='Edited')
    case('A2-other',"update profiles set full_name='Wrong' where id='"+P2+"' returning id;",value='')
    case('A3-anon',"insert into profiles(id,role) values ('"+P0+"','admin');",role='anon',parent='',error=['42501'])
    case('A4-service',"update profiles set role='admin' where id='"+P1+"'; select role from profiles where id='"+P1+"';",role='service_role',value='admin')
    case('BC1-siblings',result()+result(S12))
    for name,s,p,err in [('cross',S21,P1,['42501','23503']),('parent',S11,P2,['42501','23503']),('null',None,P1,['23502']),('forged','20000000-0000-0000-0000-000000000099',P1,['42501','23503'])]:case('BC2-'+name,result(s,p),error=err)
    case('BC2-update-policy',"update student_test_results set student_id='"+S21+"' where id='"+R11+"' returning id;",value='')
    case('BC3-bypass',result(S21),role='service_role',error=['23503'])
    case('BC3-owner-change',"update students set parent_id='"+P2+"' where id='"+S11+"';",role='service_role',error=['23503'])
    case('D1-valid',cert())
    for name,s,r,p in [('sibling',S11,R12,P1),('foreign-result',S11,R21,P1),('foreign-child',S21,R21,P1),('forged',S11,'30000000-0000-0000-0000-000000000099',P1)]:case('D2-'+name,cert(s,r,p),error=['42501','23503'])
    for name,s,r in [('student',None,R11),('result',S11,None),('both',None,None)]:case('D3-'+name,cert(s,r),error=['23502'])
    case('D5-legacy',"update certificates set certificate_title='Legacy unresolved' where student_id is null;",role='service_role')
    case('D5-clear',"update certificates set student_id=null where student_id='"+S11+"';",role='service_role',error=['23502'])
    case('D6-student',"delete from students where id='"+S11+"';",role='service_role',error=['23503'])
    case('D6-result',"delete from student_test_results where id='"+R11+"';",role='service_role',error=['23503'])
    case('D7-cascade',"delete from auth.users where id='"+P1+"';",role='postgres')
    case('D7-ordered',"delete from certificates where parent_id='"+P1+"';delete from student_test_results where parent_id='"+P1+"';delete from students where parent_id='"+P1+"';",role='service_role')
    case('D7-deferred',"set constraints all deferred;delete from students where id='"+S11+"'; set constraints all immediate;",role='service_role',error=['23503'])
    case('E1-new',"select (ensure_grade5_signup_student('New Child')).full_name;",parent=P0,value='New Child',commit=True)
    case('E1-no-duplicate',"select count(*) from students where parent_id='"+P0+"';",parent=P0,value='1')
    case('E1-retry',"select (ensure_grade5_signup_student('New Child')).full_name;",parent=P0,value='New Child')
    case('E3-marked',"select (ensure_grade5_signup_student('Same Name')).id;",value=S11)
    case('E4-unmarked',"select ensure_grade5_signup_student('Same Name');",parent=P2,error=['22023'])
    case('E4-name-conflict',"select ensure_grade5_signup_student('Wrong Name');",error=['22000'])
    case('E4-empty',"select ensure_grade5_signup_student('');",error=['22023'])
    case('E5-anon',"select ensure_grade5_signup_student('No');",role='anon',parent='',error=['42501'])
    case('E5-no-uid',"select ensure_grade5_signup_student('No');",parent='',error=['42501'])
    case('E5-admin',"select ensure_grade5_signup_student('No');",parent=AD,error=['42501'])
    case('E5-grants',"select has_function_privilege('anon','ensure_grade5_signup_student(text)','execute')::text;",role='postgres',value='false')
    case('F1-parent',"select count(*) from student_test_results where parent_id='"+P2+"';",value='0')
    case('F1-admin',"select count(*)>0 from student_test_results where parent_id='"+P2+"';",parent=AD,value='t')
    case('certificate-content-gap',cert().replace('32,40,80','40,40,100'))
    write('known-security-gaps.json',{'certificate_content':'Owned-reference certificate can carry fabricated eligibility/content; DBSEC-003 does not close this separately reported gap.','legacy_exposure':'Seeded parent-labelled cross-family legacy row remains visible under unchanged parent SELECT policy.'})
    case('F2-result',result())
    case('F2-duplicate',result(S11,P1,R11),error=['23505'])
    # Real concurrent sessions; all committed successes must identify one signup child.
    def worker(i):return case('E2-concurrent-'+str(i),"select (ensure_grade5_signup_student('Concurrent')).id;",parent=PC,commit=True).stdout.strip()
    with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool: ids=list(pool.map(worker,[1,2]))
    RESULTS.append({'id':'E2-same-child','pass':len(set(ids))==1 and bool(ids[0]),'ids':ids})
    case('capacity-free',"select add_grade5_student('Extra','90000000-0000-0000-0000-000000000001');",parent=P0,error=['P0001'])
    case('operation-key-retry',"select (add_grade5_student('New Child',md5('G5-DBSEC-signup:'||'"+P0+"')::uuid)).full_name;",parent=P0,value='New Child')
    case('operation-key-conflict',"select add_grade5_student('Different',md5('G5-DBSEC-signup:'||'"+P0+"')::uuid);",parent=P0,error=['22000'])
    for i,metadata in enumerate(['admin','parent','invalid',None]):
        who='70000000-0000-0000-0000-'+str(i+1).zfill(12)
        md={'full_name':'Synthetic Signup','phone':'synthetic'}
        if metadata is not None:md['role']=metadata
        case('role-provisioning-'+str(metadata),"insert into auth.users(id,email,raw_user_meta_data) values ('"+who+"','signup"+str(i)+"@example.invalid','"+json.dumps(md)+"');reset role;select role from profiles where id='"+who+"';",role='supabase_auth_admin',parent='',value='parent')
    case('identity-key-immutable',"update students set creation_idempotency_key='90000000-0000-0000-0000-000000000099' where id='"+S11+"';",role='service_role',error=['42501'])
    case('active-family-capacity',"insert into subscriptions(parent_id,grade,plan_code,status,starts_at,expires_at,max_students) values ('"+P1+"','grade5','premium_family_monthly','active',now()-interval '1 day',now()+interval '1 day',4);select (add_grade5_student('Family Third','90000000-0000-0000-0000-000000000033')).full_name;",role='postgres',value='Family Third')
    case('registration-repeat-profile',"insert into auth.users(id,email,raw_user_meta_data) values ('70000000-0000-0000-0000-000000000077','repeat@example.invalid','{\"role\":\"admin\"}');update profiles set role='admin' where id='70000000-0000-0000-0000-000000000077';update auth.users set raw_user_meta_data='{\"role\":\"parent\"}' where id='70000000-0000-0000-0000-000000000077';select role from profiles where id='70000000-0000-0000-0000-000000000077';",role='postgres',value='admin')
    write('test-results.json',RESULTS)
    if any(not x['pass'] for x in RESULTS):raise RuntimeError('Synthetic failures; frozen candidate not modified')

ART=json.loads((ROOT/'inputs/schema-catalog.json').read_text())

def main():
    assert os.environ.get('PGHOST')=='127.0.0.1' and os.environ.get('PGDATABASE')=='g5_dbsec_ci' and os.environ.get('PGUSER')=='harness_runner','Non-isolated connection refused'
    digests={'schema-catalog.json':'393b0d8a2e92f77c2fa157c941178ba7100054f784a506982e0ae12871276f2a','dbsec-003.sql':'885860118abf7e5bd3f3c2b97c0e9dc2e6d465f96f8d65f2545d6c90c923289d','signup-role-correction.sql':'2a11d1a231e25fe22a402a788323a963a354cee6bcb70b55270a0870f06d863d'}
    for name,digest in digests.items():assert hashlib.sha256((ROOT/'inputs'/name).read_bytes()).hexdigest()==digest,name+' identity mismatch'
    write('input-identities.json',digests)
    assert sql('show server_version;','server-version').stdout.strip()=='17.6','PostgreSQL version mismatch'
    sql(build(ART['catalog']),'reconstruction')
    baseline=capture('baseline-catalog'); differences=diff(ART['catalog'],baseline)
    write('baseline-comparison.json',{'pass':not differences,'differences':differences})
    if differences:raise RuntimeError('BASELINE HOLD: material/unadjudicated metadata differences; candidate NOT EXECUTED')
    seed();sql("select jsonb_agg(to_jsonb(r) order by id) from student_test_results r;",'legacy-before')
    candidate=(ROOT/'inputs/dbsec-003.sql').read_text()
    # R1 proves candidate transaction atomicity against complete catalog, not a toy DDL stub.
    failed=candidate.rsplit('commit;',1)[0]+'select 1/0;\ncommit;'
    r=sql(failed,'R1-injected-failure',False);assert r.returncode!=0 and '22012' in r.stderr
    assert not diff(baseline,capture('R1-rollback-catalog')),'R1 catalog rollback mismatch'
    RESULTS.append({'id':'R1','pass':True,'sqlstate':'22012'})
    sql(candidate,'dbsec-003-execution');capture('post-dbsec-catalog')
    sql("select jsonb_agg(to_jsonb(r) order by id) from student_test_results r;",'legacy-after')
    assert (OUT/'legacy-before.stdout').read_text()==(OUT/'legacy-after.stdout').read_text(),'D4 legacy results changed'
    RESULTS.append({'id':'D4','pass':True})
    # Explicitly demonstrate original gap after DBSEC-003 before the separate correction.
    case('signup-original-gap',"insert into auth.users(id,email,raw_user_meta_data) values ('70000000-0000-0000-0000-000000000099','gap@example.invalid','{\"role\":\"admin\"}');select role from profiles where id='70000000-0000-0000-0000-000000000099';",role='supabase_auth_admin',parent='',value='admin')
    sql((ROOT/'inputs/signup-role-correction.sql').read_text(),'separate-role-correction')
    matrix();capture('post-test-catalog')
    restore=[]
    for table,names in {'certificates':['g5_dbsec_certificate_student_owner','g5_dbsec_certificate_result_owner'],'student_test_results':['g5_dbsec_result_student_owner']}.items():
        for name in names:restore.append('alter table public.'+table+' drop constraint '+name+';')
    restore += ['alter table public.student_test_results drop constraint g5_dbsec_results_owner_key;','alter table public.students drop constraint g5_dbsec_students_owner_key;']
    for table,fn in [('profiles','g5_dbsec_guard_profile_role'),('student_test_results','g5_dbsec_guard_result_identity'),('certificates','g5_dbsec_guard_certificate_identity')]:
        restore += ['drop trigger '+fn+' on public.'+table+';', 'drop function public.'+fn+'();']
    for con in ART['catalog']['constraints']:
        if con['name'] in ('student_test_results_student_id_fkey','certificates_student_id_fkey','certificates_test_result_id_fkey'):
            restore += ['alter table '+con['table']+' drop constraint '+con['name']+';', 'alter table '+con['table']+' add constraint '+con['name']+' '+con['definition']+';']
    for f in ART['catalog']['functions']:
        if f['signature'] in ('handle_new_user()','ensure_grade5_signup_student(text)'):restore.append(f['definition']+';')
    for policy in ART['catalog']['policies']:
        if policy['tablename'] in ('student_test_results','certificates') and policy['cmd']=='INSERT':
            restore.append('alter policy "'+policy['policyname']+'" on public.'+policy['tablename']+' to authenticated with check ('+policy['with_check']+');')
    complete=build(ART['catalog']);restore.append(complete[complete.index('alter schema '):])
    sql('\n'.join(restore),'R2-restore-baseline')
    restored=capture('R2-restored-catalog');rdiff=diff(baseline,restored);write('R2-comparison.json',rdiff)
    assert not rdiff,'R2 schema/ACL rollback mismatch'
    RESULTS.append({'id':'R2','pass':True});write('test-results.json',RESULTS)
    write('disposition.json',{'development_result':'PRELIMINARY MATRIX PASS WITH UNRESOLVED RECORDED SECURITY GAPS','independent_qa':'REQUIRED','production':'HOLD'})

if __name__=='__main__':
    try:main()
    except Exception as exc:
        write('disposition.json',{'development_result':'BLOCKED_OR_FAILED','reason':str(exc),'independent_qa':'NOT CERTIFIED','production':'HOLD'});write('exception.txt',traceback.format_exc());raise
