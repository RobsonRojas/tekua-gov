import { assertEquals } from "https://deno.land/std@0.168.0/testing/asserts.ts"
import { deliverEach } from "./notifyDelivery.ts"

Deno.test("falha de um destinatário não interrompe os demais (7.4)", async () => {
  const delivered: string[] = []
  const failed: string[] = []

  const count = await deliverEach(
    ["a", "b", "c"],
    async (userId) => {
      if (userId === "b") throw new Error("push endpoint gone")
      delivered.push(userId)
    },
    (userId) => failed.push(userId),
  )

  assertEquals(count, 2)
  assertEquals(delivered.sort(), ["a", "c"])
  assertEquals(failed, ["b"])
})

Deno.test("todos os destinatários são tentados mesmo com falhas em sequência", async () => {
  const attempted: string[] = []
  await deliverEach(["x", "y", "z"], async (userId) => {
    attempted.push(userId)
    throw new Error("email provider down")
  })
  assertEquals(attempted.sort(), ["x", "y", "z"])
})

Deno.test("lista vazia não gera erro e conta zero envios", async () => {
  const count = await deliverEach([], async () => {})
  assertEquals(count, 0)
})
