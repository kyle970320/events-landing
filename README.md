# DATA SKETCHERS Landing

React + Vite 기반 랜딩페이지 소스입니다. 현재 사용하는 이미지·고해상도 히어로 영상과 패키지 잠금 파일을 포함합니다. 별도 백엔드나 환경변수는 필요하지 않습니다.

## 실행

Node.js 24.15 이상인 24.x 환경을 권장합니다.

```bash
npm ci
npm run dev
```

기존 설치와 같은 의존성 해결 방식을 유지하도록 `.npmrc`에 `legacy-peer-deps=true`가 설정되어 있습니다.

## 빌드·배포

```bash
npm run build
```

호스팅에서 프로젝트 루트를 이 `package.json`이 있는 폴더로, 빌드 명령을 `npm run build`, 배포 폴더를 `dist`로 설정합니다. 직접 업로드하는 정적 호스팅에서는 빌드된 `dist/` 내용물을 업로드합니다.

리소스 경로는 상대 경로(`base: "./"`)입니다. 서버 최상위와 하위 폴더 모두 지원합니다. 소스의 `index.html`을 직접 열지 말고 개발 서버 또는 빌드 결과를 제공하는 HTTP 서버를 사용하세요.

## 검사

```bash
npm test
npm run test:ui
```

## 구성

- `src/`: React 컴포넌트, 스타일, 캔버스 모델과 테스트
- `public/images/`: 실제 사용하는 로고·고객사 이미지·히어로 이미지·영상
- `vite.config.js`: 상대 경로 배포 설정
- `package-lock.json`: 의존성 버전 잠금

캔버스와 활용 예시는 프론트엔드 데모입니다. HWP 예시 다운로드는 준비된 샘플 데이터이며 실제 파일 변환 API를 호출하지 않습니다. 상담 문의는 회사 이메일로 연결됩니다.

Blender 원본, 렌더 프레임, 이전 시안, 중복 영상, 빌드 결과, node_modules는 포함하지 않습니다. Git에 이 폴더의 파일들을 올린 뒤 호스팅 서비스에서 설치·빌드하세요.
