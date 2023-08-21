import {
  birdbject,
  buildingObject,
  groundObject,
  treeObject,
} from "../modules/objectsLoader.js";

//camera settings
let cameraPosition = [0, 0, 0];
let cameraZoomOffset = 1000;

//tree settings
const treesPosition = TREES_POSTION;

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const objectsData = await Promise.all([
    birdbject(gl, meshProgramInfo),
    groundObject(gl, meshProgramInfo),
  ])
    .then(async (loadedObj) => {
      return loadedObj;
    })
    .finally(() => {
      console.log("All objects loaded");
    });

  const buildingData = await buildingObject(gl, meshProgramInfo);

  const treeData = await treeObject(gl, meshProgramInfo);

  var fieldOfViewRadians = degToRad(60);

  // ------ Objects Controls --------

  function updateZoom() {
    return function (event, ui) {
      cameraZoomOffset = ui.value;
    };
  }

  webglLessonsUI.setupSlider("#animation", {
    value: cameraZoomOffset,
    slide: updateZoom(),
    min: 0,
    max: 1000,
  });

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
    camera = m4.translate(camera, 0, 30, cameraZoomOffset);

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

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
