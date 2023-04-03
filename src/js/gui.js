const prevButton = document.getElementById("prev");
const nextButton = document.getElementById("next");
const buyButton = document.getElementById("buy");
const redButton = document.getElementById("red");
const greenButton = document.getElementById("green");
const blueButton = document.getElementById("blue");

const colorButtons = document.querySelectorAll(".colorButton");

prevButton.addEventListener("click", () => setDiretion("left"));
nextButton.addEventListener("click", () => setDiretion("right"));
buyButton.addEventListener("click", () => buyFruit());

colorButtons.forEach((button) => {
  button.addEventListener("click", () => {
    colorButtons.forEach((btn) => btn.classList.remove("selected"));
    button.classList.add("selected");
  });
});

redButton.addEventListener("click", () => setFruitColor("red"));
greenButton.addEventListener("click", () => setFruitColor("green"));
blueButton.addEventListener("click", () => setFruitColor("blue"));
