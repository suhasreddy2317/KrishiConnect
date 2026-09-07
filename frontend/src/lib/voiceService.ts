import { apiRequest } from './api';

export type VoiceIntent =
  | 'recommendation'
  | 'market_price'
  | 'price_trend'
  | 'my_lots'
  | 'produce'
  | 'offers'
  | 'buyers'
  | 'shipments'
  | 'payments'
  | 'help'
  | 'unknown';

export interface VoiceContext {
  token: string | null;
  lots: Array<{ id: number; commodity_id: number | null; location: string | null; crop: string | null }>;
  language: string;
  crops: Array<{ id: number; name: string }>;
}

export interface DetectedCrop {
  id: number;
  name: string;
}

export interface IntentDetectionResult {
  intent: VoiceIntent;
  crop: DetectedCrop | null;
}

export interface VoiceResponse {
  intent: VoiceIntent;
  text: string;
  data: Record<string, unknown> | null;
  action_hint: string | null;
}

const KNOWN_CROPS: Array<{ names: string[]; id: number }> = [
  { names: ['tomato', 'टमाटर', 'टमाटो', 'ಟೊಮೇಟೊ', 'టమాట', 'టమాటో'], id: -1 },
  { names: ['onion', 'प्याज', 'प्याज़', 'ಈರುಳ್ಳಿ', 'ఉల్లిపాయ'], id: -2 },
  { names: ['soybean', 'सोया', 'सोयाबीन', 'ಸೋಯಾಬೀನ್', 'సోయాబీన్'], id: -3 },
  { names: ['wheat', 'गेहूँ', 'ಗೋಧಿ', 'గోధుమ'], id: -4 },
];

function detectCrop(query: string): DetectedCrop | null {
  const q = query.toLowerCase();
  for (const crop of KNOWN_CROPS) {
    for (const name of crop.names) {
      if (q.includes(name.toLowerCase())) {
        return { id: crop.id, name: crop.names[0] };
      }
    }
  }
  return null;
}

function detectIntent(query: string): IntentDetectionResult {
  const q = query.toLowerCase();
  const crop = detectCrop(query);

  const patterns: Array<{ intent: VoiceIntent; keywords: string[] }> = [
    {
      intent: 'recommendation',
      keywords: [
        'when should i sell', 'should i sell', 'sell now', 'should i store',
        'when to sell', 'best time to sell', 'sell or store', 'hold or sell',
        'sell my',
        'कब बेचूं', 'बेचना चाहिए', 'अभी बेचूं', 'स्टोर करना चाहिए', 'बेचूं या रखूं',
        'बेचने का समय', 'भंडारण करना',
        'ಯಾವಾಗ ಮಾರಬೇಕು', 'ಮಾರಬೇಕೇ', 'ಈಗ ಮಾರಬೇಕು', 'ಸಂಗ್ರಹಿಸಬೇಕೇ',
        'ಮಾರಾಟ ಮಾಡಬೇಕು', 'ಉಳಿಸಬೇಕು',
        'ఎప్పుడు అమ్మాలి', 'అమ్మాలా', 'ఇప్పుడు అమ్మాలి', 'నిల్వ చేయాలా',
        'అమ్మటం',
      ],
    },
    {
      intent: 'price_trend',
      keywords: [
        'price trend', 'price going up', 'price falling', 'trending up', 'trending down',
        'भाव बढ़ रहा', 'भाव गिर रहा', 'कीमत बढ़ रही', 'कीमत गिर रही',
        'ಬೆಲೆ ಏರುತ್ತಿದೆಯೇ', 'ಬೆಲೆ ಇಳಿಯುತ್ತಿದೆಯೇ', 'ಬೆಲೆ ಟ್ರೆಂಡ್',
        'ధర పెరుగుతున్నదా', 'ధర తగ్గుతున్నదా', 'ధర ట్రెండ్',
      ],
    },
    {
      intent: 'market_price',
      keywords: [
        "today's price", 'market price', 'mandi price', 'current rate', 'price today',
        'how much is', 'what is the price', 'price of',
        'आज का भाव', 'मंडी भाव', 'बाजार भाव', 'कीमत', 'आज की कीमत',
        'ಇಂದಿನ ಬೆಲೆ', 'ಮಾರುಕಟ್ಟೆ ಬೆಲೆ', 'ಮಂಡಿ ಬೆಲೆ', 'ದರ',
        'నేటి ధర', 'మార్కెట్ ధర', 'మండీ ధర', 'రేటు',
      ],
    },
    {
      intent: 'my_lots',
      keywords: [
        'my lot', 'my lots', 'my produce', 'my crop', 'what do i have',
        'मेरे लॉट', 'मेरी फसल', 'उत्पाद', 'मेरा स्टॉक',
        'ನನ್ನ ಲಾಟ್', 'ನನ್ನ ಬೆಳೆ', 'ನನ್ನ ಉತ್ಪನ್ನ',
        'నా లాట్', 'నా పంట', 'నా ఉత్పత్తి',
      ],
    },
    {
      intent: 'offers',
      keywords: [
        'offer', 'offers', 'buyer offer', 'quotation',
        'ऑफर', 'प्रस्ताव', 'खरीदार',
        'ಆಫರ್', 'ಖರೀದಿದಾರ', 'ಪ್ರಸ್ತಾಪ',
        'ఆఫర్', 'కొనుగోలుదారు',
      ],
    },
    {
      intent: 'buyers',
      keywords: [
        'buyer', 'buyers', 'matched', 'match', 'who is interested',
        'खरीदार', 'मैच', 'रुचि',
        'ಖರೀದಿದಾರ', 'ಮೆಚ್ಚುಕೆ', 'ಆಸಕ್ತಿ',
        'కొనుగోలుదారు', 'మ్యాట్', 'ఆసక్తి',
      ],
    },
    {
      intent: 'shipments',
      keywords: [
        'shipment', 'shipments', 'delivery', 'track my', 'transit',
        'शिपमेंट', 'पहुंच', 'डिलीवरी', 'भेजना',
        'ಡೆಲಿವರಿ', 'ಶಿಪ್‌ಮೆಂಟ್',
        'డెలివరీ', 'షిప్‌మెంట్',
      ],
    },
    {
      intent: 'payments',
      keywords: [
        'payment', 'payments', 'paid', 'money received', 'received money',
        'भुगतान', 'पैसा', 'राशी',
        'ಪೇಮೆಂಟ್', 'ಚೆಲವಿ', 'ಹಣ',
        'చెల్లిళ్ళు', 'ధన', 'నగదు',
      ],
    },
    {
      intent: 'help',
      keywords: [
        'help', 'assist', 'what can you do', 'how to', 'how do i',
        'सहायता', 'मदद', 'क्या कर सकते हो',
        'ಸಹಾಯ', 'ಏನು ಮಾಡಬಹುದು',
        'సహాయం', 'ఏమి చేయవచ్చు',
      ],
    },
  ];

  for (const pattern of patterns) {
    if (pattern.keywords.some((kw) => q.includes(kw))) {
      return { intent: pattern.intent, crop };
    }
  }

  return { intent: 'unknown', crop: null };
}

