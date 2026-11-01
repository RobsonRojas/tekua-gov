import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { executeJrTool, JR_TOOL_NAME, jrFunctionDeclarations } from "./jrTools.ts"

const NOW = Date.parse('2026-11-01T12:00:00Z')
const FUTURE = '2026-11-20T19:00:00-03:00'

Deno.test("declara somente a ferramenta de rascunho, com título e data obrigatórios", () => {
  assertEquals(jrFunctionDeclarations.map((f) => f.name), [JR_TOOL_NAME])
  assertEquals(jrFunctionDeclarations[0].parameters.required, ['title', 'scheduledAt'])
})

Deno.test("rascunho válido é aceito e aparado; opcionais ausentes são omitidos", () => {
  const r = executeJrTool(JR_TOOL_NAME, { title: "  Uso da horta  ", scheduledAt: FUTURE }, NOW)
  assertEquals(r.ok, true)
  if (r.ok) assertEquals(r.draft, { title: "Uso da horta", scheduledAt: new Date(FUTURE).toISOString() })
})

Deno.test("opcionais presentes são mantidos", () => {
  const r = executeJrTool(JR_TOOL_NAME, { title: "T", scheduledAt: FUTURE, description: " ctx ", locationOrLink: " Casa comum " }, NOW)
  assertEquals(r.ok && r.draft.description, "ctx")
  assertEquals(r.ok && r.draft.locationOrLink, "Casa comum")
})

Deno.test("título ou data ausentes são recusados", () => {
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: " ", scheduledAt: FUTURE }, NOW).ok, false)
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: "T" }, NOW).ok, false)
  assertEquals(executeJrTool(JR_TOOL_NAME, null, NOW).ok, false)
})

Deno.test("data inválida ou passada é recusada", () => {
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: "T", scheduledAt: "amanhã" }, NOW).ok, false)
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: "T", scheduledAt: "2026-10-01T10:00:00Z" }, NOW).ok, false)
})

Deno.test("e-mail no título ou descrição é recusado", () => {
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: "falar com a@b.com", scheduledAt: FUTURE }, NOW).ok, false)
  assertEquals(executeJrTool(JR_TOOL_NAME, { title: "T", scheduledAt: FUTURE, description: "x@y.org" }, NOW).ok, false)
})

Deno.test("ferramenta desconhecida é recusada", () => {
  assertEquals(executeJrTool("transfer_funds", { title: "T", scheduledAt: FUTURE }, NOW).ok, false)
})
