const generateGamma = (alpha) => {
  if (alpha >= 1) {
    const d = alpha - 1.0 / 3.0;
    const c = 1.0 / Math.sqrt(9.0 * d);
    while (true) {
      let x, v;
      do {
        let u1 = 0, u2 = 0;
        while(u1 === 0) u1 = Math.random();
        while(u2 === 0) u2 = Math.random();
        x = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
        v = 1.0 + c * x;
      } while (v <= 0);
      
      v = v * v * v;
      const u = Math.random();
      if (u < 1.0 - 0.0331 * x * x * x * x) return d * v;
      if (Math.log(u) < 0.5 * x * x + d * (1.0 - v + Math.log(v))) return d * v;
    }
  } else {
    return Math.pow(Math.random(), 1.0 / alpha) * generateGamma(1.0 + alpha);
  }
};
export default generateGamma;