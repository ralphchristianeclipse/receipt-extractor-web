import { expose } from "comlink";
import * as handlers from "./handlers";
// no need to change here as it will expose all handlers
expose(handlers);
