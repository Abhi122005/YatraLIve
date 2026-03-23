// Multi-language translations for DisplayPage
export const translations = {
  display: {
    en: {
      title: 'KSRTC Smart Terminal',
      subtitle: 'Kerala State Road Transport Corporation',
      arrivalBoard: 'Arrival Board',
      delayAlerts: 'Delay Alerts',
      recentDepartures: 'Recent Departures',
      connectionLost: '⚠️ Connection Lost — Attempting to reconnect...',
      footer: 'Ernakulam KSRTC Depot • Real-Time Passenger Information System • Powered by YatraLive',
      noData: 'No buses at this time',
      busNumber: 'Bus Number',
      type: 'Type',
      route: 'Route',
      destination: 'Destination',
      distance: 'Distance',
      eta: 'ETA',
      status: 'Status',
      platform: 'Platform',
      arrivedAt: 'Arrived At',
      departedAt: 'Departed At',
      statusLabels: {
        SCHEDULED: 'Scheduled',
        APPROACHING: 'Approaching',
        NEAR: 'Near Depot',
        ARRIVED: 'Arrived',
        DEPARTED: 'Departed',
        DELAYED: 'Delayed',
        CANCELLED: 'Cancelled'
      }
    },
    ml: {
      title: 'കെഎസ്ആർടിസി സ്മാർട് ടെർമിനൽ',
      subtitle: 'കേരള സ്റ്റേറ്റ് റോഡ് ട്രാൻസ്പോർട്ട് കോർപ്പറേഷൻ',
      arrivalBoard: 'വരവ് ബോർഡ്',
      delayAlerts: 'കാലതാമസ അറിയിപ്പുകൾ',
      recentDepartures: 'സമീപകാല പുറപ്പാടുകൾ',
      connectionLost: '⚠️ കണക്ഷൻ നഷ്ടപ്പെട്ടു — വീണ്ടും ബന്ധിപ്പിക്കാൻ ശ്രമിക്കുന്നു...',
      footer: 'എർണാകുളം കെഎസ്ആർടിസി ഡിപോ • തത്സമയ യാത്രികർ വിവര സിസ്റ്റം • യാത്രലൈവ് മുഖേന സാധ്യമായി',
      noData: 'ഈ സമയത്ത് ബസുകൾ ഉണ്ടാകില്ല',
      busNumber: 'ബസ് നമ്പർ',
      type: 'തരം',
      route: 'റൂട്ട്',
      destination: 'ലക്ഷ്യസ്ഥാനം',
      distance: 'അകലം',
      eta: 'വരണ്ട സമയം',
      status: 'നിലവാരം',
      platform: 'പ്ലാറ്റ്ഫോം',
      arrivedAt: 'എത്തിയ സമയം',
      departedAt: 'പുറപ്പെട്ട സമയം',
      statusLabels: {
        SCHEDULED: 'നിശ്ചിത സമയപ്പട',
        APPROACHING: 'അടുത്തുവരുന്നത്',
        NEAR: 'ഡിപോയ്ക്കടുത്ത്',
        ARRIVED: 'എത്തിച്ചേരി',
        DEPARTED: 'പുറപ്പെട്ടത്',
        DELAYED: 'കാലതാമസം',
        CANCELLED: 'റദ്ദാക്കിയത്'
      }
    },
    hi: {
      title: 'केएसआरटीसी स्मार्ट टर्मिनल',
      subtitle: 'केरल राज्य सड़क परिवहन निगम',
      arrivalBoard: 'आगमन बोर्ड',
      delayAlerts: 'विलंब सूचनाएँ',
      recentDepartures: 'हाल के प्रस्थान',
      connectionLost: '⚠️ कनेक्शन खो गया — फिर से कनेक्ट करने की कोशिश की जा रही है...',
      footer: 'एर्नाकुलम केएसआरटीसी डिपो • वास्तविक समय यात्री सूचना प्रणाली • यात्रा लाइव द्वारा संचालित',
      noData: 'इस समय कोई बस नहीं',
      busNumber: 'बस संख्या',
      type: 'प्रकार',
      route: 'मार्ग',
      destination: 'गंतव्य',
      distance: 'दूरी',
      eta: 'आगमन समय',
      status: 'स्थिति',
      platform: 'प्लेटफ़ॉर्म',
      arrivedAt: 'आगमन समय',
      departedAt: 'प्रस्थान समय',
      statusLabels: {
        SCHEDULED: 'निर्धारित',
        APPROACHING: 'समीप आ रहा है',
        NEAR: 'डिपो के पास',
        ARRIVED: 'पहुँच गया',
        DEPARTED: 'रवाना हुआ',
        DELAYED: 'विलंबित',
        CANCELLED: 'रद्द'
      }
    }
  },
  announcements: {
    en: {
      busArriving: 'Bus number {busNumber} from {route} to {destination} is now arriving at platform {platform}.',
      busApproaching: 'Bus number {busNumber} from {route} is approaching the depot.',
      busDelayed: 'Bus number {busNumber} to {destination} is running late.',
    },
    ml: {
      busArriving: '{route} നിന്നും {destination} ലേക്കുള്ള {busNumber} നമ്പറുള്ള ബസ് ഇപ്പോൾ പ്ലാറ്റ്ഫോം {platform} ൽ എത്തിയിരിക്കുന്നു.',
      busApproaching: '{route} നിന്നുള്ള {busNumber} നമ്പറുള്ള ബസ് ഡിപോയ്ക്കടുത്തുവരികയാണ്.',
      busDelayed: '{destination} ലേക്കുള്ള {busNumber} നമ്പറുള്ള ബസ് കാലതാമസത്തോടെ പ്രവർത്തിക്കുന്നു.',
    },
    hi: {
      busArriving: 'बस संख्या {busNumber} {route} से {destination} के लिए अब प्लेटफॉर्म {platform} पर आ रही है।',
      busApproaching: 'बस संख्या {busNumber} {route} से डिपो के पास आ रही है।',
      busDelayed: 'बस संख्या {busNumber} {destination} के लिए देर से चल रही है।',
    }
  }
};

