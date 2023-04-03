async function getAvocadoObject(gl, meshProgramInfo) {
  const textureUrl = "/src/objects/avocado/avocado_obj.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const translation = [40, 0, 0];
  const scale = [0.15, 0.15, 0.15];

  return { ...objectData, scale, translation };
}
