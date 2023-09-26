export async function groundObject(gl, meshProgramInfo) {
  const textureUrl = "/src/assets/objects/ground/ground.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const offset = [10, 0, 0];
  const scale = [50, 50, 50];

  return { ...objectData, scale, offset };
}

export async function buildingObject(gl, meshProgramInfo) {
  const textureUrl = "/src/assets/objects/building/building.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const offset = [100, 50, -20];
  const scale = [3, 3, 3];

  return { ...objectData, scale, offset };
}

export async function birdbject(gl, meshProgramInfo) {
  const textureUrl = "/src/assets/objects/bird/bird.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const offset = [-400, 300, 0];
  const scale = [1, 1, 1];

  return { ...objectData, scale, offset };
}

export async function treeObject(gl, meshProgramInfo) {
  const textureUrl = "/src/assets/objects/tree/tree.obj"; // Change the texture URL
  const objectData = await loadObject(gl, meshProgramInfo, textureUrl); // Load the texture

  const offset = [10, 0, 0];
  const scale = [2.5, 2.5, 2.5];

  return { ...objectData, scale, offset };
}
