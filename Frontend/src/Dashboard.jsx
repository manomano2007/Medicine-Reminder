import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import "./Dashboard.css";

function Dashboard() {
  const navigate = useNavigate();

  const [medicines, setMedicines] = useState([]);
  const [orders, setOrders] = useState([]);
  const [takenLogs, setTakenLogs] = useState([]);
  const [confirmingId, setConfirmingId] = useState(null);

  const [selectedMedicine, setSelectedMedicine] = useState(null);
  const [orderQuantity, setOrderQuantity] = useState(1);
  const [paymentMethod, setPaymentMethod] = useState("");

  // Medicine currently ringing - drives the on-screen alarm popup
  const [activeAlarm, setActiveAlarm] = useState(null);
  const [clearingHistory, setClearingHistory] = useState(false);

  const PRICE_PER_UNIT = 10;

  const API_URL = "https://medicine-reminder-ke6o.onrender.com";

  // Prevent same reminder from playing repeatedly
  const playedReminders = useRef(new Set());

  const storedUser = (() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  })();

  const todayStr = () => new Date().toISOString().split("T")[0];

  // ==========================================
  // Load Razorpay Checkout Script
  // ==========================================

  useEffect(() => {
    const script = document.createElement("script");
    script.src = "https://checkout.razorpay.com/v1/checkout.js";
    script.async = true;
    document.body.appendChild(script);

    return () => {
      if (document.body.contains(script)) {
        document.body.removeChild(script);
      }
    };
  }, []);

  // ==========================================
  // Request Notification Permission
  // ==========================================

  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "default") {
        Notification.requestPermission().catch((error) => {
          console.log("Notification Permission Error:", error);
        });
      }
    }
  }, []);

  // ==========================================
  // Data loaders - always scoped to the
  // logged-in user's ID
  // ==========================================

  const loadMedicines = async () => {
    try {
      const userId = localStorage.getItem("userId");

      if (!userId) {
        navigate("/login");
        return;
      }

      const response = await fetch(
        `${API_URL}/medicines?userId=${userId}`
      );

      const data = await response.json();

      if (response.ok) {
        setMedicines(data);
      } else {
        console.log(data.message);
      }
    } catch (error) {
      console.log("Medicine Error:", error);
    }
  };

  const loadOrders = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${API_URL}/orders?userId=${userId}`
      );

      const data = await response.json();
      setOrders(data);
    } catch (error) {
      console.log("Orders Error:", error);
    }
  };

  const loadTakenLogs = async () => {
    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${API_URL}/medicines/taken?userId=${userId}&date=${todayStr()}`
      );

      const data = await response.json();

      if (response.ok) {
        setTakenLogs(data);
      }
    } catch (error) {
      console.log("Taken Logs Error:", error);
    }
  };

  useEffect(() => {
    loadMedicines();
    loadOrders();
    loadTakenLogs();
  }, []);

  // ==========================================
  // Medicine Reminder (alarm/notification only -
  // never touches stock by itself)
  // ==========================================

  useEffect(() => {
    let reminderInterval;

    const checkReminder = async () => {
      try {
        const userId = localStorage.getItem("userId");

        const response = await fetch(
          `${API_URL}/medicines?userId=${userId}`
        );
        const data = await response.json();

        const now = new Date();
        const currentHours = String(now.getHours()).padStart(2, "0");
        const currentMinutes = String(now.getMinutes()).padStart(2, "0");
        const currentTime = `${currentHours}:${currentMinutes}`;
        const today = todayStr();

        data.forEach((medicine) => {
          const reminderId = `${medicine._id}-${today}-${currentTime}`;

          if (
            medicine.time === currentTime &&
            !playedReminders.current.has(reminderId)
          ) {
            playedReminders.current.add(reminderId);

            const alarm = new Audio("/alarm.mp3");
            alarm.volume = 1.0;
            alarm.currentTime = 0;
            alarm.play().catch((error) => {
              console.log("🔇 Browser blocked automatic audio:", error);
            });

            if (
              "Notification" in window &&
              Notification.permission === "granted"
            ) {
              new Notification("💊 Medicine Reminder", {
                body: `Time to take ${medicine.medicineName}`,
                icon: "/vite.svg",
              });
            }

            // On-screen popup - always shows, regardless of whether
            // browser notification permission was granted.
            setActiveAlarm(medicine);

            console.log(`🔔 Reminder: ${medicine.medicineName}`);
          }
        });
      } catch (error) {
        console.log("Reminder Error:", error);
      }
    };

    checkReminder();
    reminderInterval = setInterval(checkReminder, 10000);

    return () => clearInterval(reminderInterval);
  }, []);

  // ==========================================
  // Confirm Taken - the ONLY place quantity
  // is decremented
  // ==========================================

  const confirmTaken = async (medicine) => {
    const userId = localStorage.getItem("userId");

    if (medicine.quantity <= 0) {
      alert("No tablets remaining. Please reorder.");
      return;
    }

    setConfirmingId(medicine._id);

    try {
      const response = await fetch(
        `${API_URL}/medicines/${medicine._id}/take`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            userId,
            date: todayStr(),
          }),
        }
      );

      const data = await response.json();

      if (response.ok) {
        await loadMedicines();
        await loadTakenLogs();

        setActiveAlarm((current) =>
          current && current._id === medicine._id ? null : current
        );
      } else {
        alert(data.message || "Could not confirm dose");
      }
    } catch (error) {
      console.log("Confirm Taken Error:", error);
      alert("Cannot connect to backend.");
    } finally {
      setConfirmingId(null);
    }
  };

  // ==========================================
  // Clear Order History (manual)
  // ==========================================

  const clearOrderHistory = async () => {
    if (orders.length === 0) return;

    const confirmed = window.confirm(
      "Clear your entire order history? This cannot be undone."
    );

    if (!confirmed) return;

    setClearingHistory(true);

    try {
      const userId = localStorage.getItem("userId");

      const response = await fetch(
        `${API_URL}/orders/clear?userId=${userId}`,
        { method: "DELETE" }
      );

      const data = await response.json();

      if (response.ok) {
        setOrders([]);
      } else {
        alert(data.message || "Could not clear order history");
      }
    } catch (error) {
      console.log("Clear History Error:", error);
      alert("Cannot connect to backend.");
    } finally {
      setClearingHistory(false);
    }
  };

  // ==========================================
  // Razorpay Payment
  // ==========================================

  const startPayment = async () => {
    if (!selectedMedicine) {
      alert("Please select a medicine");
      return;
    }

    if (!orderQuantity || orderQuantity < 1) {
      alert("Please enter valid quantity");
      return;
    }

    const totalPrice = orderQuantity * PRICE_PER_UNIT;

    try {
      const response = await fetch(`${API_URL}/create-payment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          medicineName: selectedMedicine.medicineName,
          quantity: orderQuantity,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        alert(data.message || "Unable to create payment");
        return;
      }

      if (!window.Razorpay) {
        alert("Razorpay is still loading. Please try again.");
        return;
      }

      const options = {
        key: data.key,
        amount: data.amountInPaise,
        currency: "INR",
        name: "MedReminder",
        description: `${selectedMedicine.medicineName} - ${orderQuantity} units`,
        order_id: data.orderId,

        handler: async function (paymentResponse) {
          try {
            const verifyResponse = await fetch(`${API_URL}/verify-payment`, {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                razorpay_order_id: paymentResponse.razorpay_order_id,
                razorpay_payment_id: paymentResponse.razorpay_payment_id,
                razorpay_signature: paymentResponse.razorpay_signature,
                userId: localStorage.getItem("userId"),
                medicineName: selectedMedicine.medicineName,
                quantity: orderQuantity,
              }),
            });

            const verifyData = await verifyResponse.json();

            if (verifyResponse.ok && verifyData.success) {
              alert(`Payment successful! ₹${totalPrice} paid successfully.`);
              setSelectedMedicine(null);
              setOrderQuantity(1);
              setPaymentMethod("");
              await loadOrders();
              await loadMedicines();
            } else {
              alert(verifyData.message || "Payment verification failed");
            }
          } catch (error) {
            console.log("Verification Error:", error);
            alert("Payment completed, but verification failed.");
          }
        },

        prefill: {
          name: storedUser
            ? `${storedUser.firstName || ""} ${storedUser.lastName || ""}`.trim()
            : "",
          email: storedUser?.email || "",
          contact: "",
        },

        notes: {
          medicine: selectedMedicine.medicineName,
          quantity: String(orderQuantity),
        },

        theme: { color: "#2563eb" },

        modal: {
          ondismiss: function () {
            console.log("Payment window closed");
          },
        },
      };

      const razorpay = new window.Razorpay(options);

      razorpay.on("payment.failed", function (response) {
        alert(response.error.description || "Payment failed");
      });

      razorpay.open();
    } catch (error) {
      console.log("Payment Error:", error);
      alert("Cannot connect to payment server.");
    }
  };

  // ==========================================
  // COD Order
  // ==========================================

  const placeCODOrder = async () => {
    if (!selectedMedicine) {
      alert("Please select a medicine");
      return;
    }

    try {
      const response = await fetch(`${API_URL}/orders`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: localStorage.getItem("userId"),
          medicineName: selectedMedicine.medicineName,
          quantity: orderQuantity,
          paymentMethod: "Cash on Delivery",
          status: "Requested",
        }),
      });

      const data = await response.json();

      if (response.ok) {
        alert("COD Order placed successfully!");
        setSelectedMedicine(null);
        setOrderQuantity(1);
        setPaymentMethod("");
        await loadOrders();
        await loadMedicines();
      } else {
        alert(data.message || "Order failed");
      }
    } catch (error) {
      console.log("COD Error:", error);
      alert("Cannot connect to backend");
    }
  };

  const handlePayment = () => {
    if (!paymentMethod) {
      alert("Please select payment method");
      return;
    }

    if (paymentMethod === "UPI" || paymentMethod === "Card") {
      startPayment();
      return;
    }

    if (paymentMethod === "Cash on Delivery") {
      placeCODOrder();
      return;
    }
  };

  const openReorder = (medicine) => {
    setSelectedMedicine(medicine);
    setOrderQuantity(1);
    setPaymentMethod("");
  };

  // ==========================================
  // Derived data / stats
  // ==========================================

  const isActiveToday = (medicine) => {
    const today = todayStr();
    if (medicine.startDate && today < medicine.startDate) return false;
    if (medicine.endDate && today > medicine.endDate) return false;
    return true;
  };

  const isTakenToday = (medicineId) =>
    takenLogs.some((log) => log.medicineId === medicineId);

  const activeMedicines = medicines.filter(isActiveToday);

  const threshold = (medicine) => medicine.lowStockThreshold ?? 5;

  const totalMedicines = medicines.length;
  const todaysMedicinesCount = activeMedicines.length;
  const remainingTablets = medicines.reduce(
    (sum, m) => sum + (m.quantity || 0),
    0
  );
  const todaysTakenCount = activeMedicines.filter((m) =>
    isTakenToday(m._id)
  ).length;
  const lowStockMedicines = medicines.filter(
    (m) => m.quantity > 0 && m.quantity <= threshold(m)
  );
  const pendingReminders = activeMedicines.filter(
    (m) => m.quantity > 0 && !isTakenToday(m._id)
  );

  const statusForMedicine = (medicine) => {
    if (medicine.quantity <= 0) return "empty";
    if (medicine.quantity <= threshold(medicine)) return "low";
    return "ok";
  };

  const statusLabel = (status) => {
    if (status === "empty") return "Medicine Empty";
    if (status === "low") return "Low Stock";
    return "In Stock";
  };

  const userInitial =
    storedUser?.firstName?.[0]?.toUpperCase() ||
    storedUser?.email?.[0]?.toUpperCase() ||
    "U";

  return (
    <div className="db-page">
      {/* On-screen alarm popup */}
      {activeAlarm && (
        <div
          style={{
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            background: "rgba(0,0,0,0.5)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            zIndex: 1000,
          }}
        >
          <div
            style={{
              background: "white",
              borderRadius: "16px",
              padding: "32px",
              width: "320px",
              textAlign: "center",
              boxShadow: "0 20px 50px rgba(0,0,0,0.25)",
            }}
          >
            <div style={{ fontSize: "40px" }}>⏰</div>
            <h2 style={{ margin: "10px 0 4px" }}>Medicine Reminder</h2>
            <p style={{ fontSize: "18px", fontWeight: 600, margin: "0 0 20px" }}>
              Time to take {activeAlarm.medicineName}
            </p>

            <button
              className="db-btn-confirm"
              style={{ width: "100%", marginBottom: 10 }}
              disabled={confirmingId === activeAlarm._id}
              onClick={() => confirmTaken(activeAlarm)}
            >
              {confirmingId === activeAlarm._id ? "Saving..." : "Confirm Taken"}
            </button>

            <button
              className="db-logout-btn"
              style={{ width: "100%" }}
              onClick={() => setActiveAlarm(null)}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      {/* Top bar */}
      <nav className="db-topbar">
        <div className="db-logo">💊 MedReminder</div>

        <div className="db-topbar-right">
          <div className="db-user-chip">
            <div className="db-avatar">{userInitial}</div>
            <span className="db-user-name">
              {storedUser?.firstName
                ? `${storedUser.firstName} ${storedUser.lastName || ""}`.trim()
                : "My Dashboard"}
            </span>
          </div>

          <button
            className="db-logout-btn"
            onClick={() => {
              localStorage.removeItem("userId");
              localStorage.removeItem("user");
              navigate("/login");
            }}
          >
            Logout
          </button>
        </div>
      </nav>

      <div className="db-body">
        {/* Sidebar */}
        <aside className="db-sidebar">
          <button className="db-nav-link active">🏠 Dashboard</button>
          <button
            className="db-nav-link"
            onClick={() => navigate("/add-medicine")}
          >
            ➕ Add Medicine
          </button>
        </aside>

        {/* Main content */}
        <main className="db-main">
          <div className="db-welcome">
            <h1>
              Welcome back{storedUser?.firstName ? `, ${storedUser.firstName}` : ""} 👋
            </h1>
            <p>Here's what's happening with your medicines today.</p>
          </div>

          <button
            className="db-add-btn"
            onClick={() => navigate("/add-medicine")}
          >
            ➕ Add Medicine
          </button>

          {/* Summary cards */}
          <div className="db-stats-grid">
            <div className="db-stat-card">
              <div className="db-stat-label">Total Medicines</div>
              <div className="db-stat-value">{totalMedicines}</div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">Today's Medicines</div>
              <div className="db-stat-value">{todaysMedicinesCount}</div>
            </div>

            <div className="db-stat-card">
              <div className="db-stat-label">Remaining Tablets</div>
              <div className="db-stat-value">{remainingTablets}</div>
            </div>

            <div className="db-stat-card good">
              <div className="db-stat-label">Today's Taken</div>
              <div className="db-stat-value">{todaysTakenCount}</div>
            </div>

            <div className="db-stat-card warn">
              <div className="db-stat-label">Low Stock Medicines</div>
              <div className="db-stat-value">{lowStockMedicines.length}</div>
            </div>

            <div className="db-stat-card danger">
              <div className="db-stat-label">Pending Reminders</div>
              <div className="db-stat-value">{pendingReminders.length}</div>
            </div>
          </div>

          {/* Today's Reminders */}
          <div className="db-section">
            <div className="db-section-head">
              <h2>⏰ Today's Reminders</h2>
            </div>

            {activeMedicines.length === 0 ? (
              <p className="db-empty-note">
                No reminders for today. Add a medicine to get started.
              </p>
            ) : (
              activeMedicines.map((medicine) => {
                const taken = isTakenToday(medicine._id);
                const empty = medicine.quantity <= 0;

                return (
                  <div className="db-med-row" key={medicine._id}>
                    <div className="db-med-info">
                      <h3>💊 {medicine.medicineName}</h3>
                      <div className="db-med-meta">
                        {medicine.dosage && <span>{medicine.dosage}</span>}
                        <span>Time: {medicine.time}</span>
                        <span>Remaining: {medicine.quantity}</span>
                      </div>
                    </div>

                    <div className="db-med-actions">
                      <span
                        className={`db-badge ${taken ? "taken" : "pending"}`}
                      >
                        {taken ? "Taken" : "Pending"}
                      </span>

                      {!taken && !empty && (
                        <button
                          className="db-btn-confirm"
                          disabled={confirmingId === medicine._id}
                          onClick={() => confirmTaken(medicine)}
                        >
                          {confirmingId === medicine._id
                            ? "Saving..."
                            : "Confirm Taken"}
                        </button>
                      )}

                      {empty && (
                        <button
                          className="db-btn-order"
                          onClick={() => openReorder(medicine)}
                        >
                          Order Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Medicine list / stock */}
          <div className="db-section">
            <div className="db-section-head">
              <h2>📦 My Medicines</h2>
            </div>

            {medicines.length === 0 ? (
              <p className="db-empty-note">No medicines added yet.</p>
            ) : (
              medicines.map((medicine) => {
                const status = statusForMedicine(medicine);

                return (
                  <div className="db-med-row" key={medicine._id}>
                    <div className="db-med-info">
                      <h3>💊 {medicine.medicineName}</h3>
                      <div className="db-med-meta">
                        {medicine.dosage && <span>{medicine.dosage}</span>}
                        <span>Reminder: {medicine.time}</span>
                        <span>Remaining: {medicine.quantity}</span>
                        {(medicine.startDate || medicine.endDate) && (
                          <span>
                            {medicine.startDate || "—"} to{" "}
                            {medicine.endDate || "—"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="db-med-actions">
                      <span className={`db-badge ${status}`}>
                        {statusLabel(status)}
                      </span>

                      {status !== "ok" && (
                        <button
                          className="db-btn-order"
                          onClick={() => openReorder(medicine)}
                        >
                          Order Now
                        </button>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Reorder / Payment box */}
          {selectedMedicine && (
            <div className="db-section">
              <div className="db-section-head">
                <h2>🛒 Reorder Medicine</h2>
              </div>

              <div className="db-med-row">
                <div className="db-med-info">
                  <h3>{selectedMedicine.medicineName}</h3>
                  <div className="db-med-meta">
                    <span>Current Stock: {selectedMedicine.quantity}</span>
                  </div>
                </div>
              </div>

              <p>
                Price per unit: <strong>₹{PRICE_PER_UNIT}</strong>
              </p>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Order Quantity
              </label>
              <input
                type="number"
                min="1"
                value={orderQuantity}
                onChange={(e) => {
                  const value = Number(e.target.value);
                  setOrderQuantity(value < 1 ? 1 : value);
                }}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px",
                  margin: "8px 0 15px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "16px",
                }}
              />

              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  background: "#ecfdf5",
                  color: "#15803d",
                  padding: "16px",
                  borderRadius: "10px",
                  fontSize: "18px",
                  marginBottom: "16px",
                }}
              >
                <span>Total Amount</span>
                <strong>₹{orderQuantity * PRICE_PER_UNIT}</strong>
              </div>

              <label style={{ fontWeight: 600, fontSize: 14 }}>
                Payment Method
              </label>
              <select
                value={paymentMethod}
                onChange={(e) => setPaymentMethod(e.target.value)}
                style={{
                  display: "block",
                  width: "100%",
                  padding: "12px",
                  margin: "8px 0 15px",
                  border: "1px solid #d1d5db",
                  borderRadius: "8px",
                  boxSizing: "border-box",
                  fontSize: "16px",
                }}
              >
                <option value="">Select Payment Method</option>
                <option value="UPI">📱 UPI</option>
                <option value="Card">💳 Card</option>
                <option value="Cash on Delivery">🚚 Cash on Delivery</option>
              </select>

              <button
                className="db-add-btn"
                style={{ width: "100%", justifyContent: "center" }}
                onClick={handlePayment}
              >
                {paymentMethod === "Cash on Delivery"
                  ? "Place COD Order"
                  : `Pay ₹${orderQuantity * PRICE_PER_UNIT}`}
              </button>

              <button
                className="db-logout-btn"
                style={{ width: "100%", marginTop: 10 }}
                onClick={() => {
                  setSelectedMedicine(null);
                  setOrderQuantity(1);
                  setPaymentMethod("");
                }}
              >
                Cancel
              </button>
            </div>
          )}

          {/* Order History */}
          <div className="db-section">
            <div
              className="db-section-head"
              style={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <h2>🧾 Order History</h2>

              {orders.length > 0 && (
                <button
                  className="db-logout-btn"
                  onClick={clearOrderHistory}
                  disabled={clearingHistory}
                >
                  {clearingHistory ? "Clearing..." : "🗑️ Clear History"}
                </button>
              )}
            </div>

            {orders.length === 0 ? (
              <p className="db-empty-note">No orders yet.</p>
            ) : (
              orders.map((order) => (
                <div className="db-med-row" key={order._id}>
                  <div className="db-med-info">
                    <h3>💊 {order.medicineName}</h3>
                    <div className="db-med-meta">
                      <span>Quantity: {order.quantity}</span>
                      <span>Payment: {order.paymentMethod}</span>
                      <span>Total: ₹{order.quantity * PRICE_PER_UNIT}</span>
                    </div>
                  </div>

                  <div className="db-med-actions">
                    <span className="db-badge ok">{order.status}</span>
                  </div>
                </div>
              ))
            )}
          </div>
        </main>
      </div>
    </div>
  );
}

export default Dashboard;
