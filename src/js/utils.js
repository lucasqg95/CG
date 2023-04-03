const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

// camera utils
function setDiretion(direction) {
  if (direction === "left") {
    moveDirection = -1;
  } else if (direction === "right") {
    moveDirection = 1;
  }
}

function moveCamera(direction, fruitsArray, camera) {
  if (direction === -1 && moveIndex > 0) {
    moveCounter -= moveSpeed;
    moveOffset -= moveSpeed;
    return m4.translate(camera, moveOffset, 10, 50);
  } else if (direction === 1 && moveIndex < fruitsArray.length - 1) {
    moveCounter += moveSpeed;
    moveOffset += moveSpeed;
    return m4.translate(camera, moveOffset, 10, 50);
  } else {
    return m4.translate(camera, moveOffset, 10, 50);
  }
}

// fruit utils

function buyFruit() {
  const fruit = fruitsControls[selectedFruit];

  const fruits = JSON.parse(localStorage.getItem("fruits"));
  if (fruits) {
    fruits.push({
      name: fruit.name,
      color: fruit.color,
    });
    localStorage.setItem("fruits", JSON.stringify(fruits));
  } else {
    localStorage.setItem(
      "fruits",
      JSON.stringify([{ name: fruit.name, color: fruit.color }])
    );
  }
}

function createFruitControl(fruit, description) {
  fruitsControls.push({
    name: fruit,
    description: description,
    color: {
      value: undefined,
    },
    y: 0,
    x: 0,
    z: 0,
  });
}

function setFruitColor(color) {
  console.log("color", color);
  const fruit = fruitsControls[selectedFruit];
  if (color === "red") {
    fruit.color.value = [1, 0, 0, 1];
  }
  if (color === "green") {
    fruit.color.value = [0, 1, 0, 1];
  }
  if (color === "blue") {
    fruit.color.value = [0, 0, 1, 1];
  }
}
