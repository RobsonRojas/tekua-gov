import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { effectiveVisibility, validateSentiment } from "./giftGratitude.ts"

Deno.test("sentimento padrão é gratidão", () => {
  assertEquals(validateSentiment(undefined), { ok: true, sentiment: "gratitude" })
  assertEquals(validateSentiment("gratitude"), { ok: true, sentiment: "gratitude" })
})

Deno.test("ingratidão é aceita como sentimento válido", () => {
  assertEquals(validateSentiment("ingratitude"), { ok: true, sentiment: "ingratitude" })
})

Deno.test("sentimento desconhecido é recusado", () => {
  assertEquals(validateSentiment("neutro").ok, false)
})

Deno.test("ingratidão é sempre privada, mesmo se o autor marcar público (ingratidões privadas)", () => {
  assertEquals(effectiveVisibility("ingratitude", true), false)
  assertEquals(effectiveVisibility("ingratitude", false), false)
})

Deno.test("gratidão segue a escolha do autor", () => {
  assertEquals(effectiveVisibility("gratitude", true), true)
  assertEquals(effectiveVisibility("gratitude", false), false)
})
