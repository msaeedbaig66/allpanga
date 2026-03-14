const institutionOptions = {
  college: [
    "Government College Faisalabad",
    "Government College for Women Faisalabad",
    "Punjab Group of Colleges Faisalabad",
    "Superior College Faisalabad",
    "Chenab College Faisalabad",
    "KIPS College Faisalabad",
    "Aspire College Faisalabad",
    "Divisional Public School and College Faisalabad",
    "Other College",
  ],
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

let supabaseClientPromise;

function getSupabase() {
  if (!supabaseClientPromise) {
    supabaseClientPromise = import("./auth/auth.js").then((module) => module.supabase);
  }

  return supabaseClientPromise;
}

function setStatus(node, message, isError = false) {
  if (!node) return;
  node.textContent = message;
  node.className = isError ? "status error show" : "status success show";
}

function clearStatus(node) {
  if (!node) return;
  node.textContent = "";
  node.className = "status";
}

function setupLoginPage() {
  const form = document.getElementById("login-form");
  const status = document.getElementById("login-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(status);
    const email = document.getElementById("login-email")?.value.trim() || "";
    const password = document.getElementById("login-password")?.value || "";
    const button = form.querySelector("button[type='submit']");

    if (!email) return setStatus(status, "Email is required.", true);
    if (!password) return setStatus(status, "Password is required.", true);

    if (button) button.disabled = true;
    setStatus(status, "Signing you in...");

    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return setStatus(status, error.message, true);
      setStatus(status, "Login successful");
      window.location.href = "./profile.html";
    } catch (error) {
      setStatus(status, error?.message || "Login failed. Please try again.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function setupForgotPage() {
  const form = document.getElementById("forgot-form");
  const status = document.getElementById("forgot-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(status);
    const email = document.getElementById("forgot-email")?.value.trim() || "";
    const button = form.querySelector("button[type='submit']");

    if (!email) return setStatus(status, "Email is required.", true);

    if (button) button.disabled = true;
    setStatus(status, "Sending your magic link...");

    try {
      const supabase = await getSupabase();
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: new URL("./reset-password.html", window.location.href).toString(),
        },
      });
      if (error) return setStatus(status, error.message, true);
      setStatus(status, "Check your email for the password reset link.");
      form.reset();
    } catch (error) {
      setStatus(status, error?.message || "Unable to send magic link.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function setupSignupPage() {
  const form = document.getElementById("signup-form");
  const status = document.getElementById("signup-status");
  if (!form || !status) return;

  const institutionTypeInput = document.getElementById("institution-type");
  const institutionOptionButtons = [...document.querySelectorAll(".institution-option-btn")];
  const institutionSelectWrap = document.getElementById("institution-select-wrap");
  const institutionSelect = document.getElementById("institution-select");

  function updateInstitutionUI(selectedType = institutionTypeInput?.value || "") {
    institutionOptionButtons.forEach((button) => {
      const isActive = button.dataset.institutionType === selectedType;
      button.classList.toggle("is-active", isActive);
      button.setAttribute("aria-pressed", isActive ? "true" : "false");
    });

    if (!selectedType) {
      if (institutionSelectWrap) institutionSelectWrap.classList.remove("hidden");
      if (institutionSelect) {
        institutionSelect.disabled = true;
        institutionSelect.innerHTML = '<option value="">Choose College, University, or TAVTA first</option>';
      }
      return;
    }

    const options = institutionOptions[selectedType] || [];
    if (institutionSelectWrap) institutionSelectWrap.classList.remove("hidden");
    if (institutionSelect) {
      institutionSelect.disabled = false;
      institutionSelect.innerHTML = ['<option value="">Select institution *</option>', ...options.map((item) => `<option value="${item}">${item}</option>`)].join("");
    }
  }

  institutionOptionButtons.forEach((button) => {
    button.addEventListener("click", (event) => {
      event.preventDefault();
      if (institutionTypeInput) institutionTypeInput.value = button.dataset.institutionType || "";
      updateInstitutionUI(button.dataset.institutionType || "");
    });
  });
  updateInstitutionUI();

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(status);
    const firstName = document.getElementById("first-name")?.value.trim() || "";
    const lastName = document.getElementById("last-name")?.value.trim() || "";
    const storeName = document.getElementById("store-name")?.value.trim() || "";
    const email = document.getElementById("signup-email")?.value.trim() || "";
    const phone = document.getElementById("signup-phone")?.value.trim() || "";
    const password = document.getElementById("signup-password")?.value || "";
    const confirmPassword = document.getElementById("confirm-password")?.value || "";
    const institutionType = institutionTypeInput?.value || "";
    const institutionName = institutionSelect?.value.trim() || "";
    const button = form.querySelector("button[type='submit']");

    if (!firstName || !lastName || !storeName) return setStatus(status, "First name, last name, and store name are required.", true);
    if (!email) return setStatus(status, "Email is required.", true);
    if (!password) return setStatus(status, "Password is required.", true);
    if (confirmPassword !== password) return setStatus(status, "Passwords do not match.", true);
    if (!institutionType) return setStatus(status, "Please choose College, University, or TAVTA.", true);
    if (!institutionName) return setStatus(status, "Please provide your institution name.", true);

    if (button) button.disabled = true;
    setStatus(status, "Creating your account...");

    try {
      const supabase = await getSupabase();
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: new URL("./login.html", window.location.href).toString(),
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

      const identities = data?.user?.identities;
      const isObfuscatedExistingUser =
        !error &&
        data?.user &&
        Array.isArray(identities) &&
        identities.length === 0;

      if (error || isObfuscatedExistingUser) {
        return setStatus(
          status,
          "This email is already registered. Please log in or use Forgot Password.",
          true
        );
      }

      setStatus(status, "Check your email to verify your account");
      form.reset();
      if (institutionTypeInput) institutionTypeInput.value = "";
      updateInstitutionUI();
    } catch (error) {
      setStatus(status, error?.message || "Signup failed. Please try again.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

function setupResetPasswordPage() {
  const form = document.getElementById("reset-password-form");
  const status = document.getElementById("reset-password-status");
  if (!form || !status) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearStatus(status);

    const password = document.getElementById("reset-password")?.value || "";
    const confirmPassword = document.getElementById("reset-confirm-password")?.value || "";
    const button = form.querySelector("button[type='submit']");

    if (!password) return setStatus(status, "New password is required.", true);
    if (password.length < 8) return setStatus(status, "Password must be at least 8 characters.", true);
    if (password !== confirmPassword) return setStatus(status, "Passwords do not match.", true);

    if (button) button.disabled = true;
    setStatus(status, "Updating your password...");

    try {
      const supabase = await getSupabase();
      const { data: sessionData, error: sessionError } = await supabase.auth.getSession();
      if (sessionError) return setStatus(status, sessionError.message, true);
      if (!sessionData.session) return setStatus(status, "This reset link is missing or expired. Request a new one.", true);

      const { error } = await supabase.auth.updateUser({ password });
      if (error) return setStatus(status, error.message, true);

      setStatus(status, "Password updated. Redirecting to login...");
      form.reset();
      window.setTimeout(() => {
        window.location.href = "./login.html";
      }, 1200);
    } catch (error) {
      setStatus(status, error?.message || "Unable to update password.", true);
    } finally {
      if (button) button.disabled = false;
    }
  });
}

setupLoginPage();
setupSignupPage();
setupForgotPage();
setupResetPasswordPage();
