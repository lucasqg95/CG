async function main() {
  const { gl, meshProgramInfo } = initializeWorld();

  const bananaData = await getBananaObject(gl, meshProgramInfo);

  const bananaUniforms = {
    u_texture: bananaData.texture,
    u_matrix: m4.identity(),
  };

  var fieldOfViewRadians = degToRad(60);

  function computeMatrix(viewProjectionMatrix, translation, yRotation) {
    var matrix = m4.translate(
      viewProjectionMatrix,
      translation[0],
      translation[1],
      translation[2]
    );
    return m4.yRotate(matrix, yRotation);
  }

  loadGUI();

  console.log(gl.getError());
  function render() {
    gl.clearColor(0.7, 0.8, 0, 1); // sets the background color to green
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT); // clears the color and depth buffer

    twgl.resizeCanvasToDisplaySize(gl.canvas);

    gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
    gl.enable(gl.DEPTH_TEST);
    gl.enable(gl.CULL_FACE);

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var projectionMatrix = m4.perspective(fieldOfViewRadians, aspect, 1, 2000);

    // Compute the camera's matrix using look at.
    var cameraPosition = [20, 100, 200];
    var target = [0, 0, 0];
    var up = [0, 1, 0];
    var cameraMatrix = m4.lookAt(cameraPosition, target, up);

    // Make a view matrix from the camera matrix.
    var viewMatrix = m4.inverse(cameraMatrix);

    var viewProjectionMatrix = m4.multiply(projectionMatrix, viewMatrix);

    gl.useProgram(meshProgramInfo.program);

    // ------ Draw the banana --------

    // Bind the texture
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, bananaData.texture);

    // Set the texture coordinate attribute
    const texcoordLocation = gl.getAttribLocation(
      meshProgramInfo.program,
      "a_texcoord"
    );

    gl.enableVertexAttribArray(texcoordLocation);
    gl.bindBuffer(
      gl.ARRAY_BUFFER,
      bananaData.bufferInfo.attribs.a_texcoord.buffer
    );
    gl.vertexAttribPointer(texcoordLocation, 2, gl.FLOAT, false, 0, 0);

    // Setup all the needed attributes.
    gl.bindVertexArray(bananaData.vao);

    const bananaTranslation = [0, 0, 0]; // Update these values to match the banana's position
    const bananaRotation = 0; // Update this value to match the banana's rotation

    bananaUniforms.u_matrix = computeMatrix(
      viewProjectionMatrix,
      bananaTranslation,
      bananaRotation
    );

    // Set the uniforms we just computed
    twgl.setUniforms(meshProgramInfo, bananaUniforms);

    twgl.drawBufferInfo(gl, bananaData.bufferInfo);
    requestAnimationFrame(render);
  }

  requestAnimationFrame(render);
}

main();
