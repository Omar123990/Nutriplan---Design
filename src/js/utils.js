// ====== utils.js ======
import { loadFoodLog } from "./storage.js";

export const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

export function formatDate(date) {
  const options = { weekday: "long", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}

export function getNutrient(nutrients, name) {
  return nutrients.find((n) => n.nutrientName === name)?.value || 0;
}

export function getWeekDays() {
  const today = new Date();
  const week = [];

  const start = new Date(today);
  start.setDate(today.getDate() - today.getDay());

  for (let i = 0; i < 7; i++) {
    const d = new Date(start);
    d.setDate(start.getDate() + i);

    week.push({
      label: d.toLocaleDateString("en-US", { weekday: "short" }),
      day: d.getDate(),
      dateKey: d.toISOString().split("T")[0],
      calories: 0,
    });
  }
  return week;
}

export function calculateDailyTotals() {
  const items = loadFoodLog();
  return items.reduce(
    (totals, meal) => {
      totals.calories += meal.calories;
      totals.protein += meal.protein;
      totals.carbs += meal.carbs;
      totals.fat += meal.fat;
      return totals;
    },
    { calories: 0, protein: 0, carbs: 0, fat: 0 },
  );
}

export function calculateWeeklyCalories() {
  const foodItems = loadFoodLog();
  const week = getWeekDays();

  foodItems.forEach((meal) => {
    const day = week.find((d) => d.dateKey === meal.date);
    if (day) {
      day.calories += Number(meal.calories);
    }
  });

  return week;
}
