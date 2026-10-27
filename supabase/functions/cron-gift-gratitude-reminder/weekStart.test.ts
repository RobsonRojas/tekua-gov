import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { weekStartOf } from "./weekStart.ts"

Deno.test("semana começa na segunda-feira (UTC)", () => {
  assertEquals(weekStartOf(new Date("2026-10-27T12:00:00Z")), "2026-10-26") // terça
  assertEquals(weekStartOf(new Date("2026-10-26T00:00:00Z")), "2026-10-26") // segunda
  assertEquals(weekStartOf(new Date("2026-10-25T23:59:00Z")), "2026-10-19") // domingo: fim da semana anterior
})
