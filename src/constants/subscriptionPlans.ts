export interface SubscriptionPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  duration: 'monthly' | 'yearly';
  features: string[];
  popular?: boolean;
  savings?: string;
}

export const SubscriptionPlans: SubscriptionPlan[] = [
  {
    id: 'free',
    name: 'Free',
    price: 0,
    currency: 'VND',
    duration: 'monthly',
    features: [
      '3 food scans per day',
      'Basic nutrition tracking',
      'BMI calculator',
      'Water tracking',
      'Basic exercise logging',
      'Limited food database access',
    ],
  },
  {
    id: 'premium_monthly',
    name: 'Premium Monthly',
    price: 99000,
    currency: 'VND',
    duration: 'monthly',
    popular: true,
    features: [
      'Unlimited food scans',
      'AI-powered nutrition advice',
      'Advanced meal planning',
      'Recipe recommendations',
      'Progress analytics',
      'Social features',
      'Challenges & leaderboards',
      'Priority customer support',
      'Export data',
      'Advanced charts',
      'Personalized goals',
      'Nutrition insights',
    ],
  },
  {
    id: 'premium_yearly',
    name: 'Premium Yearly',
    price: 990000,
    currency: 'VND',
    duration: 'yearly',
    savings: 'Save 17%',
    features: [
      'Unlimited food scans',
      'AI-powered nutrition advice',
      'Advanced meal planning',
      'Recipe recommendations',
      'Progress analytics',
      'Social features',
      'Challenges & leaderboards',
      'Priority customer support',
      'Export data',
      'Advanced charts',
      'Personalized goals',
      'Nutrition insights',
      'Exclusive premium content',
      'Early access to new features',
    ],
  },
];

export const FeatureComparison = {
  'Food Scans': {
    free: '3 per day',
    premium: 'Unlimited',
  },
  'AI Nutrition Advice': {
    free: '❌',
    premium: '✅',
  },
  'Meal Planning': {
    free: 'Basic',
    premium: 'Advanced AI',
  },
  'Recipe Database': {
    free: 'Limited',
    premium: 'Full access',
  },
  'Progress Analytics': {
    free: 'Basic charts',
    premium: 'Advanced analytics',
  },
  'Social Features': {
    free: '❌',
    premium: '✅',
  },
  'Challenges': {
    free: '❌',
    premium: '✅',
  },
  'Export Data': {
    free: '❌',
    premium: '✅',
  },
  'Customer Support': {
    free: 'Community',
    premium: 'Priority',
  },
  'Vietnamese Food Database': {
    free: 'Limited',
    premium: 'Complete',
  },
} as const;

export const PremiumFeatures = [
  {
    icon: '🔍',
    title: 'Unlimited Scans',
    description: 'Scan as many foods as you want, anytime',
  },
  {
    icon: '🤖',
    title: 'AI Nutrition Coach',
    description: 'Get personalized advice from our AI nutritionist',
  },
  {
    icon: '📊',
    title: 'Advanced Analytics',
    description: 'Detailed insights into your nutrition patterns',
  },
  {
    icon: '🍽️',
    title: 'Smart Meal Planning',
    description: 'AI-generated meal plans based on your goals',
  },
  {
    icon: '👥',
    title: 'Social Features',
    description: 'Connect with friends and join challenges',
  },
  {
    icon: '🏆',
    title: 'Challenges & Rewards',
    description: 'Participate in weekly challenges and earn badges',
  },
  {
    icon: '📈',
    title: 'Export Data',
    description: 'Export your nutrition data for analysis',
  },
  {
    icon: '🇻🇳',
    title: 'Complete Vietnamese Database',
    description: 'Access to 1000+ Vietnamese foods',
  },
] as const;