document.addEventListener("DOMContentLoaded", () => {
  const burgerBtn = document.querySelector(".burger-btn");
  const closeBtn = document.querySelector(".close-btn");
  const navbar = document.querySelector(".navbar");

  if (burgerBtn) {
    burgerBtn.addEventListener("click", () => {
      navbar.classList.add("active");
    });
  }

  if (closeBtn) {
    closeBtn.addEventListener("click", () => {
      navbar.classList.remove("active");
    });
  }
});
