import React, { useMemo, useState } from "react";
import { apiWorker } from "./workers";
import { useQuery } from "@tanstack/react-query";
import { proxy } from "comlink";

function downloadJSON(jsonData, filename) {
  // Convert JSON data to string
  const jsonString = JSON.stringify(jsonData, null, 2);

  // Create a Blob object
  const blob = new Blob([jsonString], { type: "application/json" });

  // Create a URL for the Blob
  const url = URL.createObjectURL(blob);

  // Create an anchor element
  const a = document.createElement("a");

  // Set the anchor's href attribute to the Blob URL
  a.href = url;

  // Set the download attribute to the desired file name
  a.download = filename;

  // Append the anchor element to the body
  document.body.appendChild(a);

  // Programmatically click the anchor element to trigger the download
  a.click();

  // Remove the anchor element from the body
  document.body.removeChild(a);

  // Revoke the Blob URL
  URL.revokeObjectURL(url);
}

export const ReceiptExtractor = () => {
  const [fileUrls, setFileUrls] = useState<string[]>();
  const [map, setMap] = useState(new Map());
  const query = useQuery({
    queryKey: ["RECEIPT_EXTRACTOR", fileUrls],
    queryFn: async () => {
      if (!fileUrls) return null;
      console.time("RECEIPT_EXTRACTOR");
      const newMap = new Map(
        fileUrls?.map((fileUrl) => [fileUrl, { fileUrl }]),
      );
      setMap(newMap);
      const results = await Promise.all(
        fileUrls?.map(async (fileUrl) => {
          const startTime = new Date();
          setMap((prev) => {
            return prev.set(fileUrl, {
              ...prev.get(fileUrl),
              startTime: startTime?.toISOString(),
            });
          });
          const result = await apiWorker.receiptExtractor(fileUrl);
          const endTime = new Date();
          const elapsedSeconds = Math.abs(
            Math.round((+endTime - +startTime) / 1000),
          );
          const output = {
            fileUrl,
            result,
            startTime: startTime?.toISOString(),
            endTime: endTime?.toISOString(),
            elapsedSeconds,
          };
          setMap((prev) => {
            return prev.set(fileUrl, output);
          });
          return null;
        }),
      );
      console.timeEnd("RECEIPT_EXTRACTOR");
      return results;
    },
    enabled: !!fileUrls,
    refetchOnWindowFocus: false,
  });
  const mapValues = useMemo(() => [...map?.values()], [map]);
  return (
    <div>
      <button
        disabled={query?.isInitialLoading}
        onClick={() => downloadJSON(mapValues, "output.json")}
      >
        Save
      </button>
      <input
        type="file"
        multiple
        onChange={async (event) => {
          const inputs = event.target.files;
          if (!inputs?.length) return;
          const urls = [...inputs].map((input) => URL.createObjectURL(input));
          setFileUrls(urls);
        }}
      />
      {query?.isInitialLoading && <div>Loading... </div>}
      <div key={map?.size}>
        {mapValues?.map((row, index) => (
          <React.Fragment key={index}>
            <pre>{JSON.stringify(row, null, 2)}</pre>
            <div
              key={index}
              style={{ height: "fit-content", width: "fit-content" }}
            >
              <img
                src={row.fileUrl}
                style={{ width: "100%", height: "100%" }}
              />
            </div>
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};
