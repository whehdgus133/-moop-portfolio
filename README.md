# The moop studio.

사진·영상 제작자의 프로젝트 중심 포트폴리오입니다. 기존의 흰 배경, 큰 사진, 간결한 글자와 여백을 유지했습니다. HTML / CSS / JavaScript로 동작하며 빌드 과정이나 데이터베이스 없이 GitHub Pages에 배포할 수 있습니다.

## 먼저 알아둘 점

- 실제 사진은 기존 `images/hero.jpg` 한 장뿐입니다. 이를 사용한 **PORTRAIT STUDY 샘플 프로젝트**만 등록했습니다. 실제 고객명·연도·실적을 만들어 넣지 않았습니다.
- PRODUCT / EVENT도 분류로 준비되어 있습니다. 프로젝트가 없으면 준비 중으로 표시됩니다.
- 원본 `images/hero.jpg`는 수정하거나 삭제하지 않았습니다. 사이트는 작게 변환한 WebP를 사용합니다.
- CONTACT에 전화번호와 이메일을 반영했습니다. ABOUT 사진, SNS, FILM 주소는 비어 있습니다. 비어 있는 링크는 클릭되지 않습니다.
- 메인 WORK는 PORTRAIT / PRODUCT / EVENT 세 분야의 입구입니다. 현재 대표 사진은 기존 사진을 임시로 재사용하며 각 분야에 들어가면 그 분야의 공개 프로젝트만 표시됩니다.
- AI 자동 분류나 관리자 업로드 화면 자체는 아직 구현하지 않았습니다. 프로젝트 데이터와 이미지 변환 도구가 향후 자동화의 연결 지점입니다.

## 파일 구성

```text
index.html                       메인: 소개 / 세 분야의 WORK / ABOUT
work.html                        전체 및 분야별 프로젝트 목록
about.html                       프로필, 경력, 촬영/협업 실적, 클라이언트 로고
contact.html                     연락처와 프로젝트 문의 폼
project.html                     모든 프로젝트가 공유하는 상세 갤러리
style.css                        기존 디자인 + 반응형 / flip / lightbox
js/
  shared.js                      데이터 읽기, 이미지, 공통 설정
  home.js                        메인 분야별 대표 이미지와 링크
  work.js                        분야별 프로젝트 카드, flip
  contact.js                     문의 폼, 메일 앱 연결, 선택적 Formspree 전송
  project.js                     상세 갤러리, 확대 보기, 스와이프
data/
  projects.json                  프로젝트 관리 대장
  site.json                      대표 사진 / 소개 사진 / 연락처 설정
images/
  hero.jpg                       기존 원본 — 보존
  hero/hero-{thumb,preview,full}.webp
  about/                         소개 사진을 넣을 자리
  projects/
    sample-portrait/01-{thumb,preview,full}.webp
tools/
  prepare_project.py             원본 폴더 → 웹용 사진 + 프로젝트 초안
  check_site.py                  데이터와 사진 경로 검사
  requirements.txt               이미지 변환에 필요한 Pillow
```

`work.html?category=portrait`에서 인물 프로젝트 목록을 보고, `project.html?id=sample-portrait`에서 해당 프로젝트의 모든 사진을 봅니다. 프로젝트마다 HTML을 복사하거나 index.html에 카드를 추가할 필요가 없습니다. 프로젝트와 사진은 `order`가 작은 순서로 표시됩니다.

## Mac 전용 관리화면

`/Users/jo/Desktop/WEB/Portfolio_Manager/관리화면 실행.command`를 더블클릭하면 관리화면이 열립니다. 메인/분야 대표 사진, ABOUT, 프로젝트 사진·순서·설명, 연락처를 편집할 수 있습니다.

**편집 → 미리보기 → 로컬 저장 → 공개 준비 → GitHub Desktop에서 commit / Push origin** 순서로 사용하세요. 저장 전에 변경 내용을 미리 볼 수 있고, 로컬 저장은 GitHub에 자동 반영되지 않습니다. 관리 프로그램은 사이트 폴더 밖에 있어 이 저장소에 포함되지 않습니다. `WEB` 전체를 업로드하지 말고 이 포트폴리오 저장소만 관리하세요.

