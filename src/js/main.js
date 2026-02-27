// ====== main.js ======
import { saveFoodLog, loadFoodLog } from "./storage.js";
import {
  API_BASE,
  OPEN_FOOD_API,
  fetchData,
  calculateMealNutrition,
} from "./api.js";
import {
  DAILY_TARGETS,
  formatDate,
  calculateDailyTotals,
  calculateWeeklyCalories,
} from "./utils.js";
import {
  hideLoader,
  showInnerLoader,
  hideInnerLoader,
  setActiveColor,
  createRecipeCard,
  renderWeeklyChart,
  renderDailyProgress,
  updateLoggedItemsHeader,
} from "./ui.js";

// --- State Variables ---
let currentCategory = "";
let currentNutriScore = "";
let currentSearch = "";

// --- DOM Elements ---
const cuisinesContainer = document.getElementById("cuisines-container");
const categoriesGrid = document.getElementById("categories-grid");
const recipesGrid = document.getElementById("recipes-grid");
const recipesCount = document.getElementById("recipes-count");
const searchInput = document.getElementById("search-input");

const productsGrid = document.getElementById("products-grid");
const productsCount = document.getElementById("products-count");
const inputSearchLog = document.getElementById("search-product-btn");
const categoryButtons = document.querySelectorAll(".product-category-btn");
const nutriButtons = document.querySelectorAll(".nutri-score-filter");

const loggedItemsList = document.getElementById("logged-items-list");
const foodDay = document.getElementById("foodlog-date");

const sidebarLinks = document.querySelectorAll("#sidebar .nav-link");

// Elements for Meal Details
const mealDetailsSection = document.getElementById("meal-details");
const allRecipesSection = document.getElementById("all-recipes-section");
const mealCategoriesSection = document.getElementById(
  "meal-categories-section",
);
const searchFiltersSection = document.getElementById("search-filters-section");
const backBtn = document.getElementById("back-to-meals-btn");

// View Toggle Elements
const gridViewBtn = document.getElementById("grid-view-btn");
const listViewBtn = document.getElementById("list-view-btn");

// Sidebar Toggle Elements
const sidebar = document.getElementById("sidebar");
const sidebarOverlay = document.getElementById("sidebar-overlay");
const headerMenuBtn = document.getElementById("header-menu-btn");
const sidebarCloseBtn = document.getElementById("sidebar-close-btn");

const spinnerHTML = `<div class="col-span-full flex justify-center items-center py-16 w-full"><div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div></div>`;

// --- Dashboard Functions ---
function updateDashboard() {
  const totals = calculateDailyTotals();
  renderDailyProgress(totals, DAILY_TARGETS);

  const weekData = calculateWeeklyCalories();
  renderWeeklyChart(weekData);

  renderLoggedItemsList();
}

