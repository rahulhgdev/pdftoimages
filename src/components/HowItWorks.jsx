import { useState } from "react";
import arrow from "../assets/arrow.png";

const HowItWorks = () => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };

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

  const faqs = [
    {
      question: "Is my PDF stored on your servers?",
      answer:
        "No, your PDF is processed entirely on your local browser. We never upload or store any of your files on our servers. Your privacy is fully protected.",
    },
    {
      question: "What image format are the conversions?",
      answer:
        "All converted pages are saved as high-quality PNG images. PNG format preserves the quality and clarity of your PDF content without compression artifacts.",
    },
    {
      question: "Can I edit or delete pages?",
      answer:
        "Yes! After conversion, you can delete individual pages by clicking the 'Delete Current' button. You can then download only the pages you want as a ZIP file.",
    },
    {
      question: "What is the file size limit?",
      answer:
        "There is no specific file size limit since processing happens on your device. However, very large PDFs may take longer to process depending on your browser's capabilities.",
    },
    {
      question: "Can I convert scanned PDFs?",
      answer:
        "Yes, scanned PDFs work perfectly! The converter will render them as images just like regular PDFs, preserving all the content from your scans.",
    },
    {
      question: "Do you support batch conversion?",
      answer:
        "Currently, you can convert one PDF at a time. However, each PDF can have multiple pages, and all are processed and downloaded together as a ZIP file.",
    },
  ];

  return (
    <div className="how-it-works-container">
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

      {/* FAQs */}
      <div className="faq-container">
        <h2 className="faq-title">Frequently Asked Questions</h2>
        <div>
          {faqs.map((faq, index) => (
            <div key={index} className="faq-item">
              <button className="faq-question" onClick={() => toggleFAQ(index)}>
                <span>{faq.question}</span>
                <span
                  className={`faq-toggle ${openFAQ === index ? "open" : ""}`}
                >
                  <img src={arrow} alt="arrow" className="w-5 h-5" />
                </span>
              </button>
              <div className={`faq-answer ${openFAQ === index ? "open" : ""}`}>
                {faq.answer}
              </div>
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
};

export default HowItWorks;