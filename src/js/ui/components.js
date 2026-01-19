export function showLoading(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="flex items-center justify-center py-12">
      <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
    </div>
  `;
}

export function hideLoading(container) {
  if (!container) return;
  container.innerHTML = "";
}

export function showEmptyState(container) {
  if (!container) return;
  container.innerHTML = `
    <div class="flex flex-col items-center justify-center py-12 text-center">
      <div class="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mb-4">
        <i class="fa-solid fa-search text-gray-400 text-2xl"></i>
      </div>
      <p class="text-gray-500 text-lg">No recipes found</p>
      <p class="text-gray-400 text-sm mt-2">Try searching for something else</p>
    </div>
  `;
}




