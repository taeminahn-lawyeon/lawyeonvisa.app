# 관리자 "글 편집" 기능 — 배포 설정 (1회)

관리자 대시보드(`/admin-dashboard.html`)의 **글 편집** 탭이 동작하려면
Supabase Edge Function `commit-content`를 배포하고 GitHub 토큰을 등록해야 합니다.
프론트엔드(탭 UI·블록 에디터)는 이미 배포되어 있습니다.

## 동작 원리
관리자가 편집 탭에서 글을 저장하면 → `commit-content` 함수가 관리자 권한을 확인한 뒤
GitHub에 해당 `content/*.html`을 커밋 → `build-site` Action이 자동 빌드·배포합니다.
(편집 결과가 실제 정적 HTML로 남아 SEO에 그대로 반영되고, git으로 되돌리기도 가능)

## 1) GitHub 토큰 만들기 (Contents 쓰기)
GitHub → **Settings → Developer settings → Personal access tokens → Fine-grained tokens → Generate new token**
- **Repository access**: Only select repositories → `taeminahn-lawyeon/lawyeonvisa.app`
- **Permissions → Repository permissions → Contents: Read and write**
- 만료일 설정 후 생성 → 토큰 문자열 복사(`github_pat_…`)

## 2) Supabase 시크릿 등록 + 함수 배포
로컬에 Supabase CLI가 있고 프로젝트에 로그인된 상태에서 저장소 루트에서:

```bash
# 토큰 등록 (SUPABASE_URL/ANON/SERVICE_ROLE 키는 자동 주입되어 설정 불필요)
supabase secrets set GITHUB_TOKEN=github_pat_여기에붙여넣기
# (선택) 저장소가 다르면 지정 — 기본값 taeminahn-lawyeon/lawyeonvisa.app
# supabase secrets set GITHUB_REPO=owner/repo

# 함수 배포
supabase functions deploy commit-content
```

> Supabase CLI가 없으면: `npm i -g supabase` 후 `supabase login`,
> 그리고 `supabase link --project-ref gqistzsergddnpcvuzba` 한 번 실행.

## 3) 확인
- 관리자 로그인 → 대시보드 → **글 편집** 탭 → 글 선택 → **불러오기**
- 문단/소제목/FAQ가 블록으로 뜨면 성공. 텍스트 수정 후 **저장** → 1~3분 뒤 사이트 반영.
- "불러오기 실패: GITHUB_TOKEN 미설정" → 1)·2) 미완료. "관리자 권한 없음" → 로그인 계정의 role 확인.

## 보안 요약
- 함수는 호출자 JWT를 검증하고 `profiles.role`/`admins.role`이 `super_admin/admin/staff`일 때만 커밋.
- 저장 경로는 `content/<이름>.(ko|en|vi).html` **화이트리스트**만 허용(워크플로·JS 등 다른 파일 불가).
- GitHub 토큰은 함수 서버 측 시크릿에만 존재(브라우저에 노출 안 됨).

## 편집 규칙(관리자용)
- 링크·이미지·표·복잡한 구조 블록은 **잠금(🔒)** — 안전상 텍스트만 편집 가능.
- 굵게(`<b>`)만 지원. 그 외 서식은 저장 시 자동 제거.
- 한국어를 고치면 **영어 글도 따로** 고쳐야 함(언어별 파일 분리).
- 문단 재작성·새 글 추가·구조 변경은 개발(또는 Claude 세션)로 요청.
