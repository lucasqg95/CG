async function getAppleObject(gl, meshProgramInfo) {
  fetch("Apple.obj")
    .then((response) => response.text())
    .then((text) => {
      console.log(text);
      const objData = parseOBJ(text);

      // Create buffers for the mesh data
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, objData);

      // Create a VAO for the mesh
      const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);
      return vao;
    })
    .catch((e) => {
      console.log(e);
    });
}
