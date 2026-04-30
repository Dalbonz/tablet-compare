# 클로이에게 - 프로젝트 컨텍스트

## 프로젝트 개요
- 앱명: Tablet Compare
- 목적: 부서 내 태블릿 스펙 비교 앱
- 배포: Cloudflare Pages (완전 무료)

## 기술 스택
- Frontend: React + Vite → Cloudflare Pages
- Backend: Cloudflare Worker
- 데이터: devicespecifications.com 크롤링
- AP 성능: 칩셋별 Geekbench 하드코딩 (worker/src/index.js CHIP_DB)
- 제품목록: GitHub Actions 주간 자동 업데이트 → products.json

## 배포 URL
- 프론트: https://tablet-compare.pages.dev
- Worker: https://tablet-compare-worker.swpark1204.workers.dev

## GitHub 레포
- https://github.com/Dalbonz/tablet-compare

## Cloudflare 계정
- 이메일: swpark1204@gmail.com
- Worker: tablet-compare-worker
- Pages: tablet-compare

## 배포 명령어
export CLOUDFLARE_EMAIL=swpark1204@gmail.com
export CLOUDFLARE_API_KEY=<Global API Key>
cd worker && npx wrangler deploy
cd ../frontend && npm run build && npx wrangler pages deploy dist --project-name tablet-compare

## 신제품 출시 시
1. worker/src/index.js CHIP_DB에 새 칩셋 추가
2. products.json은 GitHub Actions 자동 업데이트
3. Worker 재배포
