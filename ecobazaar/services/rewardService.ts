
import { Reward } from '../types';

const REWARDS_KEY = 'ecobazaar_rewards';

const INITIAL_REWARDS: Reward[] = [
  {
    id: '1',
    title: '10% Discount Coupon',
    description: 'Get 10% off on your next purchase of any eco-friendly product.',
    pointsCost: 500,
    discountCode: 'ECO10',
    type: 'percentage',
    value: 10
  },
  {
    id: '2',
    title: '$20 Fixed Discount',
    description: 'Enjoy a flat $20 discount on orders above $100.',
    pointsCost: 1200,
    discountCode: 'GREEN20',
    type: 'fixed',
    value: 20
  },
  {
    id: '3',
    title: 'Free Shipping Voucher',
    description: 'Zero shipping costs for your next 3 orders.',
    pointsCost: 300,
    discountCode: 'FREESHIP',
    type: 'fixed',
    value: 0
  },
  {
    id: '4',
    title: '25% Mega Saver',
    description: 'Exclusive 25% discount for our top eco-warriors.',
    pointsCost: 2500,
    discountCode: 'WARRIOR25',
    type: 'percentage',
    value: 25
  }
];

export const getRewards = async (): Promise<Reward[]> => {
  const stored = localStorage.getItem(REWARDS_KEY);
  if (!stored) {
    localStorage.setItem(REWARDS_KEY, JSON.stringify(INITIAL_REWARDS));
    return INITIAL_REWARDS;
  }
  return JSON.parse(stored);
};

export const addReward = async (reward: Omit<Reward, 'id'>): Promise<Reward> => {
  const rewards = await getRewards();
  const newReward = {
    ...reward,
    id: Math.random().toString(36).substr(2, 9)
  };
  const updated = [...rewards, newReward];
  localStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
  return newReward;
};

export const deleteReward = async (id: string): Promise<void> => {
  const rewards = await getRewards();
  const updated = rewards.filter(r => r.id !== id);
  localStorage.setItem(REWARDS_KEY, JSON.stringify(updated));
};
