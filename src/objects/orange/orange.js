async function getOrangeObject(gl, meshProgramInfo) {
  const orangeData = fetch("/src/objects/orange/Orange.obj")
    .then((response) => response.text())
    .then((text) => {
      const objData = parseOBJ(text);

      // Create buffers for the mesh data
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, objData);

      // Create a VAO for the mesh
      const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

      return {
        bufferInfo,
        vao,
      };
    })
    .catch((e) => {
      console.log(e);
    });

  return orangeData;
}
