async function getStrawberryObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/strawberry/strawberry.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const translation = [40, 0, 0];
  const scale = [2, 2, 2];

  return { ...objectData, scale, translation };
}
