import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

function Reorder() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [selectedMedicine, setSelectedMedicine] = useState("");
  const [quantity, setQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch("http://localhost:5000/medicines")
      .then((response) => response.json())
      .then((data) => {
        setMedicines(data);
      })
      .catch((error) => {
        console.log("Medicine Error:", error);
      });
  }, []);

  const handleOrder = async () => {
    if (!selectedMedicine) {
      alert("Please select a medicine");
      return;
    }

    if (!quantity || quantity < 1) {
      alert("Please select quantity");
      return;
    }

    if (!paymentMethod) {
      alert("Please select a payment method");
      return;
    }

    const medicine = medicines.find(
      (item) => item._id === selectedMedicine
    );

    try {
      setLoading(true);

      const response = await fetch(
        "http://localhost:5000/orders",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            medicineName: medicine.medicineName,
            quantity: Number(quantity),
            paymentMethod: paymentMethod,
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        alert("Order placed successfully! 🎉");
        navigate("/dashboard");
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.log("Order Error:", error);
      alert("Cannot connect to backend");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>

        <h1>🛒 Reorder Medicine</h1>

        <p style={styles.subtitle}>
          Select your medicine, quantity and payment method.
        </p>

        {/* Medicine */}
        <label style={styles.label}>
          Select Medicine
        </label>

        <select
          style={styles.input}
          value={selectedMedicine}
          onChange={(e) => {
            setSelectedMedicine(e.target.value);
            setQuantity(1);
          }}
        >
          <option value="">
            -- Select Medicine --
          </option>

          {medicines.map((medicine) => (
            <option
              key={medicine._id}
              value={medicine._id}
            >
              {medicine.medicineName}
            </option>
          ))}
        </select>

        {/* Quantity */}
        <label style={styles.label}>
          Quantity
        </label>

        <select
          style={styles.input}
          value={quantity}
          onChange={(e) =>
            setQuantity(Number(e.target.value))
          }
        >
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
          <option value="5">5</option>
          <option value="10">10</option>
        </select>

        {/* Payment */}
        <label style={styles.label}>
          Payment Method
        </label>

        <select
          style={styles.input}
          value={paymentMethod}
          onChange={(e) =>
            setPaymentMethod(e.target.value)
          }
        >
          <option value="">
            -- Select Payment Method --
          </option>

          <option value="Cash on Delivery">
            💵 Cash on Delivery
          </option>

          <option value="UPI">
            📱 UPI
          </option>

          <option value="Card">
            💳 Credit / Debit Card
          </option>
        </select>

        {/* Buttons */}
        <button
          style={styles.orderButton}
          onClick={handleOrder}
          disabled={loading}
        >
          {loading
            ? "Processing..."
            : "Confirm Order"}
        </button>

        <button
          style={styles.backButton}
          onClick={() => navigate("/dashboard")}
        >
          ← Back to Dashboard
        </button>

      </div>
    </div>
  );
}

const styles = {
  page: {
    minHeight: "100vh",
    background: "#f5f9ff",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    padding: "30px",
  },

  card: {
    width: "450px",
    background: "white",
    padding: "35px",
    borderRadius: "18px",
    boxShadow: "0 5px 25px rgba(0,0,0,0.1)",
  },

  subtitle: {
    color: "#6b7280",
    marginBottom: "25px",
  },

  label: {
    display: "block",
    marginTop: "18px",
    marginBottom: "8px",
    fontWeight: "bold",
  },

  input: {
    width: "100%",
    padding: "12px",
    border: "1px solid #d1d5db",
    borderRadius: "8px",
    fontSize: "15px",
    boxSizing: "border-box",
  },

  orderButton: {
    width: "100%",
    marginTop: "25px",
    padding: "13px",
    border: "none",
    borderRadius: "8px",
    background: "#16a34a",
    color: "white",
    fontSize: "16px",
    fontWeight: "bold",
    cursor: "pointer",
  },

  backButton: {
    width: "100%",
    marginTop: "12px",
    padding: "12px",
    border: "none",
    borderRadius: "8px",
    background: "#e5e7eb",
    color: "#111827",
    fontSize: "15px",
    cursor: "pointer",
  },
};

export default Reorder;