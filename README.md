# Tablet Compare

부서 내 태블릿 스펙 비교 앱

## 배포 URL
- 프론트: https://tablet-compare.pages.dev
- Worker: https://tablet-compare-worker.swpark1204.workers.dev

## 기술 스택
- Frontend: React + Vite → Cloudflare Pages
- Backend: Cloudflare Worker
- 데이터: devicespecifications.com
- AP 성능: CHIP_DB 하드코딩 (Geekbench 6)
- 제품목록: GitHub Actions 주간 자동 업데이트

## 신제품 출시 시
1. worker/src/index.js CHIP_DB에 새 칩셋 추가
2. products.json은 GitHub Actions 자동 업데이트
3. Worker 재배포

## 클로이에게
자세한 컨텍스트는 README_CONTEXT.md 참조