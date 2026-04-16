const API = "https://api.redclass.redberryinternship.ge/api";


const state = {
  courseId: null,
  weeklyScheduleId: null,
  timeSlotId: null,
  sessionTypeId: null,
  basePrice: 0,
  extraPrice: 0,
};


document.addEventListener("DOMContentLoaded", async () => {
  const params = new URLSearchParams(window.location.search);
  state.courseId = params.get("id");

  if (!state.courseId) return;

  await loadCourseHeader();
  await loadWeeklySchedules();

  updatePriceUI();
});


function updatePriceUI() {
  const base = Number(state.basePrice) || 0;
  const extra = Number(state.extraPrice) || 0;

  const total = base + extra;

  const totalEl = document.getElementById("totalPrice");
  const baseEl = document.getElementById("basePrice");
  const sessionEl = document.getElementById("sessionPrice");

  if (totalEl) totalEl.textContent = `$${total}`;
  if (baseEl) baseEl.textContent = `$${base}`;
  if (sessionEl) sessionEl.textContent = extra === 0 ? "Included" : `+$${extra}`;
}


async function loadCourseHeader() {
  const res = await fetch(`${API}/courses/${state.courseId}`);
  const data = await res.json();

  const course = data.data;

  const container = document.getElementById("courseHeader");
  if (!container) return;

  const avgRating = course.reviews.length
    ? (
        course.reviews.reduce((s, r) => s + r.rating, 0) /
        course.reviews.length
      ).toFixed(1)
    : "0.0";

  state.basePrice = Number(course.price || 0);
  state.extraPrice = 0;

  updatePriceUI();

  container.innerHTML = `
    <div class="course-top">
      <h1 class="course-title heading-1">${course.title}</h1>

      <div class="courseedetails">
        <div class="img-durat">
          <img src="${course.image}" class="course-img" />

          <div class="course-info">
            <div class="dev">
              <div class="img-title">
                <img src="imgs/time.svg">
                <span class="bodyXS">${course.durationWeeks} weeks</span>
              </div>

              <div class="img-title">
                <img src="imgs/houre.svg">
                <span class="bodyXS">${course.hours} hours</span>
              </div>
            </div>

            <div class="dev">
              <div class="img-title">
                <img src="imgs/star.svg">
                <span class="bodyXS">${avgRating}</span>
              </div>

              <div class="img-title">
                <span class="bodyS filter-btn">
                  ${course.category.name}
                </span>
              </div>
            </div>
          </div>
        </div>

        <div class="course-description">
          <div class="instructor-info">
            <img src="${course.instructor.avatar}" />
            <span>${course.instructor.name}</span>
          </div>

          <p class="heading-4">Course Description</p>
          <p class="bodyS">${course.description}</p>
        </div>
      </div>
    </div>
  `;

  document.getElementById("breadcrumbCategory").textContent =
    course.category.name;
}


async function loadWeeklySchedules() {
  const container = document.getElementById("weeklyContainer");
  if (!container) return;

  container.innerHTML = "";

  const res = await fetch(`${API}/courses/${state.courseId}/weekly-schedules`);
  const data = await res.json();

  data.data.forEach(item => {
    const div = document.createElement("div");
    div.className = "choose-card";
    div.innerText = item.label;

    div.onclick = () => {
      state.weeklyScheduleId = item.id;

      setActive(div, "weeklyContainer");

      resetStep2And3();

      loadTimeSlots();
    };

    container.appendChild(div);
  });
}


function resetStep2And3() {
  state.timeSlotId = null;
  state.sessionTypeId = null;
  state.extraPrice = 0;

  const time = document.getElementById("timeSlotContainer");
  const session = document.getElementById("sessionContainer");

  if (time) time.innerHTML = "";
  if (session) session.innerHTML = "";

  updatePriceUI();
}


async function loadTimeSlots() {
  if (!state.weeklyScheduleId) return;

  const container = document.getElementById("timeSlotContainer");
  if (!container) return;

  container.innerHTML = "";

  const res = await fetch(
    `${API}/courses/${state.courseId}/time-slots?weekly_schedule_id=${state.weeklyScheduleId}`
  );

  const data = await res.json();

  data.data.forEach(slot => {
    const div = document.createElement("div");
    div.className = "choose-card";

    div.innerHTML = `<p class="bodyXS">${slot.label}</p>`;

    div.onclick = () => {
      state.timeSlotId = slot.id;

      setActive(div, "timeSlotContainer");

      resetSession();

      loadSessionTypes();
    };

    container.appendChild(div);
  });
}


function resetSession() {
  state.sessionTypeId = null;
  state.extraPrice = 0;

  const container = document.getElementById("sessionContainer");
  if (container) container.innerHTML = "";

  updatePriceUI();
}


async function loadSessionTypes() {
  if (!state.weeklyScheduleId || !state.timeSlotId) return;

  const container = document.getElementById("sessionContainer");
  if (!container) return;

  container.innerHTML = "";

  const url = `${API}/courses/${state.courseId}/session-types?weekly_schedule_id=${state.weeklyScheduleId}&time_slot_id=${state.timeSlotId}`;

  const res = await fetch(url);
  const data = await res.json();

  data.data.forEach(type => {
    const div = document.createElement("div");
    div.className = "choose-cards";

    const seats = Number(type.availableSeats ?? 0);
    const modifier = Number(type.priceModifier || 0);

    if (seats <= 0) {
      div.classList.add("disabled");
      div.innerHTML = `
        <p>${type.name}</p>
        <b>Fully Booked</b>
      `;
      container.appendChild(div);
      return;
    }

    div.innerHTML = `
      <img src="imgs/online.svg">
      <p class="heading-5">${type.name}</p>
      <span class="location helper-regularS">${type.location ?? ""}</span>
      <span class="price bodyXS">
        ${modifier === 0 ? "Included" : `+$${modifier}`}
      </span>
      <small>Seats: ${seats}</small>
    `;

    div.onclick = () => {
      state.sessionTypeId = type.id;
      state.extraPrice = modifier;

      setActive(div, "sessionContainer");

      updatePriceUI();
    };

    container.appendChild(div);
  });
}

function setActive(el, containerId) {
  const container = document.getElementById(containerId);

  container.querySelectorAll(".active")
    .forEach(x => x.classList.remove("active"));

  el.classList.add("active");
}