관리 프로그램 설명과 실행 파일은 옆 폴더 `Portfolio_Manager`에 있습니다. 저장 전 데이터는 관리 프로그램의 `local-data/backups`에 자동 보관됩니다. 초안 상태는 사이트에서만 숨기며 업로드된 사진 파일 자체를 비공개로 만들지는 않습니다.

## 내 컴퓨터에서 확인하기

1. 터미널에서 다음 두 줄을 실행합니다.

   ```sh
   cd "/Users/jo/Desktop/WEB/-moop-portfolio-main"
   python3 -m http.server 8000 --bind 127.0.0.1
   ```

2. 브라우저에서 **http://localhost:8000**을 엽니다.
3. 파일을 수정한 뒤 새로고침하면 반영됩니다.
4. 서버 종료는 터미널에서 Control + C를 누릅니다.

HTML을 더블클릭해 `file://`로 열면 브라우저 보안 정책 때문에 프로젝트 데이터와 모듈이 로딩되지 않습니다. 위 로컬 서버를 이용해 주세요. Python 3가 설치되어 있어야 합니다.

## 새 프로젝트 추가하기 — 권장 방법

처음 한 번만 이미지 변환 도구를 준비합니다. 사이트를 보기 위해서는 이 설치가 필요하지 않습니다.

```sh
python3 -m venv .venv
.venv/bin/python -m pip install -r tools/requirements.txt
```

**1. 원본 사진을 별도 폴더에 모읍니다.**

예: 개인 컴퓨터의 `Portfolio_Inbox/artist-portrait-2026/`. 파일 이름을 `01.jpg`, `02.jpg`처럼 정리하면 순서 지정이 쉽습니다. JPG / PNG / WebP / TIFF를 지원합니다. HEIC / RAW는 먼저 JPEG 또는 TIFF로 내보내 주세요. 폴더 바로 아래의 사진만 읽습니다.

**2. 변환 도구를 실행합니다.** 아래는 사용법 예시입니다. 원본 폴더 경로와 이름을 실제 값으로 바꿔 주세요.

```sh
.venv/bin/python tools/prepare_project.py "/원본/사진/폴더" \
  --id artist-portrait-2026 \
  --name "실제 프로젝트 이름" \
  --category portrait \
  --year 2026
```

- `--id`: 겹치지 않는 영문 소문자·숫자·하이픈 조합. 주소에도 쓰이므로 공개 후에는 유지하는 것이 좋습니다.
- `--category`: `portrait`, `product`, `event` 중 선택.
- `--year`, `--client`: 실제 정보가 있을 때만 입력하는 선택 항목입니다.
- 원본은 변경하지 않습니다. 새 폴더 `images/projects/프로젝트ID/`와 `data/projects.json`의 초안을 자동 생성합니다.
- 기존 ID나 폴더는 덮어쓰지 않습니다. 파일명 순서로 사진을 등록하고 첫 사진을 임시 대표 사진으로 지정합니다.

**3. `data/projects.json`에서 생성된 항목을 확인합니다.**

| 항목 | 의미 |
|---|---|
| `id` | 고유 주소 ID |
| `name` | 프로젝트 이름 |
| `client` | 실제 고객명. 없으면 빈 문자열 |
| `category` | portrait / product / event |
| `medium` | Photography 등 실제 작업 유형 |
| `year` | 연도. 모르면 빈 문자열 |
| `description` | 카드 뒷면과 상세 화면에 표시할 짧은 소개 |
| `status` | draft: 목록과 상세에서 숨김 / published: 공개 |
| `isSample` | 실제 프로젝트는 false. 기존 예시는 true |
| `order` | 프로젝트 표시 순서. 작을수록 먼저 표시 |
| `coverId` | 대표 사진의 id. images 목록에서 골라 복사 |
| `coverPosition` | 대표 사진 자르기 중심. 기본 50% 50% |
| `images` | 프로젝트에 포함된 사진 목록 |

