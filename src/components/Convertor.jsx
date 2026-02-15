import { useState, useRef, useCallback, forwardRef } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfjsWorker from "pdfjs-dist/build/pdf.worker.mjs?url";
import JSZip from "jszip";
import { saveAs } from "file-saver";
import uploadIcon from "../assets/upload.png";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfjsWorker;

// File size limit: 100MB
const MAX_FILE_SIZE = 100 * 1024 * 1024; // 100MB in bytes

// Quality scale mapping for pdf.js - Controls rendering resolution
const QUALITY_SCALES = {
  50: 1.0,   // Low quality - 1.0x scale
  75: 1.5,   // Medium quality - 1.5x scale
  100: 2.0,  // High quality - 2.0x scale (default)
  150: 3.0,  // Very High quality - 3.0x scale
  200: 4.0,  // Ultra High quality - 4.0x scale
};



/**
 * Convert PDF pages to images with specified quality and format
 * @param {File} file - PDF file to convert
 * @param {number} quality - Quality percentage (50, 75, 100, 150, 200)
 * @param {string} imageFormat - Output format (png, jpg, webp)
 * @returns {Promise<Array>} Array of image objects with src, format, quality, and pageNumber
 */
async function pdfToImages(file, quality, imageFormat) {
  try {
    const arrayBuffer = await file.arrayBuffer();
    const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
    const numPages = pdf.numPages;
    const images = [];
    
    // Get scale value from quality mapping
    const scale = QUALITY_SCALES[quality] || QUALITY_SCALES[100];

    for (let i = 1; i <= numPages; i++) {
      const page = await pdf.getPage(i);
      const viewport = page.getViewport({ scale });
      const canvas = document.createElement("canvas");
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      // Get 2D context with willReadFrequently for better performance
      const ctx = canvas.getContext("2d", { willReadFrequently: true });
      await page.render({
        canvasContext: ctx,
        viewport: viewport,
      }).promise;

      let imageUrl;
      if (imageFormat === "jpg") {
        imageUrl = canvas.toDataURL("image/jpeg", 0.9);
      } else if (imageFormat === "webp") {
        imageUrl = canvas.toDataURL("image/webp", 0.9);
      } else {
        imageUrl = canvas.toDataURL("image/png");
      }
      
      images.push({ 
        src: imageUrl, 
        format: imageFormat,
        quality: quality,
        pageNumber: i
      });
    }
    return images;

  } catch (error) {
    console.error("Error converting PDF to images:", error);
    throw new Error(`Failed to convert PDF: ${error.message}`);
  }
}

/**
 * Download images as a ZIP file (without pdf-images folder)
 * @param {Array} images - Array of image objects
 * @param {string} fileName - Original PDF file name
 * @param {string} imageFormat - Output format
 */
async function downloadImagesAsZip(images, fileName, imageFormat) {
  try {
    const zip = new JSZip();
    images.forEach((imageData, index) => {
      const base64Data = imageData.src.split(",")[1];
      const extension = imageFormat === "jpg" ? "jpg" : 
                       imageFormat === "webp" ? "webp" : "png";
      zip.file(
        `page-${String(index + 1).padStart(3, "0")}.${extension}`, 
        base64Data, 
        { base64: true }
      );
    });

    // Generate zip file as blob
    const zipBlob = await zip.generateAsync({ type: "blob" });
    const baseName = fileName
      .replace(".pdf", "")
      .replace(/[^a-z0-9]/gi, "_");
    saveAs(zipBlob, `${baseName}_images.zip`);

  } catch (error) {
    console.error("Error creating zip file:", error);
    throw new Error(`Failed to download images: ${error.message}`);
  }
}

