import { supabase } from "./auth/auth.js";

window.supabase = supabase;

const signupForm = document.getElementById("signup-form");
const signupStatus = document.getElementById("signup-status");
const loginForm = document.getElementById("login-form");
const loginStatus = document.getElementById("login-status");
const forgotPasswordForm = document.getElementById("forgot-password-form");
const forgotPasswordStatus = document.getElementById("forgot-password-status");
const institutionOptions = {
  tavta: [
    "GCT Lahore",
    "GCT Faisalabad",
    "GCT Gujranwala",
    "GCT Multan",
    "GCT Sargodha",
    "GCT Bahawalpur",
    "GCT Sahiwal",
    "GCT Rawalpindi",
    "Other TAVTA Institute",
  ],
  university: [
    "University of Agriculture Faisalabad (UAF)",
    "Government College University Faisalabad (GCUF)",
    "Government College Women University Faisalabad (GCWUF)",
    "National Textile University (NTU)",
    "Faisalabad Medical University (FMU)",
    "NFC Institute of Engineering & Fertilizer Research (NFC-IEFR)",
    "University Medical & Dental College (UMDC) - under TUF",
    "Faisalabad International Medical University (FIMU)",
    "Aziz Fatimah Medical & Dental College (AFMDC)",
    "The University of Faisalabad (TUF)",
    "Riphah International University - Faisalabad Campus",
    "Superior University - Faisalabad Campus",
    "Hamdard University - Faisalabad Campus",
    "Preston University - Faisalabad Campus",
    "FAST-NUCES - Chiniot-Faisalabad Campus",
    "NUML - National University of Modern Languages (FSD Campus)",
    "University of Education - Faisalabad Campus",
    "University of Sargodha - Lyallpur Campus",
    "University of Engineering & Technology (UET) - Faisalabad Campus",
    "Virtual University (VU) - multiple campuses",
    "Allama Iqbal Open University (AIOU) - Regional Campus",
    "Other University or Campus",
  ],
};

function setStatus(element, message, isError = false) {
  if (!element) return;
  element.textContent = message;
  element.className = isError
    ? "text-sm leading-[22px] text-error"
    : "text-sm leading-[22px] text-primary";
  element.classList.remove("hidden");
}

function clearStatus(element) {
  if (!element) return;
  element.textContent = "";
  element.className = "hidden text-sm leading-[22px]";
}

const institutionTypeInput = document.getElementById("institution-type");
const institutionOptionButtons = [...document.querySelectorAll(".institution-option-btn")];
const institutionSelectWrap = document.getElementById("institution-select-wrap");
const institutionSelect = document.getElementById("institution-select");
const collegeNameWrap = document.getElementById("college-name-wrap");
const collegeNameInput = document.getElementById("college-name");

function updateInstitutionUI(selectedType = institutionTypeInput?.value || "") {
  institutionOptionButtons.forEach((button) => {
    button.classList.toggle("is-active", button.dataset.institutionType === selectedType);
  });

  if (!selectedType) {
    institutionSelectWrap?.classList.add("hidden");
    collegeNameWrap?.classList.add("hidden");
    if (institutionSelect) {
      institutionSelect.innerHTML = '<option value="">Select institution *</option>';
    }
    return;
  }

  if (selectedType === "college") {
    institutionSelectWrap?.classList.add("hidden");
    collegeNameWrap?.classList.remove("hidden");
    return;
  }

  collegeNameWrap?.classList.add("hidden");
  institutionSelectWrap?.classList.remove("hidden");
  const options = institutionOptions[selectedType] || [];
  institutionSelect.innerHTML = [
    '<option value="">Select institution *</option>',
    ...options.map((item) => `<option value="${item}">${item}</option>`),
  ].join("");
}

institutionOptionButtons.forEach((button) => {
  button.addEventListener("click", () => {
    if (institutionTypeInput) {
      institutionTypeInput.value = button.dataset.institutionType || "";
    }
    updateInstitutionUI(button.dataset.institutionType || "");
  });
});
updateInstitutionUI();

