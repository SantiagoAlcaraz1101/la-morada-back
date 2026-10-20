function passesLuhn(number) {
  let sum = 0;
  let doubleDigit = false;

  for (let index = number.length - 1; index >= 0; index -= 1) {
    let digit = Number(number[index]);
    if (doubleDigit) {
      digit *= 2;
      if (digit > 9) digit -= 9;
    }
    sum += digit;
    doubleDigit = !doubleDigit;
  }

  return sum % 10 === 0;
}

function isFutureExpiration(value) {
  const [month, year] = value.split("/").map(Number);
  const expiration = new Date(2000 + year, month, 1);
  return expiration > new Date();
}

function validatePayment(data) {
  const number = String(data.card_number || "").replace(/\s/g, "");
  if (!/^[0-9]{13,19}$/.test(number) || !passesLuhn(number)) {
    throw new Error("INVALID CARD NUMBER");
  }

  if (!data.card_name || typeof data.card_name !== "string" || data.card_name.trim().length < 2) {
    throw new Error("INVALID CARD NAME");
  }

  if (!/^(0[1-9]|1[0-2])\/\d{2}$/.test(String(data.expiration_date)) ||
      !isFutureExpiration(data.expiration_date)) {
    throw new Error("INVALID EXPIRATION DATE");
  }

  if (!/^[0-9]{3,4}$/.test(String(data.cvv))) throw new Error("INVALID CVV");
}

module.exports = { validatePayment, passesLuhn, isFutureExpiration };