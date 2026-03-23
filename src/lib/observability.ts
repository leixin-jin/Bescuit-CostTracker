function serializeError(error: unknown) {
  if (error instanceof Error) {
    return {
      name: error.name,
      message: error.message,
      stack: error.stack,
    }
  }

  return {
    message: String(error),
  }
}

export async function observeServerOperation<T>(
  operation: string,
  context: Record<string, unknown>,
  run: () => Promise<T>,
) {
  const startedAt = Date.now()

  console.info(`[server] ${operation}:start`, context)

  try {
    const result = await run()

    console.info(`[server] ${operation}:success`, {
      ...context,
      durationMs: Date.now() - startedAt,
    })

    return result
  } catch (error) {
    console.error(`[server] ${operation}:error`, {
      ...context,
      durationMs: Date.now() - startedAt,
      error: serializeError(error),
    })
    throw error
  }
}