const Convertor = forwardRef((_props, ref) => {
  const [file, setFile] = useState(null);
  const [images, setImages] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [converting, setConverting] = useState(false);
  const [error, setError] = useState(null);
  const [downloading, setDownloading] = useState(false);
  const [quality, setQuality] = useState(100);
  const [imageFormat, setImageFormat] = useState("png");
  const [isZoomed, setIsZoomed] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 0, y: 0 });
  const [enableZoom, setEnableZoom] = useState(false);
  const fileInputRef = useRef(null);

  const qualityOptions = [
    { value: 50, label: "Low (50%) - 1.0x Scale" },
    { value: 75, label: "Medium (75%) - 1.5x Scale" },
    { value: 100, label: "High (100%) - 2.0x Scale" },
    { value: 150, label: "Very High (150%) - 3.0x Scale" },
    { value: 200, label: "Ultra High (200%) - 4.0x Scale" },
  ];

  const formatOptions = [
    { value: "png", label: "PNG" },
    { value: "jpg", label: "JPG" },
    { value: "webp", label: "WebP" },
  ];

  function openPicker() {
    if (!converting) {
      fileInputRef.current && fileInputRef.current.click();
    }
  }

  function handleDrop(e) {
    if (converting) {
      e.preventDefault();
      return;
    }
    e.preventDefault();
    const dropped = e.dataTransfer?.files?.[0];
    if (!dropped || !dropped.type?.includes("pdf")) {
      setError("*Please drop a valid PDF file");
      setFile(null);
      return;
    }
    if (dropped.size > MAX_FILE_SIZE) {
      setError("*File size exceeds 100MB limit");
      setFile(null);
      return;
    }
    setError(null);
    setFile(dropped);
  }

  const handleConvert = useCallback(async () => {
    if (!file || !file.type?.includes("pdf")) return;
    setError(null);
    setImages([]);
    setCurrentIndex(0);
    setConverting(true);
    try {
      const result = await pdfToImages(file, quality, imageFormat);
      setImages(result);
      setCurrentIndex(0);
    } catch (err) {
      setError(err?.message || "Failed to convert PDF");
      console.error("Conversion error:", err);
    } finally {
      setConverting(false);
    }
  }, [file, quality, imageFormat]);

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
      await downloadImagesAsZip(images, file.name, imageFormat);
    } catch (err) {
      setError(
        "Failed to download images" + (err?.message ? `: ${err.message}` : ""),
      );
      console.error("Download error:", err);
    } finally {
      setDownloading(false);
    }
  }, [images, file, imageFormat]);

  const handleImageMouseEnter = () => {
    setIsZoomed(true);
  };

  const handleImageMouseMove = (e) => {
    if (!isZoomed) return;

    const rect = e.currentTarget.getBoundingClientRect();
    const x = ((e.clientX - rect.left) / rect.width) * 100;
    const y = ((e.clientY - rect.top) / rect.height) * 100;

    setZoomPosition({ x, y });
  };

  const handleImageMouseLeave = () => {
    setIsZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
  };

  const handleClearAll = useCallback(() => {
    setFile(null);
    setImages([]);
    setCurrentIndex(0);
    setError(null);
    setDownloading(false);
    setQuality(100);
    setImageFormat("png");
    setIsZoomed(false);
    setZoomPosition({ x: 0, y: 0 });
    setEnableZoom(false);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  }, []);

  return (
    <div className="flex items-center justify-center p-6 min-h-[calc(100vh-80px)]" ref={ref}>
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
              onDragOver={(e) => !converting && e.preventDefault()}
              className={`flex-1 border-2 border-dashed border-gray-200 rounded-xl p-6 flex flex-col items-center justify-center text-center cursor-pointer transition duration-300 ${
                converting
                  ? "opacity-60 cursor-not-allowed bg-gray-50"
                  : "hover:border-gray-300 hover:bg-gray-50"
              }`}
              onClick={openPicker}
            >
              <img
                src={uploadIcon}
                alt="Upload Icon"
                className="h-20 w-20 mb-4 opacity-90 animate-bounce"
              />
              <h3 className="text-lg font-medium text-gray-900">
                Drag & drop your file
              </h3>
              <p className="text-sm text-gray-500 mt-2">
                Or click to choose a file from your computer
              </p>
              <p className="text-xs text-gray-400 mt-1">
                Max file size: 100MB
              </p>
              <input
                ref={fileInputRef}
                type="file"
                accept=".pdf,application/pdf"
                className="hidden"
                disabled={converting}
                onChange={(e) => {
                  if (!converting) {
                    const selectedFile = e.target.files?.[0] ?? null;
                    if (selectedFile) {
                      if (selectedFile.size > MAX_FILE_SIZE) {
                        setError("*File size exceeds 100MB limit");
                        setFile(null);
                        if (fileInputRef.current) {
                          fileInputRef.current.value = "";
                        }
                        return;
                      }
                      setFile(selectedFile);
                      setImages([]);
                      setError(null);
                    } else {
                      setFile(null);
                      setImages([]);
                      setError(null);
                    }
                  }
                }}
              />
            </div>

            <div
              className="mt-6 md:mt-0 md:w-78 animate-slideUp w-full"
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
                </div>
              )}

              {error && (
                <p className="text-sm text-red-600 mb-3 text-center animate-shake">
                  {error}
                </p>
              )}

              {images.length === 0 && (
                <div className="flex gap-3">
                  {/* Quality Selection */}
                  <div className="mb-4 animate-slideUp flex-1" style={{ animationDelay: "0.05s" }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Quality
                    </label>
                    <select
                      value={quality}
                      onChange={(e) => setQuality(Number(e.target.value))}
                      disabled={converting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {qualityOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1 hidden">
                      Higher quality = larger file size but sharper images
                    </p>
                  </div>

                  {/* Format Selection */}
                  <div className="mb-4 animate-slideUp flex-1" style={{ animationDelay: "0.1s" }}>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                    Image Format
                    </label>
                    <select
                      value={imageFormat}
                      onChange={(e) => setImageFormat(e.target.value)}
                      disabled={converting}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed"
                    >
                      {formatOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1 hidden">
                      PNG: Best quality | JPG/WebP: Smaller file size
                    </p>
                  </div>
                </div>
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
              <div className="flex justify-between items-center flex-wrap mb-6">
                <h2 className="text-lg font-semibold text-gray-800">
                  Converted images ({images.length}{" "}
                  {images.length === 1 ? "page" : "pages"})
                </h2>
              </div>

              {/* Controls Row */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 pb-4 border-b border-gray-200">
                <div>
                  <select
                    value={imageFormat}
                    onChange={(e) => setImageFormat(e.target.value)}
                    disabled={converting}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition duration-300 disabled:opacity-60 disabled:cursor-not-allowed bg-white"
                    title="Change format"
                  >
                    {formatOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="flex items-end">
                  <label className="flex items-center gap-2 px-4 py-2 border border-gray-300 rounded-lg cursor-pointer hover:bg-blue-50 hover:border-blue-400 transition duration-300 w-full justify-center bg-white">
                    <input
                      type="checkbox"
                      checked={enableZoom}
                      onChange={(e) => setEnableZoom(e.target.checked)}
                      className="w-4 h-4 cursor-pointer accent-blue-600"
                    />
                    <span className="text-sm font-semibold text-gray-700">Enable Zoom</span>
                  </label>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={handleDeleteImage}
                    className="flex-1 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-700 font-semibold cursor-pointer transition duration-300 active:scale-95 text-sm border border-red-200"
                    title="Delete current image"
                  >
                  Delete
                  </button>

                  <button
                    onClick={handleClearAll}
                    className="flex-1 px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold cursor-pointer transition duration-300 active:scale-95 text-sm border border-gray-300"
                    title="Clear all changes and discard"
                  >
                    Clear
                  </button>
                </div>
              </div>

              {/* Image Preview with Zoom */}
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`w-full max-h-[70vh] flex items-center justify-center bg-gray-100 rounded-xl overflow-hidden shadow-lg animate-fadeIn relative ${
                    enableZoom && isZoomed ? "cursor-zoom-out" : enableZoom ? "cursor-zoom-in" : ""
                  }`}
                  onMouseEnter={() => enableZoom && handleImageMouseEnter()}
                  onMouseMove={(e) => enableZoom && handleImageMouseMove(e)}
                  onMouseLeave={() => enableZoom && handleImageMouseLeave()}
                >
                  <img
                    key={`${currentIndex}-${quality}-${imageFormat}`}
                    src={images[currentIndex]?.src}
                    alt={`Page ${currentIndex + 1}`}
                    className={`max-w-full max-h-[70vh] object-contain animate-imageZoom transition-transform duration-200 ${
                      enableZoom && isZoomed ? "scale-200" : "scale-100"
                    }`}
                    style={
                      enableZoom && isZoomed
                        ? {
                            transformOrigin: `${zoomPosition.x}% ${zoomPosition.y}%`,
                          }
                        : {}
                    }
                  />
                  
                </div>

                {/* Image Info Badge */}
                <div className="flex gap-2 justify-center flex-wrap">
                  <span className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium">
                    {imageFormat.toUpperCase()}
                  </span>
                  <span className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium">
                    Quality: {images[currentIndex]?.quality}%
                  </span>
                  <span className="px-3 py-1 bg-purple-100 text-purple-800 rounded-full text-sm font-medium">
                    Scale: {QUALITY_SCALES[images[currentIndex]?.quality || 100]}x
                  </span>
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
                      ? "bg-blue-300 cursor-not-allowed text-white"
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
});

export default Convertor;