// Dynamic data translation maps for backend values
// Keys are stored in UPPERCASE for case-insensitive lookup
export const dynamicTranslations = {
  busTypes: {
    'SUPER FAST': { ml: 'സൂപ്പർ ഫാസ്റ്റ്', hi: 'सुपर फास्ट' },
    'SUPER DELUXE': { ml: 'സൂപ്പർ ഡീലക്സ്', hi: 'सुपर डीलक्स' },
    'ORDINARY': { ml: 'ഓർഡിനറി', hi: 'साधारण' },
    'FAST PASSENGER': { ml: 'ഫാസ്റ്റ് പാസഞ്ചർ', hi: 'फास्ट पैसेंजर' },
    'AC SUPER FAST': { ml: 'എസി സൂപ്പർ ഫാസ്റ്റ്', hi: 'एसी सुपर फास्ट' },
    'DELUXE': { ml: 'ഡീലക്സ്', hi: 'डीलक्स' },
    'AC LOW FLOOR': { ml: 'എസി ലോ ഫ്ലോർ', hi: 'एसी लो फ्लोर' },
    'SLEEPER AC': { ml: 'സ്ലീപ്പർ എസി', hi: 'स्लीपर एसी' },
    'EXPRESS': { ml: 'എക്സ്പ്രസ്സ്', hi: 'एक्सप्रेस' },
  },
  destinations: {
    'KOZHIKODE': { ml: '\u0d15\u0d4b\u0d34\u0d3f\u0d15\u0d4d\u0d15\u0d4b\u0d1f\u0d4d', hi: '\u0915\u094b\u091d\u093c\u093f\u0915\u094b\u0921' },
    'THIRUVANANTHAPURAM': { ml: '\u0d24\u0d3f\u0d30\u0d41\u0d35\u0d28\u0d28\u0d4d\u0d24\u0d2a\u0d41\u0d30\u0d02', hi: '\u0924\u093f\u0930\u0941\u0935\u0928\u0902\u0924\u092a\u0941\u0930\u092e' },
    'TRIVANDRUM': { ml: '\u0d24\u0d3f\u0d30\u0d41\u0d35\u0d28\u0d28\u0d4d\u0d24\u0d2a\u0d41\u0d30\u0d02', hi: '\u0924\u093f\u0930\u0941\u0935\u0928\u0902\u0924\u092a\u0941\u0930\u092e' },
    'MUVATTUPUZHA': { ml: '\u0d2e\u0d42\u0d35\u0d3e\u0d31\u0d4d\u0d31\u0d41\u0d2a\u0d41\u0d34', hi: '\u092e\u0942\u0935\u093e\u091f\u094d\u091f\u0941\u092a\u0941\u0934\u093e' },
    'KOLLAM': { ml: '\u0d15\u0d4a\u0d32\u0d4d\u0d32\u0d02', hi: '\u0915\u094b\u0932\u094d\u0932\u092e' },
    'COIMBATORE': { ml: '\u0d15\u0d4b\u0d2f\u0d2e\u0d4d\u0d2a\u0d24\u0d4d\u0d24\u0d42\u0d7c', hi: '\u0915\u094b\u092f\u0902\u092c\u091f\u0942\u0930' },
    'PALAKKAD': { ml: '\u0d2a\u0d3e\u0d32\u0d15\u0d4d\u0d15\u0d3e\u0d1f\u0d4d', hi: '\u092a\u093e\u0932\u0915\u094d\u0915\u093e\u0921' },
    'KANNUR': { ml: '\u0d15\u0d23\u0d4d\u0d23\u0d42\u0d7c', hi: '\u0915\u0928\u094d\u0928\u0942\u0930' },
    'IDUKKI': { ml: '\u0d07\u0d1f\u0d41\u0d15\u0d4d\u0d15\u0d3f', hi: '\u0907\u0921\u0941\u0915\u094d\u0915\u0940' },
    'THRISSUR': { ml: '\u0d24\u0d43\u0d36\u0d4d\u0d36\u0d42\u0d7c', hi: '\u0924\u094d\u0930\u093f\u0936\u0942\u0930' },
    'KARAKKAD': { ml: '\u0d15\u0d30\u0d15\u0d4d\u0d15\u0d3e\u0d1f\u0d4d', hi: '\u0915\u0930\u0915\u094d\u0915\u093e\u0921' },
    'ADOOR': { ml: '\u0d05\u0d1f\u0d42\u0d7c', hi: '\u0905\u0921\u0942\u0930' },
  },
  routes: {
    'VIA ALUVA': { ml: 'ആലുവ വഴി', hi: 'अलुवा के रास्ते' },
    'VIA ALUVA, THRISSUR': { ml: 'ആലുവ, തൃശ്ശൂർ വഴി', hi: 'अलुवा, त्रिशूर के रास्ते' },
    'VIA KOTTAYAM': { ml: 'കോട്ടയം വഴി', hi: 'कोट्टायम के रास्ते' },
    'VIA PERUMBAVOOR': { ml: 'പെരുമ്പാവൂർ വഴി', hi: 'पेरुंबावूर के रास्ते' },
    'VIA ALAPPUZHA': { ml: 'ആലപ്പുഴ വഴി', hi: 'आलप्पुऴा के रास्ते' },
    'VIA THRISSUR, PALAKKAD': { ml: 'തൃശ്ശൂർ, പാലക്കാട് വഴി', hi: 'त्रिशूर, पालक्काड के रास्ते' },
    'VIA THRISSUR': { ml: 'തൃശ്ശൂർ വഴി', hi: 'त्रिशूर के रास्ते' },
    'VIA ANGAMALY': { ml: 'അങ്കമാലി വഴി', hi: 'अंगमाली के रास्ते' },
    'VIA PARAVOOR': { ml: 'പറവൂർ വഴി', hi: 'परवूर के रास्ते' },
  },
};

