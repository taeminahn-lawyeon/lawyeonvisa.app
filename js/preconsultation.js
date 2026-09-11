/* Shared Korean/English pre-consultation form. */
(function () {
    'use strict';
    var LANG = document.documentElement.lang === 'ko' ? 'ko' : 'en';
    var STR = LANG === 'ko' ? {
        agree: '개인정보 수집·이용·제공에 동의해 주세요.',
        need: '필수 항목을 모두 선택하거나 입력해 주세요.',
        badEmail: '회신받으실 이메일 주소를 확인해 주세요.',
        proc: '신청 중…', done: '신청 완료', cta: '사전상담 신청',
        err: '신청을 전송하지 못했습니다. 다시 시도하시거나 02-2039-0544로 연락해 주세요.',
        country: '국가를 선택하세요', nationality: '국적을 선택하세요',
        second: '두 번째 국적을 선택하세요',
        confirm: function (n,e) { return n+'님의 사전상담 신청이 접수되었습니다. 내용을 검토한 뒤 '+e+'로 회신드리겠습니다.'; }
    } : {
        agree: 'Please agree to the collection, use and provision of your personal information.',
        need: 'Please complete all required fields.',
        badEmail: 'Please check the email address where we will reply.',
        proc: 'Sending…', done: 'Application received', cta: 'Apply for pre-consultation',
        err: 'We could not send your application. Please try again, or call +82-2-2039-0544.',
        country: 'Select a country', nationality: 'Select your nationality',
        second: 'Select your second nationality',
        confirm: function (n,e) { return n+', your pre-consultation application has been received. We will review your matter and reply to '+e+'.'; }
    };
    function el(id) { return document.getElementById(id); }
    var name=el('cName'), email=el('cEmail'), phone=el('cPhone'), category=el('cCategory'),
        visa=el('cVisa'), expiry=el('cExpiry'), country=el('cCountry'), memo=el('cMemo'),
        nationality=el('cNationality'), dual=el('cDualNationality'), second=el('cSecondNationality'),
        hp=el('cCompanyHp'), chk=el('consentChk'), btn=el('consultBtn'),
        seg=el('inKoreaSeg'), inKorea=null, submitting=false;

    function populate(select, prompt, kind, excluded) {
        select.innerHTML='<option value="">'+prompt+'</option>'+window.MojCountries.options(LANG,kind,excluded);
    }
    populate(country,STR.country,'residence');
    populate(nationality,STR.nationality,'nationality');
    populate(second,STR.second,'second');

    function identity() {
        return window.MojCountries.validate({
            in_korea:inKorea, country:country.value, nationality:nationality.value,
            has_dual_nationality:dual.value==='' ? null : dual.value==='yes',
            second_nationality:second.value
        });
    }
    function sync() {
        var validIdentity=false;
        try { identity(); validIdentity=true; } catch (_) { /* incomplete form */ }
        btn.disabled=!(name.value.trim() && email.value.trim() && phone.value.trim() &&
            category.value && validIdentity && chk.checked && !submitting);
    }
    function syncDual() {
        var active=dual.value==='yes';
        el('secondNationalityField').hidden=!active;
        second.disabled=!active;
        second.required=active;
        if (!active) second.value='';
        sync();
    }
    nationality.addEventListener('change',function () {
        var previous=second.value, primary=window.MojCountries.find(nationality.value);
        populate(second,STR.second,'second',nationality.value);
        if (previous && previous!==nationality.value) second.value=previous;
        dual.querySelector('option[value="yes"]').disabled=!!primary && !primary.dual;
        if (primary && !primary.dual) dual.value='no';
        syncDual();
    });
    dual.addEventListener('change',syncDual);
    seg.addEventListener('change',function (event) {
        if (event.target.name!=='inKorea') return;
        inKorea=event.target.value==='yes';
        Array.prototype.forEach.call(seg.querySelectorAll('label'),function (label) {
            label.classList.toggle('on',label.getAttribute('data-v')===event.target.value);
        });
        el('visaFields').style.display=inKorea ? '' : 'none';
        el('countryField').style.display=inKorea ? 'none' : '';
        country.disabled=inKorea;
        country.required=!inKorea;
        visa.disabled=!inKorea; expiry.disabled=!inKorea;
        sync();
    });
    [name,email,phone].forEach(function (input) { input.addEventListener('input',sync); });
    [category,country,second,chk].forEach(function (input) { input.addEventListener('change',sync); });
    btn.addEventListener('click',apply);

    async function apply() {
        if (submitting) return;
        var fields;
        try { fields=identity(); } catch (_) { alert(STR.need); return; }
        if (!name.value.trim() || !email.value.trim() || !phone.value.trim() || !category.value) {
            alert(STR.need); return;
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(email.value.trim())) {
            alert(STR.badEmail); email.focus(); return;
        }
        if (!chk.checked) { alert(STR.agree); return; }
        submitting=true; btn.disabled=true; btn.textContent=STR.proc;
        var payload=Object.assign(fields,{
            name:name.value.trim(), email:email.value.trim(), phone:phone.value.trim(),
            category:category.value, in_korea:inKorea,
            visa:inKorea ? (visa.value || '') : '',
            visa_expiry:inKorea ? (expiry.value || '') : '',
            message:memo.value.trim(), lang:LANG, hp:hp.value
        });
        try {
            if (typeof createPreConsultation!=='function') throw new Error('backend not ready');
            var result=await createPreConsultation(payload);
            if (!result || !result.success) throw new Error((result && result.error) || 'save failed');
            el('confirmText').textContent=STR.confirm(payload.name,payload.email);
            el('confirm').classList.add('show');
            el('confirm').scrollIntoView({behavior:'smooth',block:'center'});
            btn.textContent=STR.done;
        } catch (error) {
            console.error(error); alert(STR.err); submitting=false; btn.textContent=STR.cta; sync();
        }
    }
    syncDual();
})();
