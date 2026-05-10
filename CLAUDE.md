# CLAUDE.md — Tablet Compare 프로젝트 기억

> 이 파일은 Claude와의 작업 기억을 보존하기 위한 파일입니다.
> 매 세션 마지막에 자동 업데이트됩니다.

---

## 프로젝트 개요

- **앱명**: Tablet Compare — 부서 내 태블릿 스펙 비교 앱
- **프론트**: React + Vite → Cloudflare Pages (`https://tablet-compare.pages.dev`)
- **백엔드**: Cloudflare Worker (`https://tablet-compare-worker.swpark1204.workers.dev`)
- **데이터 소스**: devicespecifications.com 크롤링 (hex dsId 기반)
- **제품 목록**: `products.json` (GitHub raw → Worker 런타임 fetch)
- **성능 DB**: `worker/src/index.js` CHIP_DB (Geekbench 하드코딩)
- **GitHub**: https://github.com/Dalbonz/tablet-compare

---

## 배포 방법

### Worker 배포
```bash
cd worker
CLOUDFLARE_EMAIL=swpark1204@gmail.com \
CLOUDFLARE_API_KEY=<Global API Key> \
npx wrangler deploy
```

### 프론트엔드 배포
```bash
cd frontend && npm run build
CLOUDFLARE_EMAIL=swpark1204@gmail.com \
CLOUDFLARE_API_KEY=<Global API Key> \
npx wrangler pages deploy dist --project-name tablet-compare
```

> **중요**: Worker 코드 변경은 반드시 `wrangler deploy` 필요.
> `products.json` 변경은 GitHub push만 해도 Worker가 런타임에 반영.

### Cloudflare 인증
- `CLOUDFLARE_API_KEY` 형식 (Global API Key): `cfk_...` 접두사
- `CLOUDFLARE_EMAIL`: `swpark1204@gmail.com`

---

## 파일 구조 핵심

```
products.json          — 전체 제품 목록 (제조사별 name + dsId)
worker/src/index.js    — Cloudflare Worker (파싱, CHIP_DB, FALLBACK_DB)
frontend/src/
  App.jsx              — 제조사/모델 선택, API 호출
  components/
    CompareTable.jsx   — 스펙 비교 테이블 (배지 렌더링 포함)
    SettingsPanel.jsx  — 설정 패널
scripts/
  scrape-products.js   — 제품 목록 크롤링 (GitHub Actions 주간 실행)
  test-all-specs.mjs   — 전체 제품 스펙 fetch 테스트 스크립트
  find-correct-dsids.mjs — slug dsId → hex dsId 탐색 스크립트
  verify-new-dsids.mjs   — 새 dsId 검증 스크립트
```

---

## dsId 규칙

- **올바른 형식**: 8자리 16진수 (예: `4fc55fda`)
- **잘못된 형식**: slug 형식 (예: `apple-ipad-pro-13-2024`) → 홈페이지 반환
- **없는 제품**: `""` 빈문자열 → Worker가 fetch 스킵 (쓰레기 데이터 방지)

### dsId 탐색 방법
- devicespecifications.com 브랜드 페이지는 404 → 직접 접근 불가
- WebSearch로 `site:devicespecifications.com [제품명]` 검색 후 URL에서 hex 추출
- 검증: 페이지 title이 제품명과 일치하는지 확인

---

## products.json 현황 (2026-04-30 기준)

| 제조사 | 제품 수 | 상태 |
|--------|---------|------|
| Apple | 17 | ✅ 전체 정상 |
| Samsung | 14 | ✅ 전체 정상 (Tab S10 기본형 제거—존재하지 않음) |
| Xiaomi | 9 | ✅ 전체 정상 |
| Lenovo | 7 | ✅ 전체 정상 |
| Huawei | 5 | ✅ 전체 정상 |
| Microsoft | 4 | ⚠️ dsId 빈값 (devicespecifications.com 미등재) |
| Google | 1 | ✅ 정상 |
| ASUS | 1 | ⚠️ dsId 빈값 (devicespecifications.com 미등재) |
| OnePlus | 3 | ✅ 전체 정상 |
| Sony | 1 | ✅ 정상 |
| **합계** | **62** | **57 정상 / 5 빈값** |

