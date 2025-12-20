function stripNonDigits(value) {
  return String(value || "").replace(/\D/g, "");
}

function detectCardType(cardNumber) {
  const digits = stripNonDigits(cardNumber);
  if (!digits) return "unknown";

  if (digits.startsWith("4")) return "visa";

  const firstTwo = Number(digits.slice(0, 2));
  if (firstTwo >= 51 && firstTwo <= 55) return "mastercard";

  const firstFour = Number(digits.slice(0, 4));
  if (firstFour >= 2221 && firstFour <= 2720) return "mastercard";

  return "unknown";
}

function isValidCardNumber(cardNumber) {
  const digits = stripNonDigits(cardNumber);
  if (!digits) return false;

  let sum = 0;
  let shouldDouble = false;

  for (let i = digits.length - 1; i >= 0; i -= 1) {
    let digit = Number(digits[i]);
    if (shouldDouble) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    shouldDouble = !shouldDouble;
  }

  return sum % 10 === 0;
}

export { detectCardType, isValidCardNumber };