각 사진의 `alt`에는 사진 내용을 짧게 설명해 주세요. `caption`은 사진 아래에 보여줄 선택 설명입니다. `order`를 바꾸면 사진 순서가 바뀝니다. `src`, `thumbnail`, `full`, `sources`, `width`, `height`는 도구가 채웁니다. `source`의 원본 파일명과 SHA-256은 향후 정확한 중복 확인과 출처 추적에 사용할 수 있습니다.

**4. 공개합니다.** 설명과 사진 목록을 확인하고 `status`를 `"published"`로 바꿉니다. 기존 샘플은 `status`를 `"draft"`로 바꾸면 숨겨집니다. 마지막으로 검사합니다.

```sh
python3 tools/check_site.py
```

로컬에서 확인한 다음 변경된 데이터와 이미지 파일을 GitHub에 반영하면 됩니다. 초안은 화면에서만 숨겨집니다. 공개 저장소와 업로드된 파일 자체를 비공개로 만드는 기능은 아닙니다.

**AI에게 맡길 때는:** “이 폴더를 새 프로젝트로 등록해줘. 이름은 …, 분류는 …, 연도는 …, 설명은 …이고 우선 초안으로 만들어줘”라고 요청할 수 있습니다. 화면 코드를 고칠 필요가 없습니다.

## 기존 프로젝트에 사진만 추가하려면

웹용 사진을 해당 프로젝트 폴더에 추가하고 그 프로젝트의 `images`에 사진 정보를 추가합니다. 각 사진 ID는 프로젝트 안에서 중복되지 않아야 합니다. `order`로 위치를 정합니다. 이미 준비된 WebP/JPEG를 수동 등록하는 최소 예시입니다. 파일 경로·크기는 실제 사진 값으로 입력해야 합니다.

```json
{
  "id": "artist-portrait-04",
  "alt": "사진의 실제 내용을 설명",
  "caption": "",
  "order": 4,
  "width": 1600,
  "height": 2400,
  "src": "images/projects/artist-portrait-2026/04.webp"
}
```

이 최소 형식도 작동합니다. `full`을 생략하면 확대 보기에도 `src`를 사용합니다. 여러 크기가 준비되면 기존 사진처럼 `sources`와 `full`을 추가하면 됩니다. 현재 변환 도구는 새 프로젝트 생성용이므로 기존 ID로 재실행해 사진을 덧붙이지는 않습니다. 기존 프로젝트 추가 작업은 파일 변환과 데이터 갱신을 AI에 요청하거나 위 형식으로 직접 등록할 수 있습니다.

## 분야 대표 이미지 관리

`data/projects.json`의 `categories`에서 분야별 대표 사진을 관리합니다.

- `cover`: 사진 정보 또는 null. 기존 프로젝트의 사진 객체를 복사하거나 아래처럼 직접 지정할 수 있습니다.
- `coverPosition`: 사진 중심점. 기본 `50% 50%`입니다.
- `description`: 분야 페이지의 짧은 설명입니다.
- `cover`가 null이면 해당 분야의 첫 공개 프로젝트 대표 사진을 자동으로 사용합니다. 프로젝트도 없으면 메인 대표 사진을 임시로 사용합니다. 임시/샘플 사진에는 안내 문구가 붙습니다.

```json
"cover": {
  "src": "images/projects/실제프로젝트ID/01-preview.webp",
  "width": 1600,
  "height": 1067,
  "alt": "대표 사진의 실제 설명"
}
```

## CONTACT / 대표 사진 / 소개 사진

`data/site.json`에서 관리합니다.

- `contact.phone`: 현재 `010-9006-1382`. 모바일에서 누르면 전화 앱으로 연결됩니다.
- `links.email`: 현재 `moopstudio@naver.com`. 누르면 메일 앱으로 연결됩니다.
- `links.instagram`, `links.youtube`, `links.film`: `https://`로 시작하는 실제 URL. 빈 문자열이면 비활성 상태입니다.
- `aboutPhoto`: 현재 null. 사진을 준비하면 `{"src":"images/about/profile.webp","width":1200,"height":1600,"alt":"실제 소개 사진 설명"}` 형식으로 입력합니다. 크기는 실제 사진에 맞춥니다.
- `hero`: 대표 사진 정보. `src`와 `sources`를 변경하면 됩니다. 초기 로딩용 기본 사진도 바꾸려면 index.html의 `[data-hero]` 안 이미지도 같은 경로로 맞춥니다.
- 기존 ABOUT 문구는 index.html에 유지했습니다.