function renderLoggedItemsList() {
  const foodItems = loadFoodLog();
  updateLoggedItemsHeader(foodItems.length);

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
  foodItems.forEach((meal) => {
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
        <button class="text-red-600 delete-meal hover:bg-red-50 p-2 rounded-lg transition" data-id="${meal.id}">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </div>
    `;
  });
}

// --- API & Core Functions ---

async function loadCuisines() {
  try {
    const data = await fetchData(`${API_BASE}/list.php?a=list`);

    if (!cuisinesContainer) return;

    cuisinesContainer.innerHTML = `
      <span class="text-sm font-semibold text-gray-500 whitespace-nowrap">
        <i class="fa-solid fa-earth-americas mr-1"></i> Cuisines:
      </span>
      <button class="cuisine-btn px-4 py-2 bg-emerald-600 text-white rounded-full font-medium text-sm whitespace-nowrap shadow-sm transition-all" data-area="All">
        All Recipes
      </button>
    `;

    data.meals.forEach((area) => {
      if (area.strArea !== "Unknown") {
        cuisinesContainer.innerHTML += `
          <button class="cuisine-btn px-4 py-2 bg-gray-100 text-gray-700 hover:bg-gray-200 rounded-full font-medium text-sm whitespace-nowrap transition-all" data-area="${area.strArea}">
            ${area.strArea}
          </button>
        `;
      }
    });

    document.querySelectorAll(".cuisine-btn").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        document.querySelectorAll(".cuisine-btn").forEach((b) => {
          b.classList.remove("bg-emerald-600", "text-white", "shadow-sm");
          b.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
        });

        const clickedBtn = e.target.closest(".cuisine-btn");
        clickedBtn.classList.remove(
          "bg-gray-100",
          "text-gray-700",
          "hover:bg-gray-200",
        );
        clickedBtn.classList.add("bg-emerald-600", "text-white", "shadow-sm");

        const area = clickedBtn.dataset.area;
        if (area === "All") {
          loadRecipes("Chicken");
        } else {
          loadRecipesByArea(area);
        }
      });
    });
  } catch (error) {
    console.error("Error loading cuisines", error);
  }
}

async function loadRecipesByArea(area) {
  try {
    recipesGrid.innerHTML = spinnerHTML;
    recipesCount.textContent = `Loading ${area} recipes...`;

    const data = await fetchData(`${API_BASE}/filter.php?a=${area}`);
    recipesGrid.innerHTML = "";

    const meals = data.meals ? data.meals.slice(0, 25) : [];
    recipesCount.textContent = `Showing ${meals.length} recipes`;

    meals.forEach((meal) => {
      recipesGrid.innerHTML += createRecipeCard(meal);
    });
  } catch (error) {
    recipesGrid.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Failed to load recipes.</p>`;
    recipesCount.textContent = "Error";
  }
}

async function loadCategories() {
  const data = await fetchData(`${API_BASE}/categories.php`);
  categoriesGrid.innerHTML = "";

  categoriesGrid.className =
    "grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4";

  data.categories.forEach((cat) => {
    categoriesGrid.innerHTML += `
      <div class="category-card bg-white rounded-xl p-3 border border-gray-100 shadow-sm hover:border-emerald-500 hover:shadow-md cursor-pointer transition-all group flex items-center justify-center" data-category="${cat.strCategory}">
        <div class="flex flex-col items-center gap-2 text-center w-full">
          <div class="w-12 h-12 rounded-full bg-emerald-50 flex items-center justify-center overflow-hidden border border-emerald-100 group-hover:bg-emerald-100 transition-colors shrink-0">
            <img src="${cat.strCategoryThumb}" alt="${cat.strCategory}" class="w-10 h-10 object-contain group-hover:scale-110 transition-transform" />
          </div>
          <h3 class="text-sm font-semibold text-gray-700 group-hover:text-emerald-700 transition-colors w-full truncate px-1">${cat.strCategory}</h3>
        </div>
      </div>
    `;
  });
}

async function loadRecipes(category = "Chicken") {
  try {
    recipesGrid.innerHTML = spinnerHTML;
    recipesCount.textContent = `Loading recipes...`;

    const data = await fetchData(`${API_BASE}/filter.php?c=${category}`);
    recipesGrid.innerHTML = "";

    const meals = data.meals ? data.meals.slice(0, 25) : [];
    recipesCount.textContent = `Showing ${meals.length} recipes`;
    meals.forEach((meal) => {
      recipesGrid.innerHTML += createRecipeCard(meal);
    });
  } catch (error) {
    recipesGrid.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Failed to load recipes.</p>`;
    recipesCount.textContent = "Error";
  }
}

async function loadProducts() {
  try {
    productsGrid.innerHTML = spinnerHTML;
    productsCount.textContent = "Searching products...";

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
    if (currentNutriScore) params.append("nutriscore_grade", currentNutriScore);

    const data = await fetchData(`${OPEN_FOOD_API}?${params.toString()}`);
    const products = data.products || [];

    productsGrid.innerHTML = "";
    productsCount.textContent = `${products.length} products found`;

    if (!products.length) {
      productsGrid.innerHTML = `<p class="col-span-full text-center text-gray-500 py-10">No results found for your search.</p>`;
    } else {
      products.forEach(renderProductCard);
    }
  } catch (error) {
    productsGrid.innerHTML = `<p class="col-span-full text-center text-red-500 py-10">Failed to load products.</p>`;
    productsCount.textContent = "Error";
  }
}

function renderProductCard(product) {
  const card = document.createElement("div");
  card.className =
    "product-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group";
  card.innerHTML = `
    <div class="relative h-40 bg-gray-100 flex items-center justify-center overflow-hidden">
      <img class="w-full h-full object-contain group-hover:scale-110 transition-transform duration-300" src="${product.image_front_url || ""}" alt="${product.product_name || "Product"}" />
      ${product.nutriscore_grade ? `<div class="absolute top-2 left-2 bg-green-500 text-white text-xs font-bold px-2 py-1 rounded uppercase">Nutri-Score ${product.nutriscore_grade.toUpperCase()}</div>` : ""}
    </div>
    <div class="p-4">
      <p class="text-xs text-emerald-600 font-semibold mb-1 truncate">${product.brands || "Unknown Brand"}</p>
      <h3 class="font-bold text-gray-900 mb-2 line-clamp-2">${product.product_name || "No name"}</h3>
    </div>
  `;
  productsGrid.appendChild(card);

  card.addEventListener("click", () => {
    const alirtDiv = document.getElementById("alirtDiv");
    alirtDiv.classList.remove("hidden");
    alirtDiv.innerHTML = `
      <div class="bg-white rounded-2xl p-6 max-w-md w-full mx-4">
        <div class="flex items-center gap-4 mb-6">
          <img src="${product.image_front_url || ""}" class="w-16 h-16 rounded-xl object-cover">
          <div><h3 class="text-xl font-bold">${product.product_name || "No name"}</h3></div>
        </div>
        <div class="flex gap-3 pt-4">
          <button class="add-product-to-log flex-1 py-3 bg-emerald-600 text-white rounded-xl font-semibold">Log This Food</button>
          <button class="close-product-modal flex-1 py-3 bg-gray-100 rounded-xl font-semibold">Close</button>
        </div>
      </div>
    `;

    alirtDiv.querySelector(".close-product-modal").onclick = () =>
      alirtDiv.classList.add("hidden");
    alirtDiv.querySelector(".add-product-to-log").onclick = () => {
      addProductToLog(product);
      alirtDiv.classList.add("hidden");
    };
  });
}

function addProductToLog(product) {
  const log = loadFoodLog();
  const servingSize = product.nutriments?.serving_size_g || 100;
  const ratio = servingSize / 100;

  const calories =
    (product.nutriments?.["energy-kcal_100g"] ||
      product.nutriments?.energy_100g ||
      0) * ratio;

  const mealData = {
    id: product.id || Date.now(),
    name: product.product_name || "No name",
    img: product.image_front_url || "",
    servings: 1,
    calories: Math.round(calories),
    protein: Math.round((product.nutriments?.proteins_100g || 0) * ratio),
    carbs: Math.round((product.nutriments?.carbohydrates_100g || 0) * ratio),
    fat: Math.round((product.nutriments?.fat_100g || 0) * ratio),
    date: new Date().toISOString().split("T")[0],
  };

  log.push(mealData);
  saveFoodLog(log);
  updateDashboard();

  Swal.fire({
    icon: "success",
    title: "Logged successfully",
    html: `<p>${mealData.name} added</p><p class="text-emerald-600 mt-2">+${mealData.calories} cal</p>`,
    timer: 2000,
    showConfirmButton: false,
    timerProgressBar: true,
  });
}

async function loadMealDetails(id) {
  showInnerLoader();
  try {
    const data = await fetchData(`${API_BASE}/lookup.php?i=${id}`);
    const meal = data.meals[0];

    document.querySelector("#meal-details img").src = meal.strMealThumb;
    document.querySelector("#meal-details h1").textContent = meal.strMeal;

    const ingredientsContainer = document.querySelector(
      "#meal-details .grid.grid-cols-1.md\\:grid-cols-2",
    );
    ingredientsContainer.innerHTML = "";
    for (let i = 1; i <= 20; i++) {
      const ing = meal[`strIngredient${i}`];
      const meas = meal[`strMeasure${i}`];
      if (ing && ing.trim() !== "") {
        ingredientsContainer.innerHTML += `
        <div class="flex items-center gap-3 p-3 bg-gray-50 rounded-xl hover:bg-emerald-50 transition-colors">
          <input type="checkbox" class="ingredient-checkbox w-5 h-5 text-emerald-600 rounded border-gray-300" />
          <span class="text-gray-700"><span class="font-medium text-gray-900">${meas}</span> ${ing}</span>
        </div>`;
      }
    }

    const instructionsContainer = document.querySelector(
      "#meal-details .space-y-4",
    );
    instructionsContainer.innerHTML = "";
    meal.strInstructions.split(".").forEach((step, i) => {
      if (step.trim()) {
        instructionsContainer.innerHTML += `
        <div class="flex gap-4 p-4 rounded-xl hover:bg-gray-50 transition-colors">
          <div class="w-10 h-10 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0">${i + 1}</div>
          <p class="text-gray-700 leading-relaxed pt-2">${step.trim()}.</p>
        </div>`;
      }
    });

    const videoContainer = document.querySelector(
      "#meal-details .aspect-video",
    );
    if (meal.strYoutube) {
      const videoId = meal.strYoutube.split("v=")[1];
      videoContainer.innerHTML = `<iframe class="absolute inset-0 w-full h-full" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>`;
    } else {
      videoContainer.innerHTML = `<p class="text-gray-500 text-center py-10">No video available for this recipe.</p>`;
    }

    const nutrition = await calculateMealNutrition(meal);
    const servings = 4;

    document.getElementById("nutrition-calories").textContent = Math.round(
      nutrition.calories / servings,
    );
    document.getElementById("nutrition-protein").textContent =
      `${Math.round(nutrition.protein / servings)}g`;
    document.getElementById("nutrition-carbs").textContent =
      `${Math.round(nutrition.carbs / servings)}g`;
    document.getElementById("nutrition-fat").textContent =
      `${Math.round(nutrition.fat / servings)}g`;

    allRecipesSection.classList.add("hidden");
    mealCategoriesSection.classList.add("hidden");
    searchFiltersSection.classList.add("hidden");
    mealDetailsSection.classList.remove("hidden");

    window.scrollTo({ top: 0, behavior: "smooth" });

    document.getElementById("log-meal-btn").onclick = () => {
      const mealToLog = {
        id: meal.idMeal,
        name: meal.strMeal,
        img: meal.strMealThumb,
        servings: 1,
        calories: Math.round(nutrition.calories / servings),
        protein: Math.round(nutrition.protein / servings),
        carbs: Math.round(nutrition.carbs / servings),
        fat: Math.round(nutrition.fat / servings),
        date: new Date().toISOString().split("T")[0],
      };

      const log = loadFoodLog();
      log.push(mealToLog);
      saveFoodLog(log);
      updateDashboard();

      Swal.fire({
        icon: "success",
        title: "Meal Logged!",
        html: `<p>${meal.strMeal} added</p><p class="text-emerald-600 mt-2">+${mealToLog.calories} cal</p>`,
        timer: 2000,
        showConfirmButton: false,
        timerProgressBar: true,
      });
    };
  } catch (error) {
    console.error("Error loading details:", error);
  } finally {
    hideInnerLoader();
  }
}

// --- Event Listeners & Core Logic ---

// ** 1. Mobile Sidebar Toggle Functions **
function openSidebar() {
  if (sidebar) {
    // إزالة كلاس الإخفاء
    sidebar.classList.remove("-translate-x-full");
    // إجبار السايد بار على الدخول للشاشة (يتخطى أي كود CSS آخر)
    sidebar.style.transform = "translateX(0)"; 
  }
  if (sidebarOverlay) sidebarOverlay.classList.remove("hidden");
}

function closeSidebar() {
  if (sidebar) {
    // إعادة كلاس الإخفاء
    sidebar.classList.add("-translate-x-full");
    // مسح الستايل الإجباري ليعود لوضعه الطبيعي خارج الشاشة
    sidebar.style.transform = ""; 
  }
  if (sidebarOverlay) sidebarOverlay.classList.add("hidden");
}

if (headerMenuBtn) headerMenuBtn.addEventListener("click", openSidebar);
if (sidebarCloseBtn) sidebarCloseBtn.addEventListener("click", closeSidebar);
if (sidebarOverlay) sidebarOverlay.addEventListener("click", closeSidebar);

// ** 2. Initialization on Load **
document.addEventListener("DOMContentLoaded", () => {
  if (foodDay) foodDay.innerText = formatDate(new Date());
  setTimeout(hideLoader, 1000);

  updateDashboard();
  loadCategories();
  loadCuisines();
  loadRecipes();
});

// ** 3. Grid/List View Toggle Logic **
gridViewBtn?.addEventListener("click", () => {
  recipesGrid.className =
    "grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 transition-all duration-300";

  gridViewBtn.classList.add("bg-white", "shadow-sm");
  gridViewBtn
    .querySelector("i")
    .classList.replace("text-gray-500", "text-gray-700");

  listViewBtn.classList.remove("bg-white", "shadow-sm");
  listViewBtn
    .querySelector("i")
    .classList.replace("text-gray-700", "text-gray-500");
});

listViewBtn?.addEventListener("click", () => {
  recipesGrid.className = "grid grid-cols-1 gap-5 transition-all duration-300";

  listViewBtn.classList.add("bg-white", "shadow-sm");
  listViewBtn
    .querySelector("i")
    .classList.replace("text-gray-500", "text-gray-700");

  gridViewBtn.classList.remove("bg-white", "shadow-sm");
  gridViewBtn
    .querySelector("i")
    .classList.replace("text-gray-700", "text-gray-500");
});

// ** 4. Sidebar Navigation Corrected **
const mainSections = [
  document.getElementById("search-filters-section"),
  document.getElementById("meal-categories-section"),
  document.getElementById("all-recipes-section"),
  document.getElementById("meal-details"),
  document.getElementById("products-section"),
  document.getElementById("foodlog-section"),
];

sidebarLinks.forEach((link) => {
  link.addEventListener("click", (e) => {
    e.preventDefault();

    sidebarLinks.forEach((l) => {
      l.classList.remove("bg-emerald-50", "text-emerald-700");
      l.classList.add("text-gray-600", "hover:bg-gray-50");
    });
    link.classList.add("bg-emerald-50", "text-emerald-700");
    link.classList.remove("text-gray-600", "hover:bg-gray-50");

    // نخفي كل السكاشن الاول
    mainSections.forEach((sec) => {
      if (sec) sec.classList.add("hidden");
    });

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

    // نقفل السايد بار لو على موبايل
    if (window.innerWidth < 1024) {
      closeSidebar();
    }

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
});

// Delete item from log
loggedItemsList.addEventListener("click", (e) => {
  const deleteBtn = e.target.closest(".delete-meal");
  if (!deleteBtn) return;
  const id = deleteBtn.dataset.id;
  let foodItems = loadFoodLog();
  foodItems = foodItems.filter((meal) => meal.id != id);
  saveFoodLog(foodItems);
  updateDashboard();
});

document.getElementById("clear-foodlog").onclick = () => {
  saveFoodLog([]);
  updateDashboard();
};

// Search & Categories Logic
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

inputSearchLog.addEventListener("click", (e) => {
  currentSearch = document.getElementById("product-search-input").value;
  loadProducts();
});

// Card Clicks
categoriesGrid.addEventListener("click", (e) => {
  const card = e.target.closest(".category-card");
  if (card) {
    document.querySelectorAll(".category-card").forEach((c) => {
      c.classList.remove("border-emerald-500", "bg-emerald-50");
      c.classList.add("border-gray-100", "bg-white");
    });
    card.classList.remove("border-gray-100", "bg-white");
    card.classList.add("border-emerald-500", "bg-emerald-50");

    // تصفير فلاتر البلاد لما تختار Category
    document.querySelectorAll(".cuisine-btn").forEach((b) => {
      b.classList.remove("bg-emerald-600", "text-white", "shadow-sm");
      b.classList.add("bg-gray-100", "text-gray-700", "hover:bg-gray-200");
    });
    document
      .querySelector('.cuisine-btn[data-area="All"]')
      ?.classList.add("bg-emerald-600", "text-white", "shadow-sm");

    loadRecipes(card.dataset.category);
  }
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

// Quick Actions Buttons (Food Log)
const logMealBtn = document.getElementById("logAmeal");
if (logMealBtn) {
  logMealBtn.addEventListener("click", () => {
    document.getElementById("foodlog-section").classList.add("hidden");
    document
      .getElementById("meal-categories-section")
      .classList.remove("hidden");
    document
      .getElementById("search-filters-section")
      .classList.remove("hidden");
    document.getElementById("all-recipes-section").classList.remove("hidden");

    // تفعيل التاب صح في السايد بار
    sidebarLinks.forEach((l) => {
      l.classList.remove("bg-emerald-50", "text-emerald-700");
      l.classList.add("text-gray-600", "hover:bg-gray-50");
      if (l.textContent.trim() === "Meals & Recipes") {
        l.classList.add("bg-emerald-50", "text-emerald-700");
        l.classList.remove("text-gray-600", "hover:bg-gray-50");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}

const scanBtn = document.getElementById("scanBtn");
if (scanBtn) {
  scanBtn.addEventListener("click", () => {
    document.getElementById("foodlog-section").classList.add("hidden");
    document.getElementById("products-section").classList.remove("hidden");

    // تفعيل التاب صح في السايد بار
    sidebarLinks.forEach((l) => {
      l.classList.remove("bg-emerald-50", "text-emerald-700");
      l.classList.add("text-gray-600", "hover:bg-gray-50");
      if (l.textContent.trim() === "Product Scanner") {
        l.classList.add("bg-emerald-50", "text-emerald-700");
        l.classList.remove("text-gray-600", "hover:bg-gray-50");
      }
    });

    window.scrollTo({ top: 0, behavior: "smooth" });
  });
}
