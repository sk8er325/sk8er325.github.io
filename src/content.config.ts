import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// 프로젝트 1개 = src/content/projects/<slug>.md 1개. 프론트매터가 곧 스키마(설계 §3).
const projects = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/projects' }),
  schema: z.object({
    order: z.number(),                 // 보드 행 번호
    code: z.string(),                  // 보드에 찍히는 영문 짧은 이름 (대문자)
    title: z.string(),                 // 영문 제목
    titleKo: z.string(),               // 한국어 제목
    period: z.string(),                // 기간
    status: z.enum(['boarding', 'departed', 'cancelled']), // 진행 중 / 완료 / 중단
    stage: z.string(),                 // 지금 단계, 영문 한 단어 (FINAL REPORT, PLAN, —)
    stageKo: z.string(),               // 같은 내용 한국어
    summary: z.string(),               // 한 줄 요약 (한국어)
    role: z.string(),                  // 내 역할
    tools: z.array(z.string()),        // 쓴 도구
    results: z.array(z.string()),      // 결과 숫자
    limits: z.array(z.string()),       // 한계와 틀린 것 — 생략 불가
    attempt: z.string().optional(),    // 01 1차 안
    wrong: z.string().optional(),      // 02 무엇이 틀렸는가
    next: z.string().optional(),       // 03 다음 안의 근거
    plain: z.array(z.string()).max(3).optional(), // 3줄짜리 빠른 버전
    attachments: z.array(z.object({ label: z.string(), href: z.string() })).default([]),
    draft: z.boolean().default(false), // 본인이 문장을 다시 쓰기 전까지 true
  }),
});

// 기록: 3~10줄. 빈 달은 표시하지 않고, 갱신 간격도 드러내지 않는다.
const notes = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/notes' }),
  schema: z.object({
    date: z.coerce.date(),
    title: z.string(),
  }),
});

export const collections = { projects, notes };
