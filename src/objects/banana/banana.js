async function getBananaObject(gl, meshProgramInfo) {
  const orangeData = fetch("/src/objects/banana/Banana.obj")
    .then((response) => response.text())
    .then(async (text) => {
      const objData = parseOBJ(text);

      // Create buffers for the mesh data

      const bufferInfo = twgl.createBufferInfoFromArrays(gl, objData);

      // Create a VAO for the mesh
      const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

      const textureUrl = "/src/objects/banana/Banana_BaseColor.png"; // Change the texture URL
      const texture = await loadTexture(gl, textureUrl); // Load the texture

      return {
        bufferInfo,
        vao,
        texture,
      };
    })
    .catch((e) => {
      console.log(e);
    });

  return orangeData;
}
