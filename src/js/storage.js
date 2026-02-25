// ====== storage.js ======
export function saveFoodLog(items) {
  localStorage.setItem("foodLog", JSON.stringify(items));
}

export function loadFoodLog() {
  const data = localStorage.getItem("foodLog");
  return data ? JSON.parse(data) : [];
}
