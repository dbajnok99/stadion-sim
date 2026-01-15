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
  const [history, setHistory] = useState([]);

  const handleSimulate = () => {
    const data = runSimulation(params);
    setResults(data);

    // Calculate metrics for history
    const peakArrival = Math.max(...data.timelineData.map(d => d.arrivals));

    const activatedTasks = [
      params.addUltras && "Ultras",
      params.seasonTicketPriority && "Priority",
      params.impatientFans && "Impatient"
    ].filter(Boolean).join(', ') || "None";

    const newRun = {
      runId: `run_${String(history.length).padStart(3, '0')}`,
      timestamp: new Date().toLocaleString(),
      numGates: params.numGates,
      expectedFans: params.totalFans,
      spread: params.distParams.stdDev,
      distType: params.distType,
      activatedTasks,
      peakArrival,
      insideByKickoff: data.stats.insideByKickoff,
      avgWaitTime: data.stats.avgWaitSec,
      missedKickoff: data.stats.missedKickoffCount,
      missedKickoff: data.stats.missedKickoffCount,
      lastEntry: data.stats.lastFanMinutesLate,
      laneChanges: data.stats.totalLaneChanges || 0,
      avgSwitchedWait: data.stats.avgSwitchedWaitSec,
      avgNotSwitchedWait: data.stats.avgNotSwitchedWaitSec
    };

    setHistory(prev => [...prev, newRun]);
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        <Header />
        <div style={styles.layout}>
          <ControlPanel params={params} setParams={setParams} onRun={handleSimulate} />
          <div style={styles.resultsPanel}>
            <ResultsDashboard results={results} params={params} history={history} />
          </div>
        </div>
      </div>
    </div>
  );
}
