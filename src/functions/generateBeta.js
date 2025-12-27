import generateGamma from './generateGamma';

const generateBeta = (alpha, beta) => {
  const x = generateGamma(alpha);
  const y = generateGamma(beta);
  return x / (x + y);
};

export default generateBeta;
