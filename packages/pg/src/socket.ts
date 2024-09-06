import { EventEmitter } from 'node:events';

export interface DuplexStream<T = unknown> {
  readable: ReadableStream<T>;
  writable: WritableStream<T>;
}

/**
 * Creates a passthrough socket object that can be passed
 * directly to the `stream` property in a `pg` `Client`.
 *
 * @example
 * const client = new Client({
 *   user: 'postgres',
 *   stream: socketFromDuplexStream(clientDuplex),
 * });
 */
export function socketFromDuplexStream(duplex: DuplexStream<Uint8Array>) {
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  return () => new PassThroughSocket(duplex) as any;
}

/**
 * Simulated Node.js `Socket` that passes data to and from
 * the provided `DuplexStream`.
 *
 * Useful with libraries like `pg` to route data
 * through custom streams, such as an in-memory duplex pair.
 */
export class PassThroughSocket extends EventEmitter {
  writer: WritableStreamDefaultWriter;
  writable = false;
  destroyed = false;

  constructor(public duplex: DuplexStream<Uint8Array>) {
    super();
    this.writer = duplex.writable.getWriter();
  }

  private async emitData() {
    for await (const chunk of toAsyncIterator(this.duplex.readable)) {
      this.emit('data', Buffer.from(chunk));
    }
  }

  connect() {
    this.emitData();

    // Yield to the event loop
    new Promise((resolve) => setTimeout(resolve)).then(() => {
      this.writable = true;
      this.emit('connect');
    });

    return this;
  }

  write(
    // biome-ignore lint/suspicious/noExplicitAny: <explanation>
    chunk: any,
    encodingOrCallback?: BufferEncoding | ((error: Error | undefined) => void),
    callback?: (error: Error | undefined) => void,
  ): boolean {
    if (typeof encodingOrCallback === 'function') {
      // biome-ignore lint/style/noParameterAssign: <explanation>
      callback = encodingOrCallback;
      // biome-ignore lint/style/noParameterAssign: <explanation>
      encodingOrCallback = undefined;
    }

    this.writer
      .write(new Uint8Array(chunk))
      .then(() => callback?.(undefined))
      .catch((err) => callback?.(err));

    return true;
  }

  end() {
    this.writable = false;
    this.emit('close');
    return this;
  }

  destroy() {
    this.destroyed = true;
    this.end();
    return this;
  }

  startTls() {
    throw new Error('TLS is not supported in pass-through sockets');
  }

  setNoDelay() {
    return this;
  }

  setKeepAlive() {
    return this;
  }

  ref() {
    return this;
  }

  unref() {
    return this;
  }
}

/**
 * Converts a `ReadableStream` to an `AsyncIterator`.
 *
 * Note that `ReadableStream` is supposed to implement `AsyncIterable`
 * already, but this isn't true for all environments today (eg. Safari).
 *
 * Use this method as a ponyfill.
 */
function toAsyncIterator<R = unknown>(
  readable: ReadableStream<R>,
  options?: { preventCancel?: boolean },
): AsyncIterableIterator<R> {
  // If the `ReadableStream` implements `[Symbol.asyncIterator]`, use it
  if (Symbol.asyncIterator in readable) {
    return readable[Symbol.asyncIterator](options);
  }

  // Otherwise fallback to a ponyfill
  const reader = (readable as ReadableStream<R>).getReader();
  const iterator: AsyncIterableIterator<R> = {
    async next() {
      try {
        const { done, value } = await reader.read();
        if (done) {
          reader.releaseLock();
        }
        return {
          done,
          // biome-ignore lint/style/noNonNullAssertion: <explanation>
          value: value!,
        };
      } catch (e) {
        reader.releaseLock();
        throw e;
      }
    },
    async return(value: unknown) {
      if (!options?.preventCancel) {
        const cancelPromise = reader.cancel(value);
        reader.releaseLock();
        await cancelPromise;
      } else {
        reader.releaseLock();
      }
      return { done: true, value };
    },
    [Symbol.asyncIterator]() {
      return iterator;
    },
  };
  return iterator;
}
