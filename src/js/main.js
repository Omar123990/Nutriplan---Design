"use strict";
// DOM elements
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");
const recipesCount = document.getElementById("recipes-count");

const loadingOverlay = document.getElementById("app-loading-overlay");

const mealCategoriesSection = document.getElementById(
  "meal-categories-section",
);
const searchFiltersSection = document.getElementById("search-filters-section");
const allRecipesSection = document.getElementById("all-recipes-section");
const mealDetailsSection = document.getElementById("meal-details");
const backBtn = document.getElementById("back-to-meals-btn");

const mealHeroImg = mealDetailsSection.querySelector("img");
const mealTitle = mealDetailsSection.querySelector("h1");
const heroServings = document.getElementById("hero-servings");
const heroCalories = document.getElementById("hero-calories");

const ingredientsContainer = mealDetailsSection.querySelector(
  ".grid.grid-cols-1.md\\:grid-cols-2",
);

const instructionsContainer = mealDetailsSection.querySelector(".space-y-4");
const videoContainer = mealDetailsSection.querySelector(".aspect-video");

const btnView = document.getElementById("list-view-btn");
const btnGrid = document.getElementById("grid-view-btn");

const searchInput = document.getElementById("search-input");
const cuisinesContainer = document.querySelector(
  "#search-filters-section .flex.items-center.gap-3",
);
const sidebarLinks = document.querySelectorAll("#sidebar .nav-link");
const allSections = document.querySelectorAll(
  "section, #all-recipes-section, #meal-details",
);

const API_BASE = "https://www.themealdb.com/api/json/v1/1";
const OPEN_FOOD_API = "https://world.openfoodfacts.org/cgi/search.pl";

const USDA_API_KEY = "g1wB4LDrKdPKVeab39cPbBEnrWTn5uKQW5osUr17";
const USDA_BASE_URL = "https://api.nal.usda.gov/fdc/v1/foods/search";

const nutritionCalories = document.getElementById("nutrition-calories");
const nutritionTotal = document.getElementById("nutrition-total");

const nutritionProtein = document.getElementById("nutrition-protein");
const nutritionCarbs = document.getElementById("nutrition-carbs");
const nutritionFat = document.getElementById("nutrition-fat");
const nutritionFiber = document.getElementById("nutrition-fiber");

const proteinBar = document.getElementById("nutrition-protein-bar");
const carbsBar = document.getElementById("nutrition-carbs-bar");
const fatBar = document.getElementById("nutrition-fat-bar");
const fiberBar = document.getElementById("nutrition-fiber-bar");

const btnLogMeal = document.getElementById("log-meal-btn");

const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");

const searchInputLog = document.getElementById("product-search-input");
const inputSearch = document.getElementById("search-product-btn");

const categoryButtons = document.querySelectorAll(".product-category-btn");
const nutriButtons = document.querySelectorAll(".nutri-score-filter");

const caloriesText = document.getElementById("calories-text");
const proteinText = document.getElementById("protein-text");
const carbsText = document.getElementById("carbs-text");
const fatText = document.getElementById("fat-text");

const caloriesBar = document.getElementById("calories-bar");

const DAILY_TARGETS = {
  calories: 2000,
  protein: 50,
  carbs: 250,
  fat: 65,
};

let currentCategory = "";
let currentNutriScore = "";
let currentSearch = "";
// end DOM elements

// start functions

// start loader
function showLoader() {
  loadingOverlay.classList.remove("hidden");
  loadingOverlay.style.opacity = "1";
}

function hideLoader() {
  loadingOverlay.style.transition = "opacity 1s ease";
  loadingOverlay.style.opacity = "0";
  setTimeout(() => {
    loadingOverlay.classList.add("hidden");
  }, 1000);
}

// end loader
// start local storage

function saveFoodLog(items) {
  localStorage.setItem("foodLog", JSON.stringify(items));
}
function loadFoodLog() {
  const data = localStorage.getItem("foodLog");
  return data ? JSON.parse(data) : [];
}
// end local storage

