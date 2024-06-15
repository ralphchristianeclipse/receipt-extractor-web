import { pipeline, env } from "@xenova/transformers";
// env.localModelPath = "https://gjrkk4-5173.csb.app/models/";
env.allowLocalModels = false;
// const pipe = await pipeline(
//   "image-to-text",
//   "selvakumarcts/sk_invoice_receipts",
// );

const getPipeline = async (...args: Parameters<typeof pipeline>) => {
  let instance = null;
  let lastArgs;
  const currentArgs = JSON.stringify(args);
  return async () => {
    if (lastArgs !== currentArgs && instance) {
      instance.dispose();
      instance = null;
    }
    if (!instance) {
      instance = await pipeline(...args);
      lastArgs = currentArgs;
    }
    return instance;
  };
};
export const receiptExtractor = async (
  input: any,
  progress_callback: (progress: number) => void,
) => {
  // Allocate a pipeline for sentiment-analysis
  const instance = await getPipeline(
    "document-question-answering",
    "Xenova/donut-base-finetuned-docvqa",
    {
      progress_callback,
    },
  );

  const model = await instance();
  const questions = {
    total: "What is the total?",
    receiptDate: "What is the receipt date",
  };
  const entries = await Promise.all(
    Object.entries(questions).map(async ([key, value]) => {
      const result = await model(input, value);
      return [key, result?.[0]?.answer];
    }),
  );
  const output = Object.fromEntries(entries);

  return output;
};
