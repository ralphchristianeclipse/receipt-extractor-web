import * as Comlink from "comlink";

export const getExtractor = () => {
  const worker = new Worker("./worker.ts");
  // WebWorkers use `postMessage` and therefore work with Comlink.
  const wrapper = Comlink.wrap(worker);
  return wrapper;
};
