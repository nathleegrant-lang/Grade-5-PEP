"""Exact scoped reconstruction and fail-closed metadata comparison; no DB connector."""
import json

def qi(s): return '"'+s.replace('"','""')+'"'
def qualified(t): return qi(t['schema'])+'.'+qi(t['name'])
def build(c):
    sql=['set search_path = public, auth, app_private, pg_catalog;']
    # The local bootstrap is harness_runner, never a tested production role.
    for r in c['roles']:
        if r['name'].startswith('pg_'): continue
        flags=[opt if r[key] else 'NO'+opt for key,opt in [('superuser','SUPERUSER'),('inherit','INHERIT'),('create_role','CREATEROLE'),('create_db','CREATEDB'),('login','LOGIN'),('replication','REPLICATION'),('bypass_rls','BYPASSRLS')]]
        sql.append('create role '+qi(r['name'])+' with '+' '.join(flags)+' connection limit '+str(r['connection_limit'])+';')
    # Native builtin memberships have the local bootstrap as grantor; restore source provenance.
    sql.append("do $$ declare r record; begin for r in select a.*,p.rolname role_name,m.rolname member_name,g.rolname grantor_name from pg_auth_members a join pg_roles p on p.oid=a.roleid join pg_roles m on m.oid=a.member join pg_roles g on g.oid=a.grantor loop execute format('revoke %I from %I granted by %I',r.role_name,r.member_name,r.grantor_name); end loop; end $$;")
    for m in c['memberships']:
        for key,opt in [('admin','ADMIN'),('inherit','INHERIT'),('set','SET')]:
            sql.append('grant '+qi(m['role'])+' to '+qi(m['member'])+' with '+opt+' '+str(m[key]).upper()+' granted by '+qi(m['grantor'])+';')
    for s in c['schemas']:
        if s['name']!='public': sql.append('create schema '+qi(s['name'])+';')
    for t in c['tables']:
        cols=[]
        for a in t['columns']:
            d=qi(a['name'])+' '+a['type']
            if a['collation']: d+=' collate '+a['collation']
            if a['identity']: d+=' generated '+('always' if a['identity']=='a' else 'by default')+' as identity'
            elif a['generated']: d+=' generated always as ('+a['default']+') stored'
            elif a['default'] is not None: d+=' default '+a['default']
            if a['not_null']: d+=' not null'
            cols.append(d)
        sql.append('create table '+qualified(t)+' ('+', '.join(cols)+');')
    for kind in ['p','u','c','f','x']:
        for con in c['constraints']:
            if con['type']==kind: sql.append('alter table '+con['table']+' add constraint '+qi(con['name'])+' '+con['definition']+';')
    owned={x['index_oid'] for x in c['constraints'] if x['type'] in ['p','u','x']}
    for i in c['indexes']:
        if i['oid'] not in owned: sql.append(i['definition']+';')
    for f in c['functions']:
        sql += [f['definition'].rstrip()+';', 'alter function '+f['signature']+' owner to '+qi(f['owner'])+';']
    for t in c['tables']:
        sql += ['alter table '+qualified(t)+' owner to '+qi(t['owner'])+';', 'alter table '+qualified(t)+(' enable' if t['rls'] else ' disable')+' row level security;', 'alter table '+qualified(t)+(' force' if t['force_rls'] else ' no force')+' row level security;']
    for p in c['policies']:
        d='create policy '+qi(p['policyname'])+' on '+qi(p['schemaname'])+'.'+qi(p['tablename'])+' as '+p['permissive']+' for '+p['cmd']+' to '+', '.join('PUBLIC' if r=='public' else qi(r) for r in p['roles'])
        if p['qual'] is not None: d+=' using ('+p['qual']+')'
        if p['with_check'] is not None: d+=' with check ('+p['with_check']+')'
        sql.append(d+';')
    for t in c['triggers']:
        sql += [t['definition']+';', 'alter table '+t['table']+' '+{'O':'enable','D':'disable','A':'enable always','R':'enable replica'}[t['enabled']]+' trigger '+qi(t['name'])+';']
    privileges={'r':'SELECT','a':'INSERT','w':'UPDATE','d':'DELETE','D':'TRUNCATE','x':'REFERENCES','t':'TRIGGER','m':'MAINTAIN','X':'EXECUTE','U':'USAGE','C':'CREATE'}
    allroles='PUBLIC, '+', '.join(qi(r['name']) for r in c['roles'])
    def acl(obj,items):
        if items is None: return
        sql.append('revoke all on '+obj+' from '+allroles+';')
        for item in items:
            who,bits=item.split('=',1);bits,grantor=bits.rsplit('/',1);i=0
            while i<len(bits):
                ch=bits[i];i+=1;option=i<len(bits) and bits[i]=='*'
                if option:i+=1
                sql.extend(['set role '+qi(grantor)+';', 'grant '+privileges[ch]+' on '+obj+' to '+(qi(who) if who else 'PUBLIC')+(' with grant option' if option else '')+';', 'reset role;'])
    for s in c['schemas']:
        sql.append('alter schema '+qi(s['name'])+' owner to '+qi(s['owner'])+';');acl('schema '+qi(s['name']),s['acl'])
    for t in c['tables']:acl('table '+qualified(t),t['acl'])
    for f in c['functions']:acl('function '+f['signature'],f['acl'])
    # Do not replace unavailable platform extensions with permissive implementations.
    return '\n'.join(sql)+'\n'

def normalized(c):
    """Remove OIDs/time only, normalize unordered collections and CRLF, preserve all security fields."""
    def walk(x):
        if isinstance(x,dict):return {k:walk(v) for k,v in sorted(x.items()) if k not in ('oid','index_oid','captured_at')}
        if isinstance(x,list):return sorted([walk(v) for v in x],key=lambda v:json.dumps(v,sort_keys=True))
        if isinstance(x,str):return x.replace('\r\n','\n')
        return x
    c=json.loads(json.dumps(c));c['roles']=[r for r in c['roles'] if r['name']!='harness_runner']
    return walk(c)

def diff(expected,actual):
    e,a=normalized(expected),normalized(actual)
    return [{'section':k,'expected':e.get(k),'actual':a.get(k)} for k in sorted(set(e)|set(a)) if e.get(k)!=a.get(k)]
