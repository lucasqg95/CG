async function getAppleObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/apple/apple.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const offset = [0, 0, 0];
  const scale = [0.15, 0.15, 0.15];

  return { ...objectData, scale, offset };
}
