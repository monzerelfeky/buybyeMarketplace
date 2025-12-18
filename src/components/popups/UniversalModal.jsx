import React from "react";
import "../../styles/UniversalModal.css";

export default function UniversalModal({ isOpen, onClose, type, children }) {
  if (!isOpen) return null;

  // Modal width depends on type
  const size = type === "login" ? "modal-small" : "modal-large";
  

  return (
    <div className="um-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
      <div className={`um-container ${size}`}>
        
        {/* Close Button */}
        <button className="um-close-btn" onClick={onClose}>✕</button>

        {/* Render the content */}
        {children}

      </div>
    </div>
  );
}
