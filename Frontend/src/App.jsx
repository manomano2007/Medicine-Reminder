import { useState } from "react";
import { Link } from "react-router-dom";


import "./App.css";

function App() {
  const [language, setLanguage] = useState("en");

  const translations = {
    en: {
      home: "Home",
      medicines: "Medicines",
      orders: "Orders",
      about: "About",
      contact: "Contact",
      register: "Register",
      title1: "Never Miss Your",
      title2: " Medicine",
      description:
        "Keep track of your medicines, get timely reminders, and know when it's time to reorder.",
      start: "Get Started →",
      reminder: "Medicine Reminder",
      reminderText: "Get reminders when it's time to take your medicine.",
      stock: "Stock Tracking",
      stockText: "Keep track of how many medicines you have left.",
      reorder: "Easy Reorder",
      reorderText: "When your medicine is running low, you can reorder it.",
      why: "Why MedReminder?",
      aboutText:
        "MedReminder helps you manage your daily medicines, track your medicine stock and avoid running out.",
      footer: "© 2026 MedReminder. All rights reserved.",
    },

    ta: {
      home: "முகப்பு",
      medicines: "மருந்துகள்",
      orders: "ஆர்டர்கள்",
      about: "எங்களை பற்றி",
      contact: "தொடர்பு",
      register: "பதிவு",
      title1: "உங்கள் மருந்தை",
      title2: " மறக்காதீர்கள்",
      description:
        "உங்கள் மருந்துகளை கண்காணித்து, சரியான நேரத்தில் நினைவூட்டல்களைப் பெற்று, மருந்து தீரும் முன் மீண்டும் ஆர்டர் செய்யுங்கள்.",
      start: "தொடங்குங்கள் →",
      reminder: "மருந்து நினைவூட்டல்",
      reminderText:
        "மருந்து எடுத்துக்கொள்ள வேண்டிய நேரத்தில் நினைவூட்டலைப் பெறுங்கள்.",
      stock: "மருந்து இருப்பு",
      stockText: "உங்களிடம் எவ்வளவு மருந்து உள்ளது என்பதை கண்காணிக்கவும்.",
      reorder: "மீண்டும் ஆர்டர்",
      reorderText:
        "மருந்து குறைவாக இருக்கும்போது மீண்டும் ஆர்டர் செய்யலாம்.",
      why: "ஏன் MedReminder?",
      aboutText:
        "MedReminder உங்கள் தினசரி மருந்துகளை நிர்வகிக்கவும், மருந்து இருப்பை கண்காணிக்கவும் உதவுகிறது.",
      footer: "© 2026 MedReminder. அனைத்து உரிமைகளும் பாதுகாக்கப்பட்டவை.",
    },

    hi: {
      home: "होम",
      medicines: "दवाइयाँ",
      orders: "ऑर्डर",
      about: "हमारे बारे में",
      contact: "संपर्क",
      register: "रजिस्टर",
      title1: "अपनी दवा",
      title2: " कभी न भूलें",
      description:
        "अपनी दवाइयों को ट्रैक करें, समय पर रिमाइंडर पाएं और दवा खत्म होने से पहले दोबारा ऑर्डर करें।",
      start: "शुरू करें →",
      reminder: "दवा रिमाइंडर",
      reminderText: "दवा लेने के समय रिमाइंडर प्राप्त करें।",
      stock: "दवा स्टॉक",
      stockText: "आपके पास कितनी दवा बची है, इसे ट्रैक करें।",
      reorder: "दोबारा ऑर्डर",
      reorderText: "दवा कम होने पर उसे दोबारा ऑर्डर करें।",
      why: "MedReminder क्यों?",
      aboutText:
        "MedReminder आपकी दैनिक दवाइयों को मैनेज करने और स्टॉक को ट्रैक करने में मदद करता है।",
      footer: "© 2026 MedReminder. सर्वाधिकार सुरक्षित।",
    },

    te: {
      home: "హోమ్",
      medicines: "మందులు",
      orders: "ఆర్డర్లు",
      about: "మా గురించి",
      contact: "సంప్రదించండి",
      register: "రిజిస్టర్",
      title1: "మీ మందులను",
      title2: " మర్చిపోకండి",
      description:
        "మీ మందులను ట్రాక్ చేయండి, సమయానికి రిమైండర్లు పొందండి మరియు మందులు అయిపోకముందే మళ్లీ ఆర్డర్ చేయండి.",
      start: "ప్రారంభించండి →",
      reminder: "మెడిసిన్ రిమైండర్",
      reminderText: "మందు తీసుకునే సమయానికి రిమైండర్ పొందండి.",
      stock: "మెడిసిన్ స్టాక్",
      stockText: "మీ వద్ద ఎంత మందు మిగిలి ఉందో ట్రాక్ చేయండి.",
      reorder: "మళ్లీ ఆర్డర్",
      reorderText: "మందులు తక్కువగా ఉన్నప్పుడు మళ్లీ ఆర్డర్ చేయండి.",
      why: "MedReminder ఎందుకు?",
      aboutText:
        "MedReminder మీ రోజువారీ మందులను నిర్వహించడానికి మరియు స్టాక్‌ను ట్రాక్ చేయడానికి సహాయపడుతుంది.",
      footer: "© 2026 MedReminder. అన్ని హక్కులు ప్రత్యేకించబడ్డాయి.",
    },

    ml: {
      home: "ഹോം",
      medicines: "മരുന്നുകൾ",
      orders: "ഓർഡറുകൾ",
      about: "ഞങ്ങളെക്കുറിച്ച്",
      contact: "ബന്ധപ്പെടുക",
      register: "രജിസ്റ്റർ",
      title1: "നിങ്ങളുടെ മരുന്ന്",
      title2: " മറക്കരുത്",
      description:
        "നിങ്ങളുടെ മരുന്നുകൾ ട്രാക്ക് ചെയ്യുക, സമയബന്ധിതമായ ഓർമ്മപ്പെടുത്തലുകൾ നേടുക, മരുന്ന് തീരുന്നതിന് മുമ്പ് വീണ്ടും ഓർഡർ ചെയ്യുക.",
      start: "ആരംഭിക്കുക →",
      reminder: "മരുന്ന് ഓർമ്മപ്പെടുത്തൽ",
      reminderText:
        "മരുന്ന് കഴിക്കേണ്ട സമയത്ത് ഓർമ്മപ്പെടുത്തൽ നേടുക.",
      stock: "മരുന്ന് സ്റ്റോക്ക്",
      stockText:
        "നിങ്ങളുടെ കൈവശമുള്ള മരുന്നുകളുടെ എണ്ണം ട്രാക്ക് ചെയ്യുക.",
      reorder: "വീണ്ടും ഓർഡർ ചെയ്യുക",
      reorderText:
        "മരുന്ന് കുറയുമ്പോൾ അത് വീണ്ടും ഓർഡർ ചെയ്യാം.",
      why: "എന്തുകൊണ്ട് MedReminder?",
      aboutText:
        "നിങ്ങളുടെ ദൈനംദിന മരുന്നുകൾ നിയന്ത്രിക്കാനും സ്റ്റോക്ക് ട്രാക്ക് ചെയ്യാനും MedReminder സഹായിക്കുന്നു.",
      footer: "© 2026 MedReminder. എല്ലാ അവകാശങ്ങളും സംരക്ഷിച്ചിരിക്കുന്നു.",
    },

    kn: {
      home: "ಮುಖಪುಟ",
      medicines: "ಔಷಧಿಗಳು",
      orders: "ಆರ್ಡರ್‌ಗಳು",
      about: "ನಮ್ಮ ಬಗ್ಗೆ",
      contact: "ಸಂಪರ್ಕಿಸಿ",
      register: "ನೋಂದಣಿ",
      title1: "ನಿಮ್ಮ ಔಷಧಿಯನ್ನು",
      title2: " ಮರೆಯಬೇಡಿ",
      description:
        "ನಿಮ್ಮ ಔಷಧಿಗಳನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ, ಸಮಯಕ್ಕೆ ಜ್ಞಾಪನೆಗಳನ್ನು ಪಡೆಯಿರಿ ಮತ್ತು ಔಷಧಿ ಮುಗಿಯುವ ಮೊದಲು ಮರುಆರ್ಡರ್ ಮಾಡಿ.",
      start: "ಪ್ರಾರಂಭಿಸಿ →",
      reminder: "ಔಷಧಿ ಜ್ಞಾಪನೆ",
      reminderText:
        "ಔಷಧಿ ತೆಗೆದುಕೊಳ್ಳುವ ಸಮಯದಲ್ಲಿ ಜ್ಞಾಪನೆಯನ್ನು ಪಡೆಯಿರಿ.",
      stock: "ಔಷಧಿ ಸ್ಟಾಕ್",
      stockText:
        "ನಿಮ್ಮ ಬಳಿ ಎಷ್ಟು ಔಷಧಿ ಉಳಿದಿದೆ ಎಂಬುದನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಿ.",
      reorder: "ಮರುಆರ್ಡರ್",
      reorderText:
        "ಔಷಧಿ ಕಡಿಮೆಯಾದಾಗ ಮತ್ತೆ ಆರ್ಡರ್ ಮಾಡಬಹುದು.",
      why: "ಏಕೆ MedReminder?",
      aboutText:
        "MedReminder ನಿಮ್ಮ ದೈನಂದಿನ ಔಷಧಿಗಳನ್ನು ನಿರ್ವಹಿಸಲು ಮತ್ತು ಔಷಧಿ ಸ್ಟಾಕ್ ಅನ್ನು ಟ್ರ್ಯಾಕ್ ಮಾಡಲು ಸಹಾಯ ಮಾಡುತ್ತದೆ.",
      footer: "© 2026 MedReminder. ಎಲ್ಲಾ ಹಕ್ಕುಗಳನ್ನು ಕಾಯ್ದಿರಿಸಲಾಗಿದೆ.",
    },
  };

  const t = translations[language];

  return (
    <div className="app">

      <nav className="navbar">
        <div className="logo">💊 MedReminder</div>

        <div className="nav-links">
          <a href="#home">{t.home}</a>
          <a href="#medicines">{t.medicines}</a>
          <a href="#orders">{t.orders}</a>
          <a href="#about">{t.about}</a>
          <a href="#contact">{t.contact}</a>
        </div>

        <select
          className="language-select"
          value={language}
          onChange={(e) => setLanguage(e.target.value)}
        >
          <option value="en">English</option>
          <option value="ta">தமிழ்</option>
          <option value="hi">हिन्दी</option>
          <option value="te">తెలుగు</option>
          <option value="ml">മലയാളം</option>
          <option value="kn">ಕನ್ನಡ</option>
        </select>
<div className="auth-buttons">
  <Link to="/login" className="login-btn">
    Login
  </Link>

  <Link to="/register" className="register-btn">
    {t.register}
  </Link>
</div>
      </nav>

      <section className="hero" id="home">
        <div className="hero-text">
          <h1>
            {t.title1}
            <span>{t.title2}</span>
          </h1>

          <p>{t.description}</p>

       <Link to="/login" className="start-btn">
  {t.start}
</Link>
        </div>

        <div className="hero-icon">💊</div>
      </section>

      <section className="features">

        <div className="feature-card">
          <div className="feature-icon">⏰</div>
          <h3>{t.reminder}</h3>
          <p>{t.reminderText}</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">📦</div>
          <h3>{t.stock}</h3>
          <p>{t.stockText}</p>
        </div>

        <div className="feature-card">
          <div className="feature-icon">🛒</div>
          <h3>{t.reorder}</h3>
          <p>{t.reorderText}</p>
        </div>

      </section>

      <section className="about" id="about">
        <h2>{t.why}</h2>
        <p>{t.aboutText}</p>
      </section>

      <footer>
        <p>{t.footer}</p>
      </footer>

    </div>
  );
}

export default App;