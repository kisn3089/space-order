---
description: PR 템플릿 기반으로 git history를 분석하여 PR 설명을 자동 생성
allowed-tools: Bash(git:*), Read
argument-hint: [base-branch]
---

# PR Description Generator

PR 템플릿(`.github/pull_request_template.md`)과 git history를 분석하여 PR 설명을 생성합니다.

## 실행 단계

### 1. PR 템플릿 읽기

`.github/pull_request_template.md` 파일을 읽어 템플릿 구조를 파악합니다.

### 2. Git 컨텍스트 수집

Base branch를 결정합니다:

- `$ARGUMENTS` 인자가 있으면 해당 브랜치 사용
- 없으면 `main` 사용

다음 git 명령어들을 실행하여 컨텍스트를 수집합니다:

```bash
# 현재 브랜치
git branch --show-current

# 커밋 로그 (base branch 이후)
git log <base-branch>..HEAD --pretty=format:"%h %s%n%b---"

# 변경 파일 요약
git diff --stat <base-branch>...HEAD

# 전체 diff
git diff <base-branch>...HEAD
```

### 3. 변경 사항 분석

**변경 유형 감지 (커밋 prefix 기반):**

| Prefix             | 변경 유형                               |
| ------------------ | --------------------------------------- |
| `feat:`, `*/feat:` | ✨ 새로운 기능 (New feature)            |
| `fix:`, `*/fix:`   | 🐛 버그 수정 (Bug fix)                  |
| `refactor:`        | 🎨 코드 리팩토링 (Code refactoring)     |
| `ui:`, `style:`    | 🎨 프론트엔드 UI/UX (Frontend UI/UX)    |
| `docs:`            | 📚 문서 업데이트 (Documentation update) |
| `test:`            | 🧪 테스트 관련 (Test related)           |
| `perf:`            | ⚡ 성능 개선 (Performance improvement)  |
| `chore:`, `lint:`  | 🔧 설정 변경 (Configuration change)     |
| `docker:`          | 🐳 Docker 관련 (Docker related)         |

**영향 범위 감지 (파일 경로 기반):**

| 경로 패턴                          | 영향 범위                          |
| ---------------------------------- | ---------------------------------- |
| `apps/orderhub/`                   | 백엔드 API (Backend API)           |
| `apps/order/`, `apps/orderdesk/`   | 프론트엔드 UI (Frontend UI)        |
| `packages/db/`, `prisma/`          | 데이터베이스 (Database)            |
| `docker-compose.yml`, `Dockerfile` | Docker 설정 (Docker Configuration) |
| 그 외                              | 기타 (Other)                       |

### 4. PR 템플릿 섹션 작성

#### 설명 (Description)

커밋 메시지와 diff를 기반으로 목적과 변경 내용을 요약합니다.

**GitHub 마크다운 포맷팅 규칙:**

1. ### 번호 + 제목으로 주요 변경 사항을 구분
2. **백틱(`)**으로 코드, 컴포넌트명, 파일명, 태그 강조
3. **화살표(→)**로 변경 전/후를 명확하게 표현
4. **불릿 포인트(-)**로 세부 설명 추가

**출력 형식 예시:**

```markdown
### 1. Compound Component 패턴 적용

- `TableOrderList` → `TableOrderCard` compound component로 리팩토링
- `OrderCard.Header`, `OrderCard.Body`, `OrderCard.Footer` 서브 컴포넌트 분리

### 2. Web Accessibility 향상

- 테이블 클릭 시 상세 페이지 이동 로직을 `<button>` → `<Link>` 태그로 변경하여 웹 표준 준수
- click event가 있는 요소에 `tabIndex`, `disabled` 속성 추가

### 3. 타입 안정성 개선

- `OrderTableProps` 타입에 `orderStatus` 필드 추가
- `any` 타입 → 명시적 타입으로 변경
```

**작성 원칙:**

- 추상적 표현 대신 구체적 기술 내용 작성
  - 나쁜 예: "접근성 개선"
  - 좋은 예: "`<button>` → `<Link>` 태그로 변경하여 웹 표준 준수"
- 실제 변경된 파일, 컴포넌트, 로직을 구체적으로 명시
- 커밋 메시지의 prefix별로 그룹화하여 정리

#### 변경 유형 (Type of Change)

- 감지된 유형만 체크 (`[x]`)로 표시
- 해당하지 않는 유형은 삭제

#### 영향 범위 (Scope)

- 감지된 범위만 체크 (`[x]`)로 표시
- 해당하지 않는 범위는 삭제

#### 테스트 (Testing)

변경 유형에 따른 적절한 테스트 유형 제안:

- Backend 변경: API 테스트, 단위 테스트
- Frontend 변경: 프론트엔드 테스트, 수동 테스트
- Database 변경: 통합 테스트

#### 테스트 단계 (Test Steps)

실제 변경 사항 기반 구체적인 테스트 단계 작성:

1. 구체적인 테스트 시나리오
2. 예상 결과
3. 확인 방법

#### 체크리스트 (Checklist)

모든 항목 미체크 상태(`[ ]`)로 유지 (작성자가 확인)

#### 관련 Issue

커밋 메시지에서 issue 참조 추출 (예: "Fixes #123", "Closes #456")

#### 스크린샷/화면 녹화

Frontend UI 변경이 감지되면 스크린샷 추가 안내 문구 작성

#### 데이터베이스 마이그레이션

- `packages/db/` 또는 `prisma/` 변경이 있으면: `[x] 데이터베이스 마이그레이션 필요`
- 없으면: `[x] 데이터베이스 마이그레이션 불필요`

#### 설정 변경 (Configuration Changes)

변경된 설정 파일 명시 (.env, package.json, tsconfig 등)

#### 배포 참고사항 (Deployment Notes)

- DB 마이그레이션 실행 필요 여부
- 환경변수 추가/변경 여부
- 의존성 설치 필요 여부

#### 추가 정보 (Additional Information)

커밋 메시지의 body에서 추가 컨텍스트 추출

### 5. 출력

완성된 PR description을 GitHub에 바로 복사할 수 있는 Markdown 형식으로 출력합니다.
코드 블록으로 감싸서 복사하기 쉽게 제공합니다.
