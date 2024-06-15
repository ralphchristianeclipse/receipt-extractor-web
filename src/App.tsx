import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./queryClient";
import { ReceiptExtractor } from "./ReceiptExtractor";

export const App = () => {
  return (
    // Provide the client to your App
    <QueryClientProvider client={queryClient}>
      <ReceiptExtractor />
    </QueryClientProvider>
  );
};
