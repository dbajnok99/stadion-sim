const formatWaitTime = (seconds) => {
  const numSeconds = Number(seconds);
  if (!Number.isFinite(numSeconds)) return 'N/A';
  if (numSeconds < 60) return `${numSeconds.toFixed(1)} sec`;
  const mins = Math.floor(numSeconds / 60);
  const secs = (numSeconds % 60).toFixed(0);
  return `${mins} min ${secs} sec`;
};

export default formatWaitTime;