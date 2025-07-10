// src/utils/validations.js

/**
 * Validates the format of an email address.
 * Ensures the email has valid characters, "@" symbol, and a domain.
 * 
 * @param {string} email - The email address to validate.
 * @returns {boolean} - Returns true if the email format is valid, false otherwise.
 */
export const validateEmail = (email) => {
  const emailPattern = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailPattern.test(email);
};

/**
 * Validates the format of a mobile number.
 * Ensures it starts with '0' followed by a non-zero digit and has 10 digits in total.
 * 
 * @param {string} mobile - The mobile number to validate.
 * @returns {boolean} - Returns true if the mobile number format is valid, false otherwise.
 */
export const validateMobile = (mobile) => {
  const mobilePattern = /^0[1-9]\d{8}$/;
  return mobilePattern.test(mobile);
};

/**
 * Validates the format of a Sri Lankan National Identity Card (NIC) number.
 * Accepts old NIC format (9 digits followed by 'V' or 'X') or new NIC format (12 digits).
 * 
 * @param {string} nic - The NIC number to validate.
 * @returns {boolean} - Returns true if the NIC format is valid, false otherwise.
 */
export const validateNIC = (nic) => {
  const nicPattern = /^(?:\d{9}[VX]|\d{12})$/;
  return nicPattern.test(nic);
};


