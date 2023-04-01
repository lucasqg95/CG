async function getBananaObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/banana/banana.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const translation = [40, 0, 0];
  const scale = [20, 20, 20];

  return { ...objectData, scale, translation };
}
