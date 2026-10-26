import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { canCancelCircle, canCloseCircle, validateNewCircle } from "./circleRules.ts"

const AUTHOR = "author-1"
const OTHER = "member-2"
const NOW = Date.parse("2099-01-01T00:00:00.000Z")

Deno.test("autor pode encerrar a própria convocação aberta", () => {
  assertEquals(canCloseCircle({ created_by: AUTHOR, status: "open" }, AUTHOR, false), true)
})

Deno.test("membro comum não encerra convocação de outro (7.2)", () => {
  assertEquals(canCloseCircle({ created_by: AUTHOR, status: "open" }, OTHER, false), false)
})

Deno.test("administrador encerra convocação de qualquer autor (7.2)", () => {
  assertEquals(canCloseCircle({ created_by: AUTHOR, status: "open" }, OTHER, true), true)
})

Deno.test("convocação já encerrada ou cancelada não pode ser encerrada de novo", () => {
  assertEquals(canCloseCircle({ created_by: AUTHOR, status: "closed" }, AUTHOR, false), false)
  assertEquals(canCloseCircle({ created_by: AUTHOR, status: "cancelled" }, AUTHOR, true), false)
})

Deno.test("somente administrador cancela convocação (7.2)", () => {
  assertEquals(canCancelCircle(true), true)
  assertEquals(canCancelCircle(false), false)
})

Deno.test("criação recusa data passada e aceita data futura", () => {
  const past = validateNewCircle({ title: "T", scheduledAt: "2098-12-31T10:00:00.000Z", confirmedPreCircles: true }, NOW)
  assertEquals(past.ok, false)
  const future = validateNewCircle({ title: "T", scheduledAt: "2099-02-01T10:00:00.000Z", confirmedPreCircles: true }, NOW)
  assertEquals(future.ok, true)
})

Deno.test("criação exige título e confirmação dos pré-círculos", () => {
  const noTitle = validateNewCircle({ title: "   ", scheduledAt: "2099-02-01T10:00:00.000Z", confirmedPreCircles: true }, NOW)
  assertEquals(noTitle.ok, false)
  const noConfirm = validateNewCircle({ title: "T", scheduledAt: "2099-02-01T10:00:00.000Z", confirmedPreCircles: false }, NOW)
  assertEquals(noConfirm.ok, false)
})

Deno.test("criação recusa data inválida", () => {
  const bad = validateNewCircle({ title: "T", scheduledAt: "não-é-data", confirmedPreCircles: true }, NOW)
  assertEquals(bad.ok, false)
})
