import { forwardRef, useState } from "react";
import arrow from "../assets/arrow.png";

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
  
const FAQs = forwardRef((_props, ref) => {
  const [openFAQ, setOpenFAQ] = useState(null);

  const toggleFAQ = (index) => {
    setOpenFAQ(openFAQ === index ? null : index);
  };
  return (
    <div>
      {/* FAQs */}
      <div className="faq-container" ref={ref}>
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
    </div>
  );
});

export default FAQs;
