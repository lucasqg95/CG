const degToRad = (d) => (d * Math.PI) / 180;

const radToDeg = (r) => (r * 180) / Math.PI;

function setDiretion(direction) {
  console.log(direction);
  if (direction === "left") {
    moveDirection = -1;
  } else if (direction === "right") {
    moveDirection = 1;
  }
}

function moveCamera(direction, camera) {
  if (direction === -1) {
    moveCounter -= moveSpeed;
    moveOffset -= moveSpeed;
    return m4.translate(camera, moveOffset, 10, 50);
  } else if (direction === 1) {
    moveCounter += moveSpeed;
    moveOffset += moveSpeed;
    return m4.translate(camera, moveOffset, 10, 50);
  } else {
    return m4.translate(camera, moveOffset, 10, 50);
  }
}
