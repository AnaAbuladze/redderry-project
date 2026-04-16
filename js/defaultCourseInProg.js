
const inProgressCourses = [
  {
    progress: 64,
    course: {
      title: "React from Zero to Hero",
      image:
        "https://api.redclass.redberryinternship.ge/storage/courses/react-hero.jpg",
      avgRating: 4.9,
      instructor: {
        name: "Sarah Johnson",
      },
    },
  },
];

document.addEventListener("DOMContentLoaded", function () {
  renderDefaultCourseSection();
});

function renderDefaultCourseSection() {
  const container = document.getElementById("defaultCourseList");

  if (!container) return;

  let html = "";

  for (let i = 0; i < 3; i++) {
    const item = inProgressCourses[0];

    html += `
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
  }

  container.innerHTML = html;
}