import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { hasGratitude, validateGratitude } from "./giftGratitude.ts"

Deno.test("sem mensagem nem emojis: uso registrado sem agradecimento (5.2)", () => {
  const r = validateGratitude({})
  assertEquals(r, { ok: true, message: null, emojis: null })
  const blank = validateGratitude({ message: "   ", emojis: [] })
  assertEquals(blank, { ok: true, message: null, emojis: null })
})

Deno.test("só mensagem é aceita e aparada (5.2)", () => {
  const r = validateGratitude({ message: "  Obrigada pela ajuda!  " })
  assertEquals(r, { ok: true, message: "Obrigada pela ajuda!", emojis: null })
})

Deno.test("só emojis são aceitos (5.2)", () => {
  const r = validateGratitude({ emojis: ["🙏", "❤️"] })
  assertEquals(r.ok, true)
  if (r.ok) assertEquals(r.emojis, ["🙏", "❤️"])
})

Deno.test("mensagem acima de 280 caracteres é recusada e não registra (5.2)", () => {
  const r = validateGratitude({ message: "a".repeat(281) })
  assertEquals(r.ok, false)
  assertEquals(validateGratitude({ message: "a".repeat(280) }).ok, true)
})

Deno.test("texto que não é emoji na lista é recusado", () => {
  assertEquals(validateGratitude({ emojis: ["obrigado"] }).ok, false)
  assertEquals(validateGratitude({ emojis: ["<script>"] }).ok, false)
})

Deno.test("mais de 5 emojis é recusado", () => {
  assertEquals(validateGratitude({ emojis: ["🙏", "🙏", "🙏", "🙏", "🙏", "🙏"] }).ok, false)
})

Deno.test("tipos inválidos são recusados", () => {
  assertEquals(validateGratitude({ message: 42 }).ok, false)
  assertEquals(validateGratitude({ emojis: "🙏" }).ok, false)
})

Deno.test("hasGratitude reconhece mensagem ou emojis", () => {
  assertEquals(hasGratitude(null, null), false)
  assertEquals(hasGratitude("oi", null), true)
  assertEquals(hasGratitude(null, ["🙏"]), true)
  assertEquals(hasGratitude(null, []), false)
})
