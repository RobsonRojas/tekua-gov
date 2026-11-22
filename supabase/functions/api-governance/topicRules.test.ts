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

import { notificationTargets, resolveReplyParent, sanitizeMentionIds, MAX_MENTIONS_PER_COMMENT } from "./topicRules.ts"

Deno.test("resposta a comentário raiz usa o próprio comentário como pai", () => {
  assertEquals(resolveReplyParent({ id: "c1", topic_id: "t1", parent_id: null }, "t1"), { ok: true, parentId: "c1" })
})

Deno.test("resposta a resposta é normalizada para o comentário raiz", () => {
  assertEquals(resolveReplyParent({ id: "c2", topic_id: "t1", parent_id: "c1" }, "t1"), { ok: true, parentId: "c1" })
})

Deno.test("pai de outra pauta ou inexistente é rejeitado", () => {
  assertEquals(resolveReplyParent({ id: "c1", topic_id: "t2", parent_id: null }, "t1").ok, false)
  assertEquals(resolveReplyParent(null, "t1").ok, false)
})

Deno.test("menções: remove autor, duplicatas e valores inválidos", () => {
  assertEquals(sanitizeMentionIds(["a", "b", "a", "me", 3, null], "me"), ["a", "b"])
  assertEquals(sanitizeMentionIds("x", "me"), [])
})

Deno.test("menções respeitam o limite", () => {
  const ids = Array.from({ length: 50 }, (_, i) => `u${i}`)
  assertEquals(sanitizeMentionIds(ids, "me").length, MAX_MENTIONS_PER_COMMENT)
})

Deno.test("notificações: resposta notifica o autor do pai", () => {
  assertEquals(notificationTargets("me", [], "p"), { mention: [], reply: ["p"] })
})

Deno.test("notificações: autor do pai mencionado recebe só a menção", () => {
  assertEquals(notificationTargets("me", ["p"], "p"), { mention: ["p"], reply: [] })
})

Deno.test("notificações: responder a si mesmo não notifica", () => {
  assertEquals(notificationTargets("me", [], "me"), { mention: [], reply: [] })
})

import { parseRewardAmount, MAX_TOPIC_REWARD } from "./topicRules.ts"

Deno.test("recompensa ausente vale zero", () => {
  assertEquals(parseRewardAmount(undefined), { ok: true, amount: 0 })
  assertEquals(parseRewardAmount(""), { ok: true, amount: 0 })
})

Deno.test("recompensa aceita número e texto com vírgula, arredondando a 2 casas", () => {
  assertEquals(parseRewardAmount(5), { ok: true, amount: 5 })
  assertEquals(parseRewardAmount("2,5"), { ok: true, amount: 2.5 })
  assertEquals(parseRewardAmount(1.239), { ok: true, amount: 1.24 })
})

Deno.test("recompensa rejeita negativo, não numérico e acima do teto", () => {
  assertEquals(parseRewardAmount(-1).ok, false)
  assertEquals(parseRewardAmount("abc").ok, false)
  assertEquals(parseRewardAmount(NaN).ok, false)
  assertEquals(parseRewardAmount(MAX_TOPIC_REWARD + 1).ok, false)
  assertEquals(parseRewardAmount(MAX_TOPIC_REWARD), { ok: true, amount: MAX_TOPIC_REWARD })
})
