// ====== api.js ======
export const API_BASE = "https://www.themealdb.com/api/json/v1/1";
export const OPEN_FOOD_API = "https://world.openfoodfacts.org/cgi/search.pl";
export const USDA_API_KEY = "g1wB4LDrKdPKVeab39cPbBEnrWTn5uKQW5osUr17";
export const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

export async function fetchData(url) {
  const res = await fetch(url);
  return await res.json();
}

export async function fetchNutritionByIngredient(ingredient) {
  try {
    const res = await fetch(
      `${USDA_BASE_URL}?api_key=${USDA_API_KEY}&query=${ingredient}&pageSize=1`,
    );
    const data = await res.json();
    return data.foods?.[0]?.foodNutrients || [];
  } catch (error) {
    console.error("Error fetching nutrition data:", error);
    return [];
  }
}

export async function calculateMealNutrition(meal) {
  let totalCalories = 0,
    totalProtein = 0,
    totalCarbs = 0,
    totalFat = 0,
    totalFiber = 0;

  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}`];
    if (!ingredient) continue;

    const nutrients = await fetchNutritionByIngredient(ingredient);
    if (!nutrients || nutrients.length === 0) continue;

    const getNut = (name) =>
      nutrients.find((n) => n.nutrientName === name)?.value || 0;

    totalCalories += getNut("Energy");
    totalProtein += getNut("Protein");
    totalCarbs += getNut("Carbohydrate, by difference");
    totalFat += getNut("Total lipid (fat)");
    totalFiber += getNut("Fiber, total dietary");
  }

  return {
    calories: totalCalories,
    protein: totalProtein,
    carbs: totalCarbs,
    fat: totalFat,
    fiber: totalFiber,
  };
}
