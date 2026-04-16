const API = "https://api.redclass.redberryinternship.ge/api";

let currentSort = "newest";

const CAT_ICONS = {
  development: `<img src="imgs/develop.svg" width="16" height="16">`,
  design: `<img src="imgs/design.svg" width="16" height="16">`,
  business: `<img src="imgs/bussines.svg" width="16" height="16">`,
  marketing: `<img src="imgs/marketing.svg" width="16" height="16">`,
  "data-science": `<img src="imgs/datascien.svg" width="16" height="16">`
};

const state = {
  allCourses: [],
  filteredCourses: [],
  categories: [],
  topics: [],
  instructors: [],
  page: 1,
  perPage: 10,
  totalPages: 1,
  selectedCats: new Set(),
  selectedTopics: new Set(),
  selectedInsts: new Set()
};

document.addEventListener("DOMContentLoaded", async () => {
  await fetchAllData();
  setupSortDropdown();
  setupGlobalClick();
});

/* =========================
   FETCH ALL DATA
========================= */
async function fetchAllData() {
  let page = 1;
  let all = [];

  while (true) {
    const res = await fetch(`${API}/courses?page=${page}`);
    const data = await res.json();

    all = all.concat(data.data);

    if (page >= data.meta.lastPage) break;
    page++;
  }

  state.allCourses = all;

  const [catsRes, topicsRes, instRes] = await Promise.all([
    fetch(`${API}/categories`),
    fetch(`${API}/topics`),
    fetch(`${API}/instructors`)
  ]);

  state.categories = (await catsRes.json()).data;
  state.topics = (await topicsRes.json()).data;
  state.instructors = (await instRes.json()).data;

  applyFilters();
  buildSidebar();
  render();
}

/* =========================
   SORT DROPDOWN
========================= */
function setupSortDropdown() {
  const sortDropdown = document.querySelector(".sort-dropdown");
  const sortSelected = document.getElementById("sortSelected");

  sortSelected.addEventListener("click", (e) => {
    e.stopPropagation();
    sortDropdown.classList.toggle("open");
  });

  document.querySelectorAll(".sort-option").forEach(option => {
    option.addEventListener("click", () => {
      currentSort = option.dataset.value;
      sortSelected.innerText = option.innerText;

      document.querySelectorAll(".sort-option")
        .forEach(o => o.classList.remove("active"));

      option.classList.add("active");
      sortDropdown.classList.remove("open");

      state.page = 1;
      applyFilters();
      render();
    });
  });
}

/* =========================
   GLOBAL CLICK HANDLER
========================= */
function setupGlobalClick() {
  document.addEventListener("click", (e) => {
    const btn = e.target.closest(".filter-btn");
    if (!btn) return;

    const type = btn.dataset.type;
    const value = String(btn.dataset.value);

    let set =
      type === "cat"
        ? state.selectedCats
        : type === "topic"
          ? state.selectedTopics
          : state.selectedInsts;

    if (set.has(value)) set.delete(value);
    else set.add(value);

    state.page = 1;

    buildSidebar();
    updateSelectedCount();
    applyFilters();
    render();
  });
}

/* =========================
   FILTER COUNT
========================= */
function updateSelectedCount() {
  document.getElementById("selectedCount").innerText =
    state.selectedCats.size +
    state.selectedTopics.size +
    state.selectedInsts.size;
}

function clearAll() {
  state.selectedCats.clear();
  state.selectedTopics.clear();
  state.selectedInsts.clear();

  state.page = 1;

  buildSidebar();
  updateSelectedCount();
  applyFilters();
  render();
}

/* =========================
   SIDEBAR BUILD
========================= */
function buildSidebar() {
  renderCategories();
  renderTopics();
  renderInstructors();
}

function renderCategories() {
  document.getElementById("categories").innerHTML =
    state.categories.map(c => {
      const active = state.selectedCats.has(String(c.id));

      return `
        <button class="filter-btn ${active ? "active" : ""} btn-category bodyS"
          data-type="cat"
          data-value="${c.id}">
          ${CAT_ICONS[c.icon] || ""} ${c.name}
        </button>
      `;
    }).join("");
}

function renderTopics() {
  let filtered = state.topics;

  if (state.selectedCats.size) {
    filtered = filtered.filter(t =>
      state.selectedCats.has(String(t.categoryId))
    );
  }

  document.getElementById("topics").innerHTML =
    filtered.map(t => {
      const active = state.selectedTopics.has(String(t.id));

      return `
        <button class="filter-btn ${active ? "active" : ""} bodyS"
          data-type="topic"
          data-value="${t.id}">
          ${t.name}
        </button>
      `;
    }).join("");
}

