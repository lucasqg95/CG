async function getWatermelonObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/watermelon/watermelon.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const translation = [40, 0, 0];
  const scale = [40, 40, 40];
  const color = [0.0, 0.5, 0.0, 1.0];

  return { ...objectData, scale, translation };
}
