

function getToken() {
  return getCookie("token");
}
document.addEventListener("DOMContentLoaded", function () {
  loadInProgressCourses();
});

function loadInProgressCourses() {
  const token = getToken();

  const container = document.getElementById("inProgressCoursesList");

  if (!container) {
    console.log(" Missing container #inProgressCoursesList");
    return;
  }

  if (!token) {
    console.log(" No token → guest user");
    renderEmptyState();
    return;
  }

  fetch("https://api.redclass.redberryinternship.ge/api/courses/in-progress", {
    method: "GET",
    headers: {
      accept: "application/json",
      Authorization: `Bearer ${token}`,
    },
  })
    .then((res) => {
      if (!res.ok) {
        throw new Error(" Unauthorized or request failed");
      }
      return res.json();
    })
    .then((json) => {
      console.log(" IN PROGRESS RESPONSE:", json);

      renderInProgressCourses(json.data || []);
    })
    .catch((err) => {
      console.error(" Fetch error:", err);
      renderEmptyState();
    });
}


function renderInProgressCourses(courses) {
  const container = document.getElementById("inProgressCoursesList");

  if (!container) return;

  if (!courses || courses.length === 0) {
    renderEmptyState();
    return;
  }

  container.innerHTML = courses
    .map((item) => {
      const course = item.course;

      return `
 <div class="default-card">
      <div class="default-card-content">
        <img src="${item.course.image}" class="course-img"/>

        <div class="default-info">
          <div class="course-instructor ">
             <p class="bodyXS instructor"> Lecturer: ${item.course.instructor?.name || "Unknown"}</p>
              <div class="couse-rate">
              <img src="imgs/Star.svg" alt="Rating">
             <p class="bodySM rating"> ${item.course.avgRating} </p>
              </div>
            </div>
          <h3 class=heading-4>${item.course.title}</h3>
          </div>
          </div>
          <div class="default-card-footer">
         <div class="default-progress">
                   <span class="helper-medium">${item.progress}% Completed</span>

          <div class="progress-bar">
            <div class="progress-fill" style="width:${item.progress}%"></div>
          </div>

          </div>

          <button onclick="goToCourse(${item.course.id})"class="buttonS view-button">
            View
          </button>
          </div>
          </div>

        </div>
      </div>
      `;
    })
    .join("");
}

function renderEmptyState() {
  const container = document.getElementById("inProgressCoursesList");

  if (!container) return;

  container.innerHTML = `
    <div class="empty-state">
      <p>No courses in progress</p>
      <button onclick="openModal('loginModal')">
        Login to continue
      </button>
    </div>
  `;
}
function toggleCourseSections() {
  const loggedIn = isLoggedIn();

  const inProgressSection = document.querySelector(".courses-in-progress");
  const defaultSection = document.querySelector("#defaultCourseLearning");

  if (!inProgressSection || !defaultSection) return;

  if (loggedIn) {
    inProgressSection.style.display = "block";
    defaultSection.style.display = "none";
  } else {
    inProgressSection.style.display = "none";
    defaultSection.style.display = "block";
  }
}

document.addEventListener("DOMContentLoaded", function () {
  toggleCourseSections();
});