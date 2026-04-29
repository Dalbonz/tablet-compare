# Tablet Compare Pro

태블릿 제품 스펙 비교 앱 — GSMArena + Nanoreview 실시간 크롤링 기반

## 기술 스택
- **Frontend**: React + Vite
- **Backend/크롤링**: Cloudflare Workers
- **호스팅**: Cloudflare Pages
- **비용**: 완전 무료 🎉

## 로컬 개발 환경 세팅

### 필수 설치
```bash
node -v   # v18 이상 필요
npm -v
```

### 1. 프로젝트 클론
```bash
git clone https://github.com/Dalbonz/Tablet_compare.git
cd Tablet_compare
```

### 2. 프론트엔드 세팅
```bash
cd frontend
npm install
npm run dev
```

### 3. Cloudflare Worker 세팅
```bash
cd ../worker
npm install
npx wrangler dev
```

## 배포

### Cloudflare Pages (프론트엔드)
```bash
cd frontend
npm run build
# Cloudflare Pages에 dist/ 폴더 연결
```

### Cloudflare Workers (백엔드)
```bash
cd worker
npx wrangler deploy
```

## 프로젝트 구조
```
Tablet_compare/
├── frontend/          # React + Vite 앱
│   ├── src/
│   │   ├── components/
│   │   │   ├── ProductCard.jsx
│   │   │   ├── CompareTable.jsx
│   │   │   └── AddProductPanel.jsx
│   │   ├── App.jsx
│   │   └── main.jsx
│   └── package.json
└── worker/            # Cloudflare Worker (크롤링 API)
    ├── src/
    │   └── index.js
    └── wrangler.toml
```
