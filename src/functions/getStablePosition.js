const getStablePosition = (index, seed, width, height) => {
  // Simple pseudo-random hash
  const sin = Math.sin(index * 12.9898 + seed * 78.233) * 43758.5453;
  const randX = sin - Math.floor(sin);
  const cos = Math.cos(index * 12.9898 + seed * 78.233) * 43758.5453;
  const randY = cos - Math.floor(cos);
  
  return {
    x: Math.floor(Math.abs(randX) * width),
    y: Math.floor(Math.abs(randY) * height)
  };
};

export default getStablePosition;