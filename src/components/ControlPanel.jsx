import DistributionControls from './DistributionControls';
import { Settings, Play } from 'lucide-react';
import styles from '../styles';

const ControlPanel = ({ params, setParams, onRun }) => {
  const updateDistParam = (key, value) => {
    setParams(prev => ({
      ...prev,
      distParams: { ...prev.distParams, [key]: Number(value) }
    }));
  };

  return (
    <div style={styles.controlPanel}>
      <div style={{...styles.sectionTitle, borderBottom: '1px solid #e2e8f0', paddingBottom: '12px'}}>
        <Settings size={20} color="#2563eb" />
        Configuration
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Number of Gates: <span style={{color: '#2563eb'}}>{params.numGates}</span></label>
        <input type="range" min="1" max="50" value={params.numGates} onChange={e => setParams({...params, numGates: Number(e.target.value)})} style={styles.slider} />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Number of FastLane Gates: <span style={{color: '#2563eb'}}>{params.numSeasonGates}</span></label>
        <input type="range" min="0" max="25" value={params.numSeasonGates} onChange={e => setParams({...params, numSeasonGates: Number(e.target.value)})} style={styles.slider} />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Expected Fans: <span style={{color: '#2563eb'}}>{params.totalFans}</span></label>
        <input type="range" min="1000" max="10000" step="100" value={params.totalFans} onChange={e => setParams({...params, totalFans: Number(e.target.value)})} style={styles.slider} />
      </div>

      <div style={styles.inputGroup}>
        <label style={styles.label}>Arrival Distribution</label>
        <select style={styles.select} value={params.distType} onChange={(e) => setParams({...params, distType: e.target.value})}>
          <option value="normal">Normal (Gaussian)</option>
          <option value="uniform">Uniform (Constant)</option>
          <option value="beta">Beta (Flexible Shape)</option>
        </select>
        <div style={styles.subPanel}>
          <DistributionControls distType={params.distType} distParams={params.distParams} onUpdate={updateDistParam} />
        </div>
      </div>

      <hr style={{margin: '20px 0', border: 'none', borderTop: '1px solid #e2e8f0'}} />

      <div>
        {[
          { id: 'task2', key: 'addUltras', label: 'Task 2: Ultras Arrival', sub: '500 away fans at T-60min' },
          { id: 'task3', key: 'overloadMode', label: 'Task 3: Overload Scenario', sub: 'Adds 2000 extra fans' },
          { id: 'task4', key: 'seasonTicketPriority', label: 'Task 4: Priority Lanes', sub: 'Season ticket holders (40%) fast lanes' },
          { id: 'task5', key: 'impatientFans', label: 'Task 5: Impatient Fans', sub: 'Switch queues if lines uneven' }
        ].map(task => (
          <div key={task.id} style={{...styles.checkboxRow, backgroundColor: params[task.key] ? '#eff6ff' : 'transparent'}}>
            <input type="checkbox" id={task.id} checked={params[task.key]} onChange={e => setParams({...params, [task.key]: e.target.checked})} style={styles.checkbox} />
            <div>
              <label htmlFor={task.id} style={{fontWeight: '500', fontSize: '0.9rem', cursor:'pointer'}}>{task.label}</label>
              <p style={{fontSize: '0.75rem', color: '#64748b', margin: '2px 0 0 0'}}>{task.sub}</p>
            </div>
          </div>
        ))}
      </div>

      <button 
        onClick={onRun}
        style={styles.primaryButton}
        onMouseOver={(e) => e.target.style.backgroundColor = '#1d4ed8'}
        onMouseOut={(e) => e.target.style.backgroundColor = '#2563eb'}
      >
        <Play size={20} />
        Run Simulation
      </button>
    </div>
  );
};

export default ControlPanel;