if (signupForm && signupStatus) {
  const firstNameInput = document.getElementById("first-name");
  const lastNameInput = document.getElementById("last-name");
  const storeNameInput = document.getElementById("store-name");
  const emailInput = document.getElementById("register-email");
  const phoneInput = document.getElementById("register-phone");
  const passwordInput = document.getElementById("register-password");
  const confirmPasswordInput = document.getElementById("confirm-password");
  const submitButton = signupForm.querySelector("button");

  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(signupStatus);

    const firstName = firstNameInput?.value.trim() || "";
    const lastName = lastNameInput?.value.trim() || "";
    const storeName = storeNameInput?.value.trim() || "";
    const email = emailInput?.value.trim() || "";
    const phone = phoneInput?.value.trim() || "";
    const password = passwordInput?.value || "";
    const confirmPassword = confirmPasswordInput?.value || "";
    const institutionType = institutionTypeInput?.value || "";
    const institutionName = institutionType === "college"
      ? collegeNameInput?.value.trim() || ""
      : institutionSelect?.value.trim() || "";

    if (!firstName || !lastName || !storeName) {
      setStatus(signupStatus, "First name, last name, and store name are required.", true);
      return;
    }
    if (!email) {
      setStatus(signupStatus, "Email is required.", true);
      return;
    }
    if (!password) {
      setStatus(signupStatus, "Password is required.", true);
      return;
    }
    if (confirmPassword !== password) {
      setStatus(signupStatus, "Passwords do not match.", true);
      return;
    }
    if (!institutionType) {
      setStatus(signupStatus, "Please choose College, University, or TAVTA.", true);
      return;
    }
    if (!institutionName) {
      setStatus(signupStatus, "Please provide your institution name.", true);
      return;
    }

    if (submitButton) submitButton.disabled = true;
    setStatus(signupStatus, "Creating your account...");

    try {
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            first_name: firstName,
            last_name: lastName,
            store_name: storeName,
            phone_number: phone,
            institution_type: institutionType,
            institution_name: institutionName,
          },
        },
      });

      if (error) {
        setStatus(signupStatus, error.message, true);
        return;
      }

      setStatus(signupStatus, "Check your email to verify your account");
      signupForm.reset();
      if (institutionTypeInput) {
        institutionTypeInput.value = "";
      }
      updateInstitutionUI();
    } catch (error) {
      setStatus(signupStatus, error?.message || "Signup failed. Please try again.", true);
    } finally {
      if (submitButton) submitButton.disabled = false;
    }
  });
}

if (loginForm && loginStatus) {
  const loginEmailInput = document.getElementById("login-email");
  const loginPasswordInput = document.getElementById("login-password");
  const loginSubmitButton = loginForm.querySelector("button");

  loginForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(loginStatus);

    const email = loginEmailInput?.value.trim() || "";
    const password = loginPasswordInput?.value || "";

    if (!email) {
      setStatus(loginStatus, "Email is required.", true);
      return;
    }
    if (!password) {
      setStatus(loginStatus, "Password is required.", true);
      return;
    }

    if (loginSubmitButton) loginSubmitButton.disabled = true;
    setStatus(loginStatus, "Signing you in...");

    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setStatus(loginStatus, error.message, true);
        return;
      }
      setStatus(loginStatus, "Login successful");
      window.location.href = "/profile.html";
    } catch (error) {
      setStatus(loginStatus, error?.message || "Login failed. Please try again.", true);
    } finally {
      if (loginSubmitButton) loginSubmitButton.disabled = false;
    }
  });
}

if (forgotPasswordForm && forgotPasswordStatus) {
  const forgotEmailInput = document.getElementById("forgot-password-email");
  const forgotSubmitButton = forgotPasswordForm.querySelector("button");

  forgotPasswordForm.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(forgotPasswordStatus);

    const email = forgotEmailInput?.value.trim() || "";
    if (!email) {
      setStatus(forgotPasswordStatus, "Email is required.", true);
      return;
    }

    if (forgotSubmitButton) forgotSubmitButton.disabled = true;
    setStatus(forgotPasswordStatus, "Sending your magic link...");

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: new URL("./profile.html", window.location.href).toString(),
        },
      });

      if (error) {
        setStatus(forgotPasswordStatus, error.message, true);
        return;
      }

      setStatus(forgotPasswordStatus, "Check your email for the magic login link.");
      forgotPasswordForm.reset();
    } catch (error) {
      setStatus(forgotPasswordStatus, error?.message || "Unable to send magic link.", true);
    } finally {
      if (forgotSubmitButton) forgotSubmitButton.disabled = false;
    }
  });
}

