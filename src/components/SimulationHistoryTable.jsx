import React from 'react';
import { Download } from 'lucide-react';
import styles from '../styles';

export default function SimulationHistoryTable({ history }) {
  if (!history || history.length === 0) {
    return null;
  }

  const safeCell = (c) => {
    if (c === null || c === undefined) return '';
    if (typeof c === 'number') return String(c);
    const s = String(c).replace(/"/g, '""');
    return `"${s}"`;
  };

  const downloadCsv = (filename, headers, rows) => {
    const csvContent = [
      headers.join(','),
      ...rows.map(r => r.map(safeCell).join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // ---- Existing summary export (unchanged in spirit, but safer quoting) ----
  const handleExportCSV = () => {
    const headers = [
      "Run ID",
      "Timestamp",
      "Gates",
      "VIP Gates",
      "Expected Fans",
      "Spread",
      "Dist Type",
      "Activated Tasks",
      "Peak Arrival",
      "Peak VIP Arrival",
      "Inside by Kickoff (%)",
      "Avg Wait (s)",
      "Missed Kickoff",
      "Last Entry (min)",
      "Lane Changes",
      "Avg Wait (Switched)",
      "Avg Wait (Static)",
      "Avg Wait (VIP)",
      "Set Arrival Mean",
      "Set VIP Arrival Mean",
    ];

    const rows = history.map(run => [
      run.runId,
      run.timestamp,
      run.numGates,
      run.numSeasonGates,
      run.expectedFans,
      run.spread,
      run.distType,
      run.activatedTasks,
      run.peakArrival,
      run.peakSeasonalArrival,
      run.insideByKickoff,
      run.avgWaitTime,
      run.missedKickoff,
      run.lastEntry,
      run.laneChanges,
      run.avgSwitchedWait,
      run.avgNotSwitchedWait,
      run.avgSeasonalWait,
      run.setMean,
      run.setVIPMean,
    ]);

    const fname = `simulation_history_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    downloadCsv(fname, headers, rows);
  };

  // ---- NEW: export timeline for ONE run ----
  const exportTimelineCSV = (run) => {
    if (!run || !run.timelineData || run.timelineData.length === 0) {
      alert("No timelineData found for this run. Make sure you store timelineData in history.");
      return;
    }

    // These columns are exactly what you need for the report plots
    const headers = [
      "Run ID",
      "Minute from Kickoff",
      "Arrivals (fans/min)",
      "Total Queue Length (fans)",
      "Inside (cumulative)",
      "Lane Changes (cumulative)"
    ];

    const rows = run.timelineData.map(d => ([
      run.runId,
      d.time,                 // already minutes from kickoff in your code
      d.arrivals,
      d.queueLength,
      d.inside,
      d.insideStats?.laneChanges ?? 0
    ]));

    const fname = `${run.runId}_timeline_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`;
    downloadCsv(fname, headers, rows);
  };

  // Convenience button: export timeline of latest run
  const handleExportLatestTimeline = () => {
    const latest = history[history.length - 1];
    exportTimelineCSV(latest);
  };

  return (
    <div style={styles.chartCard}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
        <h3 style={styles.sectionTitle}>Simulation History</h3>

        <div style={{ display: 'flex', gap: '10px' }}>
          <button onClick={handleExportCSV} style={styles.buttonSecondary}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Export Summary CSV
          </button>

          <button onClick={handleExportLatestTimeline} style={styles.buttonSecondary}>
            <Download size={16} style={{ marginRight: '8px' }} />
            Export Timeline (latest)
          </button>
        </div>
      </div>

      <div style={{ overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #e2e8f0' }}>
              <th style={thStyle}>Run ID</th>
              <th style={thStyle}>Gates</th>
              <th style={thStyle}>Fans</th>
              <th style={thStyle}>Dist</th>
              <th style={thStyle}>Active Tasks</th>
              <th style={thStyle}>Inside %</th>
              <th style={thStyle}>Avg Wait</th>
              <th style={thStyle}>Missed</th>
              <th style={thStyle}>Changes</th>
              <th style={thStyle}>Wait(Switch)</th>
              <th style={thStyle}>Wait(Static)</th>
              <th style={thStyle}>Wait(VIP)</th>
              <th style={thStyle}>Timeline</th>
            </tr>
          </thead>

          <tbody>
            {[...history].map((run) => (
              <tr key={run.runId} style={{ borderBottom: '1px solid #f1f5f9' }}>
                <td style={tdStyle}>{run.runId}</td>
                <td style={tdStyle}>{run.numGates}</td>
                <td style={tdStyle}>{run.expectedFans}</td>
                <td style={tdStyle}>{run.distType}</td>
                <td style={tdStyle}>{run.activatedTasks}</td>

                <td style={tdStyle}>
                  <span style={{
                    color: run.insideByKickoff >= 99 ? '#16a34a' : '#dc2626',
                    fontWeight: 600
                  }}>
                    {run.insideByKickoff}%
                  </span>
                </td>

                <td style={tdStyle}>{run.avgWaitTime}s</td>
                <td style={tdStyle}>{run.missedKickoff}</td>
                <td style={tdStyle}>{run.laneChanges}</td>
                <td style={tdStyle}>{run.avgSwitchedWait}s</td>
                <td style={tdStyle}>{run.avgNotSwitchedWait}s</td>
                <td style={tdStyle}>{run.avgSeasonalWait}s</td>

                <td style={tdStyle}>
                  <button
                    onClick={() => exportTimelineCSV(run)}
                    style={{ ...styles.buttonSecondary, padding: '6px 10px' }}
                    title="Export queue length over time etc."
                  >
                    <Download size={14} style={{ marginRight: '6px' }} />
                    Timeline CSV
                  </button>
                </td>
              </tr>
            ))}
          </tbody>

        </table>
      </div>
    </div>
  );
}

const thStyle = {
  padding: '10px',
  color: '#64748b',
  fontWeight: 600
};

const tdStyle = {
  padding: '10px',
  color: '#334155'
};
