/* Offline regression checks: no live records or notification emails are created. */
const {test}=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');
const moj=require('../js/moj-countries.js');
const root=path.resolve(__dirname,'..');
const read=p=>fs.readFileSync(path.join(root,p),'utf8');

test('every offered name matches the captured Ministry of Justice Korean label',()=>{
    const source=require('./moj-countries-source.json');
    assert.equal(moj.countries.length,216);
    const aliases=new Map();
    for(const c of moj.countries){
        assert.equal(c.ko,source.countries.find(x=>x.code===c.code).ko);
        assert.equal(moj.normalize(c.en),c.ko);
        assert.equal(moj.normalize(c.code),c.ko);
        if(c.iso2) assert.equal(moj.normalize(c.iso2),c.ko);
        for(const a of [c.ko,c.en,c.officialEn,c.code,c.iso2,...c.aliases].filter(Boolean)){
            const key=a.toLowerCase();
            if(aliases.has(key))assert.equal(aliases.get(key),c.ko,'ambiguous alias: '+a);
            aliases.set(key,c.ko);
        }
    }
    assert.equal(moj.normalize('US'),'미국');
    assert.equal(moj.normalize('TH'),'타이');
    assert.equal(moj.normalize('RU'),'러시아(연방)');
    assert.equal(moj.normalize('AE'),'아랍에미리트연합');
});

test('both language selects store Korean full names; residence excludes nationality-only statuses',()=>{
    for(const lang of ['ko','en']){
        const choices=moj.options(lang,'residence');
        assert.match(choices,/<option value="미국">/);
        assert.doesNotMatch(choices,/<option value="[A-Z]{2}">/);
        for(const name of ['한국','무국적','국적불명','영국외지민','홍콩거주난민']){
            assert.ok(!choices.includes('value="'+name+'"'));
        }
    }
    assert.match(moj.options('en','residence'),/>United Arab Emirates<\/option>/);
    assert.match(moj.options('en','residence'),/>Democratic Republic of the Congo<\/option>/);
    assert.ok(!moj.options('ko','second','미국').includes('value="미국"'));
    const legacy={window:{}};
    vm.runInNewContext(read('js/countries.js'),legacy);
    for(const country of legacy.window.COUNTRIES)assert.ok(moj.normalize(country.c),country.c);
});

const base={name:'TEST ONLY',email:'test@example.invalid',phone:'000',category:'비자·체류',
    in_korea:false,country:'United States',nationality:'Canada',has_dual_nationality:false,
    second_nationality:null,visa:'',visa_expiry:'',message:'',lang:'en'};

test('current nationality is independent of residence and second nationality is conditional',()=>{
    assert.deepEqual(moj.validate(base),{country:'미국',nationality:'캐나다',has_dual_nationality:false,second_nationality:null});
    assert.deepEqual(moj.validate({...base,in_korea:true,country:'US',has_dual_nationality:true,second_nationality:'KR'}),
        {country:null,nationality:'캐나다',has_dual_nationality:true,second_nationality:'한국'});
    assert.equal(moj.validate({...base,second_nationality:'US'}).second_nationality,null);
    for(const change of [
        {nationality:''},{has_dual_nationality:null},{country:''},{country:'KR'},
        {country:'무국적'},{nationality:'invented'},
        {has_dual_nationality:true,second_nationality:''},
        {has_dual_nationality:true,second_nationality:'CA'},
        {has_dual_nationality:true,second_nationality:'무국적'},
        {nationality:'무국적',has_dual_nationality:true,second_nationality:'US'}
    ])assert.throws(()=>moj.validate({...base,...change}),JSON.stringify(change));
});

test('the production serializer sends all citizenship fields as named database columns',async()=>{
    let records=[];
    const source=read('js/supabase-client.js');
    const start=source.indexOf('async function createPreConsultation(d)');
    const end=source.indexOf('// 사전상담 접수 메일 발송',start);
    const sandbox={window:{MojCountries:moj},console:{error(){}},debugLog(){},
        uuidv4:()=> 'test-id',
        supabaseClient:{from(table){assert.equal(table,'pre_consultations');return {async insert(record){records.push(record);return {error:null};}};}},
        notifyAdminOnNewPreConsultation:()=>Promise.resolve({})};
    vm.createContext(sandbox);vm.runInContext(source.slice(start,end),sandbox);
    for(const inKorea of [false,true])for(const dual of [false,true]){
        const result=await sandbox.createPreConsultation({...base,in_korea:inKorea,has_dual_nationality:dual,second_nationality:'US'});
        assert.equal(result.success,true);
        const record=records.at(-1);
        assert.equal(record.nationality,'캐나다');
        assert.equal(record.has_dual_nationality,dual);
        assert.equal(record.second_nationality,dual?'미국':null);
        assert.equal(record.country,inKorea?null:'미국');
    }
    const before=records.length;
    assert.equal((await sandbox.createPreConsultation({...base,has_dual_nationality:true,second_nationality:'CA'})).success,false);
    assert.equal(records.length,before);
    assert.equal((await sandbox.createPreConsultation({...base,hp:'bot'})).skipped,true);
    assert.equal(records.length,before);
});
