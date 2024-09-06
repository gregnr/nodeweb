// biome-ignore lint/suspicious/noExplicitAny: <explanation>
interface ReadableStream<R = any> {
  values(options?: { preventCancel?: boolean }): AsyncIterableIterator<R>;
  [Symbol.asyncIterator](options?: { preventCancel?: boolean }): AsyncIterableIterator<R>;
}
