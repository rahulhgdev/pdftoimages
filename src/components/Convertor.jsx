import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import uploadIcon from "../assets/upload.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SCALE = 2; // higher = sharper images

function formatFileSize(bytes) {
  const K = 1000;
  if (bytes < K) return `${bytes} B`;
  if (bytes < K * K) return `${(bytes / K).toFixed(2)} KB`;
  if (bytes < K * K * K) return `${(bytes / (K * K)).toFixed(2)} MB`;
  return `${(bytes / (K * K * K)).toFixed(2)} GB`;
}

async function pdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
  const numPages = pdf.numPages;
  const images = [];

  for (let i = 1; i <= numPages; i++) {
    const page = await pdf.getPage(i);
    const viewport = page.getViewport({ scale: SCALE });
    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;
    const ctx = canvas.getContext("2d");
    await page.render({
      canvasContext: ctx,
      viewport,
    }).promise;
    images.push(canvas.toDataURL("image/png"));
  }

  return images;
}

async function downloadImagesAsZip(images, fileName) {
  const zip = new JSZip();
  const folder = zip.folder("pdf-images");

  images.forEach((imageData, index) => {
    const base64Data = imageData.split(",")[1];
    folder.file(`page-${String(index + 1).padStart(3, "0")}.png`, base64Data, {
      base64: true,
    });
  });

  const zipBlob = await zip.generateAsync({ type: "blob" });
  const baseName = fileName.replace(".pdf", "").replace(/[^a-z0-9]/gi, "_");
  saveAs(zipBlob, `${baseName}_images.zip`);
}