### 지금 문의 폼이 작동하는 방식

이름·회신 이메일·문의 내용을 입력하고 **메일 앱에서 보내기**를 누르면 수신 주소와 문의 내용이 채워진 메일 작성 화면으로 연결합니다. **사이트에서 바로 발송되지는 않습니다. 메일 앱에서 보내기를 눌러야 합니다.** 입력 내용도 그대로 남겨둡니다.

기기에 메일 앱이 연결되어 있지 않으면 **문의 내용 복사**를 누른 뒤 네이버 메일 등에서 수신 주소를 입력하고 붙여 넣어 보낼 수 있습니다. 이메일 형식과 필수 항목은 브라우저에서 검사합니다.

### 나중에 사이트 안에서 직접 접수하려면

1. Formspree에서 본인 계정으로 폼을 만들고 실제 수신 이메일을 설정·인증합니다.
2. 발급된 `https://formspree.io/f/…` 형식의 공개 폼 주소를 `contact.formEndpoint`에 입력합니다. 현재는 빈 문자열입니다.
3. 버튼이 `SEND INQUIRY`로 바뀌고 사이트 안에서 전송합니다. 성공·실패·전송 중 상태를 구분하며 실패하면 입력 내용을 유지합니다. 실제 수신 테스트는 서비스 연결 후 진행해야 합니다.

Formspree 폼 주소만 사용하며 비밀 API 키는 필요하지 않습니다. 스팸 방지·수신 설정은 서비스에서 관리합니다. 수신 주소 변경은 site.json뿐 아니라 Formspree 설정에서도 바꿔야 합니다. 공식 안내: https://help.formspree.io/articles/building-your-form/building-an-html-form

## 이미지 품질과 성능

- 원본은 별도로 보존하고, 화면에는 WebP 세 가지 크기를 사용합니다: 긴 변 기준 640 / 1600 / 2800px. 작은 원본은 확대하지 않습니다.
- `thumb`는 작은 화면용, `preview`는 일반 감상용, `full`은 확대 보기용입니다. 브라우저가 화면 너비와 선명도에 맞춰 선택합니다. 세로 사진의 실제 너비도 srcset에 기록합니다.
- WebP 품질은 85 / 88 / 90입니다. tools/prepare_project.py에서 조정할 수 있습니다.
- 색상 프로필이 있는 사진은 sRGB로 변환합니다. 회전 정보를 반영하고 생성본에는 카메라·GPS 메타데이터를 복사하지 않습니다.
- 갤러리는 원본 화면비를 유지합니다. 가로로 넓은 사진은 한 줄 전체, 세로·정사각 사진은 두 열, 모바일은 한 열입니다. 대표 카드만 일정한 비율에 맞춰 일부 가장자리가 잘릴 수 있습니다.
- 첫 대표 사진은 우선 로딩하고 프로젝트 카드와 갤러리는 lazy loading을 사용합니다. 확대 보기는 full 파일을 사용합니다. 고해상도 화면에서는 일반 표시에서도 full 크기가 선택될 수 있습니다.

## 사용 방법과 접근성

