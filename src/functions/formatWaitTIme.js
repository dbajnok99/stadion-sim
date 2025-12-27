const formatWaitTime = (seconds) => {
  if (seconds < 60) return `${seconds.toFixed(1)} sec`;
  const mins = Math.floor(seconds / 60);
  const secs = (seconds % 60).toFixed(0);
  return `${mins} min ${secs} sec`;
};

export default formatWaitTime;