const Convertor = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const fileInputRef = useRef(null);

  function openPicker() {
    fileInputRef.current && fileInputRef.current.click();
  }

  function handleDrop(e) {
    e.preventDefault();
    const dropped = e.dataTransfer?.files?.[0];
    if (dropped) setFile(dropped);
  }

  const handleConvert = useCallback(async () => {
    if (!file || !file.type?.includes("pdf")) return;
    setError(null);
    setImages([]);
    setCurrentIndex(0);
    setConverting(true);
    try {
      const result = await pdfToImages(file);
      setImages(result);
      setCurrentIndex(0);
    } catch (err) {
      setError(err?.message || "Failed to convert PDF");
    } finally {
      setConverting(false);
    }
  }, [file]);

  const handleDeleteImage = useCallback(() => {
    if (images.length === 0) return;
    const newImages = images.filter((_, i) => i !== currentIndex);
    setImages(newImages);
    if (newImages.length === 0) {
      setCurrentIndex(0);
    } else {
      setCurrentIndex((prev) =>
        prev >= newImages.length ? newImages.length - 1 : prev,
      );
    }
  }, [images, currentIndex]);

  const handleDownload = useCallback(async () => {
    if (images.length === 0) return;
    setDownloading(true);
    try {
      await downloadImagesAsZip(images, file.name);
    } catch (err) {
      setError(
        "Failed to download images" + (err?.message ? `: ${err.message}` : ""),
      );
    } finally {
      setDownloading(false);
    }
  }, [images, file]);

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]">
      <div className="max-w-3xl w-full">
        <header className="mb-6 text-center animate-fadeIn">
          <h1 className="text-4xl font-bold text-gray-900">PDF2Image</h1>
          <p className="text-gray-600 mt-2">
            Convert PDF pages to high-quality images – fast and locally.
          </p>
        </header>

        <main className="bg-white shadow-xl rounded-2xl p-6 md:p-8 animate-slideUp">
          <div className="md:flex md:items-center flex-col md:gap-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex-1 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-300 hover:bg-gray-50 transition duration-300"
              onClick={openPicker}
            >
              <img
                src={uploadIcon}
                alt="Upload Icon"
                className="h-20 w-20 mb-4 opacity-90 animate-bounce"
              />
              <h3 className="text-lg font-medium text-gray-900">
                Drag & drop your PDF here
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Or click to choose a file from your computer
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                onChange={(e) => {
                  setFile(e.target.files?.[0] ?? null);
                  setImages([]);
                  setError(null);
                }}
              />
            </div>

            <div
              className="mt-6 md:mt-0 md:w-78 animate-slideUp"
              style={{ animationDelay: "0.1s" }}
            >
              {file && (
                <div className="mb-4 flex items-center justify-center gap-3 animate-fadeIn">
                  <p
                    className="text-gray-800 text-sm max-w-60 truncate"
                    title={file?.name}
                  >
                    {file?.name}
                  </p>
                  <p className="text-xs font-medium text-gray-500">
                    {formatFileSize(file.size)}
                  </p>
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 mt-2 text-center animate-shake">
                  {error}
                </p>
              )}

              <button
                className={`w-full py-2 rounded-full text-white font-medium transition duration-300 ${
                  file && !converting
                    ? "bg-blue-600 hover:bg-blue-700 active:scale-95 cursor-pointer"
                    : "bg-blue-300 cursor-not-allowed"
                }`}
                disabled={!file || converting}
                onClick={handleConvert}
              >
                {converting ? "Converting…" : "Convert to Image"}
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <section className="mt-8 pt-6 border-t border-gray-200 animate-slideUp">
              {/* Header with image count and delete button */}
              <div className="flex justify-between items-center flex-wrap">
                <h2 className="text-lg font-semibold text-gray-800 mb-3">
                  Converted images ({images.length}{" "}
                  {images.length === 1 ? "page" : "pages"})
                </h2>
                <div className="flex justify-end mb-4">
                  <button
                    onClick={handleDeleteImage}
                    className="px-4 py-2 rounded-lg bg-red-100 hover:bg-red-200 text-red-700 font-medium cursor-pointer transition duration-300 active:scale-95 animate-fadeIn"
                    title="Delete current image"
                  >
                    🗑️ Delete Current
                  </button>
                </div>
              </div>

              {/* Image Preview */}
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-h-[70vh] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden shadow-lg animate-fadeIn">
                  <img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`Page ${currentIndex + 1}`}
                    className="max-w-full max-h-[70vh] object-contain animate-imageZoom"
                  />
                </div>

                {/* Slider */}
                <div className="w-full px-2 animate-slideUp">
                  <input
                    type="range"
                    min="0"
                    max={images.length - 1}
                    value={currentIndex}
                    onChange={(e) => setCurrentIndex(parseInt(e.target.value))}
                    className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-blue-600 hover:accent-blue-700"
                  />
                  <div className="flex justify-between text-xs text-gray-500 mt-2">
                    <span>Page 1</span>
                    <span className="text-sm font-medium text-gray-600 min-w-[4rem] text-center">
                    {currentIndex + 1} / {images.length}
                  </span>
                    <span>Page {images.length}</span>
                  </div>
                </div>

                {/* Navigation Buttons */}
                {/* <div
                  className="flex items-center gap-4 animate-slideUp"
                  style={{ animationDelay: "0.1s" }}
                >
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((i) =>
                        i <= 0 ? images.length - 1 : i - 1,
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition duration-300 active:scale-95 cursor-pointer"
                    aria-label="Previous image"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 min-w-[4rem] text-center">
                    {currentIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setCurrentIndex((i) =>
                        i >= images.length - 1 ? 0 : i + 1,
                      )
                    }
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium transition duration-300 active:scale-95 cursor-pointer"
                    aria-label="Next image"
                  >
                    Next
                  </button>
                </div> */}
                
              </div>

              {/* Download Button */}
              <div
                className="flex justify-center mt-6 animate-slideUp"
                style={{ animationDelay: "0.3s" }}
              >
                <button
                  onClick={handleDownload}
                  disabled={downloading}
                  className={`px-6 py-3 rounded-full font-medium transition duration-300 active:scale-95 ${
                    downloading
                      ? "bg-blue-300 cursor-not-allowed"
                      : "rounded-full text-white font-medium transition duration-300 cursor-pointer bg-blue-600 hover:bg-blue-700 active:scale-95"
                  }`}
                >
                  {downloading ? "Downloading…" : "Download all images"}
                </button>
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default Convertor;
