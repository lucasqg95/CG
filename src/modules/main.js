import { cameraMovement, cubicBezierPointAndTangent } from "./camera.js";
import { birdbject, buildingObject } from "./objectsLoader.js";
import { degToRad } from "./utils.js";

//camera settings
let t = 0;
let cameraPosition = [-100.05, 210, 110.68];
let target = [703.8646233146919, 677.0565082486469, -700.0000000000001];

const controlPoints = [
  [-100.05, 210, 110.68],
  [-180.23, 210, 290.25],
  [-80.26, 210, 210.93],
  [20.65, 210, 250.24],
  [120.24, 210, 230.67],
  [260.48, 210, 230.34],
  [230.76, 210, 70.25],
  [190.45, 210, -140.14],
  [40.96, 210, -540.45],
  [-110.89, 210, -420.13],
  [-230.56, 210, -280.12],
  [-60.59, 210, -40.23],
  [-100.05, 210, 110.67],
];

//ball settings

let spherePosition = [...cameraPosition];
let sphereDirection = [0, 0, -1];
let isShooting = false; // Flag to prevent rapid shooting

const lightDirection = [-1, 3, 5];
const lightColor = [1.0, 1.0, 1.0];
const ambientColor = [0.2, 0.2, 0.2];

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  // ------ draw height map terrain --------

  const ballProgramInfo = twgl.createProgramInfo(gl, [ballVs, ballFs]);
  const terrainProgramInfo = twgl.createProgramInfo(gl, [terrainVs, terrainFs]);
  const terrainBufferInfo = twgl.primitives.createPlaneBufferInfo(
    gl,
    1000,
    1000,
    200,
    200
  );

  const heightMapTexture = twgl.createTexture(gl, {
    src: "src/assets/heightmap/height.png",
    minMag: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE,
  });

  const normalMapTexture = twgl.createTexture(gl, {
    src: "src/assets/heightmap/diffuse.png",
    minMag: gl.NEAREST,
    wrap: gl.CLAMP_TO_EDGE,
  });

  let terrain_worldMatrix = m4.identity();

  // ----- draw skybox ---------

  const skyboxProgramInfo = twgl.createProgramInfo(gl, [skyboxVS, skyboxFS]);
  const quadBufferInfo = twgl.primitives.createXYQuadBufferInfo(gl);

  const skyboxTexture = twgl.createTexture(gl, {
    target: gl.TEXTURE_CUBE_MAP,
    src: [
      "src/assets/skybox/right.bmp",
      "src/assets/skybox/left.bmp",
      "src/assets/skybox/top.bmp",
      "src/assets/skybox/bottom.bmp",
      "src/assets/skybox/front.bmp",
      "src/assets/skybox/back.bmp",
    ],
    min: gl.LINEAR_MIPMAP_LINEAR,
  });

  // ------ draw ball --------

  let sphereWorldMatrix = m4.identity();

  function createSphereWithLighting(
    gl,
    position,
    radius,
    lightDirection,
    lightColor,
    ambientColor,
    projectionMatrix,
    viewMatrix
  ) {
    const sphereBufferInfo = twgl.primitives.createSphereBufferInfo(
      gl,
      radius,
      24,
      12
    );

    sphereWorldMatrix = m4.identity();
    sphereWorldMatrix = m4.translate(sphereWorldMatrix, position);

    const normalMatrix = m4.transpose(m4.inverse(sphereWorldMatrix));

    const uniforms = {
      u_projection: projectionMatrix,
      u_view: viewMatrix,
      u_world: sphereWorldMatrix,
      u_normalMatrix: normalMatrix,
      u_lightDirection: lightDirection,
      u_lightColor: lightColor,
      u_ambientColor: ambientColor,
    };

    gl.useProgram(ballProgramInfo.program);

    twgl.setBuffersAndAttributes(gl, ballProgramInfo, sphereBufferInfo);
    twgl.setUniforms(ballProgramInfo, uniforms);

    twgl.drawBufferInfo(gl, sphereBufferInfo);
  }

  // ------ load objects --------

  const birdData = await birdbject(gl, meshProgramInfo);

  const buildingData = await buildingObject(gl, meshProgramInfo);

  var fieldOfViewRadians = degToRad(60);

  // ------ Camera Controls --------

  const canvas = document.querySelector("#canvas");

  let isMouseDragging = true;

  canvas.addEventListener("mousedown", (e) => {
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

  document.addEventListener(
    "keydown",
    (e) => {
      if (e.code === "Space" && !isShooting) {
        // Shoot the ball
        isShooting = true;

        console.log("Sphere Position:", spherePosition);
        // Set a timeout to reset isShooting after a delay (e.g., 1 second)
        setTimeout(() => {
          isShooting = false;
        }, 1000); // 1000 milliseconds (1 second)
      }
    },
    false
  );

  // ------ Objects Controls --------

  console.log(gl.getError());

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
      t = deltaTime * 0.1 + t;
      const { position, tangent } = cubicBezierPointAndTangent(
        controlPoints,
        t
      );

      cameraPosition = position;
    } else if (t >= 1) {
      t = 0;
    }

    var camera = m4.yRotation(degToRad(0));
    camera = m4.translate(camera, ...cameraPosition);
    camera = m4.lookAt(cameraPosition, target, [0, 1, 0]);

    var viewMatrix = m4.inverse(camera);
    let viewDirection = m4.copy(camera);

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

    // ------ Draw terrain --------

    gl.useProgram(terrainProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, terrainProgramInfo, terrainBufferInfo);
    twgl.setUniforms(terrainProgramInfo, sharedUniforms);
    twgl.setUniformsAndBindTextures(terrainProgramInfo, {
      u_world: terrain_worldMatrix,
      displacementMap: heightMapTexture,
      normalMap: normalMapTexture,
    });
    twgl.drawBufferInfo(gl, terrainBufferInfo);

    // ------ Draw balls --------

    if (isShooting) {
      // Move the ball in the shooting direction
      const ballSpeed = 10.0 * deltaTime; // Adjust the speed as needed
      spherePosition[0] += sphereDirection[0] * ballSpeed;
      spherePosition[1] += sphereDirection[1] * ballSpeed;
      spherePosition[2] += sphereDirection[2] * ballSpeed;

      // Check if the ball has gone too far and stop shooting
      if (spherePosition[2] < -1000) {
        isShooting = false;
      }

      // Render the moving ball
      createSphereWithLighting(
        gl,
        spherePosition,
        10,
        lightDirection,
        lightColor,
        ambientColor,
        projectionMatrix,
        viewMatrix
      );
    }

    // ------ Draw skybox --------

    viewDirection[12] = 0;
    viewDirection[13] = 0;
    viewDirection[14] = 0;

    gl.depthFunc(gl.LEQUAL);
    gl.useProgram(skyboxProgramInfo.program);
    twgl.setBuffersAndAttributes(gl, skyboxProgramInfo, quadBufferInfo);
    twgl.setUniformsAndBindTextures(skyboxProgramInfo, {
      u_viewDirectionProjectionInverse: m4.inverse(
        m4.multiply(projectionMatrix, viewDirection)
      ),
      u_skybox: skyboxTexture,
    });
    twgl.drawBufferInfo(gl, quadBufferInfo);

    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
