class ValidationError extends Error {}

export function validateUsername(username) {
  if (typeof username !== "string") {
    throw new ValidationError("Username is not valid.");
  }
  if (username.length < 3) {
    throw new ValidationError(
      "The username must contain a minimum of 3 characters."
    );
  }
  if (username.length > 20) {
    throw new ValidationError(
      "The username must contain a maximum of 20 characters."
    );
  }
  if (/^\d/.test(username)) {
    throw new ValidationError("The username cannot begin with a number.");
  }
  if (!/^[A-Za-z0-9]+$/.test(username)) {
    throw new ValidationError(
      "The username may only contain letters and numbers."
    );
  }
}

export function validatePassword(password) {
  if (typeof password !== "string") {
    throw new ValidationError("Password is not valid");
  }
  if (password.length > 40) {
    throw new ValidationError(
      "The password must contain a maximum of 40 characters."
    );
  }
  if (password.length < 8) {
    throw new ValidationError(
      "The password must contain a minimum of 8 characters."
    );
  }
}
