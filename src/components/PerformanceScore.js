import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function PerformanceScore({ userId }) {
  const [perf, setPerf] = useState(null);

  useEffect(() => {
    axios.get(`${API}/driver/performance/${userId}`)
      .then(res => setPerf(res.data))
      .catch(e => console.error(e));
  }, [userId]);

  if (!perf) return null;

  const getScoreColor = (score) => score >= 80 ? '#34a853' : score >= 60 ? '#f9a825' : '#ea4335';
  const getScoreLabel = (score) => score >= 80 ? 'Excellent' : score >= 60 ? 'Good' : 'Needs Improvement';

  return (
    <div style={styles.container}>
      <p style={styles.title}>📊 Performance Score</p>
      <div style={styles.scoreCircle}>
        <div style={{...styles.circle, borderColor: getScoreColor(perf.score)}}>
          <p style={{...styles.scoreNum, color: getScoreColor(perf.score)}}>{perf.score}</p>
          <p style={styles.scoreLabel}>{getScoreLabel(perf.score)}</p>
        </div>
      </div>
      <div style={styles.statsGrid}>
        <div style={styles.statBox}>
          <p style={{...styles.statNum, color: '#34a853'}}>{perf.acceptanceRate}%</p>
          <p style={styles.statLabel}>Acceptance Rate</p>
          <div style={styles.barTrack}>
            <div style={{...styles.barFill, width: `${perf.acceptanceRate}%`, backgroundColor: '#34a853'}} />
          </div>
        </div>
        <div style={styles.statBox}>
          <p style={{...styles.statNum, color: '#1a73e8'}}>{perf.completionRate}%</p>
          <p style={styles.statLabel}>Completion Rate</p>
          <div style={styles.barTrack}>
            <div style={{...styles.barFill, width: `${perf.completionRate}%`, backgroundColor: '#1a73e8'}} />
          </div>
        </div>
      </div>
      <div style={styles.tripStats}>
        {[
          { label: 'Total Requests', value: perf.stats.total, color: '#333' },
          { label: 'Accepted', value: perf.stats.accepted, color: '#34a853' },
          { label: 'Completed', value: perf.stats.completed, color: '#1a73e8' },
          { label: 'Declined', value: perf.stats.declined, color: '#ea4335' },
        ].map((s, i) => (
          <div key={i} style={styles.tripStat}>
            <p style={{...styles.tripStatNum, color: s.color}}>{s.value}</p>
            <p style={styles.tripStatLabel}>{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
}

const styles = {
  container: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  title: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  scoreCircle: { display: 'flex', justifyContent: 'center', marginBottom: '20px' },
  circle: { width: '100px', height: '100px', borderRadius: '50%', border: '6px solid', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' },
  scoreNum: { fontSize: '28px', fontWeight: 'bold', margin: 0 },
  scoreLabel: { fontSize: '11px', color: '#888', margin: 0 },
  statsGrid: { display: 'flex', gap: '12px', marginBottom: '16px' },
  statBox: { flex: 1, backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px' },
  statNum: { fontSize: '22px', fontWeight: 'bold', margin: '0 0 4px 0' },
  statLabel: { fontSize: '11px', color: '#888', margin: '0 0 8px 0' },
  barTrack: { height: '6px', backgroundColor: '#eee', borderRadius: '3px', overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: '3px', transition: 'width 0.5s ease' },
  tripStats: { display: 'flex', justifyContent: 'space-around', backgroundColor: '#f8f9fa', borderRadius: '12px', padding: '12px' },
  tripStat: { textAlign: 'center' },
  tripStatNum: { fontSize: '20px', fontWeight: 'bold', margin: '0 0 4px 0' },
  tripStatLabel: { fontSize: '11px', color: '#888', margin: 0 },
};

export default PerformanceScore;