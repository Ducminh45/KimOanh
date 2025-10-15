import api from './apiClient';

export async function getDailySummary(date?: string) {
  const res = await api.get('/progress/summary', { params: { date } });
  return res.data as {
    waterMl: number;
    caloriesBurned: number;
    calories: number;
    macros: { proteinG: number; carbsG: number; fatG: number; fiberG: number };
  };
}
