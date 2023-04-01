let cameraPosition = [0, 0, 0];
let moveDirection = 0;
let moveSpeed = 0.4;
let moveCounter = 0;
let moveOffset = 0;

async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const objectsData = await Promise.all([
    getBananaObject(gl, meshProgramInfo),
    getAppleObject(gl, meshProgramInfo),
    getAvocadoObject(gl, meshProgramInfo),
    getBananaObject(gl, meshProgramInfo),
  ]).then((loadedObj) => {
    return loadedObj;
  });

  var fieldOfViewRadians = degToRad(60);

  // function computeMatrix(viewProjectionMatrix, translation, yRotation, scale) {
  //   var matrix = m4.translate(
  //     viewProjectionMatrix,
  //     translation[0],
  //     translation[1],
  //     translation[2]
  //   );

  //   matrix = m4.yRotate(matrix, yRotation);
  //   return matrix;
  // }

  loadGUI();

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

    // Compute the camera's matrix using look at.

    // Make a view matrix from the camera matrix.
    var camera = m4.yRotation(degToRad(0));
    camera = m4.translate(camera, 0, 10, 50);

    var viewMatrix = m4.inverse(moveCamera(moveDirection, camera));

    if (moveCounter > 36) {
      moveCounter = 0;
      moveDirection = 0;
    } else if (moveCounter < -36) {
      moveCounter = 0;
      moveDirection = 0;
    }

    const sharedUniforms = {
      u_lightDirection: m4.normalize([-1, 3, 5]),
      u_view: viewMatrix,
      u_projection: projectionMatrix,
      u_viewWorldPosition: cameraPosition,
    };

    console.log(moveDirection);

    gl.useProgram(meshProgramInfo.program);
    twgl.setUniforms(meshProgramInfo, sharedUniforms);

    // ------ Draw objects --------

    // Set the texture coordinate attribute
    const texcoordLocation = gl.getAttribLocation(
      meshProgramInfo.program,
      "a_texcoord"
    );

    gl.enableVertexAttribArray(texcoordLocation);

    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Set the position attribute
    var move = 0;

    objectsData.forEach(function (object) {
      let u_world = m4.identity();

      u_world = m4.translate(u_world, move, 0, 0);
      u_world = m4.scale(u_world, ...object.scale);
      u_world = m4.translate(u_world, ...object.offset);

      for (const { bufferInfo, vao, material } of object.parts) {
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
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
