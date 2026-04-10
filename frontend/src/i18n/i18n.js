import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

// Translation files (will be moved to separate files later)
const resources = {
  en: {
    translation: {
      "dashboard": "Dashboard",
      "bills": "Bills",
      "parties": "Parties",
      "finance": "Finance",
      "profile": "Profile",
      "admin": "Admin",
      "login_title": "Welcome Back",
      "login_subtitle": "Enter your mobile number to get started",
      "send_otp": "Send OTP",
      "phone_number": "Phone Number",
      "role_select_title": "Select Business Type",
      "role_select_subtitle": "This helps us customize the app for your needs",
      "transport": "Transport",
      "garage": "Garage",
      "new_bill": "New Bill",
      "add_party": "Add Party",
      "search": "Search...",
      "logout": "Log Out",
    }
  },
  hi: {
    translation: {
      "dashboard": "डैशबोर्ड",
      "bills": "बिल",
      "parties": "पार्टियां",
      "finance": "वित्त",
      "profile": "प्रोफ़ाइल",
      "admin": "एडमिन",
      "login_title": "स्वागत हे",
      "login_subtitle": "शुरू करने के लिए अपना मोबाइल नंबर दर्ज करें",
      "send_otp": "OTP भेजें",
      "phone_number": "फ़ोन नंबर",
      "role_select_title": "अपना व्यवसाय चुनें",
      "role_select_subtitle": "यह आपकी ज़रूरत के अनुसार अनुकूलित करने में मदद करता है",
      "transport": "ट्रांसपोर्ट",
      "garage": "गैराज",
      "new_bill": "नया बिल",
      "add_party": "पार्टी जोड़ें",
      "search": "खोजें...",
      "logout": "लॉग आउट",
    }
  }
};

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false, // not needed for react as it escapes by default
    }
  });

export default i18n;
