// ====== ui.js ======
const loadingOverlay = document.getElementById("app-loading-overlay");
const innerLoader = document.getElementById("loader");

// تعديل كلاسات اللودر الداخلي عشان يظهر كـ Modal شفاف في نص الشاشة (لما تضغط على وجبة)
if (innerLoader) {
  innerLoader.className =
    "fixed inset-0 bg-white/60 backdrop-blur-sm z-50 flex items-center justify-center hidden";
}

export function showLoader() {
  loadingOverlay.classList.remove("hidden");
  loadingOverlay.style.opacity = "1";
}

export function hideLoader() {
  loadingOverlay.style.transition = "opacity 1s ease";
  loadingOverlay.style.opacity = "0";
  setTimeout(() => {
    loadingOverlay.classList.add("hidden");
  }, 1000);
}

export function showInnerLoader() {
  if (innerLoader) innerLoader.classList.remove("hidden");
}

export function hideInnerLoader() {
  if (innerLoader) innerLoader.classList.add("hidden");
}

export function setActiveColor(
  containerSelector,
  itemSelector,
  activeBg,
  activeText,
  inactiveBg,
  inactiveText,
) {
  const container = document.querySelector(containerSelector);
  if (!container) return;
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

export function createRecipeCard(meal) {
  return `
    <div class="recipe-card bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-lg transition-all cursor-pointer group"
         data-meal-id="${meal.idMeal}">
      <div class="relative h-48 overflow-hidden">
        <img class="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
             src="${meal.strMealThumb}" alt="${meal.strMeal}">
      </div>
      <div class="p-4">
        <h3 class="font-bold mb-1 line-clamp-1">${meal.strMeal}</h3>
        <p class="text-xs text-gray-500">Click to view details</p>
      </div>
    </div>
  `;
}

export function updateLoggedItemsHeader(count) {
  const loggedItemsHeader = document.querySelector(
    "h4.text-sm.font-semibold.text-gray-700",
  );
  if (loggedItemsHeader) {
    loggedItemsHeader.innerHTML = `Logged Items (${count})`;
  }
}

export function renderWeeklyChart(weekData) {
  const container = document.querySelector("#weekly-chart .grid.grid-cols-7");
  if (!container) return;

  container.innerHTML = "";
  const maxCalories = Math.max(...weekData.map((d) => d.calories), 2000);

  weekData.forEach((day) => {
    const heightPercentage = Math.min((day.calories / maxCalories) * 100, 100);

    container.innerHTML += `
      <div class="flex flex-col items-center justify-end h-full pt-4">
        <div class="w-full max-w-[40px] bg-gray-100 rounded-t-lg flex flex-col justify-end h-40 mb-3 relative group overflow-hidden">
          <div class="bg-gradient-to-t from-emerald-600 to-emerald-400 rounded-t-lg w-full transition-all duration-700 ease-out" style="height: ${heightPercentage}%"></div>
          <div class="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
            <span class="text-white text-[10px] font-bold rotate-[-90deg] whitespace-nowrap">${Math.round(day.calories)} cal</span>
          </div>
        </div>
        <p class="text-sm font-semibold text-gray-900">${day.label}</p>
        <p class="text-xs text-gray-500">${day.day}</p>
      </div>
    `;
  });
}

export function renderDailyProgress(totals, targets) {
  document.getElementById("calories-text").textContent =
    `${Math.round(totals.calories)} / ${targets.calories} kcal`;
  document.getElementById("calories-bar").style.width =
    Math.min((totals.calories / targets.calories) * 100, 100) + "%";

  document.getElementById("protein-text").textContent =
    `${Math.round(totals.protein)} / ${targets.protein} g`;
  document.getElementById("protein-bar").style.width =
    Math.min((totals.protein / targets.protein) * 100, 100) + "%";

  document.getElementById("carbs-text").textContent =
    `${Math.round(totals.carbs)} / ${targets.carbs} g`;
  document.getElementById("carbs-bar").style.width =
    Math.min((totals.carbs / targets.carbs) * 100, 100) + "%";

  document.getElementById("fat-text").textContent =
    `${Math.round(totals.fat)} / ${targets.fat} g`;
  document.getElementById("fat-bar").style.width =
    Math.min((totals.fat / targets.fat) * 100, 100) + "%";
}
