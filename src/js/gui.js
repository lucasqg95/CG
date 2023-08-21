const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const buyButton = document.getElementById("buy");

prevButton.addEventListener("click", () => setDiretion("left"));
nextButton.addEventListener("click", () => setDiretion("right"));
buyButton.addEventListener("click", () => buyFruit());
