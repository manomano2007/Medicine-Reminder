import { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const API_URL = "https://medicine-reminder-ke6o.onrender.com";

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch(`${API_URL}/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Login failed");
        return;
      }

      if (!data.user || !data.user.id) {
        alert("Login successful, but User ID was not received.");
        console.log("Login response:", data);
        return;
      }

      // IMPORTANT
      localStorage.setItem("userId", String(data.user.id));

      // Save user details also
      localStorage.setItem(
        "user",
        JSON.stringify(data.user)
      );

      console.log(
        "Logged in user:",
        data.user
      );

      console.log(
        "Saved userId:",
        localStorage.getItem("userId")
      );

      alert("Login successful!");

      navigate("/dashboard");

    } catch (error) {
      console.log("Login Error:", error);
      alert("Cannot connect to backend");
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1>💊 MedReminder</h1>

        <h2>Welcome Back!</h2>

        <p>
          Login to manage your medicines
        </p>

        <form onSubmit={handleLogin}>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) =>
              setEmail(e.target.value)
            }
            style={styles.input}
            required
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) =>
              setPassword(e.target.value)
            }
            style={styles.input}
            required
          />

          <button
            type="submit"
            style={styles.button}
          >
            Login
          </button>

        </form>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eff6ff",
  },

  card: {
    width: "400px",
    padding: "40px",
    background: "white",
    borderRadius: "15px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.1)",
    textAlign: "center",
  },

  input: {
    width: "100%",
    padding: "13px",
    margin: "10px 0",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  button: {
    width: "100%",
    padding: "13px",
    marginTop: "15px",
    border: "none",
    borderRadius: "8px",
    background: "#2563eb",
    color: "white",
    fontSize: "16px",
    cursor: "pointer",
  },
};

export default Login;