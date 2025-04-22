import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

export default [
  // Kế thừa các rule mặc định của Next.js
  ...compat.extends("next/core-web-vitals", "next/typescript"),

  // Ghi đè rule: tắt cảnh báo biến không dùng
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "off", // hoặc "warn" nếu bạn muốn cảnh báo
    },
  },
];
