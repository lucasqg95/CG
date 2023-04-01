async function getAvocadoObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/avocado/avocado.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  console.log(objectData);

  const translation = [40, 0, 0];
  const scale = [1.5, 1.5, 1.5];

  return { ...objectData, scale, translation };
}
