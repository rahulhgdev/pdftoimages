import { forwardRef } from "react";

const HowItWorks = forwardRef((_props, ref) => {
  const steps = [
    {
      icon: "📁",
      title: "Upload PDF",
      description:
        "Drag and drop your PDF file or click to browse your computer.",
    },
    {
      icon: "⚡",
      title: "Convert Instantly",
      description:
        "Click the convert button. Processing happens locally on your device.",
    },
    {
      icon: "👁️",
      title: "Preview Images",
      description:
        "View each page with a smooth slider and navigation controls.",
    },
    {
      icon: "📥",
      title: "Download All",
      description:
        "Download all pages as a ZIP file in high-quality PNG format.",
    },
  ];

  const features = [
    "✓ Fast local processing - no server uploads",
    "✓ High-quality images - 2x resolution rendering",
    "✓ Batch download - get all pages as ZIP",
    "✓ Delete individual pages - customize your output",
    "✓ Responsive design - works on all devices",
    "✓ Free to use - no limits or registrations",
  ];

  return (
    <div className="how-it-works-container" ref={ref}>
      {/* Header */}
      <h1 className="how-it-works-title">How It Works</h1>
      <p className="how-it-works-subtitle">
        Convert your PDFs to high-quality images in just 4 simple steps
      </p>

      {/* Steps */}
      <div className="steps-container">
        {steps.map((step, index) => (
          <div key={index} className="step-card">
            <div className="step-icon">{step.icon}</div>
            <h3 className="step-title">{step.title}</h3>
            <p className="step-description">{step.description}</p>
          </div>
        ))}
      </div>

      {/* Features */}
      <div className="features-container">
        <h2 className="features-title">Why Choose PDF2Image?</h2>
        <div className="features-list">
          {features.map((feature, index) => (
            <div key={index} className="feature-item">
              <span className="feature-check">✓</span>
              <span className="feature-text">{feature.slice(2)}</span>
            </div>
          ))}
        </div>
      </div>

      <div
        style={{
          marginTop: "3rem",
          padding: "2rem",
          backgroundColor: "#f9fafb",
          borderRadius: "1rem",
          textAlign: "center",
          animation: "slideUp 0.6s ease-out",
          animationDelay: "0.4s",
        }}
      >
        <p style={{ color: "#6b7280", lineHeight: "1.6" }}>
          <strong>Ready to convert your PDFs?</strong> <br />
          Go back to the converter and start transforming your PDF files into
          beautiful, shareable images today!
        </p>
      </div>
    </div>
  );
});

export default HowItWorks;