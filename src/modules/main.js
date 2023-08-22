import { cubicBezierPointAndTangent } from "./camera.js";
import {
  birdbject,
  buildingObject,
  groundObject,
  treeObject,
} from "./objectsLoader.js";
import { TREES_POSTION, degToRad } from "./utils.js";

//camera settings
let t = 0;
let cameraZoomOffset = 1000;
let cameraPosition = [-269.4296871180335, 38.1232870679158, cameraZoomOffset];
let target = [703.8646233146919, 677.0565082486469, -700.0000000000001];

const controlPoints = [
  [-269.4296871180335, 38.1232870679158, 1000],
  [-169.2492779778083, 135.3462283569189, 900],
  [-15.5561744307941, 160.902587376284, 800],
  [52.6785026331906, 166.4697379970672, 700],
  [166.9482460410798, 143.2845726679302, 600],
  [-96.3689887684041, -15.6994181604381, 500],
  [117.2657489072149, -93.5353303368267, 400],
  [334.212653058425, 145.7686975246234, 100],
];

//tree settings
const treesPosition = TREES_POSTION;

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const objectsData = await Promise.all([groundObject(gl, meshProgramInfo)])
    .then(async (loadedObj) => {
      return loadedObj;
    })
    .finally(() => {
      console.log("All objects loaded");
    });

  const birdData = await birdbject(gl, meshProgramInfo);

  const buildingData = await buildingObject(gl, meshProgramInfo);

  const treeData = await treeObject(gl, meshProgramInfo);

  var fieldOfViewRadians = degToRad(60);

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
      target = tangent;
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

    // Set the position attribute

    objectsData.forEach(function (object, index) {
      let u_world = m4.identity();

      u_world = m4.scale(u_world, ...object.scale);
      u_world = m4.translate(u_world, ...object.offset);

      for (let { bufferInfo, vao, material } of object.parts) {
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
