/**
 * Masks a document number as CPF (11 chars) or CNPJ (14 chars).
 * CPF: 000.000.000-00
 * CNPJ: 00.000.000/0000-00
 */
export const formatDocument = (value: string): string => {
  const digits = value.replace(/\D/g, "");
  
  if (digits.length <= 11) {
    // CPF Mask
    return digits
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  } 
  
  // CNPJ Mask
  return digits
    .slice(0, 14) // Limit to 14 digits
    .replace(/^(\d{2})(\d)/, "$1.$2")
    .replace(/^(\d{2})\.(\d{3})(\d)/, "$1.$2.$3")
    .replace(/\.(\d{3})(\d)/, ".$1/$2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Masks a phone number as (00) 0000-0000 or (00) 00000-0000
 */
export const formatPhone = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 11);
  
  if (digits.length > 10) {
    // Mobile: (11) 91234-5678
    return digits
      .replace(/^(\d{2})(\d)/, "($1) $2")
      .replace(/(\d{5})(\d)/, "$1-$2");
  }
  
  // Landline: (11) 1234-5678
  return digits
    .replace(/^(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{4})(\d)/, "$1-$2");
};

/**
 * Masks a credit card number in groups of 4 digits.
 * 0000 0000 0000 0000
 */
export const formatCardNumber = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 16);
  return digits.replace(/(\d{4})(?=\d)/g, "$1 ");
};

/**
 * Masks an expiration date as MM/YY
 */
export const formatCardExpiry = (value: string): string => {
  const digits = value.replace(/\D/g, "").slice(0, 4);
  return digits.replace(/(\d{2})(\d)/, "$1/$2");
};

/**
 * Removes all non-numeric characters from a string.
 */
export const unmask = (value: string): string => {
  return value.replace(/\D/g, "");
};
