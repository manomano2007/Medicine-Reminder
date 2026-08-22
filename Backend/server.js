const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const crypto = require("crypto");
const nodemailer = require("nodemailer");
const Razorpay = require("razorpay");

const User = require("./model/user");
const Medicine = require("./model/medicine");
const Order = require("./model/order");
const TakenLog = require("./model/takenLog");

require("dotenv").config();

const app = express();

app.use(cors());
app.use(express.json());


// =====================================
// Razorpay
// =====================================

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID,
  key_secret: process.env.RAZORPAY_KEY_SECRET,
});


// =====================================
// Email (OTP) - Nodemailer
// =====================================

const mailTransporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  connectionTimeout: 15000, // 15s to connect to Gmail
  greetingTimeout: 15000,
  socketTimeout: 15000,
});

// In-memory OTP store: email -> { otp, expiresAt, formData }
// Good enough for a short-lived (5 min) OTP window.
const otpStore = new Map();

if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
  console.log(
    "⚠️  EMAIL_USER / EMAIL_PASS not set - OTP emails will fail. " +
    "Add them in Render > Environment."
  );
}

const OTP_EXPIRY_MS = 5 * 60 * 1000; // 5 minutes

function generateOtp() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

async function sendOtpEmail(email, otp) {
  await mailTransporter.sendMail({
    from: `"MedReminder" <${process.env.EMAIL_USER}>`,
    to: email,
    subject: "Your MedReminder verification code",
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 480px; margin: auto;">
        <h2 style="color:#2563eb;">💊 MedReminder</h2>
        <p>Use the code below to verify your email and complete registration:</p>
        <p style="font-size: 32px; font-weight: bold; letter-spacing: 6px; color:#2563eb;">${otp}</p>
        <p>This code expires in 5 minutes. If you didn't request this, you can ignore this email.</p>
      </div>
    `,
  });
}


// =====================================
// MongoDB
// =====================================

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("MongoDB Connected!");
  })
  .catch((error) => {
    console.log("MongoDB Error:", error);
  });


// =====================================
// Home
// =====================================

app.get("/", (req, res) => {
  res.send("Medicine Reminder Backend is Running!");
});


// =====================================
// Register - Step 1: send a real OTP to
// the given email. No user is created yet.
// =====================================

app.post("/register/send-otp", async (req, res) => {
  try {
    const { firstName, lastName, mobile, email, password } = req.body;

    if (!email || !String(email).trim()) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!firstName || !lastName || !mobile || !password) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        message: "Email already registered. Please login.",
      });
    }

    const otp = generateOtp();

    otpStore.set(email, {
      otp,
      expiresAt: Date.now() + OTP_EXPIRY_MS,
      formData: { firstName, lastName, mobile, email, password },
    });

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP sent to your email",
    });

  } catch (error) {
    console.log("Send OTP Error:", error);

    res.status(500).json({
      message: "Failed to send OTP. Please check the email address and try again.",
    });
  }
});


// =====================================
// Register - Step 2: verify the OTP, and
// only then actually create the user.
// =====================================

app.post("/register/verify-otp", async (req, res) => {
  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        message: "Email and OTP are required",
      });
    }

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({
        message: "No OTP request found for this email. Please request a new OTP.",
      });
    }

    if (Date.now() > record.expiresAt) {
      otpStore.delete(email);
      return res.status(400).json({
        message: "OTP expired. Please request a new OTP.",
      });
    }

    if (String(otp).trim() !== record.otp) {
      return res.status(400).json({
        message: "Incorrect OTP. Please try again.",
      });
    }

    // Re-check in case the email got registered elsewhere while
    // the OTP was pending.
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      otpStore.delete(email);
      return res.status(400).json({
        message: "Email already registered. Please login.",
      });
    }

    const { firstName, lastName, mobile, password } = record.formData;

    const newUser = new User({
      firstName,
      lastName,
      mobile,
      email,
      password,
    });

    await newUser.save();

    otpStore.delete(email);

    res.status(201).json({
      message: "Registration successful!",
    });

  } catch (error) {
    console.log("Verify OTP Error:", error);

    res.status(500).json({
      message: "Registration failed",
    });
  }
});


// =====================================
// Register - Resend OTP (reuses the
// details from the original request)
// =====================================

app.post("/register/resend-otp", async (req, res) => {
  try {
    const { email } = req.body;

    const record = otpStore.get(email);

    if (!record) {
      return res.status(400).json({
        message: "No OTP request found for this email. Please start registration again.",
      });
    }

    const otp = generateOtp();

    record.otp = otp;
    record.expiresAt = Date.now() + OTP_EXPIRY_MS;
    otpStore.set(email, record);

    await sendOtpEmail(email, otp);

    res.status(200).json({
      message: "OTP resent to your email",
    });

  } catch (error) {
    console.log("Resend OTP Error:", error);

    res.status(500).json({
      message: "Failed to resend OTP",
    });
  }
});


// =====================================
// Login
// =====================================

app.post("/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (!user) {
      return res.status(401).json({
        message: "User not found",
      });
    }

    if (user.password !== password) {
      return res.status(401).json({
        message: "Invalid password",
      });
    }

    res.status(200).json({
      message: "Login successful!",

      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
      },
    });

  } catch (error) {
    console.log("Login Error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});


// =====================================
// Add Medicine
// =====================================


  app.post("/medicines", async (req, res) => {
  try {
    const {
  userId,
  medicineName,
  dosage,
  quantity,
  time,
  startDate,
  endDate,
  lowStockThreshold,
} = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    if (!medicineName || !String(medicineName).trim()) {
      return res.status(400).json({
        message: "Medicine name is required",
      });
    }

    const qty = Number(quantity);

    if (Number.isNaN(qty) || qty < 0) {
      return res.status(400).json({
        message: "Valid quantity is required",
      });
    }

    const newMedicine = new Medicine({
      userId,
      medicineName: String(medicineName).trim(),
      dosage: dosage ? String(dosage).trim() : "",
      quantity: qty,
      initialQuantity: qty,
      time,
      startDate: startDate || "",
      endDate: endDate || "",
      lowStockThreshold:
        lowStockThreshold !== undefined &&
        lowStockThreshold !== null &&
        lowStockThreshold !== ""
          ? Number(lowStockThreshold)
          : 5,
    });

    await newMedicine.save();

    res.status(201).json({
      message: "Medicine added successfully!",
      medicine: newMedicine,
    });

  } catch (error) {
    console.log("Medicine Error:", error);

    res.status(500).json({
      message: "Failed to add medicine",
    });
  }
});

// =====================================
// Get Medicines - USER SPECIFIC
// =====================================

app.get("/medicines", async (req, res) => {
  try {
    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const medicines = await Medicine.find({
      userId: userId,
    });

    res.status(200).json(medicines);

  } catch (error) {
    console.log("Get Medicines Error:", error);

    res.status(500).json({
      message: "Failed to get medicines",
    });
  }
});


// =====================================
// Helper: local YYYY-MM-DD for "today"
// =====================================

function todayDateString() {
  return new Date().toISOString().split("T")[0];
}


// =====================================
// Confirm Medicine Taken - decrements stock
// Only ever called when the user explicitly
// taps "Confirm Taken". A reminder firing
// never touches quantity by itself.
// =====================================

app.post("/medicines/:id/take", async (req, res) => {
  try {
    const { id } = req.params;
    const { userId, date } = req.body;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const medicine = await Medicine.findOne({
      _id: id,
      userId: userId,
    });

    if (!medicine) {
      return res.status(404).json({
        message: "Medicine not found",
      });
    }

    const dayKey = date || todayDateString();

    // Prevent duplicate deductions for the same reminder/day
    const existingLog = await TakenLog.findOne({
      medicineId: medicine._id,
      date: dayKey,
    });

    if (existingLog) {
      return res.status(400).json({
        message: "This dose has already been confirmed for today",
        medicine,
      });
    }

    if (medicine.quantity <= 0) {
      return res.status(400).json({
        message: "No tablets remaining. Please reorder.",
        medicine,
      });
    }

    medicine.quantity = medicine.quantity - 1;
    await medicine.save();

    const takenLog = new TakenLog({
      userId,
      medicineId: medicine._id,
      date: dayKey,
      taken: true,
      takenAt: new Date(),
    });

    try {
      await takenLog.save();
    } catch (logError) {
      // Unique index race (double click) - roll back the deduction
      if (logError && logError.code === 11000) {
        medicine.quantity = medicine.quantity + 1;
        await medicine.save();

        return res.status(400).json({
          message: "This dose has already been confirmed for today",
          medicine,
        });
      }
      throw logError;
    }

    res.status(200).json({
      message: "Medicine marked as taken!",
      medicine,
      takenLog,
    });

  } catch (error) {
    console.log("Confirm Taken Error:", error);

    res.status(500).json({
      message: "Failed to confirm medicine taken",
    });
  }
});


// =====================================
// Get Taken Logs - USER SPECIFIC, by date
// =====================================

app.get("/medicines/taken", async (req, res) => {
  try {
    const { userId, date } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    const dayKey = date || todayDateString();

    const logs = await TakenLog.find({
      userId: userId,
      date: dayKey,
    });

    res.status(200).json(logs);

  } catch (error) {
    console.log("Get Taken Logs Error:", error);

    res.status(500).json({
      message: "Failed to get taken logs",
    });
  }
});


// =====================================
// CREATE RAZORPAY PAYMENT ORDER
// =====================================

app.post("/create-payment", async (req, res) => {

  console.log("=================================");
  console.log("CREATE PAYMENT REQUEST");
  console.log("Body:", req.body);
  console.log("=================================");

  try {

    const {
      medicineName,
      quantity,
    } = req.body;

    if (!medicineName) {
      return res.status(400).json({
        success: false,
        message: "Medicine name is required",
      });
    }

    const qty = Number(quantity);

    if (!qty || qty < 1) {
      return res.status(400).json({
        success: false,
        message: "Invalid quantity",
      });
    }

    const PRICE_PER_UNIT = 10;

    const totalAmount = qty * PRICE_PER_UNIT;

    const amountInPaise = totalAmount * 100;

    if (
      !process.env.RAZORPAY_KEY_ID ||
      !process.env.RAZORPAY_KEY_SECRET
    ) {
      return res.status(500).json({
        success: false,
        message: "Razorpay API keys are missing",
      });
    }

    const razorpayOrder =
      await razorpay.orders.create({

        amount: amountInPaise,

        currency: "INR",

        receipt: `med_${Date.now()}`,

        notes: {
          medicineName: medicineName,
          quantity: String(qty),
        },

      });

    console.log(
      "Razorpay Order Created:",
      razorpayOrder.id
    );

    res.status(200).json({

      success: true,

      key: process.env.RAZORPAY_KEY_ID,

      orderId: razorpayOrder.id,

      amountInPaise: razorpayOrder.amount,

      amount: razorpayOrder.amount,

      currency: razorpayOrder.currency,

      pricePerUnit: PRICE_PER_UNIT,

      totalPrice: totalAmount,

    });

  } catch (error) {

    console.log("RAZORPAY ERROR:", error);

    res.status(500).json({

      success: false,

      message:
        error?.error?.description ||
        error?.message ||
        "Unable to create Razorpay order",

    });
  }
});


// =====================================
// VERIFY RAZORPAY PAYMENT
// =====================================

app.post("/verify-payment", async (req, res) => {

  try {

    const {
      razorpay_order_id,
      razorpay_payment_id,
      razorpay_signature,
      medicineName,
      quantity,
      userId,
    } = req.body;


    if (
      !razorpay_order_id ||
      !razorpay_payment_id ||
      !razorpay_signature ||
      !userId
    ) {

      return res.status(400).json({

        success: false,

        message: "Payment details or User ID missing",

      });
    }


    const generatedSignature =
      crypto
        .createHmac(
          "sha256",
          process.env.RAZORPAY_KEY_SECRET
        )
        .update(
          razorpay_order_id +
          "|" +
          razorpay_payment_id
        )
        .digest("hex");


    if (
      generatedSignature !==
      razorpay_signature
    ) {

      return res.status(400).json({

        success: false,

        message: "Payment verification failed",

      });
    }


    const newOrder = new Order({

      userId: userId,

      medicineName: medicineName,

      quantity: Number(quantity),

      paymentMethod: "Razorpay",

      status: "Paid",

    });


    await newOrder.save();


    // Restock: add the ordered quantity back onto the medicine's
    // remaining stock, so the Low Stock / Empty message clears.
    const medicineToRestock = await Medicine.findOne({
      userId: userId,
      medicineName: medicineName,
    });

    if (medicineToRestock) {
      medicineToRestock.quantity =
        (medicineToRestock.quantity || 0) + Number(quantity);

      await medicineToRestock.save();
    }


    console.log(
      "Payment verified!"
    );

    console.log(
      "Order saved:",
      newOrder._id
    );


    res.status(200).json({

      success: true,

      message:
        "Payment successful and order placed!",

      order: newOrder,

    });

  } catch (error) {

    console.log(
      "Payment Verification Error:",
      error
    );

    res.status(500).json({

      success: false,

      message:
        "Payment verification failed",

    });
  }
});


// =====================================
// Normal Order / COD
// =====================================

app.post("/orders", async (req, res) => {

  try {

    const {
      userId,
      medicineName,
      quantity,
      paymentMethod,
      status,
    } = req.body;


    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }


    const newOrder = new Order({

      userId: userId,

      medicineName: medicineName,

      quantity: Number(quantity),

      paymentMethod: paymentMethod,

      status: status || "Requested",

    });


    await newOrder.save();


    // Restock: add the ordered quantity back onto the medicine's
    // remaining stock, so the Low Stock / Empty message clears.
    const medicineToRestock = await Medicine.findOne({
      userId: userId,
      medicineName: medicineName,
    });

    if (medicineToRestock) {
      medicineToRestock.quantity =
        (medicineToRestock.quantity || 0) + Number(quantity);

      await medicineToRestock.save();
    }


    console.log(
      "Order saved successfully!"
    );


    res.status(201).json({

      message:
        "Order saved successfully!",

      order: newOrder,

    });

  } catch (error) {

    console.log(
      "Order Error:",
      error
    );

    res.status(500).json({

      message:
        "Failed to create order",

    });
  }
});


// =====================================
// Get Orders - USER SPECIFIC
// =====================================

app.get("/orders", async (req, res) => {

  try {

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }


    const orders =
      await Order
        .find({
          userId: userId,
        })
        .sort({
          createdAt: -1,
        });


    res.status(200).json(
      orders
    );

  } catch (error) {

    console.log(
      "Get Orders Error:",
      error
    );

    res.status(500).json({

      message:
        "Failed to get orders",

    });
  }
});


// =====================================
// Clear Order History - USER SPECIFIC
// =====================================

app.delete("/orders/clear", async (req, res) => {

  try {

    const { userId } = req.query;

    if (!userId) {
      return res.status(400).json({
        message: "User ID is required",
      });
    }

    await Order.deleteMany({
      userId: userId,
    });

    res.status(200).json({
      message: "Order history cleared",
    });

  } catch (error) {

    console.log(
      "Clear Order History Error:",
      error
    );

    res.status(500).json({

      message:
        "Failed to clear order history",

    });
  }
});


// =====================================
// Start Server
// =====================================

app.listen(
  5000,
  "0.0.0.0",
  () => {

    console.log(
      "================================="
    );

    console.log(
      "Server running on port 5000"
    );

    console.log(
      "================================="
    );

  }
);