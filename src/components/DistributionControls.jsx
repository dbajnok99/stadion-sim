import styles from "../styles";
const DistributionControls = ({ distType, distParams, onUpdate }) => {
  if (distType === 'normal') {
    return (
      <>
        <div style={{marginBottom: '10px'}}>
          <label style={{...styles.label, fontSize: '0.75rem'}}>Peak Arrival (Mean): {distParams.mean} min</label>
          <input type="range" min="-120" max="0" value={distParams.mean} onChange={e => onUpdate('mean', e.target.value)} style={styles.slider} />
        </div>
        <div>
          <label style={{...styles.label, fontSize: '0.75rem'}}>Spread (StdDev): {distParams.stdDev} min</label>
          <input type="range" min="5" max="60" value={distParams.stdDev} onChange={e => onUpdate('stdDev', e.target.value)} style={styles.slider} />
        </div>
      </>
    );
  }
  if (distType === 'uniform') {
    return (
      <>
        <div style={{marginBottom: '10px'}}>
          <label style={{...styles.label, fontSize: '0.75rem'}}>Start Arriving: {distParams.start} min</label>
          <input type="range" min="-180" max="-60" value={distParams.start} onChange={e => onUpdate('start', e.target.value)} style={styles.slider} />
        </div>
        <div>
          <label style={{...styles.label, fontSize: '0.75rem'}}>End Arriving: {distParams.end} min</label>
          <input type="range" min="-60" max="0" value={distParams.end} onChange={e => onUpdate('end', e.target.value)} style={styles.slider} />
        </div>
      </>
    );
  }
  if (distType === 'beta') {
    return (
      <>
        <div style={{marginBottom: '10px'}}>
          <label style={{...styles.label, fontSize: '0.75rem'}}>Alpha (Shape α): {distParams.alpha}</label>
          <input type="range" min="0.1" max="10" step="0.1" value={distParams.alpha} onChange={e => onUpdate('alpha', e.target.value)} style={styles.slider} />
        </div>
        <div>
          <label style={{...styles.label, fontSize: '0.75rem'}}>Beta (Shape β): {distParams.beta}</label>
          <input type="range" min="0.1" max="10" step="0.1" value={distParams.beta} onChange={e => onUpdate('beta', e.target.value)} style={styles.slider} />
        </div>
        <div style={{fontSize: '0.7rem', color: '#64748b', marginTop: '5px', fontStyle: 'italic'}}>
            Beta maps [0,1] to 2 hours window. <br/> α=β: Bell curve. α&gt;β: Late skew. β&gt;α: Early skew.
        </div>
      </>
    );
  }
  return null;
};


export default DistributionControls;