export function detectIntentWithCrop(query: string): IntentDetectionResult {
  return detectIntent(query);
}

export async function processVoiceQuery(
  query: string,
  ctx: VoiceContext,
  preferredLotId?: number,
): Promise<VoiceResponse> {
  const { intent, crop } = detectIntent(query);

  if (intent === 'unknown') {
    return {
      intent: 'unknown',
      text: 'Try asking about today\'s price, when to sell, your lots, buyers, or payments.',
      data: null,
      action_hint: null,
    };
  }

  if (!ctx.token) {
    return {
      intent,
      text: 'You need to be signed in to use the voice assistant.',
      data: { error: 'no_token' },
      action_hint: 'Please log in',
    };
  }

  let lotId: number | undefined;
  if (preferredLotId !== undefined) {
    lotId = preferredLotId;
  } else if (crop) {
    const matchingLot = ctx.lots.find(l => {
      if (l.crop && l.crop.toLowerCase().includes(crop.name.toLowerCase())) return true;
      if (l.commodity_id !== null && l.commodity_id === crop.id) return true;
      return false;
    });
    lotId = matchingLot?.id;
  }
  if (lotId === undefined) {
    lotId = ctx.lots[0]?.id;
  }

  try {
    const body: Record<string, unknown> = {
      query,
      language: ctx.language,
    };
    if (lotId !== undefined) body.lot_id = lotId;
    if (crop) {
      body.commodity_id = crop.id;
      body.crop_name = crop.name;
    }

    const result = await apiRequest<VoiceResponse>('/voice/query', {
      method: 'POST',
      body: JSON.stringify(body),
      headers: {
        'Content-Type': 'application/json',
      },
    }, ctx.token);

    return result;
  } catch {
    return {
      intent,
      text: 'Unable to reach the server. Please check your connection and try again.',
      data: { error: 'network_error' },
      action_hint: 'Retry',
    };
  }
}

export const INTENT_ACTION_MAP: Record<VoiceIntent, { label: string | null; tab: string | null }> = {
  recommendation: { label: 'View Recommendation', tab: '/farmer' },
  market_price:   { label: 'View Market Prices', tab: '/farmer/market' },
  price_trend:    { label: 'View Market Prices', tab: '/farmer/market' },
  my_lots:        { label: 'View My Lots', tab: '/farmer/lots' },
  produce:        { label: 'View My Lots', tab: '/farmer/lots' },
  offers:         { label: 'View Offers', tab: '/farmer/offers' },
  buyers:         { label: 'View Matched Buyers', tab: '/farmer/offers' },
  shipments:      { label: 'View Shipments', tab: '/farmer/shipments' },
  payments:       { label: 'View Payments', tab: '/farmer/payments' },
  help:           { label: null, tab: null },
  unknown:        { label: null, tab: null },
};