const normalizeDynamicKey = (value = '') =>
  value
    .trim()
    .replace(/\s+/g, ' ')
    .toUpperCase();

const translateDestinationValue = (value, lang) => {
  const key = normalizeDynamicKey(value);
  return dynamicTranslations.destinations?.[key]?.[lang] || value;
};

const translateRouteValue = (value, lang) => {
  const key = normalizeDynamicKey(value);
  const exactMatch = dynamicTranslations.routes?.[key]?.[lang];
  if (exactMatch) return exactMatch;

  const viaMatch = value.trim().match(/^via\s+(.+)$/i);
  if (!viaMatch) return value;

  const translatedStops = viaMatch[1]
    .split(',')
    .map(stop => stop.trim())
    .filter(Boolean)
    .map(stop => translateDestinationValue(stop, lang));

  if (translatedStops.length === 0) return value;
  if (lang === 'ml') return `${translatedStops.join(', ')} വഴി`;
  if (lang === 'hi') return `${translatedStops.join(', ')} के रास्ते`;
  return value;
};

// Translate a dynamic field value to the target language (case-insensitive)
export const translateField = (field, value, lang = 'en') => {
  if (lang === 'en' || !value) return value;

  if (field === 'destinations') {
    return translateDestinationValue(value, lang);
  }

  if (field === 'routes') {
    return translateRouteValue(value, lang);
  }

  const key = normalizeDynamicKey(value);
  return dynamicTranslations[field]?.[key]?.[lang] || value;
};

// Utility function to get translation
export const t = (section, key, lang = 'en') => {
  try {
    return translations[section]?.[lang]?.[key] || translations[section]?.['en']?.[key] || key;
  } catch {
    return key;
  }
};

// Format announcement text
export const formatAnnouncement = (type, data, lang = 'en') => {
  const template = translations.announcements?.[lang]?.[type];
  if (!template) return '';

  // When generating non-English announcements, translate dynamic fields too
  const busNumber = data.bus_number || data.busNumber;
  const route = lang === 'en' ? data.route : (translateField('routes', data.route, lang) || data.route);
  const destination = lang === 'en' ? data.destination : (translateField('destinations', data.destination, lang) || data.destination);
  const platform = data.platform || '—';
  
  return template
    .replace('{busNumber}', busNumber)
    .replace('{route}', route)
    .replace('{destination}', destination)
    .replace('{platform}', platform);
};
