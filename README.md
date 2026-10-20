# 🌰 싸이월드 미니홈피 모바일 청첩장

추억의 **싸이월드 미니홈피**처럼 꾸민 모바일 청첩장이에요.
[HyunIm/wedding-invitation](https://github.com/HyunIm/wedding-invitation) 템플릿의 구조(설정 파일 하나로 내용 관리, 구글 시트 방명록, GitHub Pages 자동 배포)를 참고해 만들었습니다.

## ✨ 미니홈피 메뉴 = 청첩장 기능

| 미니홈피 탭 | 청첩장 기능 |
| --- | --- |
| 🎵 BGM 플레이어 | 배경음악 (선택) |
| 홈 | 프로필 사진·오늘의 기분·Updated news·**미니룸(도트 미니미)**·일촌평·파도타기(공유) |
| 프로필 | 신랑·신부, 혼주 정보, 연락하기 |
| 다이어리 | 달력·D-day 카운트다운·인사말·캘린더 추가 |
| 사진첩 | 갤러리 (사진 크게 보기) |
| 오시는길 | 네이버 지도·카카오맵·티맵, 주소 복사, 교통 안내 |
| 선물가게 🌰 | 마음 전하실 곳 (계좌 복사) — 계좌를 넣었을 때만 보여요 |
| 방명록 | 축하 메시지 (구글 시트 연결) |
| ✚ 일촌 신청 | 참석 의사 전달 (RSVP) |

## ✍️ 내용 바꾸기

**`config.js` 하나만 고치면 됩니다.** 지금 들어있는 `홍길동 ♥ 성춘향`, 날짜, 예식장은 모두 **예시**예요. 하객에게 보내기 전에 꼭 실제 정보로 바꿔주세요.

- 사진: `images/` 폴더 안내([images/README.md](images/README.md))를 참고하세요.
- 연락처·계좌는 선택이에요. 모르면 비워두면 해당 버튼이 숨겨집니다.

## 🚀 공개하기 (GitHub Pages)

1. 저장소 **Settings → Pages → Source** 를 **GitHub Actions** 로 선택하세요.
2. `main` 브랜치에 저장하면 **Actions → 청첩장 배포** 가 자동으로 실행돼요.
3. 초록 ✅ 이 뜨면 `https://<아이디>.github.io/jaeho/` 에서 확인하세요.

> 🔓 무료 GitHub Pages 는 **공개(Public) 저장소** 기준이에요. 사진·연락처·계좌는 누구나 볼 수 있습니다.

## 📝 방명록 · 일촌 신청 연결하기 (선택)

연결하지 않으면 방명록과 일촌 신청 버튼은 "준비 중" 안내만 보여요.

1. [sheets.new](https://sheets.new) 에서 새 구글 시트를 만들고 **확장 프로그램 → Apps Script** 를 엽니다.
2. 기존 코드를 지우고 [google-apps-script/Code.gs](google-apps-script/Code.gs) 전체를 붙여넣어 저장합니다.
3. **배포 → 새 배포 → 웹 앱**, 실행: **나**, 액세스: **모든 사용자** 로 배포하고 권한을 승인합니다.
4. `/exec` 로 끝나는 주소를 `config.js` 의 `googleScriptUrl` 에 넣어주세요.
5. 청첩장에서 방명록·일촌 신청을 한 번씩 남겨 시트의 `방명록`, `참석여부` 탭에 들어오는지 확인하고 시험 행은 지워주세요.

방명록은 이름·메시지가 공개되고, 일촌 신청(참석 응답)은 시트에만 저장돼요. 방명록 시트의 `숨김` 칸에 `TRUE` 를 적으면 해당 글이 숨겨집니다.
자세한 설명은 [원본 템플릿 안내](https://github.com/HyunIm/wedding-invitation/blob/main/docs/guestbook-rsvp.md)를 참고하세요.

## 🖥️ 내 컴퓨터에서 미리보기

```bash
python3 -m http.server 8000
# 브라우저에서 http://localhost:8000 열기
```

## 📁 구조

- `config.js` — 청첩장 내용 (이 파일만 고치면 돼요)
- `index.html` — 페이지 틀
- `assets/cy.css` — 싸이월드 디자인 (픽셀 폰트 [Galmuri](https://github.com/quiple/galmuri))
- `assets/cy.js` — 화면 그리기, 도트 미니미·미니룸, 방명록/일촌 신청 통신
- `google-apps-script/Code.gs` — 방명록·참석 응답 저장 서버 (원본 템플릿 코드)
- `.github/workflows/deploy.yml` — GitHub Pages 자동 배포
