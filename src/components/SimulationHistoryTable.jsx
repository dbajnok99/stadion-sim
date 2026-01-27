import React from 'react';
import { Download } from 'lucide-react';
import styles from '../styles';

export default function SimulationHistoryTable({ history }) {
    if (!history || history.length === 0) {
        return null;
    }

    const handleExportCSV = () => {
        if (history.length === 0) return;

        // Define headers
        const headers = [
            "Run ID",
            "Timestamp",
            "Gates",
            "Expected Fans",
            "Spread",
            "Dist Type",
            "Activated Tasks",
            "Peak Arrival",
            "Inside by Kickoff (%)",
            "Avg Wait (s)",
            "Missed Kickoff",
            "Last Entry (min)",
            "Lane Changes",
            "Avg Wait (Switched)",
            "Avg Wait (Static)"
        ];

        // Map rows
        const rows = history.map(run => [
            run.runId,
            run.timestamp,
            run.numGates,
            run.expectedFans,
            run.spread,
            run.distType,
            run.activatedTasks,
            run.peakArrival,
            run.insideByKickoff,
            run.avgWaitTime,
            run.missedKickoff,
            run.lastEntry,
            run.laneChanges,
            run.avgSwitchedWait,
            run.avgNotSwitchedWait
        ]);

        // Construct CSV
        const csvContent = [
            headers.join(','),
            ...rows.map(r => r.map(c => typeof c === 'number' ? c : `"${c}"`).join(','))
        ].join('\n');

        // Download
        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', `simulation_history_${new Date().toISOString().slice(0, 19).replace(/:/g, "-")}.csv`);
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div style={styles.chartCard}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '15px' }}>
                <h3 style={styles.sectionTitle}>Simulation History</h3>
                <button onClick={handleExportCSV} style={styles.buttonSecondary}>
                    <Download size={16} style={{ marginRight: '8px' }} />
                    Export CSV
                </button>
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
