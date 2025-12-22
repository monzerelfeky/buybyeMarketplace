import React, { useEffect, useMemo, useState } from "react";
import Header from "../Header";
import Footer from "../Footer";
import { useSeller } from "../../context/SellerContext";

import "../../styles/seller/base.css";
import "../../styles/seller/layout.css";
import "../../styles/seller/serviceability.css";

export default function ServiceabilitySettings() {
  const { serviceAreas, saveServiceAreas, loading } = useSeller();
  const [rows, setRows] = useState([{ city: "", deliveryFee: 0 }]);
  const [status, setStatus] = useState(null);
  const egyptGovernorates = [
    "Alexandria",
    "Aswan",
    "Asyut",
    "Beheira",
    "Beni Suef",
    "Cairo",
    "Dakahlia",
    "Damietta",
    "Faiyum",
    "Gharbia",
    "Giza",
    "Ismailia",
    "Kafr El Sheikh",
    "Luxor",
    "Matrouh",
    "Minya",
    "Monufia",
    "New Valley",
    "North Sinai",
    "Port Said",
    "Qalyubia",
    "Qena",
    "Red Sea",
    "Sharqia",
    "Sohag",
    "South Sinai",
    "Suez",
  ];

  useEffect(() => {
    if (serviceAreas && serviceAreas.length > 0) {
      setRows(serviceAreas.map((a) => ({
        city: a.city || "",
        deliveryFee: a.deliveryFee || 0
      })));
    }
  }, [serviceAreas]);

  const totalCoverage = useMemo(() => rows.length, [rows.length]);

  const handleChange = (idx, field, value) => {
    setRows((prev) => prev.map((row, i) => (i === idx ? { ...row, [field]: value } : row)));
  };

  const addRow = () => {
    setRows((prev) => [...prev, { city: "", deliveryFee: 0 }]);
  };

  const removeRow = (idx) => {
    setRows((prev) => {
      const next = prev.filter((_, i) => i !== idx);
      // Always keep at least one editable row to avoid empty UI
      return next.length > 0 ? next : [{ city: "", deliveryFee: 0 }];
    });
  };

  const handleSave = async () => {
    setStatus(null);
    const cleaned = rows
      .filter((r) => r.city)
      .map((r) => ({
        city: r.city.trim(),
        areaName: "",
        radiusKm: 0,
        deliveryFee: Number(r.deliveryFee) || 0,
      }));

    const result = await saveServiceAreas(cleaned);
    if (result?.error) {
      setStatus({ type: "error", message: result.error || "Could not save. Please check you are logged in as a seller." });
    } else {
      setStatus({ type: "success", message: "Serviceability saved." });
    }
  };

  return (
    <>
      <Header />
      <div className="page-container serviceability-page">
        <div className="serviceability-header">
          <div>
            <h1>Serviceability & Delivery</h1>
            <p>Define the cities you deliver to and set a delivery fee for each.</p>
          </div>
        </div>

        {status && <div className={`banner banner-${status.type}`}>{status.message}</div>}

        <div className="card serviceability-card">
          <div className="card-heading">
            <div>
              <p className="eyebrow">Coverage</p>
              <h3>Serviceable areas</h3>
            </div>
            <button className="ghost-btn" onClick={addRow}>Add area</button>
          </div>

          <div className="serviceability-table">
            <div className="serviceability-head">
              <span>City</span>
              <span>Delivery fee</span>
              <span></span>
            </div>
            {rows.map((row, idx) => (
              <div key={idx} className="serviceability-row">
                <select
                  className="svc-input"
                  value={row.city}
                  onChange={(e) => handleChange(idx, "city", e.target.value)}
                >
                  <option value="">Select a city</option>
                  {egyptGovernorates.map((gov) => (
                    <option key={gov} value={gov}>
                      {gov}
                    </option>
                  ))}
                </select>
                <input
                  className="svc-input"
                  type="number"
                  min="0"
                  step="0.01"
                  value={row.deliveryFee}
                  onChange={(e) => handleChange(idx, "deliveryFee", e.target.value)}
                />
                <button
                  type="button"
                  className="icon-btn"
                  onClick={() => removeRow(idx)}
                  aria-label="Remove area"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          <div className="save-row">
            <button className="primary-btn" onClick={handleSave} disabled={loading.serviceAreas}>
              {loading.serviceAreas ? "Saving..." : "Save settings"}
            </button>
            <span className="hint">These settings sync to your checkout delivery fees.</span>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
