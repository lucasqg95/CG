//camera settings
let yRotation = -30;
let frameCount = 100;
let cameraZoomDirection = 1;
let cameraPosition = [-20, 10, 200];
let cameraInitialAnimation = true;

// fruit settings
let objectsData = [];

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  // get of the local storage the fruits that the user bought
  // and call the respective function to load the fruit in a objectsDAta promise all
  const fruits = JSON.parse(localStorage.getItem("fruits"));
  if (fruits) {
    fruits.forEach(async (fruit) => {
      let fruitData = {};
      if (fruit.name === "banana") {
        fruitData = await getBananaObject(gl, meshProgramInfo);
        if (fruit.color.value !== undefined) fruitData.color = fruit.color;
      } else if (fruit.name === "strawberry") {
        fruitData = await getStrawberryObject(gl, meshProgramInfo);
        if (fruit.color.value !== undefined) fruitData.color = fruit.color;
      } else if (fruit.name === "watermelon") {
        fruitData = await getWatermelonObject(gl, meshProgramInfo);
        if (fruit.color.value !== undefined) fruitData.color = fruit.color;
      } else if (fruit.name === "apple") {
        fruitData = await getAppleObject(gl, meshProgramInfo);
        if (fruit.color.value !== undefined) fruitData.color = fruit.color;
      }

      objectsData.push(fruitData);
    });
  }

  // const objectsData = await Promise.all([
  //   getBananaObject(gl, meshProgramInfo),
  //   getStrawberryObject(gl, meshProgramInfo),
  //   getWatermelonObject(gl, meshProgramInfo),
  //   getAppleObject(gl, meshProgramInfo),
  // ]).then((loadedObj) => {
  //   return loadedObj;
  // });

  var fieldOfViewRadians = degToRad(60);

  console.log(gl.getError());

  function render() {
    gl.clearColor(1, 1, 1, 1); // sets the background color to green
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clears the color and depth buffer

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Camera controls
    let cameraDistance = 300 - 0.5 * frameCount;

    console.log("cameraDistance", cameraDistance, "frameCount", frameCount);

    if (cameraDistance >= 100 && cameraZoomDirection === 1) {
      yRotation -= degToRad(0.5); // rotate left by 0.5 degrees in each frame
      frameCount++;
      // reset the frame count and camera position once the camera reaches the target position
    } else if (cameraDistance <= 100 && cameraZoomDirection === 1) {
      cameraZoomDirection = -1;
    }

    if (cameraDistance < 300 && cameraZoomDirection === -1) {
      cameraDistance = cameraDistance + 0.5; // increment camera distance by 1 unit in each frame
      yRotation += degToRad(0.5); // rotate left by 0.5 degrees in each frame
      frameCount--;
    } else if (cameraDistance >= 300 && cameraZoomDirection === -1) {
      cameraZoomDirection = 1;
    }

    var camera = m4.yRotation(yRotation);
    camera = m4.translate(camera, 0, 100, cameraDistance);

    var viewMatrix = m4.inverse(camera);

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1, 3, 5]),
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_viewWorldPosition: cameraPosition,
    };

    gl.useProgram(meshProgramInfo.program);
    twgl.setUniforms(meshProgramInfo, sharedUniforms);

    // ------ Draw objects --------

    // Set the position attribute
    var moveX = -80;
    var moveY = 100;

    objectsData.forEach(function (object) {
      let u_world = m4.identity();

      u_world = m4.translate(u_world, moveX, moveY, 0);
      u_world = m4.scale(u_world, ...object.scale);
      u_world = m4.translate(u_world, ...object.offset);
      console.log(object);

      for (let { bufferInfo, vao, material, data } of object.parts) {
        if (object.color && object.color.value !== undefined) {
          data.color = object.color;
          bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
          vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
        } else {
          bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
          vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
        }

        gl.bindVertexArray(vao);
        twgl.setUniforms(
          meshProgramInfo,
          {
            u_world,
          },
          material
        );
        twgl.drawBufferInfo(gl, bufferInfo);
      }

      moveX += 40;
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
