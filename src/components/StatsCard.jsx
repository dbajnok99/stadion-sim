import styles from "../styles";

const StatsCard = ({ label, value, subText, type = 'neutral' }) => {
  let bg = '#fff', border = '#e2e8f0', text = '#1e293b';
  
  if (type === 'success') { bg = '#f0fdf4'; border = '#bbf7d0'; text = '#15803d'; }
  else if (type === 'danger') { bg = '#fef2f2'; border = '#fecaca'; text = '#b91c1c'; }
  else if (type === 'info') { bg = '#eff6ff'; border = '#bfdbfe'; text = '#1e40af'; }
  else if (type === 'warning') { bg = '#fff7ed'; border = '#fed7aa'; text = '#9a3412'; }
  else if (type === 'purple') { bg = '#faf5ff'; border = '#e9d5ff'; text = '#6b21a8'; }

  return (
    <div style={{...styles.statCard, backgroundColor: bg, borderColor: border}}>
      <p style={{fontSize: '0.75rem', fontWeight: 'bold', color: text, opacity: 0.8, textTransform: 'uppercase'}}>{label}</p>
      <p style={{fontSize: '1.5rem', fontWeight: 'bold', color: text}}>{value}</p>
      {subText && <p style={{fontSize: '0.75rem', color: text, opacity: 0.9}}>{subText}</p>}
    </div>
  );
};

export default StatsCard;