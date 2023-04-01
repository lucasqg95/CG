async function getWatermelonObject(gl, meshProgramInfo) {
  const watermelonData = fetch("/src/objects/watermelon/watermelon.obj")
    .then((response) => response.text())
    .then(async (text) => {
      const objData = parseOBJ(text);

      // Create buffers for the mesh data
      const bufferInfo = twgl.createBufferInfoFromArrays(gl, objData);

      // Create a VAO for the mesh
      const vao = twgl.createVAOFromBufferInfo(gl, meshProgramInfo, bufferInfo);

      const textureUrl = "/src/objects/watermelon/watermelon.png"; // Change the texture URL
      const texture = await loadTexture(gl, textureUrl); // Load the texture

      const uniforms = {
        u_texture: texture,
        u_matrix: m4.identity(),
      };
      const translation = [160, 0, 0];
      const scale = [1, 1, 1];

      return {
        bufferInfo,
        vao,
        texture,
        uniforms,
        translation,
        scale,
      };
    })
    .catch((e) => {
      console.log(e);
    });

  return watermelonData;
}
