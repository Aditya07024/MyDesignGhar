const fs = require("fs");
const path = require("path");
const axios = require("axios");

const UI_KIT_PATH = path.join(__dirname, "../components/ui-kit.tsx");

// New keys to add to the master dictionary
const newKeys = [
  // Room Types
  "Living Room",
  "Bedroom",
  "Kitchen",
  "Bathroom",
  "Dining Room",
  "Office",
  "Kids Room",
  "Balcony",

  // Styles
  "Modern",
  "Luxury",
  "Minimalist",
  "Japandi",
  "Scandinavian",
  "Bohemian",

  // Referral screen keys
  "Refer & Earn",
  "Earn ₹150 per friend",
  "They get ₹150 off too. Everyone wins!",
  "Your referral code",
  "Invite Friends",
  "WhatsApp",
  "Friends joined",
  "Pending",
  "Total earned",
  "Code Copied",
  "Referral code '{code}' has been copied to your clipboard.",
  "Redesign your home with AI on MyDezineGhar! Use my code {code} for ₹150 off. https://mydezineghar.app",
  "WhatsApp not installed",
  "WhatsApp could not be opened on your device.",

  // Booking screen keys
  "Booking confirmed!",
  "Your session with {name} is set for Jun {day}, {slot}.",
  "View my sessions",
  "Back to home",
  "Book Session",
  "Payment",
  "Select a date",
  "Select a time",
  "Booking summary",
  "Designer",
  "Date & time",
  "Session fee",
  "Proceed to Payment",
  "Order summary",
  "Consultation",
  "Platform fee",
  "Total",
  "Payment method",
  "UPI",
  "Credit / Debit Card",
  "Wallet Balance",
  "Pay",
  "Mon",
  "Tue",
  "Wed",
  "Thu",
  "Fri",
  "Jun",

  // Sessions screen keys
  "My Sessions",
  "Upcoming",
  "Past",
  "No upcoming sessions",
  "No past sessions",
  "Book an interior designer to get personalized recommendations.",
  "Join Session",

  // Call screen keys
  "Video calling is supported on Web only.",
  "Go Back",
  "Missing connection token or server URL. Please try joining the call again.",
  
  // Splash Screen Subtitle
  "AI Interior Design for India",
  
  // Dynamic notification keys (fallback just in case)
  "Welcome to the Expert Panel!",
  "Complete your profile bio and set your range availability slots so homeowners can book your sessions.",
  "How booking payouts work",
  "Homeowners pay using their wallets. Your consultation fees will be credited to your Earnings instantly on completion.",
  "Video consultations info",
  "Join confirmed video consultation rooms securely directly from your schedule in the home dashboard.",
  "Your design is ready!",
  "3 new Rajasthan living room designs are waiting.",
  "Payment successful",
  "₹999 added to your wallet.",
  "Welcome to MyDesignGhar",
  "Get started by generating your first AI room layout or booking an expert consultation.",
  "Referral Bonus Credited",
  "You received ₹150 for referring a new user!",
  "Welcome Bonus Credited",
  "You received ₹150 for signing up with a referral code!",
  "Wallet Credited",
  "Purchase Completed",
  "You have successfully purchased the high-resolution design download.",
  "Consultation Confirmed",
  "Your video session booking has been successfully confirmed.",
  "New Session Booked",
  "Profile Updated",
  "Your profile details have been successfully updated.",
  "Session Notes Shared",
  "Your designer has shared session notes for your consultation booking.",

  // User-requested newly identified keys
  "Style",
  "Modern Styles",
  "Regional Styles",
  "Rajasthan",
  "Sikkim",
  "Meghalaya",
  "Budget",
  "Kerala",
  "Bihar",
  "Kashmir",
  "Odisha",
  "Punjab",
  "Himachal Pradesh",
  "Gujarat",
  "Tamil Nadu",
  "Karnataka",
  "Telangana",
  "Uttar Pradesh",
  "Maharashtra",
  "Uttarakhand",
  "Delhi",
  "Andhra Pradesh",
  "Haryana",
  "Madhya Pradesh",
  "Goa",
  "Chhattisgarh",
  "West Bengal",
  "Jharkhand",
  "Assam",
  "Manipur",
  "Under ₹50K",
  "₹50K–2L",
  "₹2L–5L",
  "₹5L+",
  "Under ·50K",
  "·50K-2L",
  "き2L-5L",
  "Describe your vision",
  "e.g. warm earthy tones, lots of plants, cozy reading nook...",
  "Generate 3 Designs",
  "Upload a room photo",
  "Take Photo",
  "Gallery",
  "Room type",
  "Designers",
  "Book verified interior experts",
  "Top Rated",
  "Nearby",
  "Experience",
  "yrs exp",
  "session",
  "Available balance",
  "Total earnings",
  "Enter amount (e.g. 500)",
  "Recharge packages",
  "bonus",
  "Starter",
  "Referral earnings",
  "Earn credits by inviting friends",
  "Transactions",
  "No transactions yet.",
  "+ Add Money",
  "Add Money",
  "Invite"
];

