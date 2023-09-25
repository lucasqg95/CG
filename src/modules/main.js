import { cameraMovement, cubicBezierPointAndTangent } from "./camera.js";
import { birdbject, buildingObject, treeObject } from "./objectsLoader.js";
import { TREES_POSTION, degToRad } from "./utils.js";

//camera settings
let t = 0;
let cameraZoomOffset = 1000;
let cameraPosition = [-269.4296871180335, 38.1232870679158, cameraZoomOffset];
let target = [703.8646233146919, 677.0565082486469, -700.0000000000001];

const controlPoints = [
  [-10.05, 4.5, 11.67],
  [-18.35, 5.2, 29.85],
  [-8.11, 5.8, 21.92],
  [2.15, 4.8, 25.49],
  [12.24, 1, 23.25],
  [26.32, -0.5, 23.55],
  [23.77, 1.5, 7.69],
  [19.29, 0.8, -14.12],
  [4.95, -0.2, -54.78],
  [-11.05, 2.5, -42.89],
  [-23.89, -1, -28.57],
  [-6.72, 0.7, -4.18],
  [-10.05, 4.5, 11.67],
];

//tree settings
const treesPosition = TREES_POSTION;

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const birdData = await birdbject(gl, meshProgramInfo);

  const buildingData = await buildingObject(gl, meshProgramInfo);

  const treeData = await treeObject(gl, meshProgramInfo);

  var fieldOfViewRadians = degToRad(60);

  // ------ Terrain Controls --------

  // ------ Camera Controls --------

  const canvas = document.querySelector("#canvas");

  let isMouseDragging = true;

  canvas.addEventListener("mousedown", () => {
    isMouseDragging = true;
  });

  canvas.addEventListener("mouseup", () => {
    isMouseDragging = false;
  });

  canvas.addEventListener("mousemove", (e) => {
    if (isMouseDragging) {
      target = cameraMovement(e, target);
    }
  });

  // ------ Objects Controls --------

  function updateCameraAnim(e) {
    return function (event, ui) {
      t = ui.value / 100;
    };
  }

  function updateSliderValue() {
    slider.updateValue(t * 100);
  }

  const slider = webglLessonsUI.setupSlider("#animation", {
    value: t * 100,
    slide: updateCameraAnim(),
    min: 0,
    max: 100,
  });

  console.log(gl.getError());

  const startButton = document.getElementById("start");

  startButton.addEventListener("click", () => {
    if (startButton.textContent === "Start") {
      startButton.textContent = "Stop";
    } else {
      startButton.textContent = "Start";
    }
  });

  var then = 0;
  var birdMovement = 0;

  function render(now) {
    gl.clearColor(1, 1, 1, 1); // sets the background color to green
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clears the color and depth buffer

    // Convert the time to seconds
    now *= 0.001;
    // Subtract the previous time from the current time
    var deltaTime = now - then;
    // Remember the current time for the next frame.
    then = now;

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Camera controls
    if (t < 1) {
      if (startButton.textContent === "Stop") {
        t = deltaTime * 0.1 + t;
        updateSliderValue();
      }
      const { position, tangent } = cubicBezierPointAndTangent(
        controlPoints,
        t
      );

      updateCameraAnim();
      cameraPosition = position;
    } else if (t >= 1 && startButton.textContent === "Stop") {
      updateSliderValue();
      t = 0;
    }

    var camera = m4.yRotation(degToRad(0));
    camera = m4.translate(camera, ...cameraPosition);
    camera = m4.lookAt(cameraPosition, target, [0, 1, 0]);

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

    // Draw building
    let u_world = m4.identity();
    u_world = m4.scale(u_world, ...buildingData.scale);
    u_world = m4.translate(u_world, ...buildingData.offset);

    for (let { bufferInfo, vao, material } of buildingData.parts) {
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

    for (let i = 0; i < 50; i++) {
      let u_world = m4.identity();
      const offset = treesPosition[i];

      u_world = m4.scale(u_world, ...treeData.scale);
      u_world = m4.translate(u_world, ...offset);

      for (let { bufferInfo, vao, material } of treeData.parts) {
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
    }

    // Draw Tree

    u_world = m4.identity();
    u_world = m4.scale(u_world, ...treeData.scale);
    u_world = m4.translate(u_world, ...treeData.offset);

    for (let { bufferInfo, vao, material } of treeData.parts) {
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

    // Draw bird

    birdMovement = t + deltaTime * 0.1;

    u_world = m4.identity();
    u_world = m4.scale(u_world, ...birdData.scale);
    u_world = m4.translate(
      u_world,
      ...[
        ((birdMovement - 0) / (1 - 0)) * (200 - birdData.offset[0]) +
          birdData.offset[0],
        birdData.offset[1],
        birdData.offset[2],
      ]
    );

    for (let { bufferInfo, vao, material } of birdData.parts) {
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

    u_world = m4.identity();
    u_world = m4.scale(u_world, ...birdData.scale);
    u_world = m4.translate(
      u_world,
      ...[
        ((birdMovement - 0) / (1 - 0)) * (100 - birdData.offset[0] + 200) +
          birdData.offset[0],
        birdData.offset[1] + 20,
        birdData.offset[2] - 20,
      ]
    );

    for (let { bufferInfo, vao, material } of birdData.parts) {
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

    u_world = m4.identity();
    u_world = m4.scale(u_world, ...birdData.scale);
    u_world = m4.translate(
      u_world,
      ...[
        ((birdMovement - 0) / (1 - 0)) * (200 - birdData.offset[0] + 200) +
          birdData.offset[0],
        birdData.offset[1] - 10,
        birdData.offset[2] - 10,
      ]
    );

    for (let { bufferInfo, vao, material } of birdData.parts) {
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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
