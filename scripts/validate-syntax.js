#!/usr/bin/env node
/**
 * HTML/JS 구문 오류 검증 스크립트
 * - 모든 .js 파일의 구문 오류 검출
 * - 모든 .html 파일 내 인라인 <script> 블록 구문 오류 검출
 * - 결제 흐름 핵심 포인트 검증
 */

const fs = require('fs');
const path = require('path');
const vm = require('vm');

const ROOT = path.resolve(__dirname, '..');
const IGNORE_DIRS = ['node_modules', '.git', 'dist', 'build', '.temp'];

let errors = 0;
let warnings = 0;
let filesChecked = 0;

function log(type, file, line, message) {
    if (type === 'ERROR') {
        errors++;
        console.error(`❌ ERROR  ${file}${line ? ':' + line : ''} — ${message}`);
    } else {
        warnings++;
        console.warn(`⚠️  WARN   ${file}${line ? ':' + line : ''} — ${message}`);
    }
}

// JS 파일 구문 검증
function validateJSFile(filePath) {
    const relPath = path.relative(ROOT, filePath);
    try {
        const code = fs.readFileSync(filePath, 'utf-8');
        // ES 모듈 (import/export) 파일은 sourceType 감지하여 처리
        const hasESM = /\b(import\s+|export\s+)/.test(code);
        if (hasESM) {
            // import/export를 제거한 후 나머지 구문만 검증
            const stripped = code
                .replace(/^\s*export\s+\{[^}]*\};?\s*$/gm, '')
                .replace(/^\s*export\s+(default\s+)?/gm, '')
                .replace(/^\s*import\s+.*$/gm, '');
            new vm.Script(stripped, { filename: relPath });
        } else {
            new vm.Script(code, { filename: relPath });
        }
        filesChecked++;
    } catch (e) {
        if (e instanceof SyntaxError) {
            log('ERROR', relPath, e.stack?.match(/:(\d+)/)?.[1], `JS 구문 오류: ${e.message}`);
        }
    }
}

// HTML 파일 내 인라인 스크립트 검증
function validateHTMLFile(filePath) {
    const relPath = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    filesChecked++;

    // 인라인 <script> 블록 추출 (src 속성 없는 것, application/ld+json 제외)
    const scriptRegex = /<script(?![^>]*\bsrc\b)(?![^>]*application\/ld\+json)[^>]*>([\s\S]*?)<\/script>/gi;
    let match;
    let scriptIndex = 0;

    while ((match = scriptRegex.exec(content)) !== null) {
        scriptIndex++;
        const scriptContent = match[1].trim();
        if (!scriptContent) continue;

        // 스크립트 시작 라인 번호 계산
        const beforeScript = content.substring(0, match.index);
        const startLine = beforeScript.split('\n').length;

        try {
            new vm.Script(scriptContent, { filename: `${relPath}:script#${scriptIndex}` });
        } catch (e) {
            if (e instanceof SyntaxError) {
                const errorLine = e.stack?.match(/:(\d+)/)?.[1];
                const actualLine = errorLine ? startLine + parseInt(errorLine) - 1 : startLine;
                log('ERROR', relPath, actualLine, `인라인 스크립트 구문 오류: ${e.message}`);
            }
        }
    }
}

