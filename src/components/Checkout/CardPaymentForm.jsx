import React, { useMemo, useState } from "react";
import { detectCardType, isValidCardNumber } from "../../utils/cardUtils";

const formatCardNumber = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(.{4})/g, "$1 ").trim();
};

const formatExpiry = (value) => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  if (digits.length <= 2) return digits;
  return `${digits.slice(0, 2)} / ${digits.slice(2)}`;
};

const isExpiryValid = (value) => {
  const digits = value.replace(/\D/g, "");
  if (digits.length < 4) return false;

  const month = Number(digits.slice(0, 2));
  const year = Number(digits.slice(2, 4));
  if (month < 1 || month > 12) return false;

  const now = new Date();
  const currentYear = now.getFullYear() % 100;
  const currentMonth = now.getMonth() + 1;

  if (year < currentYear) return false;
  if (year === currentYear && month < currentMonth) return false;

  return true;
};

export default function CardPaymentForm({ onPay, isSubmitting = false }) {
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvv, setCvv] = useState("");
  const [touched, setTouched] = useState({ cardNumber: false, expiry: false, cvv: false });

  const cardDigits = cardNumber.replace(/\D/g, "");
  const cardType = useMemo(() => detectCardType(cardDigits), [cardDigits]);
  const cardLogo = cardType === "visa"
    ? "/cards/visa.png"
    : cardType === "mastercard"
      ? "/cards/mastercard.png"
      : null;

  const isCardNumberValid = cardDigits.length === 16 && isValidCardNumber(cardDigits) && cardType !== "unknown";
  const isCvvValid = /^\d{3}$/.test(cvv);
  const isFormValid = isCardNumberValid && isExpiryValid(expiry) && isCvvValid;

  const handlePay = (e) => {
    e.preventDefault();
    if (!isFormValid || isSubmitting) return;
    onPay?.();
  };

  return (
    <form className="card-payment-form" onSubmit={handlePay}>
      <div className="input-group">
        <label>Card number</label>
        <div className="card-input-wrapper">
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-number"
            placeholder="1234 5678 9012 3456"
            className={`checkout-input card-number-input ${touched.cardNumber && !isCardNumberValid ? "input-error" : ""}`}
            value={cardNumber}
            onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
            onBlur={() => setTouched((prev) => ({ ...prev, cardNumber: true }))}
          />
          {cardLogo ? (
            <img className="card-logo" src={cardLogo} alt={cardType} />
          ) : null}
        </div>
        {touched.cardNumber && !isCardNumberValid && (
          <span className="error-text">Enter a valid Visa or Mastercard number.</span>
        )}
      </div>

      <div className="card-row">
        <div className="input-group">
          <label>Expiry date</label>
          <input
            type="text"
            inputMode="numeric"
            autoComplete="cc-exp"
            placeholder="MM / YY"
            className={`checkout-input ${touched.expiry && !isExpiryValid(expiry) ? "input-error" : ""}`}
            value={expiry}
            onChange={(e) => setExpiry(formatExpiry(e.target.value))}
            onBlur={() => setTouched((prev) => ({ ...prev, expiry: true }))}
          />
          {touched.expiry && !isExpiryValid(expiry) && (
            <span className="error-text">Enter a valid expiry date.</span>
          )}
        </div>

        <div className="input-group">
          <label>CVV</label>
          <input
            type="password"
            inputMode="numeric"
            autoComplete="cc-csc"
            placeholder="123"
            className={`checkout-input ${touched.cvv && !isCvvValid ? "input-error" : ""}`}
            value={cvv}
            onChange={(e) => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
            onBlur={() => setTouched((prev) => ({ ...prev, cvv: true }))}
          />
          {touched.cvv && !isCvvValid && (
            <span className="error-text">CVV must be 3 digits.</span>
          )}
        </div>
      </div>

      <button className="place-order-btn" type="submit" disabled={!isFormValid || isSubmitting}>
        {isSubmitting ? "Processing..." : "Pay"}
      </button>
    </form>
  );
}
