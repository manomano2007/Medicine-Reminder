import { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Register.css";

const API_URL = "https://medicine-reminder-ke6o.onrender.com";

function Register() {
  const navigate = useNavigate();

  // "details" -> filling the registration form
  // "otp"     -> entering the code sent to their email
  const [step, setStep] = useState("details");

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    mobile: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const [otp, setOtp] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const startResendCooldown = () => {
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  };

  // ==========================================
  // Step 1: validate details, ask backend to
  // email a real OTP to this address
  // ==========================================
  const handleSendOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (formData.password !== formData.confirmPassword) {
      alert("Passwords do not match!");
      return;
    }

    setLoading(true);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 20000);

    try {
      const response = await fetch(`${API_URL}/register/send-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: formData.firstName,
          lastName: formData.lastName,
          mobile: formData.mobile,
          email: formData.email,
          password: formData.password,
        }),
        signal: controller.signal,
      });

      const data = await response.json();

      if (response.ok) {
        setStep("otp");
        startResendCooldown();
      } else {
        setError(data.message || "Could not send OTP");
      }
    } catch (err) {
      console.log("Send OTP Error:", err);
      if (err.name === "AbortError") {
        setError(
          "Server is taking too long to respond (it may be waking up). Please try again in a moment."
        );
      } else {
        setError("Cannot connect to backend");
      }
    } finally {
      clearTimeout(timeoutId);
      setLoading(false);
    }
  };

  // ==========================================
  // Step 2: verify the OTP - the account is
  // only created (and "success" shown) here
  // ==========================================
  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");

    if (!otp.trim()) {
      setError("Please enter the OTP sent to your email");
      return;
    }

    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/verify-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: formData.email,
          otp,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.removeItem("userId");
        alert("Registration successful!");
        navigate("/login");
      } else {
        setError(data.message || "OTP verification failed");
      }
    } catch (err) {
      console.log("Verify OTP Error:", err);
      setError("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;

    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${API_URL}/register/resend-otp`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: formData.email }),
      });

      const data = await response.json();

      if (response.ok) {
        startResendCooldown();
      } else {
        setError(data.message || "Could not resend OTP");
      }
    } catch (err) {
      console.log("Resend OTP Error:", err);
      setError("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="register-card">
        <h1>💊 MedReminder</h1>

        {step === "details" ? (
          <>
            <h2>Create Account</h2>
            <p>Register to manage your medicines</p>

            <form onSubmit={handleSendOtp}>
              <input
                type="text"
                name="firstName"
                placeholder="First Name"
                value={formData.firstName}
                onChange={handleChange}
                required
              />

              <input
                type="text"
                name="lastName"
                placeholder="Last Name"
                value={formData.lastName}
                onChange={handleChange}
                required
              />

              <input
                type="tel"
                name="mobile"
                placeholder="Mobile Number"
                value={formData.mobile}
                onChange={handleChange}
                required
              />

              <input
                type="email"
                name="email"
                placeholder="Email"
                value={formData.email}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="password"
                placeholder="Password"
                value={formData.password}
                onChange={handleChange}
                required
              />

              <input
                type="password"
                name="confirmPassword"
                placeholder="Confirm Password"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
              />

              <label className="terms">
                <input type="checkbox" required />
                I agree to the Terms & Conditions
              </label>

              {error && (
                <p style={{ color: "#dc2626", fontSize: 14, marginTop: 6 }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Sending OTP..." : "Send OTP"}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2>Verify Your Email</h2>
            <p>
              We've sent a 6-digit code to <strong>{formData.email}</strong>
            </p>

            <form onSubmit={handleVerifyOtp}>
              <input
                type="text"
                inputMode="numeric"
                maxLength={6}
                placeholder="Enter OTP"
                value={otp}
                onChange={(e) =>
                  setOtp(e.target.value.replace(/[^0-9]/g, ""))
                }
                style={{ textAlign: "center", letterSpacing: "6px", fontSize: "18px" }}
                required
              />

              {error && (
                <p style={{ color: "#dc2626", fontSize: 14, marginTop: 6 }}>
                  {error}
                </p>
              )}

              <button type="submit" disabled={loading}>
                {loading ? "Verifying..." : "Verify & Register"}
              </button>

              <button
                type="button"
                onClick={handleResendOtp}
                disabled={loading || resendCooldown > 0}
                style={{
                  background: "transparent",
                  color: "#2563eb",
                  border: "none",
                  marginTop: 10,
                  cursor: resendCooldown > 0 ? "default" : "pointer",
                }}
              >
                {resendCooldown > 0
                  ? `Resend OTP in ${resendCooldown}s`
                  : "Resend OTP"}
              </button>

              <button
                type="button"
                onClick={() => {
                  setStep("details");
                  setOtp("");
                  setError("");
                }}
                style={{
                  background: "transparent",
                  color: "#6b7280",
                  border: "none",
                  marginTop: 4,
                }}
              >
                ← Back to edit details
              </button>
            </form>
          </>
        )}
      </div>
    </div>
  );
}

export default Register;
