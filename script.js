const form = document.getElementById("registrationForm");
const statusMessage = document.getElementById("formStatus");

const fields = {
  firstName: {
    input: document.getElementById("firstName"),
    error: document.getElementById("firstNameError"),
    label: "First name"
  },
  lastName: {
    input: document.getElementById("lastName"),
    error: document.getElementById("lastNameError"),
    label: "Last name"
  },
  email: {
    input: document.getElementById("email"),
    error: document.getElementById("emailError"),
    label: "Email"
  },
  password: {
    input: document.getElementById("password"),
    error: document.getElementById("passwordError"),
    label: "Password"
  }
};

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordMinLength = 6;

function setFieldError(field, message) {
  field.error.textContent = message;
  field.input.setAttribute("aria-invalid", "true");
  field.input.closest(".field-group").classList.add("invalid");
}

function clearFieldError(field) {
  field.error.textContent = "";
  field.input.removeAttribute("aria-invalid");
  field.input.closest(".field-group").classList.remove("invalid");
}

function setStatus(message, type) {
  statusMessage.textContent = message;
  statusMessage.classList.remove("success", "error");
  statusMessage.classList.add(type, "visible");
}

function clearStatus() {
  statusMessage.textContent = "";
  statusMessage.classList.remove("success", "error", "visible");
}

function validateRequired(field, value) {
  if (!value.trim()) {
    setFieldError(field, `${field.label} is required.`);
    return false;
  }
  return true;
}

function validateEmail(value) {
  return emailRegex.test(value.trim());
}

function validatePassword(value) {
  const errors = [];

  if (value.length < 8) {
    errors.push("at least 8 characters");
  }

  if (!/[A-Z]/.test(value)) {
    errors.push("one uppercase letter");
  }

  if (!/[a-z]/.test(value)) {
    errors.push("one lowercase letter");
  }

  if (!/[0-9]/.test(value)) {
    errors.push("one number");
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(value)) {
    errors.push("one special character");
  }

  if (/\s/.test(value)) {
    errors.push("no spaces allowed");
  }

  const commonPasswords = ["12345678", "password", "qwerty123"];
  if (commonPasswords.includes(value.toLowerCase())) {
    errors.push("password is too common");
  }

  return {
    isValid: errors.length === 0,
    message: errors.length
      ? `Password must contain: ${errors.join(", ")}.`
      : ""
  };
}

function validateForm() {
  let isValid = true;
  clearStatus();

  Object.values(fields).forEach(clearFieldError);

  const firstName = fields.firstName.input.value;
  const lastName = fields.lastName.input.value;
  const email = fields.email.input.value;
  const password = fields.password.input.value;

  if (!validateRequired(fields.firstName, firstName)) {
    isValid = false;
  }

  if (!validateRequired(fields.lastName, lastName)) {
    isValid = false;
  }

  if (!validateRequired(fields.email, email)) {
    isValid = false;
  } else if (!validateEmail(email)) {
    setFieldError(fields.email, "Please enter a valid email address.");
    isValid = false;
  }

  if (!validateRequired(fields.password, password)) {
    isValid = false;
  } else {
    const passwordValidation = validatePassword(password);
  
    if (!passwordValidation.isValid) {
      setFieldError(fields.password, passwordValidation.message);
      isValid = false;
    }
  }

  return isValid;
}

form.addEventListener("submit", (event) => {
  event.preventDefault();

  const isValid = validateForm();
  if (!isValid) {
    setStatus("Please fix the errors above and try again.", "error");
    return;
  }

  setStatus("Account created successfully. Welcome aboard!", "success");
  form.reset();
});

Object.values(fields).forEach((field) => {
  field.input.addEventListener("input", () => {
    if (field.error.textContent) {
      clearFieldError(field);
    }
    if (statusMessage.classList.contains("error")) {
      clearStatus();
    }
  });
});
