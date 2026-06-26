# i18n 배치 이어가기 루틴 (5분 주기)

이 파일은 **다국어화(i18n) 마라톤**을 끊김 없이 이어가기 위한 루틴입니다.
5분마다 아래 **"붙여넣기 프롬프트"** 한 줄을 그대로 보내면, 클로드가 메모리를 읽고 다음 배치를 자동으로 처리·배포합니다.

---

## ▶ 붙여넣기 프롬프트 (5분마다 이 한 줄만 보내기)

```
i18n 배치 계속. 메모리 i18n-hardcoded-debt 읽고 다음 도구 3개 i18n+howto 처리해서 배포해. 묻지 말고 연속으로.
```

> 더 짧게: `배치 계속` 라고만 보내도 됩니다 (이 루틴을 기억하고 있음).

---

## 클로드가 매번 수행할 절차 (한 배치 = 도구 ~3개)

1. 메모리 `i18n-hardcoded-debt.md`의 **Progress / Next** 목록에서 아직 안 한 도구를 고른다.
2. 각 도구 `app/[lang]/tools/<slug>/page.tsx`:
   - `import { useTranslations } from 'next-intl'` + `const t = useTranslations('toolui')` 추가
   - 하드코딩 문자열을 `t('<prefix>_<key>')`로 치환 (코드성 토큰·CSS/단위 키워드·라이브러리 클래스명은 유지)
   - 가능하면 **공용 키 재사용**: `ui_copy/ui_copied/ui_input/ui_output/ui_text_ph/ui_chars/ui_example/ui_width/ui_height/ui_value/ui_encode/ui_decode/ui_generate/ui_clear`, `sp_unit`, `cmx_steps`, `tx_amount`, `cnf_best` 등
   - 주의: 지역변수/콜백/`setState(t=>…)`가 `t`를 가리면 hook을 `tr`로 두거나 변수명을 바꾼다. 샘플 상태 문자열은 `useState(()=>[…t()…])` 지연 초기화.
3. 임시 `_b*.mjs` Node 스크립트(Write 도구로 생성)로 `locales/{en,ko,ja}/common.json`의 `toolui`에 키 주입 + 도구별 `howto[slug]`(3단계×3언어) 추가. heredoc은 따옴표 깨지므로 금지.
4. 검증: `node -e "JSON.parse(...common.json)"` 3개 통과, /ko 렌더에 `MISSING_MESSAGE` 없음.
5. 커밋 + `git push origin main` (Vercel 자동 배포). 커밋 메시지 끝에 Co-Authored-By 라인.
6. 메모리 `i18n-hardcoded-debt.md`의 **Progress** 카운트/목록 갱신.
7. 한 답변 안에서 가능한 한 여러 배치를 **연속** 처리. 배치 사이 요약·확인 질문 금지.

## 진행 현황 (이 줄은 매 배치마다 갱신)

- 2026-06-26 기준: **66 / ~359** 도구 완료. 남은 ~199개는 대부분 light(문구 1–3개)·사전형 데이터.
- 정확한 완료 목록·다음 타깃·재사용 키·주의점은 항상 메모리 `i18n-hardcoded-debt`가 단일 출처(source of truth).

## 남은 도구 빠르게 집계하는 명령

```bash
for f in $(find "app/[lang]/tools" -name page.tsx); do grep -q useTranslations "$f" || echo "${f#app/[lang]/tools/}"; done
```

## 자동화 옵션 (선택)

- 5분 간격이 번거로우면 Claude Code에서 `/loop 배치 계속` 으로 자동 반복을 걸 수 있음 (대화형 터미널에서).