function renderInstructors() {
  document.getElementById("instructors").innerHTML =
    state.instructors.map(i => {
      const initials = i.name
        .split(" ")
        .map(x => x[0])
        .join("")
        .slice(0, 2);

      const active = state.selectedInsts.has(String(i.id));

      return `
        <button class="filter-btn ${active ? "active" : ""} btn-instruc bodyS"
          data-type="inst"
          data-value="${i.id}">
          
          ${i.avatar
            ? `<img src="${i.avatar}" class="inst-img">`
            : `<div class="inst-avatar">${initials}</div>`}

          <span>${i.name}</span>
        </button>
      `;
    }).join("");
}

/* =========================
   FILTER + SORT
========================= */
function applyFilters() {
  let data = [...state.allCourses];

  data = data.filter(c => {
    if (state.selectedCats.size &&
      !state.selectedCats.has(String(c.category.id)))
      return false;

    if (state.selectedTopics.size &&
      !state.selectedTopics.has(String(c.topic.id)))
      return false;

    if (state.selectedInsts.size &&
      !state.selectedInsts.has(String(c.instructor.id)))
      return false;

    return true;
  });

  if (currentSort === "price_asc")
    data.sort((a, b) => a.basePrice - b.basePrice);

  if (currentSort === "price_desc")
    data.sort((a, b) => b.basePrice - a.basePrice);

  if (currentSort === "popular")
    data.sort((a, b) => (b.reviewCount || 0) - (a.reviewCount || 0));

  if (currentSort === "newest")
    data.sort((a, b) => b.id - a.id);

  state.filteredCourses = data;
  state.totalPages = Math.max(1, Math.ceil(data.length / state.perPage));
}

/* =========================
   RENDER
========================= */
function render() {
  renderCourses();
  renderPagination();
}

function renderCourses() {
  const container = document.getElementById("coursesGrid");

  const start = (state.page - 1) * state.perPage;
  const end = start + state.perPage;

  const list = state.filteredCourses.slice(start, end);

  const totalFiltered = state.filteredCourses.length;
  const totalAll = state.allCourses.length;
  const showingTo = Math.min(end, totalFiltered);

  document.getElementById("count").innerText =
    totalFiltered === 0
      ? "No courses found"
      : `Showing ${showingTo} out of ${totalAll}`;

  if (!list.length) {
    container.innerHTML = `
      <div class="empty-state">
        <p>No courses found</p>
      </div>
    `;
    return;
  }

  container.innerHTML = list.map(c => `
    <div class="card">

      <div class="card-info">
        <img src="${c.image}" class="card-img" alt="${c.title}">

        <div class="card-detail-indo">
          <div class="duration-inst-rating">

            <div class="duration">
              <span class="bodyXS">${c.instructor.name}</span>
              <div class="divider"></div>
              <span class="bodyXS durationWeek">
                ${c.durationWeeks} weeks
              </span>
            </div>

            <div class="course-rate">
              <img src="imgs/Star.svg" alt="Rating">
              <p class="bodySX rating">
                ${Number(c.avgRating || 0).toFixed(1)}
              </p>
            </div>

          </div>

          <p class="card-title heading-3">
            ${c.title}
          </p>
        </div>
      </div>

      <p class="card-category bodyS">
        ${c.category.name}
      </p>

      <div class="card-footer">
        <div class="price-cont">
          <p class="helper-medium">starting from</p>
          <span class="price heading-3">$${c.basePrice}</span>
        </div>

     <button class="btn-details btn-primary buttonS" data-id="${c.id}">
  Details
</button>
      </div>

    </div>
  `).join("");
}

/* =========================
   PAGINATION
========================= */
document.addEventListener("click", (e) => {
  const btn = e.target.closest(".btn-details");
  if (!btn) return;

  const id = btn.dataset.id;

  window.location.href = `course.html?id=${id}`;
});
function renderPagination() {
  const container = document.getElementById("pagination");

  let html = "";

  html += `
    <button onclick="changePage(${state.page - 1})"
      ${state.page === 1 ? "disabled" : ""}>
      <img src="imgs/left.svg">
    </button>
  `;

  for (let i = 1; i <= state.totalPages; i++) {
    html += `
      <button class="${i === state.page ? "active" : ""}"
        onclick="changePage(${i})">
        ${i}
      </button>
    `;
  }

  html += `
    <button onclick="changePage(${state.page + 1})"
      ${state.page === state.totalPages ? "disabled" : ""}>
      <img src="imgs/right.svg">
    </button>
  `;

  container.innerHTML = html;
}

function changePage(p) {
  state.page = p;
  render();
}