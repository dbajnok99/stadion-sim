import { useState, useEffect, useRef } from 'react';
import { Info, Play, Pause, RotateCcw, AlertTriangle, BarChart2, MapPin } from 'lucide-react';
import StadiumVisualizer from './StadiumVisualizer';
import StatsCard from './StatsCard';
import SimulationHistoryTable from './SimulationHistoryTable';
import formatWaitTime from '../functions/formatWaitTIme';
import styles from '../styles';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

const ResultsDashboard = ({ results, params, history }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const playbackRef = useRef(null);

  const timeline = results?.timelineData || [];

  useEffect(() => {
    setCurrentStep(0);
    setIsPlaying(false);
  }, [results]);

  useEffect(() => {
    if (isPlaying) {
      playbackRef.current = setInterval(() => {
        setCurrentStep(prev => {
          if (prev >= timeline.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 100);
    }
    return () => clearInterval(playbackRef.current);
  }, [isPlaying, timeline.length]);

  if (!results) {
    return (
      <div style={styles.emptyState}>
        <Info size={48} style={{ marginBottom: '10px' }} />
        <p>Adjust parameters and click Run to see results</p>
      </div>
    );
  }

  const currentData = timeline[currentStep] || timeline[0];
  const currentTime = currentData.time;

  const togglePlay = () => setIsPlaying(!isPlaying);
  const reset = () => { setIsPlaying(false); setCurrentStep(0); };

  return (
    <>
      <div style={styles.statsGrid}>
        <StatsCard
          label="Inside by Kickoff"
          value={`${results.stats.insideByKickoff}%`}
          subText={results.stats.insideByKickoff < 99 ? "Goal: 99%" : null}
          type={results.stats.insideByKickoff >= 99 ? 'success' : 'danger'}
        />
        <StatsCard
          label="Avg Wait Time"
          value={formatWaitTime(results.stats.avgWaitSec)}
          type="info"
        />
        <StatsCard 
          label="Avg Wait Time ST Holders" 
          value={formatWaitTime(results.stats.avgWaitSecSeason)} 
          type="info"
        />
        <StatsCard 
          label="Missed Kickoff" 
          value={`${results.stats.missedKickoffCount} fans`} 
          type="warning"
        />
        <StatsCard
          label="Last Entry"
          value={results.stats.lastFanMinutesLate > 0 ? `+${results.stats.lastFanMinutesLate} min` : "On Time"}
          type="purple"
        />
        <StatsCard
          label="Lane Changes"
          value={results.stats.totalLaneChanges || 0}
          type="danger"
        />
      </div>

      <div style={styles.chartCard}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
          <h3 style={styles.sectionTitle}><MapPin size={20} /> Stadium Simulation View</h3>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <div style={{ fontSize: '0.9rem', fontWeight: 'bold', minWidth: '80px', textAlign: 'right' }}>
              T = {currentTime} min
            </div>
            <button onClick={togglePlay} style={styles.iconButton}>
              {isPlaying ? <Pause size={16} /> : <Play size={16} />}
            </button>
            <button onClick={reset} style={styles.iconButton}>
              <RotateCcw size={16} />
            </button>
          </div>
        </div>

        <input
          type="range"
          min="0"
          max={timeline.length - 1}
          value={currentStep}
          onChange={(e) => { setIsPlaying(false); setCurrentStep(Number(e.target.value)); }}
          style={{ ...styles.slider, marginBottom: '20px' }}
        />

        <StadiumVisualizer data={timeline} params={params} currentStep={currentStep} />

        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '15px', justifyContent: 'center', marginTop: '10px', fontSize: '0.75rem', color: '#64748b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#0f172a' }}></div> Ultras</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#ca8a04' }}></div> Season</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#2563eb' }}></div> Normal</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '8px', height: '8px', borderRadius: '50%', background: '#f5170bff' }}></div> Impatient</div>

          {/* Divider */}
          <div style={{ width: '1px', height: '12px', background: '#cbd5e1', margin: '0 5px' }}></div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#a5b4fc' }}></div> Priority Gate</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}><div style={{ width: '12px', height: '12px', borderRadius: '2px', background: '#cbd5e1' }}></div> Standard Gate</div>
        </div>
      </div>

      <div style={styles.chartCard}>
        <h3 style={{ ...styles.sectionTitle, marginBottom: '20px' }}>
          <BarChart2 size={20} />
          Timeline Analysis
        </h3>
        <div style={{ height: '350px' }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={results.timelineData} margin={{ top: 5, right: 30, left: 20, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis dataKey="time" label={{ value: 'Minutes from Kickoff', position: 'insideBottom', offset: -20 }} />
              <YAxis yAxisId="left" label={{ value: 'Arrival Rate (Fans/min)', angle: -90, position: 'insideLeft' }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: 'Total Queue Length', angle: 90, position: 'insideRight' }} />
              <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', border: '1px solid #eee' }} />
              <Legend verticalAlign="top" height={36} />

              <ReferenceLine x={0} stroke="red" strokeDasharray="3 3" label="Kickoff" />
              <ReferenceLine x={currentTime} stroke="#22c55e" strokeWidth={2} label="Current" />

              <Line yAxisId="left" type="monotone" dataKey="arrivals" stroke="#3b82f6" name="Arrival Rate" dot={false} strokeWidth={2} />
              <Line yAxisId="right" type="monotone" dataKey="queueLength" stroke="#ea580c" name="Queue Size" dot={false} strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>

      {params.addUltras && (
        <div style={{ ...styles.insightBox, backgroundColor: '#fefce8', borderColor: '#facc15', color: '#854d0e' }}>
          <AlertTriangle size={20} style={{ flexShrink: 0 }} />
          <div><strong>Task 2 Insight:</strong> Check if the Orange queue line recovers after the spike at -60 min.</div>
        </div>
      )}

      <SimulationHistoryTable history={history} />
    </>
  );
};
export default ResultsDashboard;