const slidesData = [
  {
    img: "imgs/slide1.jpg",
    title: "Start learning something new today",
    text: "Explore a wide range of expert-led courses in design, development, business, and more. Find the skills you need to grow your career and learn at your own pace.",
    btn: "Browse Courses"
  },
  {
    img: "imgs/slide2.jpg",
    title: "Pick up where you left off",
    text: "Your learning journey is already in progress. Continue your enrolled courses, track your progress, and stay on track toward completing your goals.",
    btn: "start Learning"
  },
  {
    img: "imgs/slide3.jpg",
    title: "Learn together, grow faster",
    btn: "learn more",
  }
];

let currentSlide = 0;

const track = document.getElementById("carouselTrack");
const dotsContainer = document.getElementById("dots");

function renderCarousel() {
  track.innerHTML = "";
  dotsContainer.innerHTML = "";

  slidesData.forEach((item, index) => {

    const slide = document.createElement("div");
    slide.className = "slide";

    slide.innerHTML = `
      <img src="${item.img}" alt="${item.title}" class="slide-img">

      <div class="slide-content">
        <div class="slide-text">
          <h1 class="display-text">${item.title}</h1>
          ${item.text ? `<p class="body-lightXL">${item.text}</p>` : ""}
        </div>

       <button onclick="window.location.href='catalogue.html'" class="buttonM btn-primary">
  ${item.btn}
</button>
      </div>
    `;

    track.appendChild(slide);

    const dot = document.createElement("div");
    dot.className = "dot";
    dot.onclick = () => showSlide(index);

    dotsContainer.appendChild(dot);
  });

  showSlide(0);
}

function showSlide(index) {
  const slides = document.querySelectorAll(".slide");
  const dots = document.querySelectorAll(".dot"); 

  slides.forEach((s, i) => {
    s.classList.toggle("active", i === index);
  });

  dots.forEach((d, i) => {
    d.classList.toggle("active", i === index);
  });

  currentSlide = index;
}

function nextSlide() {
  let next = currentSlide + 1;
  if (next >= slidesData.length) next = 0;
  showSlide(next);
}

function prevSlide() {
  let prev = currentSlide - 1;
  if (prev < 0) prev = slidesData.length - 1;
  showSlide(prev);
}

function handleButtonClick(index) {
  alert(`Clicked: ${slidesData[index].title}`);
}

document.addEventListener("DOMContentLoaded", renderCarousel);