async function fetchData(url) {
  const res = await fetch(url);
  return await res.json();
}

// create recipe card
function createRecipeCard(meal) {
  return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
         data-meal-id="${meal.idMeal}">
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             src="${meal.strMealThumb}" alt="${meal.strMeal}">
      </div>
      <div class="p-4">
        <h3 class="font-bold mb-1">${meal.strMeal}</h3>
        <p class="text-xs text-gray-500">Click to view details</p>
      </div>
    </div>
  `;
}
// end recipe card

// load categories type
async function loadCategories() {
  const data = await fetchData(`${API_BASE}/categories.php`);
  categoriesGrid.innerHTML = "";

  data.categories.forEach((cat) => {
    categoriesGrid.innerHTML += `
      <div
        class="category-card bg-gradient-to-br from-emerald-50 to-teal-50 rounded-xl p-3 border border-emerald-200 hover:border-emerald-400 hover:shadow-md cursor-pointer transition-all group"
        data-category="${cat.strCategory}"
      >
        <div class="flex items-center gap-2.5">
          <div
            class="w-9 h-9 rounded-lg overflow-hidden flex items-center justify-center bg-white shadow-sm group-hover:scale-110 transition-transform"
          >
            <img
              src="${cat.strCategoryThumb}"
              alt="${cat.strCategory}"
              class="w-full h-full object-cover"
            />
          </div>
          <div>
            <h3 class="text-sm font-bold text-gray-900">
              ${cat.strCategory}
            </h3>
          </div>
        </div>
      </div>
    `;
  });
}
// end load categories

// load recipes section
async function loadRecipes(category = "Chicken") {
  showLoader();
  try {
    const data = await fetchData(`${API_BASE}/filter.php?c=${category}`);
    recipesGrid.innerHTML = "";

    const meals = data.meals.slice(0, 25);
    recipesCount.textContent = `Showing ${meals.length} recipes`;

    meals.forEach((meal) => {
      recipesGrid.innerHTML += createRecipeCard(meal);
    });
  } catch (error) {
    console.error("Error loading recipes:", err);
    recipesCount.textContent = "Failed to load recipes";
  } finally {
    setTimeout(() => {
      hideLoader();
    }, 1000);
  }
}
// end load recipes

// search recipes
async function searchMealsByName(query) {
  const data = await fetchData(`${API_BASE}/search.php?s=${query}`);
  recipesGrid.innerHTML = "";

  if (!data.meals) {
    recipesCount.textContent = "No recipes found";
    return;
  }

  recipesCount.textContent = `Found ${data.meals.length} recipes`;
  data.meals.forEach((meal) => {
    recipesGrid.innerHTML += createRecipeCard(meal);
  });
}
// end search recipes

// load countries
async function loadCuisines() {
  const data = await fetchData(`${API_BASE}/list.php?a=list`);
  cuisinesContainer.innerHTML = "";

  cuisinesContainer.innerHTML += `
    <button data-area="all"
      class="px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm">
      All Recipes
    </button>
  `;

  data.meals.forEach((item) => {
    cuisinesContainer.innerHTML += `
      <button data-area="${item.strArea}"
        class="px-4 py-2 bg-gray-100 text-gray-700 rounded-full font-medium text-sm hover:bg-gray-200">
        ${item.strArea}
      </button>
    `;
  });
}
// end load countries

// load recipes by area
async function loadRecipesByArea(area) {
  const data = await fetchData(`${API_BASE}/filter.php?a=${area}`);
  recipesGrid.innerHTML = "";

  const meals = data.meals.slice(0, 25);
  recipesCount.textContent = `Showing ${meals.length} recipes`;

  meals.forEach((meal) => {
    recipesGrid.innerHTML += createRecipeCard(meal);
  });
}
// end load recipes by area

// load meal details
async function loadMealDetails(id) {
  try {
    const data = await fetchData(`${API_BASE}/lookup.php?i=${id}`);
    const meal = data.meals[0];
    const alirtDiv = document.getElementById("alirtDiv");
    const logModal = document.getElementById("log-modal");

    mealHeroImg.src = meal.strMealThumb;
    mealTitle.textContent = meal.strMeal;
    heroServings.textContent = "4 servings";
    heroCalories.textContent = "485";

    ingredientsContainer.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing) {
        ingredientsContainer.innerHTML += `
        <div class="p-3 bg-gray-50 rounded-xl">
          <input type="checkbox" class="mr-2"><strong>${meas}</strong> ${ing}
        </div>
      `;
      }
    }

    instructionsContainer.innerHTML = "";
    meal.strInstructions.split(".").forEach((step, i) => {
      if (step.trim()) {
        instructionsContainer.innerHTML += `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <span class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${
            i + 1
          }</span>
          <p class="text-gray-700 leading-relaxed pt-2">${step}.</p>
        </div>
      `;
      }
    });

    if (meal.strYoutube) {
      const id = meal.strYoutube.split("v=")[1];
      videoContainer.innerHTML = `
      <iframe class="w-full h-full"
        src="https://www.youtube.com/embed/${id}" allowfullscreen></iframe>
    `;
    }
    heroServings.textContent = "4 servings";

    calculateMealNutrition(meal).then((nutrition) => {
      renderNutrition(nutrition, 4);
      heroCalories.textContent = Math.round(nutrition.calories / 4);
    });

    allRecipesSection.classList.add("hidden");
    mealDetailsSection.classList.remove("hidden");
    mealCategoriesSection.classList.add("hidden");
    searchFiltersSection.classList.add("hidden");

    function renderNutrition(nutrition, servings = 4) {
      const perServingCalories = Math.round(nutrition.calories / servings);

      nutritionCalories.textContent = perServingCalories;
      nutritionTotal.textContent = `Total: ${Math.round(nutrition.calories)} cal`;

      nutritionProtein.textContent = `${Math.round(nutrition.protein / servings)}g`;
      nutritionCarbs.textContent = `${Math.round(nutrition.carbs / servings)}g`;
      nutritionFat.textContent = `${Math.round(nutrition.fat / servings)}g`;
      nutritionFiber.textContent = `${Math.round(nutrition.fiber / servings)}g`;

      proteinBar.style.width =
        Math.min((nutrition.protein / 50) * 100, 100) + "%";
      carbsBar.style.width = Math.min((nutrition.carbs / 300) * 100, 100) + "%";
      fatBar.style.width = Math.min((nutrition.fat / 70) * 100, 100) + "%";
      fiberBar.style.width = Math.min((nutrition.fiber / 30) * 100, 100) + "%";
      return nutrition;
    }

    btnLogMeal.addEventListener("click", () => {
      alirtDiv.classList.remove("hidden");
      logModal.innerHTML = `
 
        <div class="flex items-center gap-4 mb-6">
          <img src="${meal.strMealThumb}" alt="${meal.strMeal}" class="w-16 h-16 rounded-xl object-cover">
          <div>
            <h3 class="text-xl font-bold text-gray-900">Log This Meal</h3>
            <p class="text-gray-500 text-sm">${meal.strMeal}</p>
          </div>
        </div>

        <div class="flex items-center gap-3 mb-4">
          <button id="decrease-servings" class="px-3 py-1 bg-gray-200 rounded">-</button>
          <input id="servings-input" type="number" value="1" min="0.5" max="10" step="0.5" class="w-12 text-center border rounded">
          <button id="increase-servings" class="px-3 py-1 bg-gray-200 rounded">+</button>
        </div>

        <div class="bg-emerald-50 rounded-xl p-4 mb-6">
          <p class="text-sm text-gray-600 mb-2">Estimated nutrition per serving:</p>
          <div class="grid grid-cols-4 gap-2 text-center">
            <div>
              <p class="text-lg font-bold text-emerald-600" id="modal-calories">${nutritionCalories.textContent}</p>
              <p class="text-xs text-gray-500">Calories</p>
            </div>
            <div>
              <p class="text-lg font-bold text-blue-600" id="modal-protein">${nutritionProtein.textContent}</p>
              <p class="text-xs text-gray-500">Protein</p>
            </div>
            <div>
              <p class="text-lg font-bold text-amber-600" id="modal-carbs">${nutritionCarbs.textContent}</p>
              <p class="text-xs text-gray-500">Carbs</p>
            </div>
            <div>
              <p class="text-lg font-bold text-purple-600" id="modal-fat">${nutritionFat.textContent}</p>
              <p class="text-xs text-gray-500">Fat</p>
            </div>
          </div>
        </div>

        <div class="flex justify-end gap-3">
          <button id="cancel-log" class="px-4 py-2 bg-gray-200 rounded">Cancel</button>
          <button id="confirm-log" class="px-4 py-2 bg-blue-600 text-white rounded">Confirm</button>
        </div>
 `;
      const base = {
        calories: Number(nutritionCalories.textContent),
        protein: parseFloat(nutritionProtein.textContent),
        carbs: parseFloat(nutritionCarbs.textContent),
        fat: parseFloat(nutritionFat.textContent),
      };

      function updateModalNutrition(servings) {
        document.getElementById("modal-calories").textContent = Math.round(
          base.calories * servings,
        );

        document.getElementById("modal-protein").textContent =
          Math.round(base.protein * servings) + "g";

        document.getElementById("modal-carbs").textContent =
          Math.round(base.carbs * servings) + "g";

        document.getElementById("modal-fat").textContent =
          Math.round(base.fat * servings) + "g";
      }

      document.getElementById("cancel-log").onclick = () => {
        alirtDiv.classList.add("hidden");
      };

      const { foodItems, renderLoggedItems } = inLogMeal();

      document.getElementById("confirm-log").onclick = () => {
        const servings = Number(
          document.getElementById("servings-input").value,
        );
        const calories = Number(
          document.getElementById("modal-calories").textContent,
        );

        const mealData = {
          id: meal.idMeal,
          name: meal.strMeal,
          img: meal.strMealThumb,
          servings,
          calories: calories,
          protein: Math.round(base.protein * servings),
          carbs: Math.round(base.carbs * servings),
          fat: Math.round(base.fat * servings),
          date: new Date().toISOString().split("T")[0],
        };

        foodItems.push(mealData);
        saveFoodLog(foodItems);
        renderLoggedItems();
        renderWeeklyChart();
        renderDailyProgress();

        document.getElementById("alirtDiv").classList.add("hidden");

        Swal.fire({
          icon: "success",
          title: "Meal logged successfully",
          html: `<p class="text-gray-600">${meal.strMeal} added to your log</p>
           <p class="text-emerald-600 mt-2">+${calories} cal</p>`,
          timer: 2000,
          showConfirmButton: false,
          timerProgressBar: true,
        });
      };

      const baseCalories = Number(nutritionCalories.textContent);

      document.getElementById("decrease-servings").onclick = () => {
        const input = document.getElementById("servings-input");
        let servings = Number(input.value);

        if (servings > 0.5) {
          servings -= 0.5;
          input.value = servings;
          updateModalNutrition(servings);
        }
      };
      document.getElementById("increase-servings").onclick = () => {
        const input = document.getElementById("servings-input");
        let servings = Number(input.value);

        if (servings < 10) {
          servings += 0.5;
          input.value = servings;
          updateModalNutrition(servings);
        }
      };
    });
  } catch (error) {}
}
// end log meal

// active color in section
function setActiveColor(
  containerSelector,
  itemSelector,
  activeBg,
  activeText,
  inactiveBg,
  inactiveText,
) {
  const container = document.querySelector(containerSelector);

  container.addEventListener("click", (e) => {
    const item = e.target.closest(itemSelector);
    if (!item) return;

    container.querySelectorAll(itemSelector).forEach((el) => {
      el.classList.remove(activeBg, activeText);
      el.classList.add(inactiveBg, inactiveText);
    });

    item.classList.add(activeBg, activeText);
    item.classList.remove(inactiveBg, inactiveText);
  });
}
// end active color

// get nutrient
function getNutrient(nutrients, name) {
  return nutrients.find((n) => n.nutrientName === name)?.value || 0;
}
// end get nutrient

// fetch nutrition
async function fetchNutritionByIngredient(ingredient) {
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
// end fetch nutrition

// meal details section
async function calculateMealNutrition(meal) {
  showLoader();

  try {
    let totalCalories = 0;
    let totalProtein = 0;
    let totalCarbs = 0;
    let totalFat = 0;
    let totalFiber = 0;

    for (let i = 1; i <= 20; i++) {
      const ingredient = meal[`strIngredient${i}`];
      if (!ingredient) continue;

      const nutrients = await fetchNutritionByIngredient(ingredient);
      if (!nutrients) continue;

      totalCalories += getNutrient(nutrients, "Energy");
      totalProtein += getNutrient(nutrients, "Protein");
      totalCarbs += getNutrient(nutrients, "Carbohydrate, by difference");
      totalFat += getNutrient(nutrients, "Total lipid (fat)");
      totalFiber += getNutrient(nutrients, "Fiber, total dietary");
    }

    return {
      calories: totalCalories,
      protein: totalProtein,
      carbs: totalCarbs,
      fat: totalFat,
      fiber: totalFiber,
    };
  } catch (err) {
    console.error("Nutrition calculation failed:", err);
    return null;
  } finally {
    hideLoader();
  }
}
// end meal details section

// load products 25items
async function loadProducts() {
  try {
    productsGrid.innerHTML = ``;
    productsCount.textContent = "Loading...";

    const params = new URLSearchParams({
      search_terms: currentSearch,
      page_size: 20,
      json: true,
    });

    if (currentCategory) {
      params.append("tagtype_0", "categories");
      params.append("tag_contains_0", "contains");
      params.append("tag_0", currentCategory);
    }

    if (currentNutriScore) {
      params.append("nutriscore_grade", currentNutriScore);
    }

    const res = await fetch(`${OPEN_FOOD_API}?${params.toString()}`);
    const data = await res.json();
    const products = data.products || [];

    productsCount.textContent = `${products.length} products found`;
    if (!products.length) {
      productsGrid.innerHTML = `<p class="text-gray-500">No results found</p>`;
      return;
    }

    products.forEach(renderProductCard);
  } catch (error) {
    console.error("Error loading products:", error);
    productsCount.textContent = "Failed to load products";
  }
}
// end load products 25items

// render product in scanner section
function renderProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";

  card.innerHTML = `
    <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
      <img
        class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300"
        src="${product.image_front_url || ""}"
        alt="${product.product_name || "Product"}"
      />

      ${
        product.nutriscore_grade
          ? `<div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">
              Nutri-Score ${product.nutriscore_grade.toUpperCase()}
            </div>`
          : ""
      }
    </div>

    <div class="p-4">
      <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">
        ${product.brands || "Unknown Brand"}
      </p>

      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">
        ${product.product_name || "No name"}
      </h3>

      <div class="flex items-center gap-3 text-xs text-gray-500">
        <span>${product.quantity || ""}</span>
        <span>${product.nutriments?.energy_100g || 0} kcal/100g</span>
      </div>
    </div>
  `;

  productsGrid.appendChild(card);
  card.addEventListener("click", () => {
    const alirtDiv = document.getElementById("alirtDiv");
    alirtDiv.classList.remove("hidden");

    alirtDiv.innerHTML = `
    <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
           <div class="flex items-center gap-4 mb-6">
             <img src="${product.image_front_url || ""}" alt="${product.product_name || "Product"}" class="w-16 h-16 rounded-xl object-cover">
             <div>
               <h3 class="text-xl font-bold text-gray-900">${product.product_name || "No name"}</h3>
               <p class="text-gray-500 text-sm">${product.brands || "Unknown Brand"}</p>
             </div>
           </div>

           <div class="flex items-center gap-3 text-lg font-bold text-emerald-600">
             <span>${product.quantity || ""}</span>
             <span>${product.nutriments?.energy_100g || 0} kcal/100g</span>
           </div>
           
           <div class="flex items-center gap-3 text-lg font-bold text-emerald-600 mt-4">
             <span><i class="fa-solid fa-weight-scale mr-1"></i>${product.nutriments?.serving_size_g || 0}g</span>
           </div>

           <div class="flex gap-3 pt-4">
            <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold hover:bg-emerald-700 transition-all">Log This Food</button>
            <button class="close-product-modal flex-1 py-3 bg-gray-100 text-gray-700 rounded-xl font-semibold hover:bg-gray-200 transition-all">Close</button>
           </div>
    `;

    const closeBtn = alirtDiv.querySelector(".close-product-modal");
    closeBtn.addEventListener("click", () => {
      alirtDiv.classList.add("hidden");
    });

    const addBtn = alirtDiv.querySelector(".add-product-to-log");
    addBtn.addEventListener("click", () => {
      addProductToLog(product);
      alirtDiv.classList.add("hidden");
    });
  });
}
// end render product in scanner section

// format date
function formatDate(date) {
  const options = { weekday: "long", month: "short", day: "numeric" };
  return date.toLocaleDateString("en-US", options);
}
// end format date

// bars function
function calculateDailyTotals() {
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

function renderDailyProgress() {
  const totals = calculateDailyTotals();

  // Calories
  caloriesText.textContent = `${totals.calories} / ${DAILY_TARGETS.calories} kcal`;
  caloriesBar.style.width =
    Math.min((totals.calories / DAILY_TARGETS.calories) * 100, 100) + "%";

  // Protein
  proteinText.textContent = `${totals.protein} / ${DAILY_TARGETS.protein} g`;
  proteinBar.style.width =
    Math.min((totals.protein / DAILY_TARGETS.protein) * 100, 100) + "%";

  // Carbs
  carbsText.textContent = `${totals.carbs} / ${DAILY_TARGETS.carbs} g`;
  carbsBar.style.width =
    Math.min((totals.carbs / DAILY_TARGETS.carbs) * 100, 100) + "%";

  // Fat
  fatText.textContent = `${totals.fat} / ${DAILY_TARGETS.fat} g`;
  fatBar.style.width =
    Math.min((totals.fat / DAILY_TARGETS.fat) * 100, 100) + "%";
}

// end bars function

// add to log screen function
function addProductToLog(product) {
  const log = loadFoodLog();

  const calories = product.nutriments?.energy_100g || 0;
  const protein = product.nutriments?.proteins_100g || 0;
  const carbs = product.nutriments?.carbohydrates_100g || 0;
  const fat = product.nutriments?.fat_100g || 0;

  const mealData = {
    id: product.id || Date.now(),
    name: product.product_name || "No name",
    img: product.image_front_url || "",
    servings: 1,
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(carbs),
    fat: Math.round(fat),
    date: new Date().toISOString().split("T")[0],
  };

  log.push(mealData);
  saveFoodLog(log);

  const { renderLoggedItems } = inLogMeal();
  renderLoggedItems();
  renderDailyProgress();
  renderWeeklyChart();

  Swal.fire({
    icon: "success",
    title: "Logged successfully",
    html: `
      <p class="text-gray-600">${mealData.name} added to your log</p>
      <p class="text-emerald-600 mt-2">+${mealData.calories} cal</p>
    `,
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true,
  });
}

// end screen function

// end functions

// Add event listeners

categoryButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentCategory = btn.textContent.trim().toLowerCase();
    loadProducts();
  });
});
nutriButtons.forEach((btn) => {
  btn.addEventListener("click", () => {
    currentNutriScore = btn.dataset.grade;
    loadProducts();
  });
});

sidebarLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    sidebarLinks.forEach((l) => {
      l.classList.remove("bg-emerald-50", "text-emerald-700");
      l.classList.add(
        "flex",
        "items-center",
        "gap-3",
        "px-3",
        "py-2.5",
        "rounded-lg",
        "transition-all",
        "text-gray-600",
        "hover:bg-gray-50",
      );
    });

    link.classList.add("bg-emerald-50", "text-emerald-700");
    link.classList.remove("text-gray-600", "hover:bg-gray-50");

    allSections.forEach((sec) => sec.classList.add("hidden"));

    const linkText = link.textContent.trim();

    if (linkText === "Product Scanner") {
      document.getElementById("products-section").classList.remove("hidden");
    } else if (linkText === "Meals & Recipes") {
      document
        .getElementById("search-filters-section")
        .classList.remove("hidden");
      document
        .getElementById("meal-categories-section")
        .classList.remove("hidden");
      document.getElementById("all-recipes-section").classList.remove("hidden");
    } else if (linkText === "Food Log") {
      document.getElementById("foodlog-section").classList.remove("hidden");
    }
  });
});

btnView.addEventListener("click", () => {
  recipesGrid.classList.remove("grid-cols-4", "gap-5");
  recipesGrid.classList.add("grid-cols-2", "gap-4");

  btnView.classList.add(
    "px-3",
    "py-1.5",
    "bg-white",
    "rounded-md",
    "shadow-sm",
  );
  btnGrid.classList.remove("bg-white", "rounded-md", "shadow-sm");

  const cards = recipesGrid.querySelectorAll(".recipe-card");
  cards.forEach((card) => {
    card.classList.add("flex", "flex-row", "h-40");
    card.classList.remove("overflow-hidden", "shadow-sm", "hover:shadow-lg");

    const imgContainer = card.querySelector("div.relative");
    if (imgContainer) {
      imgContainer.classList.remove("h-48");
      imgContainer.classList.add("w-48", "h-full");
    }
  });
});

btnGrid.addEventListener("click", () => {
  recipesGrid.classList.remove("grid-cols-2", "gap-4");
  recipesGrid.classList.add("grid-cols-4", "gap-5");

  btnGrid.classList.add(
    "px-3",
    "py-1.5",
    "bg-white",
    "rounded-md",
    "shadow-sm",
  );
  btnView.classList.remove("bg-white", "rounded-md", "shadow-sm");

  const cards = recipesGrid.querySelectorAll(".recipe-card");
  cards.forEach((card) => {
    card.classList.remove("flex", "flex-row", "h-40");
    card.classList.add("overflow-hidden", "shadow-sm", "hover:shadow-lg");

    const imgContainer = card.querySelector("div.relative");
    if (imgContainer) {
      imgContainer.classList.add("h-48");
      imgContainer.classList.remove("w-48", "h-full");
    }
  });
});
inputSearch.addEventListener("click", (e) => {
  currentSearch = e.target.value;
  loadProducts();
});

categoriesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".category-card");
  if (card) loadRecipes(card.dataset.category);
});

recipesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".recipe-card");
  if (card) loadMealDetails(card.dataset.mealId);
});

backBtn.addEventListener("click", () => {
  mealDetailsSection.classList.add("hidden");
  allRecipesSection.classList.remove("hidden");
  mealCategoriesSection.classList.remove("hidden");
  searchFiltersSection.classList.remove("hidden");
});

searchInput.addEventListener("input", (e) => {
  const value = e.target.value.trim();
  if (!value) loadRecipes();
  else searchMealsByName(value);
});

cuisinesContainer.addEventListener("click", (e) => {
  const btn = e.target.closest("button");
  if (!btn) return;

  cuisinesContainer.querySelectorAll("button").forEach((b) => {
    b.classList.remove("bg-emerald-600", "text-white");
    b.classList.add("bg-gray-100", "text-gray-700");
  });

  btn.classList.add("bg-emerald-600", "text-white");

  const area = btn.dataset.area;
  if (area === "all") loadRecipes();
  else loadRecipesByArea(area);
});

// end event listeners

// in food log section
function inLogMeal() {
  const foodLog = document.getElementById("foodlog-section");
  const foodDay = document.getElementById("foodlog-date");
  foodDay.innerText = formatDate(new Date());

  const loggedItemsList = document.getElementById("logged-items-list");
  let foodItems = loadFoodLog();

  function renderLoggedItems() {
    if (!foodItems.length) {
      loggedItemsList.innerHTML = `
        <div class="text-center py-8 text-gray-500">
          <i class="fa-solid fa-utensils text-4xl mb-3 text-gray-300"></i>
          <p class="font-medium">No meals logged today</p>
          <p class="text-sm">Add meals from the Meals page or scan products</p>
        </div>
      `;
      return;
    }

    loggedItemsList.innerHTML = "";
    foodItems.forEach((meal, index) => {
      loggedItemsList.innerHTML += `
        <div class="flex items-center justify-between bg-white p-4 rounded-xl shadow-sm mb-3">
          <div class="flex items-center gap-3">
            <img src="${meal.img}" class="w-12 h-12 rounded-lg object-cover">
            <div>
              <p class="font-semibold text-gray-900">${meal.name}</p>
              <p class="text-xs text-gray-500">${meal.servings} serving(s)</p>
            </div>
          </div>
          <div class="text-emerald-600 font-bold">${meal.calories} cal</div>
          <button class="text-red-600 delete-meal" data-id="${meal.id}">
            <i class="fa-solid fa-trash-can"></i>
          </button>
        </div>
      `;
    });
  }

  loggedItemsList.addEventListener("click", (e) => {
    const deleteBtn = e.target.closest(".delete-meal");
    if (!deleteBtn) return;

    const id = deleteBtn.dataset.id;
    foodItems = foodItems.filter((meal) => meal.id != id);

    saveFoodLog(foodItems);
    renderWeeklyChart();
    renderLoggedItems();
    renderDailyProgress();
  });

  const clearBtn = document.getElementById("clear-foodlog");
  clearBtn.onclick = () => {
    foodItems = [];
    saveFoodLog(foodItems);
    renderWeeklyChart();
    renderDailyProgress();
    renderLoggedItems();
  };

  renderLoggedItems();

  return { foodLog, loggedItemsList, foodItems, renderLoggedItems };
}

// start weekly render
function getWeekDays() {
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

function calculateWeeklyCalories() {
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

function renderWeeklyChart() {
  const container = document.querySelector("#weekly-chart .grid.grid-cols-7");
  if (!container) return;

  const weekData = calculateWeeklyCalories();
  container.innerHTML = "";

  weekData.forEach((day) => {
    container.innerHTML += `
      <div class="text-center bg-white rounded-xl p-3">
        <p class="text-sm font-semibold">${day.label}</p>
        <p class="text-xs text-gray-500">${day.day}</p>
        <p class="text-lg font-bold text-emerald-600">
          ${Math.round(day.calories)}
        </p>
        <p class="text-xs text-gray-400">kcal</p>
      </div>
    `;
  });
}
// end   weekly render
// start btns events
document.getElementById("scanBtn").addEventListener("click", () => {
  document.getElementById("foodlog-section").classList.add("hidden");
  document.getElementById("products-section").classList.remove("hidden");
});
document.getElementById("logAmeal").addEventListener("click", () => {
  document.getElementById("foodlog-section").classList.add("hidden");
  document.getElementById("meal-categories-section").classList.remove("hidden");
  document.getElementById("search-filters-section").classList.remove("hidden");
  document.getElementById("all-recipes-section").classList.remove("hidden");
});
// end   btns events

document.addEventListener("DOMContentLoaded", () => {
  inLogMeal();
  renderWeeklyChart();
  renderDailyProgress();
  loadCategories();
  loadRecipes();
  loadCuisines();
});

// setActiveColor function
setActiveColor(
  "#search-filters-section .flex.items-center.gap-3",
  "button",
  "bg-emerald-600",
  "text-white",
  "bg-gray-100",
  "text-gray-700",
);
setActiveColor(
  "#categories-grid",
  ".category-card",
  "bg-emerald-600",
  "text-white",
  "from-emerald-50",
  "text-gray-900",
);
// end setActiveColor

// load data
loadCategories();
loadRecipes();
loadCuisines();
