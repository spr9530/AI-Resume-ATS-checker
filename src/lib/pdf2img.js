import { getDocument, GlobalWorkerOptions } from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";

GlobalWorkerOptions.workerSrc = pdfWorker;

export async function convertPdfToImage(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await getDocument({ data: arrayBuffer }).promise;
  const page = await pdf.getPage(1);

  const viewport = page.getViewport({ scale: 4 });
  const canvas = document.createElement("canvas");
  const context = canvas.getContext("2d");

  canvas.width = viewport.width;
  canvas.height = viewport.height;

  await page.render({ canvasContext: context, viewport }).promise;

  return new Promise((resolve) => {
    canvas.toBlob((blob) => {
      if (!blob) {
        resolve({ imageUrl: "", file: null, error: "Blob creation failed" });
        return;
      }

      const originalName = file.name.replace(/\.pdf$/i, "");
      const imageFile = new File([blob], `${originalName}.png`, {
        type: "image/png",
      });

      resolve({
        imageUrl: URL.createObjectURL(blob),
        file: imageFile,
      });
    }, "image/png");
  });
}
