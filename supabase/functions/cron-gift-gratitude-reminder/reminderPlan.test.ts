import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { candidateIdsFrom, planReminders } from "./reminderPlan.ts"

// Simula a tabela gift_gratitude_reminders (chave: membro + semana) com um conjunto de envios já feitos.
const makeStore = () => {
  const sent = new Set<string>()
  const register = async (userId: string) => {
    if (sent.has(userId)) return false
    sent.add(userId)
    return true
  }
  return { sent, register }
}

Deno.test("candidatos vêm como lista de valores ou de objetos da RPC", () => {
  assertEquals(candidateIdsFrom(["a", "b"]), ["a", "b"])
  assertEquals(candidateIdsFrom([{ gift_gratitude_reminder_candidates: "a" }]), ["a"])
  assertEquals(candidateIdsFrom([]), [])
})

Deno.test("lembrete é enviado a quem ainda não foi lembrado nesta semana (5.4)", async () => {
  const store = makeStore()
  const plan = await planReminders(["ana", "bia"], store.register)
  assertEquals(plan.toNotify, ["ana", "bia"])
  assertEquals(plan.failed, [])
})

Deno.test("no máximo um lembrete por membro e por semana, mesmo com execuções repetidas (5.4)", async () => {
  const store = makeStore()
  await planReminders(["ana", "bia"], store.register)
  const second = await planReminders(["ana", "bia"], store.register)
  assertEquals(second.toNotify, [])
})

Deno.test("falha ao registrar um membro não impede o envio aos demais (5.4)", async () => {
  const register = async (userId: string) => {
    if (userId === "ana") throw new Error("database unavailable")
    return true
  }
  const plan = await planReminders(["ana", "bia", "caio"], register)
  assertEquals(plan.toNotify, ["bia", "caio"])
  assertEquals(plan.failed, ["ana"])
})

Deno.test("sem candidatos não envia nada", async () => {
  const store = makeStore()
  const plan = await planReminders([], store.register)
  assertEquals(plan, { toNotify: [], failed: [] })
})
