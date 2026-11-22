import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { acceptsVotes, TOPIC_STATUS_OPEN } from "./topicRules.ts"

Deno.test("status inicial de pauta é 'open', aceito pelo CHECK da tabela", () => {
  assertEquals(TOPIC_STATUS_OPEN, "open")
})

Deno.test("pauta aberta aceita votos", () => {
  assertEquals(acceptsVotes("open"), true)
})

Deno.test("pauta encerrada rejeita votos", () => {
  assertEquals(acceptsVotes("closed"), false)
})

Deno.test("status legado 'active' ou ausente não aceita votos", () => {
  assertEquals(acceptsVotes("active"), false)
  assertEquals(acceptsVotes(null), false)
  assertEquals(acceptsVotes(undefined), false)
})