// All scheduled Indian languages supported
const languages = [
  "hi", "bn", "te", "mr", "ta", "ur", "gu", "kn", "or", "ml", "pa", "as", "mai", 
  "sa", "sat", "ks", "ne", "sd", "doi", "kok", "mni", "brx"
];

// Helper to translate a string to target language
async function translateText(text, targetLang) {
  if (targetLang === "en") return text;
  
  const clean = text.trim();
  if (!clean) return text;
  
  try {
    const url = `https://translate.googleapis.com/translate_a/single?client=gtx&sl=en&tl=${targetLang}&dt=t&q=${encodeURIComponent(clean)}`;
    const response = await axios.get(url, { timeout: 8000 });
    const translated = response.data?.[0]?.map((x) => x[0]).join("") || clean;
    return translated;
  } catch (error) {
    console.error(`Translation failed for "${clean}" to ${targetLang}: ${error.message}`);
    return clean;
  }
}

async function run() {
  console.log("Reading ui-kit.tsx...");
  const content = fs.readFileSync(UI_KIT_PATH, "utf8");
  
  // Extract TRANSLATIONS object text
  const startIndex = content.indexOf("const TRANSLATIONS: Record<string, Record<string, string>> = {");
  if (startIndex === -1) {
    console.error("Could not find TRANSLATIONS definition!");
    return;
  }
  
  const endIndex = content.indexOf("};", startIndex);
  if (endIndex === -1) {
    console.error("Could not find end of TRANSLATIONS!");
    return;
  }
  
  // Let's locate the 'hi: {' section
  const hiStart = content.indexOf("  hi: {", startIndex);
  const hiEnd = content.indexOf("  },", hiStart);
  const hiText = content.substring(hiStart, hiEnd);
  
  // Extract all keys from hi
  // Using robust regex to handle escaped quotes inside keys
  const regex = /"((?:[^"\\]|\\.)*)":/g;
  let match;
  const masterKeys = new Set(newKeys);
  while ((match = regex.exec(hiText)) !== null) {
    masterKeys.add(match[1]);
  }
  
  console.log(`Found ${masterKeys.size} master keys to translate.`);
  
  // Build a complete translations dictionary
  const fullDict = { en: {} };
  for (const lang of languages) {
    fullDict[lang] = {};
  }
  
  // Populate existing translations from ui-kit.tsx to keep human edits
  for (const lang of languages) {
    const langStart = content.indexOf(`  ${lang}: {`, startIndex);
    if (langStart !== -1) {
      const langEnd = content.indexOf("  },", langStart);
      const langText = content.substring(langStart, langEnd);
      
      // Robust regex for key-value pair parsing with escaped quotes
      const keyValRegex = /"((?:[^"\\]|\\.)*)":\s*"((?:[^"\\]|\\.)*)"/g;
      let kvMatch;
      while ((kvMatch = keyValRegex.exec(langText)) !== null) {
        fullDict[lang][kvMatch[1]] = kvMatch[2];
      }
    }
  }
  
  const keysArray = Array.from(masterKeys);
  console.log("Translating missing keys in concurrent batches...");
  
  for (const lang of languages) {
    const missingKeys = keysArray.filter(k => !fullDict[lang][k]);
    if (missingKeys.length === 0) continue;
    
    console.log(`Language ${lang}: translating ${missingKeys.length} missing keys...`);
    
    const batchSize = 35;
    for (let i = 0; i < missingKeys.length; i += batchSize) {
      const batch = missingKeys.slice(i, i + batchSize);
      await Promise.all(batch.map(async (key) => {
        // Unescape key before translation request
        const unescapedKey = key.replace(/\\"/g, '"').replace(/\\n/g, '\n');
        const trans = await translateText(unescapedKey, lang);
        fullDict[lang][key] = trans;
      }));
      // Short sleep between batches to avoid rate limit
      await new Promise((r) => setTimeout(r, 250));
    }
  }
  
  // Format the new TRANSLATIONS string
  let newTranslationsString = "const TRANSLATIONS: Record<string, Record<string, string>> = {\n  en: {},\n";
  for (const lang of languages) {
    newTranslationsString += `  ${lang}: {\n`;
    for (const key of keysArray) {
      const escapedKey = key.replace(/"/g, '\\"').replace(/\n/g, '\\n');
      const escapedVal = fullDict[lang][key].replace(/"/g, '\\"').replace(/\n/g, '\\n');
      newTranslationsString += `    "${escapedKey}": "${escapedVal}",\n`;
    }
    newTranslationsString += "  },\n";
  }
  newTranslationsString += "};";
  
  // Replace the old TRANSLATIONS object with the new one
  const updatedContent = content.substring(0, startIndex) + newTranslationsString + content.substring(endIndex + 2);
  
  fs.writeFileSync(UI_KIT_PATH, updatedContent, "utf8");
  console.log("Successfully updated ui-kit.tsx with complete translations!");
}

run();
