export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const PASSWORD_REGEX = /^(?=.*\d)(?=.*[^A-Za-z0-9]).{6,}$/;

export const PASSWORD_RULE_TEXT =
  "Password must be at least 6 characters long and include 1 number and 1 special character.";

export const getPasswordValidationMessage = (password) => {
  if (!password) {
    return "";
  }

  if (password.length < 6) {
    return "Password must be at least 6 characters long.";
  }

  if (!/\d/.test(password)) {
    return "Password must include at least 1 number.";
  }

  if (!/[^A-Za-z0-9]/.test(password)) {
    return "Password must include at least 1 special character.";
  }

  return "";
};