- 메인 WORK: 가로형 대표 사진 세 장 아래쪽에 분야명·설명·사진 더 보기 문구를 항상 표시합니다. 사진 어디든 선택하면 해당 분야 페이지로 이동합니다. 첫 화면은 넓고 낮은 히어로와 간결한 여백으로 구성하며 모바일에서는 세로로 쌓입니다.
- 분야 페이지: 프로젝트 사진에 마우스를 올리면 뒤집힙니다. 뒤집힌 면 어디든 누르거나 VIEW PROJECT를 누르면 여러 사진이 있는 프로젝트 갤러리로 이동합니다. 키보드 Enter/Space로도 열 수 있습니다.
- 모바일: 첫 터치로 정보 표시 → VIEW PROJECT로 이동. 바깥을 터치하거나 “사진으로 돌아가기”를 누르면 닫힙니다.
- 다른 카드를 열면 이전 카드는 닫힙니다. Escape로도 카드를 닫을 수 있습니다.
- 갤러리 사진 터치로 확대. 좌우 버튼·키보드 방향키·모바일 좌우 스와이프로 이동합니다. 사진이 한 장이면 이전·다음 버튼은 숨깁니다.
- Escape / CLOSE / 사진 바깥 배경으로 닫습니다. 확대 중에는 배경 스크롤과 키보드 포커스 이탈을 막고 닫으면 원래 사진으로 포커스를 돌려줍니다.
- 시스템의 움직임 줄이기 설정에서는 회전 애니메이션을 생략합니다.

## GitHub Pages 배포

1. 프로젝트 파일을 GitHub 저장소에 업로드합니다.
2. 저장소 Settings → Pages에서 배포할 브랜치와 `/ (root)`를 선택합니다.
3. 배포 후 `https://사용자명.github.io/저장소명/`으로 접속합니다.

모든 내부 주소는 사이트 폴더 기준입니다. `/`로 시작하는 이미지나 홈 주소를 사용하지 않습니다. 상세 페이지도 실제 존재하는 `project.html`에 ID를 전달하므로 새로고침할 때 서버 라우팅 설정이 필요하지 않습니다. 포트폴리오와 메일 앱 연결 방식은 외부 서비스나 빌드 도구 없이 동작합니다. 사이트 안에서 직접 문의를 접수하는 기능만 선택적으로 Formspree 연결이 필요합니다.

이 폴더는 기존 GitHub 저장소 `https://github.com/whehdgus133/-moop-portfolio.git`에 연결되어 있으며, 로컬 main은 origin/main을 추적합니다. 변경사항을 확인한 뒤 commit과 push로 반영할 수 있습니다. GitHub Pages 배포 설정은 저장소에서 별도로 확인해야 합니다. `.gitignore`는 Git 작업에서만 적용되므로 브라우저로 직접 파일을 올릴 때는 Portfolio_Inbox, .venv 등의 원본/작업 폴더를 선택하지 마세요.

## 향후 자동화 연결 방식

원본 수집 → 해시/유사도 분석 → 분류/대표 후보/설명 초안 → 웹 이미지 생성 → `data/projects.json`에 draft 등록 → 사람이 확인 후 published 전환 순서로 확장하면 됩니다.

`schemaVersion: 1`, 고유 프로젝트/사진 ID, 원본 해시, 분리된 대표 사진 ID, 공개 상태와 표시 순서를 사용하므로 AI가 HTML을 수정할 필요가 없습니다. 정확히 같은 파일은 해시로 찾을 수 있지만 유사한 구도·연속 촬영 판단은 향후 별도 이미지 분석이 필요합니다.


## ABOUT과 전체 WORK

상단 WORK는 전체 공개 프로젝트를 보여줍니다. ALL / PORTRAIT / PRODUCT / EVENT 메뉴로 이동할 수 있습니다. 초안은 실제 사이트에서 숨깁니다. 작업을 추가할 때 HTML을 수정할 필요가 없습니다.

상단 ABOUT은 별도 소개 페이지입니다. 관리화면의 **ABOUT · 경력 · 로고**에서 프로필 사진, 이름·직함·소개, 주요 경력, 촬영 횟수, 클라이언트 수, 협업 로고를 관리합니다. 데이터는 `site.json`의 `copy`, `aboutPhoto`, `about`에 저장됩니다. 입력되지 않은 숫자는 0으로 추정하지 않고 집계 준비 중으로 표시합니다. 클라이언트 로고가 없으면 이름만 표시할 수 있습니다. 투명 PNG 로고는 원래 화면비와 투명도를 유지한 WebP로 저장합니다.

프로필 사진이나 실적, 고객사 정보는 임의로 추가하지 않았습니다. 실제 자료를 입력하고 미리보기로 확인한 뒤 저장·공개하세요.
