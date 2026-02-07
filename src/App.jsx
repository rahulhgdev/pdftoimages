import { useState, useRef, useCallback } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import "./App.css";
import uploadIcon from "./assets/upload.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

const SCALE = 2; // higher = sharper images

function formatFileSize(bytes) {
  const K = 1000; // used decimal (1000-based) here, example: 15073 KB = 15.073 MB
  if (bytes < K) return `${bytes} B`;
  if (bytes < K * K) return `${(bytes / K).toFixed(2)} KB`;
  if (bytes < K * K * K) return `${(bytes / (K * K)).toFixed(2)} MB`;
  return `${(bytes / (K * K * K)).toFixed(2)} GB`;
}

async function pdfToImages(file) {
  const arrayBuffer = await file.arrayBuffer();
  console.log(arrayBuffer);
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
    // convert canvas to image(base64)
    images.push(canvas.toDataURL("image/png"));
  }

  return images;
}

const App = () => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
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

  return (
    <div className="min-h-screen bg-gradient-to-b from-white to-gray-50 flex items-center justify-center p-6">
      <div className="max-w-3xl w-full">
        <header className="mb-6 text-center">
          <h1 className="text-4xl font-bold text-gray-900">PDF To Image</h1>
          <p className="text-gray-600 mt-2">Convert PDF pages to high-quality images — fast and locally.</p>
        </header>

        <main className="bg-white shadow-xl rounded-2xl p-6 md:p-8">
          <div className="md:flex md:items-center flex-col md:gap-4">
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              className="flex-1 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer hover:border-gray-300 transition"
              onClick={openPicker}
            >
              <img src={uploadIcon} alt="Upload Icon" className="h-20 w-20 mb-4 opacity-90" />
              <h3 className="text-lg font-medium text-gray-900">Drag & drop your PDF here</h3>
              <p className="text-sm text-gray-500 mt-2">Or click to choose a file from your computer</p>
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

            <div className="mt-6 md:mt-0 md:w-78">
              <div className={file && 'mb-4 flex items-center justify-center gap-3'}>
                <p className="text-gray-800 text-sm max-w-60 truncate" title={file?.name}>
                  {file?.name}
                </p>
                {file && (
                  <p className="text-xs font-medium text-gray-500 mt-1">{formatFileSize(file.size)}</p>
                )}
              </div>

              {error && (
                <p className="text-sm text-red-600 mt-2 text-center">{error}</p>
              )}

              <button
                className={`w-full py-2 rounded-full text-white font-medium transition ${file && !converting ? "bg-blue-600 hover:bg-blue-700" : "bg-blue-300 cursor-not-allowed"}`}
                disabled={!file || converting}
                onClick={handleConvert}
              >
                {converting ? "Converting…" : "Convert to Image"}
              </button>
            </div>
          </div>

          {images.length > 0 && (
            <section className="mt-8 pt-6 border-t border-gray-200">
              <h2 className="text-lg font-semibold text-gray-800 mb-3">
                Converted images ({images.length} {images.length === 1 ? "page" : "pages"})
              </h2>
              <div className="flex flex-col items-center gap-4">
                <div className="w-full max-h-[70vh] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden">
                  <img
                    key={currentIndex}
                    src={images[currentIndex]}
                    alt={`Page ${currentIndex + 1}`}
                    className="max-w-full max-h-[70vh] object-contain"
                  />
                </div>
                <div className="flex items-center gap-4">
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => (i <= 0 ? images.length - 1 : i - 1))}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Previous image"
                  >
                    Previous
                  </button>
                  <span className="text-sm font-medium text-gray-600 min-w-[4rem] text-center">
                    {currentIndex + 1} / {images.length}
                  </span>
                  <button
                    type="button"
                    onClick={() => setCurrentIndex((i) => (i >= images.length - 1 ? 0 : i + 1))}
                    className="px-4 py-2 rounded-lg bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium disabled:opacity-50 disabled:pointer-events-none"
                    aria-label="Next image"
                  >
                    Next
                  </button>
                </div>
                {images.length > 1 && (
                  <div className="flex flex-wrap justify-center gap-1">
                    {images.map((_, i) => (
                      <button
                        key={i}
                        type="button"
                        onClick={() => setCurrentIndex(i)}
                        className={`w-2.5 h-2.5 rounded-full transition ${i === currentIndex ? "bg-blue-600 scale-125" : "bg-gray-300 hover:bg-gray-400"}`}
                        aria-label={`Go to page ${i + 1}`}
                      />
                    ))}
                  </div>
                )}
              </div>
            </section>
          )}
        </main>
      </div>
    </div>
  );
};

export default App;