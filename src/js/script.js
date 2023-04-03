//camera settings
let cameraPosition = [0, 0, 0];
let cameraZoomOffset = 50;

// move settings
let moveDirection = 0;
let moveSpeed = 0.8;
let moveCounter = 0;
let moveOffset = 0;
let moveIndex = 0;

// fruit settings
let selectedFruit = moveIndex;
let fruitsArray = [];
let fruitsControls = [];

// background settings
let backgroundScale = 0.5;
let backgroundScaleDirection = 1;
let backgroundFrame = 0;

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const objectsData = await Promise.all([
    getBananaObject(gl, meshProgramInfo),
    getWatermelonObject(gl, meshProgramInfo),
    getAppleObject(gl, meshProgramInfo),
  ]).then(async (loadedObj) => {
    await loadedObj.forEach((obj) => {
      const urlSplit = obj.name.split("/");
      if (
        urlSplit[urlSplit.length - 1].includes("banana") &&
        fruitsArray.includes("banana") === false
      ) {
        fruitsArray.push("banana");
        createFruitControl(
          "banana",
          "A banana é uma fruta amarela e macia, rica em nutrientes como potássio e vitamina C. Ela é uma escolha popular para lanches saudáveis ou como ingrediente em receitas de sobremesas."
        );
      }
      if (
        urlSplit[urlSplit.length - 1].includes("strawberry") &&
        fruitsArray.includes("strawberry") === false
      ) {
        fruitsArray.push("strawberry");
        createFruitControl(
          "strawberry",
          "O morango é uma fruta pequena e vermelha com sabor doce e ligeiramente ácido. É rico em vitamina C, fibras e antioxidantes, e é usado em muitas sobremesas e lanches saudáveis."
        );
      }
      if (
        urlSplit[urlSplit.length - 1].includes("apple") &&
        fruitsArray.includes("apple") === false
      ) {
        fruitsArray.push("apple");
        createFruitControl(
          "apple",
          "A maçã verde é uma variedade de maçã com uma casca verde brilhante e polpa branca e firme. Ela tem um sabor levemente ácido e é conhecida por ser uma fonte rica em fibras e vitamina C."
        );
      }
      if (
        urlSplit[urlSplit.length - 1].includes("watermelon") &&
        fruitsArray.includes("watermelon") === false
      ) {
        fruitsArray.push("watermelon");
        createFruitControl(
          "watermelon",
          "A melancia é uma fruta grande e redonda, com uma casca grossa e verde escura e uma polpa vermelha suculenta e doce. Ela contém muita água e é uma fonte rica em nutrientes, incluindo vitaminas, minerais e antioxidantes."
        );
      }
    });

    return loadedObj;
  });

  const objectBackground = await Promise.all([
    getAvocadoObject(gl, meshProgramInfo),
  ]).then(async (loadedObj) => {
    return loadedObj;
  });

  var fieldOfViewRadians = degToRad(60);

  // ------ Objects Controls --------

  function updatePosition(objectIndex) {
    return function (event, ui) {
      fruitsControls[objectIndex].y = ui.value;
    };
  }

  function updateRotation(objectIndex) {
    return function (event, ui) {
      var angleInDegrees = ui.value;
      var angleInRadians = degToRad(angleInDegrees);
      fruitsControls[objectIndex].x = angleInRadians;
    };
  }

  function updateZoom() {
    return function (event, ui) {
      cameraZoomOffset = ui.value;
    };
  }

  function updateObject(objectIndex) {
    const productDescription = document.querySelector(".product-description");
    const productTitle = productDescription.querySelector("h1");
    const productDescriptionText = productDescription.querySelector("p");

    productTitle.innerHTML = fruitsControls[objectIndex].name;
    productDescriptionText.innerHTML = fruitsControls[objectIndex].description;

    webglLessonsUI.setupSlider("#y", {
      value: fruitsControls[objectIndex].y,
      slide: updatePosition(objectIndex),
      max: 50,
    });
    webglLessonsUI.setupSlider("#x", {
      value: fruitsControls[objectIndex].x,
      slide: updateRotation(objectIndex),
      min: -360,
      max: 360,
    });
    webglLessonsUI.setupSlider("#zoom", {
      value: cameraZoomOffset,
      slide: updateZoom(),
      min: 30,
      max: 70,
    });
  }

  updateObject(selectedFruit);

  console.log(gl.getError());
  function render(time) {
    gl.clearColor(1, 1, 1, 1); // sets the background color to green
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clears the color and depth buffer

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Camera controls
    var camera = m4.yRotation(degToRad(0));
    camera = m4.translate(camera, 0, 10, cameraZoomOffset);

    var viewMatrix = m4.inverse(moveCamera(moveDirection, fruitsArray, camera));

    if (moveCounter > 36) {
      moveCounter = 0;
      moveDirection = 0;
      if (moveIndex < fruitsArray.length) {
        moveIndex += 1;
        selectedFruit = moveIndex;
        updateObject(selectedFruit);
      }
    } else if (moveCounter < -36) {
      moveCounter = 0;
      moveDirection = 0;
      if (moveIndex > 0) {
        moveIndex -= 1;
        selectedFruit = moveIndex;
        updateObject(selectedFruit);
      }
    }

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
    var move = 0;

    objectsData.forEach(function (object, index) {
      let u_world = m4.identity();

      if (fruitsControls[index].y !== 0) {
        u_world = m4.translate(u_world, move, fruitsControls[index].y, 0);
      } else {
        u_world = m4.translate(u_world, move, 0, 0);
      }
      if (fruitsControls[index].x !== 0) {
        u_world = m4.yRotate(u_world, fruitsControls[index].x);
      }

      u_world = m4.scale(u_world, ...object.scale);
      u_world = m4.translate(u_world, ...object.offset);

      for (let { bufferInfo, vao, material, data } of object.parts) {
        if (
          selectedFruit === index &&
          fruitsControls[index].color.value !== undefined
        ) {
          data.color = fruitsControls[index].color;
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

      move += 40;
    });

    // Background Object Animation
    objectBackground[0].scale = [0, 0, 0];
    let scaleObject = objectBackground[0].scale;

    scaleObject[0] = scaleObject[0] + 0.25 * backgroundFrame;

    scaleObject[1] = scaleObject[1] + 0.25 * backgroundFrame;

    scaleObject[2] = scaleObject[2] + 0.25 * backgroundFrame;

    if (scaleObject[0] <= 30 && backgroundScaleDirection === 1) {
      backgroundFrame++;
      // reset the frame count and camera position once the camera reaches the target position
    } else if (scaleObject[0] >= 30 && backgroundScaleDirection === 1) {
      backgroundScaleDirection = -1;
    }

    if (scaleObject[0] >= 1 && backgroundScaleDirection === -1) {
      backgroundFrame--;
    } else if (scaleObject[0] <= 1 && backgroundScaleDirection === -1) {
      backgroundScaleDirection = 1;
    }

    // now draw the background
    objectBackground.forEach(function (object) {
      let u_world = m4.identity();
      scaleObject = object.scale;

      // scale the background to the size of the canvas
      u_world = m4.translate(u_world, 0, 20, -200);
      // make the object rotate around the y axis and scale it down to 1/2
      u_world = m4.yRotate(u_world, degToRad(0.1 * time));

      u_world = m4.scale(u_world, ...scaleObject);
      u_world = m4.translate(u_world, ...object.offset);

      for (let { bufferInfo, vao, material, data } of object.parts) {
        bufferInfo = twgl.createBufferInfoFromArrays(gl, data);
        vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

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
    });

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
