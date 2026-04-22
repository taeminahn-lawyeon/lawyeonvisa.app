#!/usr/bin/env node
/**
 * scripts/validate-biz-i18n.js
 *
 * biz.* 키와 기타 신규 공통 키가 required 7개 언어 객체 모두에 존재하는지 검증.
 *
 * 성공: exit 0 + OK 메시지
 * 실패: exit 1 + 누락 내역 stderr 출력
 *
 * 사용:
 *   node scripts/validate-biz-i18n.js
 *   npm run validate:biz-i18n
 *
 * 참조: BUSINESS_IMMIGRATION_SPEC.md 섹션 14-9-6
 */

'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..');
const TRANSLATIONS_PATH = path.join(ROOT, 'js', 'translations.js');
const MANIFEST_PATH = path.join(__dirname, 'biz-i18n-manifest.json');

// 1) manifest 로드
let manifest;
try {
    manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));
} catch (err) {
    console.error('[validate-biz-i18n] manifest 로드 실패: ' + MANIFEST_PATH);
    console.error(err.message);
    process.exit(1);
}

const requiredLangs = manifest.requiredLanguages;
const allKeys = [...manifest.keys, ...(manifest.nonBizKeys || [])];

if (!Array.isArray(requiredLangs) || requiredLangs.length === 0) {
    console.error('[validate-biz-i18n] manifest.requiredLanguages 누락');
    process.exit(1);
}
if (allKeys.length === 0) {
    console.error('[validate-biz-i18n] manifest.keys 비어 있음');
    process.exit(1);
}

// 2) translations.js 로드 및 평가
//    파일이 전역 변수 선언 형태(const translations = { ... })이므로
//    Node에서 실행하기 위해 문자열을 약간 조작해 평가.
let src;
try {
    src = fs.readFileSync(TRANSLATIONS_PATH, 'utf8');
} catch (err) {
    console.error('[validate-biz-i18n] translations.js 로드 실패: ' + TRANSLATIONS_PATH);
    console.error(err.message);
    process.exit(1);
}

// `const translations = ` → `translations = ` 로 치환해 글로벌 스코프에 할당
const evalSrc = src.replace(/^\s*const\s+translations\s*=/m, 'translations =');

let translations;
try {
    // eslint-disable-next-line no-eval
    eval(evalSrc); // translations 변수에 객체 할당됨
} catch (err) {
    console.error('[validate-biz-i18n] translations.js 평가 실패');
    console.error(err.message);
    process.exit(1);
}

if (!translations || typeof translations !== 'object') {
    console.error('[validate-biz-i18n] translations 객체가 유효하지 않음');
    process.exit(1);
}

// 3) 각 언어 × 각 키 검증
const missing = [];
for (const key of allKeys) {
    for (const lang of requiredLangs) {
        const dict = translations[lang];
        if (!dict) {
            missing.push({ key: '(LANG MISSING)', lang });
            break;
        }
        if (typeof dict[key] === 'undefined') {
            missing.push({ key, lang });
        }
    }
}

// 4) 결과 출력
if (missing.length > 0) {
    console.error('[validate-biz-i18n] ❌ 누락된 번역 키 발견:');
    const grouped = {};
    for (const m of missing) {
        if (!grouped[m.lang]) grouped[m.lang] = [];
        grouped[m.lang].push(m.key);
    }
    for (const lang of Object.keys(grouped).sort()) {
        console.error('  [' + lang + '] ' + grouped[lang].length + '건');
        for (const k of grouped[lang]) {
            console.error('    - ' + k);
        }
    }
    console.error('\n총 누락: ' + missing.length + '건');
    process.exit(1);
}

// 5) 통과
const totalChecks = allKeys.length * requiredLangs.length;
const pendingCount = (src.match(/TRANSLATION_PENDING/g) || []).length;
console.log('[validate-biz-i18n] ✅ OK');
console.log('  · 검증 키: ' + allKeys.length + '개');
console.log('  · 언어: ' + requiredLangs.length + '개 (' + requiredLangs.join(', ') + ')');
console.log('  · 총 검사: ' + totalChecks + '건, 누락 0건');
console.log('  · TRANSLATION_PENDING 주석 잔여: ' + pendingCount + '건');
process.exit(0);
