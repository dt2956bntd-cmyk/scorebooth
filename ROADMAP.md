# ScoreBooth 로드맵

## 완료된 것
- Phils Booth → ScoreBooth 리브랜딩
- 예측 게임(Call It) 제거
- 팀 선택 기능 기본 구조
- ES 모듈 구조로 분리
- GitHub Pages 배포
- PWA 메타 태그, OG 이미지, 저작권 고지(personal/non-commercial), Ko-fi 후원
- 팀 컬러 시스템 — 30개 팀 primary/secondary hex를 `constants.js`의 `TEAMCOLOR`에 정의, `theme.js`의 `applyTeamBrand()`에서 `--team-primary`/`--team-secondary` CSS 변수로 주입. `contrastText()`를 WCAG 상대휘도 기반으로 업그레이드해서 애슬레틱스·파드리스 등 밝은/저채도 팀 컬러에서도 가독성 검증 완료. 리퀴드 글래스 등 반투명 효과는 배제, 팀 컬러 자체의 대비·선명도로 정체성 표현
- 라이브 자동 갱신 — `data-loader.js`의 `scheduleRefresh()`가 라이브 중 30초/평소 60초 간격으로 자동 폴링, 갱신 중에는 상태 표시(로딩 도트, 새로고침 버튼 스핀)로 멈춘 것처럼 안 보이게 처리
- 느린 연결/오프라인 대응 — localStorage 스냅샷 캐싱(마지막 정상 데이터 우선 표시) + 스켈레톤 로딩 + 서비스워커로 앱 셸 자체를 캐싱(완전 오프라인에서도 PWA가 열리도록)
- PWA 아이콘 팀별 대응 — 매니페스트 아이콘·theme_color·파비콘을 선택 팀 기준으로 런타임 생성, 팀 변경 시 재적용

## 포지셔닝
- 시장은 3갈래: 데이터 진영(FanGraphs, Baseball Savant) / 베팅 진영(Dimers, ESPN Odds) / 팬 대시보드(Superfan Sports, MLB Today)
- ScoreBooth는 팬 대시보드. 베팅은 IP·규제 문제로 배제(사이트에 no betting 명시)
- 상업화 천장 낮음(MLB IP). 목표는 "실사용자 있는 잘 만든 무료 앱" = 포트폴리오 가치. Ko-fi 후원만 유지
- 차별점: 광고 없고 내 팀 컬러로 꾸며진 빠르고 깨끗한 단일 팀 대시보드. FotMob의 자리(깨끗함·속도·커스텀)를 MLB로

## 사용자 리서치 요약
경쟁 스포츠 앱 1~3점 리뷰 공통 불만: (1) 라이브 스코어가 방송보다 느림/경기 몰리면 멈춤 (2) 광고가 스코어 화면까지 침범 (3) 알림 스팸 + 업데이트 후 설정 초기화 (4) 멀티스포츠로 산만·무거움 (5) 핵심 기능 구독 게이팅. 추가로 FanGraphs 앱: 개인 설정 저장 안 됨.
팬 사랑 앱(FotMob) 강점: 깨끗한 UI, 느린 연결에서도 빠름, 단순함, 내 팀·원하는 이벤트만 커스텀 알림, 최소 지연.
ScoreBooth 기존 강점: 광고 없음, 단일 팀 집중, 유료 게이팅 없음.

## 다음 작업 (우선순위 순)
1. 설정 저장 검증 — 팀 선택/스포일러/다크모드가 localStorage에 확실히 저장·복원되는지 테스트(LS 헬퍼). FanGraphs가 욕먹는 지점
2. 팀 컬러 기반 공유 카드 — 승률/경기 결과를 팀 컬러 이미지 카드로. 자연 유입 + 디자인 차별화
3. 첫 화면(Booth) 요약 강화 — "오늘 내 팀 상황" 한눈에
4. 알림(선택) — 넣는다면 내 팀·원하는 이벤트만. 과하게 넣지 말 것
