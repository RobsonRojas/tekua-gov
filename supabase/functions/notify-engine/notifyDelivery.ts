// Entrega por destinatário com isolamento de falhas: uma falha não interrompe os demais.

/**
 * Executa `deliver` para cada item, em paralelo. Erros são repassados a `onError`
 * e não propagam, então os demais destinatários continuam recebendo.
 * Retorna quantos envios concluíram sem erro.
 */
export async function deliverEach<T>(
  items: T[],
  deliver: (item: T) => Promise<void>,
  onError: (item: T, error: unknown) => void = () => {},
): Promise<number> {
  let delivered = 0
  await Promise.all(
    items.map(async (item) => {
      try {
        await deliver(item)
        delivered++
      } catch (error) {
        onError(item, error)
      }
    }),
  )
  return delivered
}
