import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

import {
  initializeNotifications,
  scheduleMedicineReminder,
} from "./notifications";

function AddMedicine() {
  const navigate = useNavigate();

  const [medicineName, setMedicineName] = useState("");
  const [dosage, setDosage] = useState("");
  const [quantity, setQuantity] = useState("");
  const [time, setTime] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const API_URL =
    "https://medicine-reminder-ke6o.onrender.com";

  // ==========================================
  // Android Notification Initialize
  // ==========================================

  useEffect(() => {
    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("Please login first");
      navigate("/login");
      return;
    }

    initializeNotifications();

  }, [navigate]);


  // ==========================================
  // Add Medicine
  // ==========================================

  const handleSubmit = async (e) => {
    e.preventDefault();

    const userId = localStorage.getItem("userId");

    if (!userId) {
      alert("User session not found. Please login again.");
      navigate("/login");
      return;
    }

    if (!medicineName.trim()) {
      alert("Please enter medicine name");
      return;
    }

    if (quantity === "" || Number(quantity) < 0) {
      alert("Please enter a valid quantity");
      return;
    }

    if (!time) {
      alert("Please select reminder time");
      return;
    }

    if (
      startDate &&
      endDate &&
      new Date(endDate) < new Date(startDate)
    ) {
      alert("End date cannot be before start date");
      return;
    }

    setSubmitting(true);

    try {

      // Save medicine in MongoDB
      const response = await fetch(
        `${API_URL}/medicines`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json",
          },

          body: JSON.stringify({
            userId: userId,
            medicineName: medicineName.trim(),
            dosage: dosage.trim(),
            quantity: Number(quantity),
            time: time,
            startDate: startDate,
            endDate: endDate,
          }),
        }
      );

      const data = await response.json();

      console.log(
        "Add medicine response:",
        data
      );


      // ==========================================
      // Medicine Saved Successfully
      // ==========================================

      if (response.ok) {

        console.log(
          "Medicine saved:",
          data.medicine
        );


        // ==========================================
        // 🔔 Android Alarm Schedule
        // ==========================================

        await scheduleMedicineReminder(
          data.medicine
        );


        alert(
          `💊 Medicine added successfully!\n\n` +
          `${medicineName}\n` +
          `⏰ Reminder: ${time}`
        );


        setMedicineName("");
        setDosage("");
        setQuantity("");
        setTime("");
        setStartDate("");
        setEndDate("");

        navigate("/dashboard");

      } else {

        alert(
          data.message ||
          "Failed to add medicine"
        );

      }

    } catch (error) {

      console.log(
        "Add Medicine Error:",
        error
      );

      alert(
        "Cannot connect to backend."
      );

    } finally {
      setSubmitting(false);
    }
  };


  // ==========================================
  // UI
  // ==========================================

  return (
    <div style={styles.page}>

      <div style={styles.card}>

        <button
          type="button"
          style={styles.backLink}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

        <h1>💊 Add Medicine</h1>

        <p style={styles.subtitle}>
          Already have this medicine at home, or just
          picked it up? Add it here either way.
        </p>


        <form onSubmit={handleSubmit}>

          <label style={styles.label}>
            Medicine Name
          </label>

          <input
            type="text"
            placeholder="e.g. Paracetamol"
            value={medicineName}
            onChange={(e) =>
              setMedicineName(e.target.value)
            }
            style={styles.input}
            required
          />

          <label style={styles.label}>
            Dosage
          </label>

          <input
            type="text"
            placeholder="e.g. 500mg, 1 tablet"
            value={dosage}
            onChange={(e) =>
              setDosage(e.target.value)
            }
            style={styles.input}
          />

          <label style={styles.label}>
            Quantity you currently have
          </label>

          <input
            type="number"
            min="0"
            placeholder="e.g. 10"
            value={quantity}
            onChange={(e) =>
              setQuantity(e.target.value)
            }
            style={styles.input}
            required
          />


          <label style={styles.label}>
            ⏰ Reminder Time
          </label>


          <input
            type="time"
            value={time}
            onChange={(e) =>
              setTime(e.target.value)
            }
            style={styles.input}
            required
          />

          <div style={styles.row}>

            <div style={styles.rowItem}>
              <label style={styles.label}>
                Start Date
              </label>

              <input
                type="date"
                value={startDate}
                onChange={(e) =>
                  setStartDate(e.target.value)
                }
                style={styles.input}
              />
            </div>

            <div style={styles.rowItem}>
              <label style={styles.label}>
                End Date
              </label>

              <input
                type="date"
                value={endDate}
                onChange={(e) =>
                  setEndDate(e.target.value)
                }
                style={styles.input}
              />
            </div>

          </div>


          <div style={styles.info}>
            🔔 Daily reminder set for{" "}
            {time || "--:--"}
          </div>


          <button
            type="submit"
            style={styles.button}
            disabled={submitting}
          >
            {submitting ? "Saving..." : "Add Medicine"}
          </button>

        </form>

      </div>

    </div>
  );
}


// ==========================================
// Styles
// ==========================================

const styles = {

  page: {
    minHeight: "100vh",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    background: "#eff6ff",
    padding: "30px 16px",
  },

  card: {
    width: "460px",
    maxWidth: "100%",
    padding: "40px",
    background: "white",
    borderRadius: "15px",
    boxShadow:
      "0 10px 30px rgba(0,0,0,0.1)",
    boxSizing: "border-box",
  },

  backLink: {
    border: "none",
    background: "transparent",
    color: "#2563eb",
    fontSize: "14px",
    cursor: "pointer",
    padding: 0,
    marginBottom: "10px",
  },

  subtitle: {
    color: "#6b7280",
    fontSize: "14px",
    marginTop: "-4px",
  },

  label: {
    display: "block",
    marginTop: "10px",
    marginBottom: "5px",
    color: "#374151",
    fontSize: "14px",
    fontWeight: 600,
  },

  input: {
    width: "100%",
    padding: "13px",
    margin: "0 0 10px 0",
    border:
      "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  row: {
    display: "flex",
    gap: "12px",
  },

  rowItem: {
    flex: 1,
    minWidth: 0,
  },

  info: {
    marginTop: "6px",
    padding: "12px",
    background: "#eff6ff",
    color: "#2563eb",
    borderRadius: "8px",
    fontSize: "14px",
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

export default AddMedicine;
