// @ts-check
import { defineConfig } from 'astro/config';

// 배포 주소. 나중에 도메인을 붙이면 여기만 바꾼다.
export default defineConfig({
  site: 'https://sk8er325.github.io',
  devToolbar: { enabled: false }, // 검수 캡처에 툴바가 찍히지 않게
});
