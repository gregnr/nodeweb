// biome-ignore lint/suspicious/noExplicitAny: <explanation>
interface ReadableStream<R = any> {
  [Symbol.asyncIterator](): AsyncIterator<R>;
}
