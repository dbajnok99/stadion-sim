import { useState } from 'react';
import styles from './styles';
import Header from './components/Header';
import ControlPanel from './components/ControlPanel';
import ResultsDashboard from './components/ResultsDashboard';
import runSimulation from './functions/runSimulation';

export default function App() {
  const [params, setParams] = useState({
    numGates: 6,
    totalFans: 6000,
    addUltras: false,
    overloadMode: false,
    seasonTicketPercent: 40,
    seasonTicketPriority: false,
    impatientFans: false,
    distType: 'normal',
    distParams: { mean: -45, stdDev: 10, start: -120, end: 0, alpha: 5.0, beta: 2.0 }
  });

  const [results, setResults] = useState(null);

  const handleSimulate = () => {
    const data = runSimulation(params);
    setResults(data);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <Header />
        <div style={styles.layout}>
          <ControlPanel params={params} setParams={setParams} onRun={handleSimulate} />
          <div style={styles.resultsPanel}>
            <ResultsDashboard results={results} params={params} />
          </div>
        </div>
      </div>
    </div>
  );
}
