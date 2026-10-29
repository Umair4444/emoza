export type EmotionType = 'joy' | 'sadness' | 'anger' | 'surprise' | 'fear' | 'neutral';

export interface EmotionState {
  primary: EmotionType;
  intensity: number; // 0 to 1
  weights: {
    smile: number;      // -1 to 1 (negative = frown, positive = smile)
    browRaise: number;  // 0 to 1
    eyeWiden: number;   // 0 to 1
    headTilt: number;   // radians
    color: string;      // RGB hex color for ambient/glow mood
  };
}

const EMOTION_KEYWORDS: Record<EmotionType, string[]> = {
  joy: ['happy', 'joy', 'great', 'awesome', 'excited', 'wonderful', 'love', 'yay', 'fantastic', 'smile', 'laugh', 'good', 'best'],
  sadness: ['sad', 'sorry', 'cry', 'bad', 'hurt', 'pain', 'lonely', 'glum', 'unhappy', 'depressed', 'tear'],
  anger: ['angry', 'mad', 'hate', 'furious', 'rage', 'annoyed', 'frustrated', 'stupid', 'worst'],
  surprise: ['wow', 'omg', 'incredible', 'unbelievable', 'shock', 'surprised', 'really', 'what', 'gasp'],
  fear: ['scared', 'fear', 'terrified', 'nervous', 'anxious', 'panic', 'worried', 'oh no'],
  neutral: []
};

export function analyzeEmotion(text: string): EmotionState {
  const lowerText = text.toLowerCase();
  let detected: EmotionType = 'neutral';
  let maxMatches = 0;

  for (const [emotion, keywords] of Object.entries(EMOTION_KEYWORDS)) {
    if (emotion === 'neutral') continue;
    let matches = 0;
    for (const kw of keywords) {
      if (lowerText.includes(kw)) {
        matches++;
      }
    }
    if (matches > maxMatches) {
      maxMatches = matches;
      detected = emotion as EmotionType;
    }
  }

  const intensity = Math.min(1, Math.max(0.3, maxMatches * 0.35 + (detected !== 'neutral' ? 0.4 : 0.1)));

  switch (detected) {
    case 'joy':
      return {
        primary: 'joy',
        intensity,
        weights: {
          smile: 0.9 * intensity,
          browRaise: 0.2 * intensity,
          eyeWiden: 0.1,
          headTilt: 0.05,
          color: '#10b981' // emerald / vibrant green-blue
        }
      };
    case 'sadness':
      return {
        primary: 'sadness',
        intensity,
        weights: {
          smile: -0.7 * intensity,
          browRaise: -0.3 * intensity,
          eyeWiden: 0.0,
          headTilt: -0.15,
          color: '#3b82f6' // blue
        }
      };
    case 'anger':
      return {
        primary: 'anger',
        intensity,
        weights: {
          smile: -0.4 * intensity,
          browRaise: -0.6 * intensity,
          eyeWiden: 0.2,
          headTilt: -0.05,
          color: '#ef4444' // red
        }
      };
    case 'surprise':
      return {
        primary: 'surprise',
        intensity,
        weights: {
          smile: 0.2,
          browRaise: 0.9 * intensity,
          eyeWiden: 0.8 * intensity,
          headTilt: 0.1,
          color: '#8b5cf6' // purple
        }
      };
    case 'fear':
      return {
        primary: 'fear',
        intensity,
        weights: {
          smile: -0.2,
          browRaise: 0.7 * intensity,
          eyeWiden: 0.9 * intensity,
          headTilt: -0.1,
          color: '#f59e0b' // amber
        }
      };
    case 'neutral':
    default:
      return {
        primary: 'neutral',
        intensity: 0.5,
        weights: {
          smile: 0.1,
          browRaise: 0.0,
          eyeWiden: 0.0,
          headTilt: 0.0,
          color: '#06b6d4' // cyan
        }
      };
  }
}
