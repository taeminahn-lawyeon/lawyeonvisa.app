// Supabase Edge Function: commit-content
// 관리자 페이지 "글 편집"에서 content/*.html 파일을 불러오고(GitHub) 저장(커밋)한다.
// 저장 커밋 → build-site GitHub Action이 자동 빌드·배포.
//
// 보안:
//  - 호출자 JWT를 검증해 실제 로그인 사용자 확인
//  - profiles.role(=id) 또는 admins.role(=email)이 관리자 역할일 때만 허용
//  - path 는 content/<name>.(ko|en|vi).html 화이트리스트만 허용
//
// 필요한 시크릿(supabase secrets set ...):
//  - GITHUB_TOKEN : 이 저장소 Contents Read/Write 권한 토큰
//  - GITHUB_REPO  : "owner/repo" (미설정 시 아래 기본값)
// (SUPABASE_URL / SUPABASE_SERVICE_ROLE_KEY 는 런타임 기본 제공)

import { serve } from 'https://deno.land/std@0.168.0/http/server.ts'
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const ALLOWED_ORIGINS = [
  'https://lawyeonvisa.app',
  'https://www.lawyeonvisa.app',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
]
const ADMIN_ROLES = ['super_admin', 'admin', 'staff']
const GITHUB_REPO = Deno.env.get('GITHUB_REPO') ?? 'taeminahn-lawyeon/lawyeonvisa.app'
const BRANCH = 'main'
const PATH_RE = /^content\/[A-Za-z0-9._-]+\.(ko|en|vi)\.html$/

function cors(origin: string | null) {
  const o = origin && ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0]
  return {
    'Access-Control-Allow-Origin': o,
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
  }
}

function b64encode(str: string): string {
  const bytes = new TextEncoder().encode(str)
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin)
}
function b64decode(b64: string): string {
  const bin = atob(b64.replace(/\s/g, ''))
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return new TextDecoder().decode(bytes)
}

serve(async (req) => {
  const headers = { ...cors(req.headers.get('origin')), 'Content-Type': 'application/json' }
  if (req.method === 'OPTIONS') return new Response('ok', { headers })
  if (req.method !== 'POST') return new Response(JSON.stringify({ error: 'method' }), { status: 405, headers })

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!
    const anonKey = Deno.env.get('SUPABASE_ANON_KEY')!
    const serviceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    const ghToken = Deno.env.get('GITHUB_TOKEN')
    if (!ghToken) return new Response(JSON.stringify({ error: 'GITHUB_TOKEN 미설정' }), { status: 500, headers })

    // 1) 호출자 인증
    const authHeader = req.headers.get('Authorization') ?? ''
    const authClient = createClient(supabaseUrl, anonKey, { global: { headers: { Authorization: authHeader } } })
    const { data: { user }, error: userErr } = await authClient.auth.getUser()
    if (userErr || !user) return new Response(JSON.stringify({ error: '인증 필요' }), { status: 401, headers })

    // 2) 관리자 권한 확인 (service role → RLS 우회)
    const admin = createClient(supabaseUrl, serviceKey)
    let isAdmin = false
    {
      const { data: prof } = await admin.from('profiles').select('role').eq('id', user.id).single()
      if (prof && ADMIN_ROLES.includes(prof.role)) isAdmin = true
      if (!isAdmin && user.email) {
        const { data: adm } = await admin.from('admins').select('role').eq('email', user.email).single()
        if (adm && ADMIN_ROLES.includes(adm.role)) isAdmin = true
      }
    }
    if (!isAdmin) return new Response(JSON.stringify({ error: '관리자 권한 없음' }), { status: 403, headers })

    // 3) 요청 처리
    const body = await req.json()
    const action = body.action
    const path = String(body.path ?? '')
    if (!PATH_RE.test(path)) return new Response(JSON.stringify({ error: '허용되지 않은 경로' }), { status: 400, headers })

    const apiBase = `https://api.github.com/repos/${GITHUB_REPO}/contents/${path}`
    const ghHeaders = {
      Authorization: `Bearer ${ghToken}`,
      Accept: 'application/vnd.github+json',
      'User-Agent': 'lawyeon-admin-editor',
    }

    if (action === 'get') {
      const r = await fetch(`${apiBase}?ref=${BRANCH}`, { headers: ghHeaders })
      if (!r.ok) return new Response(JSON.stringify({ error: `GitHub GET ${r.status}` }), { status: 502, headers })
      const j = await r.json()
      return new Response(JSON.stringify({ content: b64decode(j.content), sha: j.sha }), { headers })
    }

    if (action === 'save') {
      const content = String(body.content ?? '')
      if (!content || content.length > 400000) return new Response(JSON.stringify({ error: '내용 오류' }), { status: 400, headers })
      // 현재 sha 조회
      const cur = await fetch(`${apiBase}?ref=${BRANCH}`, { headers: ghHeaders })
      if (!cur.ok) return new Response(JSON.stringify({ error: `GitHub GET ${cur.status}` }), { status: 502, headers })
      const curJson = await cur.json()
      const put = await fetch(apiBase, {
        method: 'PUT',
        headers: { ...ghHeaders, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: `edit(admin): ${path} — ${user.email}`,
          content: b64encode(content),
          sha: curJson.sha,
          branch: BRANCH,
        }),
      })
      if (!put.ok) {
        const t = await put.text()
        return new Response(JSON.stringify({ error: `GitHub PUT ${put.status}`, detail: t.slice(0, 300) }), { status: 502, headers })
      }
      const pj = await put.json()
      return new Response(JSON.stringify({ ok: true, commit: pj.commit?.sha ?? null }), { headers })
    }

    return new Response(JSON.stringify({ error: 'unknown action' }), { status: 400, headers })
  } catch (e) {
    return new Response(JSON.stringify({ error: String(e?.message ?? e) }), { status: 500, headers })
  }
})
