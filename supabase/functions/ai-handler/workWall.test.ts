import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { DRAFT_TOOL_NAME, functionDeclarationsFor, validateActivityDraft } from "./workWall.ts"

const names = (mode: "default" | "work-wall") => functionDeclarationsFor(mode).map((f) => f.name)

Deno.test("modo padrão do Oráculo não recebe a ferramenta de rascunho", () => {
  assertEquals(names("default").includes(DRAFT_TOOL_NAME), false)
})

Deno.test("modo do mural recebe a ferramenta de rascunho, e nenhuma ferramenta de escrita além dela", () => {
  const declared = names("work-wall")
  assertEquals(declared.includes(DRAFT_TOOL_NAME), true)
  const writeLike = declared.filter((n) => /transfer|pay|confirm|delete|update|claim|edit/.test(n))
  assertEquals(writeLike, [])
})

Deno.test("rascunho válido é aceito e aparado", () => {
  const r = validateActivityDraft({ title: "  Limpar a horta  ", description: "Retirar o mato da área 2", rewardAmount: 30 })
  assertEquals(r.ok, true)
  if (r.ok) assertEquals(r.draft, { title: "Limpar a horta", description: "Retirar o mato da área 2", rewardAmount: 30 })
})

Deno.test("rascunho sem título ou descrição é recusado (3.4)", () => {
  assertEquals(validateActivityDraft({ title: "  ", description: "x", rewardAmount: 10 }).ok, false)
  assertEquals(validateActivityDraft({ title: "x", description: "", rewardAmount: 10 }).ok, false)
})

Deno.test("recompensa zero, negativa ou não numérica é recusada (3.4)", () => {
  assertEquals(validateActivityDraft({ title: "x", description: "y", rewardAmount: 0 }).ok, false)
  assertEquals(validateActivityDraft({ title: "x", description: "y", rewardAmount: -5 }).ok, false)
  assertEquals(validateActivityDraft({ title: "x", description: "y", rewardAmount: "abc" }).ok, false)
})

Deno.test("recompensa numérica em texto é aceita quando positiva", () => {
  const r = validateActivityDraft({ title: "x", description: "y", rewardAmount: "12.5" })
  assertEquals(r.ok, true)
})

Deno.test("argumentos ausentes ou inválidos são recusados", () => {
  assertEquals(validateActivityDraft(null).ok, false)
  assertEquals(validateActivityDraft("texto").ok, false)
})