---

## Worker 파싱 구조 (worker/src/index.js)

### 파싱 우선순위
1. **tdGet()** — `<td>Label</td><td>Value</td>` 테이블 행 파싱 (가장 정확)
2. **bGet()** — `<b>Key</b>: value` 상단 요약 박스
3. **meta description** — og/meta 태그 (chipset, storage, battery 등)
4. **regex fallback** — 자유 텍스트에서 패턴 추출

### 주요 파싱 포인트
- **RAM**: `RAM capacity` 테이블 행 → GB 추출. Apple 일부 기기는 MHz만 표기 → `APPLE_RAM_FALLBACK` 칩셋별 하드코딩으로 보완
- **주사율**: `"60 Hz - 120 Hz refresh rate"` 패턴 → 최대값 추출
- **전면 카메라**: `Image resolution` 테이블 행 두 번째 항목 (첫 번째 = 후면)
- **충전**: `Charger output power: 9V / 5A` → V×A = W 계산
- **NFC**: `Connectivity` 또는 `Additional features` 행에서 "NFC" 텍스트 감지

### CHIP_DB 특이사항
- `Apple A16`과 `Apple A16 Bionic` 둘 다 등록 (iPad 2025가 "A16"으로 표기됨)
- Huawei Kirin 칩은 `Kirin 9000S` 형식 (대소문자 무관 includes 매칭)

---

## CompareTable 구조 (frontend/src/components/CompareTable.jsx)

- 카테고리: 기본 정보 / 바디 / 디스플레이 / AP(성능) / 메모리 / 카메라 / 사운드 / 배터리 / 통신 사양 / 센서 / MISC
- **비교 배지**: `ComparisonCell` 컴포넌트가 numeric 필드에서 `>>`, `>`, `=`, `<`, `<<` 표시
- **제조사명**: 컬럼 헤더에 제조사 + 모델명 표시 (`.manufacturer-label` CSS)
- 출시일/가격 항목 제거됨 (devicespecifications.com 미제공)

---

## 알려진 한계

1. **Microsoft Surface / ASUS ROG Flow Z13** — devicespecifications.com에 없음. dsId 빈값 처리
2. **Apple RAM 일부** — 구형 iPad/iPad mini는 devicespecifications.com이 MHz만 기재. 칩셋 폴백으로 처리
3. **밝기(nits)** — devicespecifications.com에서 대부분 미제공
4. **출시일/가격** — 데이터 소스 미제공으로 표 항목 자체 제거
5. **Samsung Galaxy Tab S10 기본형** — 존재하지 않는 제품으로 확인, 목록에서 제거

---

## 신제품 추가 방법

1. `worker/src/index.js` CHIP_DB에 새 칩셋 추가 (없는 경우)
2. `products.json`에 올바른 hex dsId로 항목 추가
3. Worker 재배포 (`wrangler deploy`)
4. `node scripts/test-all-specs.mjs`로 검증

### dsId 찾는 법
```
WebSearch: site:devicespecifications.com "[제품명]"
→ URL에서 /en/model/XXXXXXXX 추출
→ 페이지 title 확인으로 검증
```

---

## 작업 히스토리

### 2026-04-30
- **37개 slug dsId → hex dsId 전면 교체** (slug는 홈페이지 반환하는 버그)
- **FALLBACK_DB 전면 업데이트** (Lenovo/Huawei/OnePlus 등 추가)
- **Worker 파싱 대폭 개선**: 주사율, 전면 카메라, 충전속도, 센서, NFC, RAM
- **Apple RAM 폴백**: A16/A17 Pro/M1 등 칩셋별 하드코딩
- **CompareTable 수정**: 제조사명 표시, 비교 배지 실제 렌더링 연결
- **Samsung Galaxy Tab S10 기본형 제거** (존재하지 않는 제품)
- **출시일/가격 항목 제거** (데이터 소스 미제공)
- 최종 테스트: 62개 중 57개 완전 정상
