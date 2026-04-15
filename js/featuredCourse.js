const FEATURED_API =
  "https://api.redclass.redberryinternship.ge/api/courses/featured";

document.addEventListener("DOMContentLoaded", function () {
  loadFeaturedCourses();
});

function loadFeaturedCourses() {
  fetch(FEATURED_API, {
    headers: {
      accept: "application/json",
    },
  })
    .then((res) => {
      return res.json();
    })
    .then((json) => {
      renderFeaturedCourses(json.data);
    })
    .catch((err) => {});
}

function renderFeaturedCourses(courses) {
  const container = document.getElementById("featuredCoursesList");

  container.innerHTML = courses
    .map((course) => {
      return `
        <div class="course-card">
        <div class="course-header">
          <img 
            class="course-image"
            src="${course.image}" 
            alt="${course.title}" 
          />
          <div class="course-content">
         <div class="course-instructor ">
             <p class="bodyXS instructor"> Lecturer: ${course.instructor?.name || "Unknown"}</p>
              <div class="couse-rate">
              <img src="imgs/Star.svg" alt="Rating">
             <p> ${course.avgRating} </p>
              </div>
            </div>
            <div class="course-details">
        
            <h3 class='heading-3'>${course.title}</h3>
            <p class="course-description bodyS">
              ${course.description}
            </p>
            </div>
            </div>
            </div>

            <div class="card-footer">
            <div class="course-price">
              <p class="helper-medium ">Starting from </p>
             <p class="heading-2"> $${course.basePrice} </p>
            </div>
        
            <button onclick="goToCourse(${course.id})" class="buttonS btn-primary details-btn">
             Details
            </button>
            </div>
          </div>
        </div>
      `;
    })
    .join("");
}
