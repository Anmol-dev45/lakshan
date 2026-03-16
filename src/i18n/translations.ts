import type { Language } from '../store/slices/settingsSlice';

const t = {
  // ── Splash ───────────────────────────────────────────────────────────────
  splashTitle:   { ne: 'नेपालका लागि एआई\nस्वास्थ्य सहायक', en: 'AI Health Assistant\nfor Nepal' },
  splashSub:     { ne: 'AI Health Assistant for Nepal', en: 'Powered by advanced AI' },
  splashDiag:    { ne: 'निदान', en: 'Diagnose' },
  splashVoice:   { ne: 'आवाज', en: 'Voice' },
  splashOffline: { ne: 'अफलाइन', en: 'Offline' },
  splashLoading: { ne: 'प्रणाली लोड हुँदैछ...', en: 'Loading system...' },
  splashTap:     { ne: 'अगाडि बढ्न यहाँ ट्याप गर्नुहोस्', en: 'Tap here to continue' },

  // ── Header / App ─────────────────────────────────────────────────────────
  appName:       { ne: 'AI स्वास्थ्य सहायक', en: 'AI Health Assistant' },

  // ── Bottom Nav ────────────────────────────────────────────────────────────
  navHome:       { ne: 'गृह',     en: 'Home' },
  navHospital:   { ne: 'अस्पताल', en: 'Hospital' },
  navEmergency:  { ne: 'संकट',    en: 'SOS' },
  navHistory:    { ne: 'इतिहास',  en: 'History' },
  navSettings:   { ne: 'सेटिङ',   en: 'Settings' },

  // ── Home ─────────────────────────────────────────────────────────────────
  homeGreeting:      { ne: 'नमस्ते!', en: 'Hello!' },
  homeSubtitle:      { ne: 'आज तपाईंलाई कस्तो छ?', en: 'How are you feeling today?' },
  homeCheckSymptoms: { ne: 'लक्षण जाँच गर्नुहोस्', en: 'Check Symptoms' },
  homeAiActive:      { ne: 'AI सक्रिय छ', en: 'AI Active' },
  homeSpeakTitle:    { ne: 'बोलेर लक्षण बताउनुहोस्', en: 'Describe your symptoms' },
  homeSpeakSub:      { ne: 'तपाईंको स्वास्थ्य समस्या बारे कुरा गर्न यहाँ थिच्नुहोस्', en: 'Tap here to tell us about your health concern' },
  homeStartCheck:    { ne: 'जाँच सुरु गर्नुहोस्', en: 'Start Check' },
  homeFeatures:      { ne: 'मुख्य सुविधाहरू', en: 'Main Features' },
  homeLiveVoice:     { ne: 'AI डाक्टर (Live Voice)', en: 'AI Doctor (Live Voice)' },
  homeLiveVoiceSub:  { ne: 'सिधा बोल्नुहोस् — AI तुरुन्त जवाफ दिन्छ', en: 'Speak directly — AI replies instantly' },
  homeReportScan:    { ne: 'रिपोर्ट स्क्यान', en: 'Report Scan' },
  homeReportScanSub: { ne: 'तपाईंको रिपोर्ट बुझ्नुहोस्', en: 'Understand your report' },
  homeMedicine:      { ne: 'औषधि चिन्नुहोस्', en: 'Identify Medicine' },
  homeMedicineSub:   { ne: 'नाम र काम हेर्नुहोस्', en: 'See name and usage' },
  homeHospital:      { ne: 'नजिकैका अस्पताल', en: 'Nearby Hospitals' },
  homeHospitalSub:   { ne: 'उपचार केन्द्र खोज्नुहोस्', en: 'Find treatment centers' },
  homeDiseaseAlert:  { ne: 'रोग चेतावनी', en: 'Disease Alert' },
  homeDiseaseAlertSub: { ne: 'तपाईंको क्षेत्रको जानकारी', en: 'Info for your area' },
  homeTipTitle:      { ne: 'स्वास्थ्य सुझाव', en: 'Health Tip' },
  homeTipBody:       { ne: 'दिनमा प्रशस्त पानी पिउनुहोस्, यसले शरीरलाई स्वस्थ राख्छ।', en: 'Drink plenty of water every day — it keeps your body healthy.' },

  // ── Login ─────────────────────────────────────────────────────────────────
  loginBrand:        { ne: 'स्वस्थ जीवन', en: 'Swastha Jiwan' },
  loginBrandSub:     { ne: 'तपाईंको स्वास्थ्य, हाम्रो प्राथमिकता', en: 'Your health, our priority' },
  loginTab:          { ne: 'लगइन', en: 'Sign In' },
  signupTab:         { ne: 'नयाँ खाता', en: 'Sign Up' },
  labelFullName:     { ne: 'पूरा नाम', en: 'Full Name' },
  phFullName:        { ne: 'आफ्नो नाम', en: 'Your name' },
  labelEmail:        { ne: 'इमेल', en: 'Email' },
  labelPassword:     { ne: 'पासवर्ड', en: 'Password' },
  phPassword:        { ne: 'कम्तीमा ६ अक्षर', en: 'Min. 6 characters' },
  btnLogin:          { ne: 'लगइन गर्नुहोस्', en: 'Sign In' },
  btnSignup:         { ne: 'खाता सिर्जना गर्नुहोस्', en: 'Create Account' },
  loginOr:           { ne: 'वा', en: 'or' },
  loginDemo:         { ne: 'बिना खाता जारी राख्नुहोस् (Demo Mode)', en: 'Continue without account (Demo Mode)' },
  loginPrivacy:      { ne: 'तपाईंको डेटा Supabase मा सुरक्षित राखिन्छ।', en: 'Your data is securely stored.' },
  loginPrivacySub:   { ne: 'स्वास्थ्य डेटा कहिँ बिक्री हुँदैन।', en: 'Health data is never sold.' },
  errEmailTaken:     { ne: 'यो इमेल पहिलेनै दर्ता भएको छ। लगइन प्रयास गर्नुहोस्।', en: 'This email is already registered. Try signing in.' },
  msgSignupOk:       { ne: 'खाता सिर्जना भयो! आफ्नो इमेल जाँच गरी पुष्टि लिंक थिच्नुहोस्।', en: 'Account created! Check your email and click the confirmation link.' },
  errBadCredentials: { ne: 'गलत इमेल वा पासवर्ड।', en: 'Incorrect email or password.' },
  errEmailUnconfirmed: { ne: 'इमेल पुष्टि गरिएको छैन। inbox जाँच्नुहोस्।', en: 'Email not confirmed. Check your inbox.' },
  errWeakPassword:   { ne: 'पासवर्ड कम्तीमा ६ अक्षर हुनुपर्छ।', en: 'Password must be at least 6 characters.' },
  errUnknown:        { ne: 'अज्ञात त्रुटि भयो', en: 'An unknown error occurred' },

  // ── SymptomChat ───────────────────────────────────────────────────────────
  chatTitle:         { ne: 'एआई परामर्श', en: 'AI Consultation' },
  chatSubtitle:      { ne: 'AI Health Consultation', en: 'AI Health Consultation' },
  chatPlaceholder:   { ne: 'आफ्नो लक्षण लेख्नुहोस्...', en: 'Type your symptoms...' },
  chatAnalysing:     { ne: 'विश्लेषण गरिरहेको छ...', en: 'Analysing...' },
  chatThinking:      { ne: 'सोच्दैछु...', en: 'Thinking...' },
  chatTranscribing:  { ne: 'सुन्दैछु...', en: 'Listening...' },
  chatAnalyseBtn:    { ne: 'विश्लेषण गर्नुहोस् (Analyse Now)', en: 'Analyse Now' },
  chipFever:         { ne: 'ज्वरो', en: 'Fever' },
  chipHeadache:      { ne: 'टाउको दुखाइ', en: 'Headache' },
  chipCough:         { ne: 'खोकी', en: 'Cough' },
  chipFatigue:       { ne: 'थकान', en: 'Fatigue' },
  chipChestPain:     { ne: 'छाती दुखाइ', en: 'Chest Pain' },
  chatImageFail:     { ne: 'फोटो विश्लेषण गर्न सकिएन। कृपया पुनः प्रयास गर्नुहोस्।', en: 'Could not analyse photo. Please try again.' },
  chatSendingPhoto:  { ne: '📷 फोटो पठाइरहेको छु — विश्लेषण गर्दैछु...', en: '📷 Sending photo — analysing...' },
  chatDisclaimer:    { ne: 'यो एआई सल्लाह हो, अन्तिम चिकित्सा निर्णय होइन।', en: 'AI advice only — not a medical diagnosis.' },
  chatGreeting:      { ne: 'नमस्ते! म तपाईंको स्वास्थ्य सहायक हुँ। आज तपाईंलाई कस्तो महसुस भइरहेको छ? माइक थिच्नुहोस् वा टाइप गर्नुहोस्।', en: 'Hello! I\'m your AI health assistant. How are you feeling today? Tap the mic or type to describe your symptoms.' },

  // ── DiagnosisResult ───────────────────────────────────────────────────────
  diagTitle:         { ne: 'जाँचको नतिजा', en: 'Diagnosis Result' },
  diagListen:        { ne: 'सुन्नुस्', en: 'Listen' },
  diagStop:          { ne: 'रोक्नुस्', en: 'Stop' },
  diagLoading:       { ne: 'लोड...', en: 'Loading...' },
  diagNoResult:      { ne: 'कुनै विश्लेषण भेटिएन। पहिले लक्षण प्रविष्ट गर्नुहोस्।', en: 'No analysis found. Please enter symptoms first.' },
  diagStartCheck:    { ne: 'लक्षण जाँच सुरु गर्नुहोस्', en: 'Start Symptom Check' },
  diagSymptoms:      { ne: 'पहिचान गरिएका लक्षणहरू', en: 'Identified Symptoms' },
  diagMissingInfo:   { ne: 'यो जानकारी थप्दा परिणाम अझ सटीक हुन्छ:', en: 'Adding this info will improve accuracy:' },
  diagPossible:      { ne: 'सम्भावित समस्याहरू', en: 'Possible Conditions' },
  diagRecommend:     { ne: 'सिफारिसहरू', en: 'Recommendations' },
  diagWarning:       { ne: 'ध्यान दिनुपर्ने संकेतहरू', en: 'Warning Signs' },
  diagHomeCare:      { ne: 'घरेलु उपचार सुझाव', en: 'Home Care' },
  diagAddSymptoms:   { ne: 'थप लक्षण थप्नुहोस्', en: 'Add More Symptoms' },
  diagSeeDoctor:     { ne: 'डाक्टरकहाँ जानुहोस् →', en: 'See a Doctor →' },
  diagEmergency:     { ne: 'तुरुन्त अस्पताल (Emergency)', en: 'Emergency Hospital' },
  diagDisclaimer:    { ne: 'यो नतिजा एआई द्वारा तयार गरिएको हो र केवल जोखिम विश्लेषणको लागि हो। यसलाई अन्तिम चिकित्सा सल्लाह मान्नु हुँदैन। गम्भीर अवस्थामा सधैं दक्ष चिकित्सकको परामर्श लिनुहोस्।', en: 'This result is AI-generated and for risk assessment only. Do not treat it as final medical advice. Always consult a qualified doctor for serious conditions.' },
  diagDisclaimerLabel: { ne: 'सूचना:', en: 'Note:' },
  diagVoiceError:    { ne: 'आवाज उपलब्ध छैन।', en: 'Voice unavailable.' },
  diagConfLow:       { ne: 'कम आत्मविश्वास', en: 'Low Confidence' },
  diagConfMed:       { ne: 'मध्यम आत्मविश्वास', en: 'Medium Confidence' },
  diagConfHigh:      { ne: 'उच्च आत्मविश्वास', en: 'High Confidence' },

  // ── History ───────────────────────────────────────────────────────────────
  histTitle:         { ne: 'स्वास्थ्य इतिहास', en: 'Health History' },
  histTotalChecks:   { ne: 'कुल जाँच', en: 'Total Checks' },
  histLastCheck:     { ne: 'पछिल्लो जाँच', en: 'Last Check' },
  histRecentRecords: { ne: 'पछिल्ला रेकर्डहरू', en: 'Recent Records' },
  histClearAll:      { ne: 'सबै मेट्नुहोस्', en: 'Clear All' },
  histEmpty:         { ne: 'कुनै रेकर्ड छैन', en: 'No records yet' },
  histEmptySub:      { ne: 'एआई जाँच पछि तपाईंको इतिहास यहाँ देखिनेछ।', en: 'Your history will appear here after an AI check.' },
  histFirstCheck:    { ne: 'पहिलो जाँच सुरु गर्नुहोस्', en: 'Start First Check' },
  histViewResult:    { ne: 'नतिजा हेर्नुहोस्', en: 'View Result' },
  histPossible:      { ne: 'सम्भावित:', en: 'Possible:' },
  histTip:           { ne: 'नियमित रूपमा लक्षणहरू रेकर्ड गर्नाले एआईलाई तपाईंको स्वास्थ्य ट्रेन्ड पहिचान गर्न सजिलो हुन्छ।', en: 'Recording symptoms regularly helps AI identify your health trends.' },
  histTimes:         { ne: 'पटक', en: 'times' },

  // ── Settings ──────────────────────────────────────────────────────────────
  settingsTitle:     { ne: 'सेटिङ (Settings)', en: 'Settings' },
  settingsLang:      { ne: 'भाषा परिवर्तन (Language)', en: 'Language' },
  settingsNepali:    { ne: 'नेपाली', en: 'नेपाली' },
  settingsEnglish:   { ne: 'English', en: 'English' },
  settingsActive:    { ne: 'सक्रिय (Active)', en: 'Active' },
  settingsChangeEn:  { ne: 'Change to English', en: 'Change to English' },
  settingsChangeNe:  { ne: 'नेपालीमा परिवर्तन', en: 'Switch to Nepali' },
  settingsVoice:     { ne: 'आवाज सेटिङ (Voice Settings)', en: 'Voice Settings' },
  settingsVoiceIn:   { ne: 'आवाजबाट खोज्ने', en: 'Voice Input' },
  settingsVoiceInSub: { ne: 'बोलिएका शब्दहरू बुझ्ने सुविधा', en: 'Recognize spoken words' },
  settingsAiVoice:   { ne: 'AI आवाज सुनाउने', en: 'AI Voice Output' },
  settingsAiVoiceSub: { ne: 'रिपोर्ट पढेर सुनाउने सुविधा', en: 'Read reports aloud' },
  settingsEmergency: { ne: 'आकस्मिक सम्पर्क', en: 'Emergency Contacts' },
  settingsAddContact: { ne: '+ थप्नुहोस्', en: '+ Add' },
  settingsNewContact: { ne: 'नयाँ सम्पर्क थप्नुहोस्', en: 'Add New Contact' },
  settingsApiKey:    { ne: 'AI API कन्फिगरेसन', en: 'AI API Configuration' },
  settingsApiNote:   { ne: 'Anthropic Claude API key राख्नुहोस्। नराखे demo mode मा चल्नेछ।', en: 'Enter your Anthropic Claude API key. If blank, runs in demo mode.' },
  settingsSaveKey:   { ne: 'API Key सुरक्षित गर्नुहोस्', en: 'Save API Key' },
  settingsKeySaved:  { ne: 'सुरक्षित भयो!', en: 'Saved!' },
  settingsKeyNote:   { ne: 'Key browser मा मात्र store गरिन्छ। कहिँ पनि पठाइँदैन।', en: 'Key is stored in browser only. Never sent anywhere.' },
  settingsOther:     { ne: 'अन्य विकल्पहरू', en: 'Other Options' },
  settingsOffline:   { ne: 'अफलाइन मोड', en: 'Offline Mode' },
  settingsOfflineSub: { ne: 'इन्टरनेट बिना चलाउने', en: 'Use without internet' },
  settingsAbout:     { ne: 'हाम्रो बारेमा (About Us)', en: 'About Us' },
  settingsLogout:    { ne: 'लग-आउट (Logout)', en: 'Log Out' },
  settingsVersion:   { ne: '© २०८० AI स्वास्थ्य नेपाल', en: '© 2080 AI Health Nepal' },

  // ── Emergency ─────────────────────────────────────────────────────────────
  emergencyTitle:    { ne: 'आकस्मिक सेवा', en: 'Emergency Services' },
  emergencySOS:      { ne: 'SOS कल', en: 'SOS Call' },
  emergencyGPS:      { ne: 'GPS पठाउनुहोस्', en: 'Send GPS' },
  emergencyFirstAid: { ne: 'प्राथमिक उपचार', en: 'First Aid' },
  emergencyBurn:     { ne: 'आगोले पोलेमा', en: 'Burns' },
  emergencyBleeding: { ne: 'रगत बगेमा', en: 'Bleeding' },
  emergencyUnconscious: { ne: 'बेहोस भएमा', en: 'Unconscious' },
  emergencySnakeBite: { ne: 'सर्पले टोकेमा', en: 'Snake Bite' },

  // ── Hospital ──────────────────────────────────────────────────────────────
  hospitalTitle:     { ne: 'नजिकैका अस्पताल', en: 'Nearby Hospitals' },
  hospitalSearch:    { ne: 'अस्पताल खोज्नुहोस्...', en: 'Search hospitals...' },
  hospitalNearby:    { ne: 'तपाईंको नजिकका अस्पतालहरू', en: 'Hospitals Near You' },
  hospitalCall:      { ne: 'फोन गर्नुहोस्', en: 'Call' },

  // ── MedicalReportScan ─────────────────────────────────────────────────────
  reportTitle:       { ne: 'रिपोर्ट स्क्यानर', en: 'Report Scanner' },
  reportCapture:     { ne: 'रिपोर्टको फोटो खिच्नुहोस्', en: 'Take a photo of your report' },
  reportAnalysing:   { ne: 'AI विश्लेषण गरिरहेको छ...', en: 'AI is analysing...' },
  reportSummary:     { ne: 'तपाईंको रिपोर्टको सारांश', en: 'Your Report Summary' },

  // ── MedicineIdentifier ────────────────────────────────────────────────────
  medTitle:          { ne: 'औषधि पहिचान', en: 'Medicine Identifier' },
  medCapture:        { ne: 'औषधिको फोटो खिच्नुहोस्', en: 'Take a photo of the medicine' },
  medAnalysing:      { ne: 'AI पहिचान गरिरहेको छ...', en: 'AI is identifying...' },
  medIdentified:     { ne: 'पहिचान गरियो', en: 'Identified' },
  medUsage:          { ne: 'यसको प्रयोग', en: 'Usage' },
  medCaution:        { ne: 'सावधानी', en: 'Caution' },

  // ── LiveConsultation ──────────────────────────────────────────────────────
  liveIdle:          { ne: 'माथिको बटन थिच्नुहोस्', en: 'Press the button above' },
  liveConnecting:    { ne: 'जोड्दैछौं...', en: 'Connecting...' },
  liveReady:         { ne: 'बोल्नुहोस्', en: 'Speak now' },
  liveSpeaking:      { ne: 'AI बोल्दैछ', en: 'AI speaking' },
  liveError:         { ne: 'त्रुटि भयो', en: 'Error occurred' },
  liveYouSaid:       { ne: 'तपाईंले भन्नुभयो', en: 'You said' },
  liveAiDoctor:      { ne: 'AI डाक्टर', en: 'AI Doctor' },
} as const;

export type TKey = keyof typeof t;

export function translate(key: TKey, lang: Language): string {
  return t[key][lang];
}

export default t;