// 결제 흐름 핵심 검증
function validatePaymentFlow() {
    console.log('\n🔍 결제 흐름 핵심 검증...\n');

    // 1. payment-success.html 존재 및 confirm-payment 호출 확인
    const paymentSuccessPath = path.join(ROOT, 'payment-success.html');
    if (!fs.existsSync(paymentSuccessPath)) {
        log('ERROR', 'payment-success.html', null, '파일이 존재하지 않습니다');
    } else {
        const content = fs.readFileSync(paymentSuccessPath, 'utf-8');

        if (!content.includes('confirm-payment')) {
            log('ERROR', 'payment-success.html', null, 'confirm-payment API 호출이 없습니다');
        }

        if (!content.includes('displaySuccess')) {
            log('ERROR', 'payment-success.html', null, 'displaySuccess 함수 호출이 없습니다');
        }

        // 주석 처리 오류 패턴 검출 (이번 사건의 재발 방지)
        const lines = content.split('\n');
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i].trim();
            // "// 함수호출(" 패턴 후 다음 줄이 주석이 아닌 객체 속성인 경우
            if (line.match(/^\/\/.*\(.*\{?\s*$/) && i + 1 < lines.length) {
                const nextLine = lines[i + 1].trim();
                if (nextLine.match(/^[a-zA-Z_]\w*\s*:/) && !nextLine.startsWith('//')) {
                    log('WARN', 'payment-success.html', i + 2,
                        `주석 처리 불완전 가능성: "${line}" 다음 줄이 주석이 아닙니다`);
                }
            }
        }
    }

    // 2. service-apply-general.html의 servicePricing과 data/services.json 비교
    const servicesJsonPath = path.join(ROOT, 'data', 'services.json');
    const serviceApplyPath = path.join(ROOT, 'service-apply-general.html');

    if (fs.existsSync(servicesJsonPath) && fs.existsSync(serviceApplyPath)) {
        const servicesJson = JSON.parse(fs.readFileSync(servicesJsonPath, 'utf-8'));
        const applyContent = fs.readFileSync(serviceApplyPath, 'utf-8');

        const jsonIds = new Set();
        for (const cat of servicesJson.categories) {
            for (const svc of cat.services) {
                jsonIds.add(svc.id);
            }
        }

        for (const id of jsonIds) {
            if (!applyContent.includes(`'${id}'`)) {
                log('WARN', 'service-apply-general.html', null,
                    `services.json의 서비스 "${id}"가 결제 페이지에 없습니다`);
            }
        }
    }

    // 3. Edge Function 파일 존재 확인
    const confirmPaymentPath = path.join(ROOT, 'supabase', 'functions', 'confirm-payment', 'index.ts');
    if (!fs.existsSync(confirmPaymentPath)) {
        log('ERROR', 'supabase/functions/confirm-payment/index.ts', null, '결제 승인 Edge Function 파일이 없습니다');
    }
}

// 불완전 주석 패턴 검출 (모든 파일)
function validateCommentPatterns(filePath) {
    const relPath = path.relative(ROOT, filePath);
    const content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split('\n');

    for (let i = 0; i < lines.length - 1; i++) {
        const line = lines[i].trim();
        const nextLine = lines[i + 1].trim();

        // "// something({" 패턴 후 다음 줄이 주석이 아닌 객체 속성
        if (line.match(/^\/\/.*[\(\{]\s*$/) && nextLine.match(/^[a-zA-Z_]\w*\s*:/) && !nextLine.startsWith('//')) {
            log('WARN', relPath, i + 2, `주석 처리 불완전 가능성: 이전 줄은 주석인데 이 줄은 주석이 아닙니다`);
        }
    }
}

// 파일 탐색
function walkDir(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
        if (IGNORE_DIRS.includes(entry.name)) continue;
        const fullPath = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkDir(fullPath);
        } else if (entry.name.endsWith('.js')) {
            validateJSFile(fullPath);
            validateCommentPatterns(fullPath);
        } else if (entry.name.endsWith('.html')) {
            validateHTMLFile(fullPath);
            validateCommentPatterns(fullPath);
        }
    }
}

// 실행
console.log('🔎 구문 검증 시작...\n');
walkDir(ROOT);
validatePaymentFlow();

console.log(`\n${'─'.repeat(50)}`);
console.log(`📊 검증 완료: ${filesChecked}개 파일 검사`);
console.log(`   ❌ 오류: ${errors}건`);
console.log(`   ⚠️  경고: ${warnings}건`);

if (errors > 0) {
    console.log('\n💥 구문 오류가 발견되었습니다. 배포 전에 반드시 수정하세요.\n');
    process.exit(1);
}

if (warnings > 0) {
    console.log('\n⚠️  경고 사항을 확인해주세요.\n');
}

process.exit(0);
