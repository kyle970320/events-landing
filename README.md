# D-SKET 랜딩 + 시뮬레이터 React 소스

- landing/: 기존 랜딩페이지 (/ 경로)
- demo/: 노드 캔버스 기반 시뮬레이터 (/demo/ 경로)
- scripts/: 두 앱의 개발 실행·통합 빌드·미리보기 스크립트

## 의존성 설치

Node.js 24.x와 npm이 설치된 환경에서 프로젝트 루트로 이동합니다.

```sh
npm --prefix landing ci --include=dev
npm --prefix demo ci --include=dev
```

## 개발 실행

```sh
npm run dev
```

- 랜딩: http://127.0.0.1:5180/
- 시뮬레이터: http://127.0.0.1:5180/demo/

## 배포 환경에서 빌드할 때

```sh
npm run build
```

통합 출력 폴더: dist/

- / → landing 앱
- /demo/ → demo 앱

정적 호스팅에서는 실제 파일을 우선 제공하고, 페이지 경로 fallback을 다음 순서로 설정합니다.

1. /demo/* → /demo/index.html
2. 그 외 페이지 경로 → /index.html

Netlify 호환 _redirects는 통합 빌드 시 생성됩니다. 다른 서버에서는 동등한 경로 설정이 필요합니다.

Vercel에서는 Root Directory를 저장소 루트로 지정합니다. 루트의 `vercel.json`이 두 앱의 의존성 설치, 통합 빌드, `dist/` 출력 및 페이지 경로 fallback을 설정합니다. Node.js는 `package.json`의 `engines`에 따라 24.x를 사용합니다.

Nginx 예시:

```nginx
root /path/to/dist;
location = /demo { return 302 /demo/; }
location /demo/ { try_files $uri $uri/ /demo/index.html; }
location / { try_files $uri $uri/ /index.html; }
```

이 ZIP은 빌드하지 않은 React 소스 패키지입니다. node_modules·dist·테스트·QA·Blender 원본·미사용 리소스·기존 행사관리 frontend 앱은 포함하지 않습니다. 기존 package.json과 존재하는 lockfile은 그대로 포함했습니다. 테스트 소스는 배포 패키지에서 제외되어 테스트용 명령은 이 ZIP의 제공 범위에 포함되지 않습니다.
