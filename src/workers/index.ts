import { wrap } from "comlink";
import WorkerHandlers from "./worker?worker";
import type * as WorkerHandlersTypes from "./handlers";

// you can just change the name of the constant here for use in other files to avoid name conflicts
const workerHandlers = new WorkerHandlers();
export const apiWorker =
  await wrap<typeof WorkerHandlersTypes>(workerHandlers);
window.apiWorker = apiWorker;
window.workerHandlers = workerHandlers;
