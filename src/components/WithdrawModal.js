import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

function WithdrawModal({ userId, balance, onClose, onSuccess }) {
  const [amount, setAmount] = useState('');
  const [phone, setPhone] = useState('');
  const [network, setNetwork] = useState('MTN');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleWithdraw = async () => {
    setError('');
    if (!amount || parseFloat(amount) < 5) { setError('Minimum withdrawal is GH₵ 5'); return; }
    if (parseFloat(amount) > balance) { setError('Insufficient wallet balance'); return; }
    if (!phone || phone.length < 10) { setError('Please enter a valid phone number'); return; }
    setLoading(true);
    try {
      const res = await axios.post(`${API}/withdraw`, {
        userId, amount: parseFloat(amount), phone, network,
      });
      onSuccess(res.data.message);
      onClose();
    } catch (e) {
      setError(e.response?.data?.error || 'Withdrawal failed. Try again.');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <p style={styles.title}>💰 Withdraw Earnings</p>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <div style={styles.balanceBox}>
          <p style={styles.balanceLabel}>Available Balance</p>
          <p style={styles.balanceNum}>GH₵ {balance?.toFixed(2)}</p>
        </div>
        <div style={styles.networkRow}>
          {['MTN', 'Vodafone', 'AirtelTigo'].map(n => (
            <button key={n} style={{...styles.networkBtn, backgroundColor: network === n ? '#1a73e8' : '#f0f0f0', color: network === n ? 'white' : '#333'}} onClick={() => setNetwork(n)}>{n}</button>
          ))}
        </div>
        <input style={styles.input} type="tel" placeholder="Mobile Money Number (e.g. 0241234567)" value={phone} onChange={(e) => setPhone(e.target.value)} />
        <input style={styles.input} type="number" placeholder="Amount (min GH₵ 5)" value={amount} onChange={(e) => setAmount(e.target.value)} />
        {error && <p style={styles.error}>⚠️ {error}</p>}
        <button style={{...styles.withdrawBtn, opacity: loading ? 0.7 : 1}} onClick={handleWithdraw} disabled={loading}>
          {loading ? 'Processing...' : `Withdraw GH₵ ${amount || '0'} via ${network}`}
        </button>
        <p style={styles.note}>💡 Withdrawals are processed within 24 hours</p>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 9000 },
  modal: { backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '24px', width: '100%', maxWidth: '480px', margin: '0 auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' },
  title: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
  balanceBox: { backgroundColor: '#1a1a2e', borderRadius: '14px', padding: '16px', textAlign: 'center', marginBottom: '16px' },
  balanceLabel: { color: 'rgba(255,255,255,0.7)', fontSize: '12px', margin: '0 0 4px 0' },
  balanceNum: { color: 'white', fontSize: '28px', fontWeight: 'bold', margin: 0 },
  networkRow: { display: 'flex', gap: '8px', marginBottom: '16px' },
  networkBtn: { flex: 1, padding: '10px', borderRadius: '10px', border: 'none', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold' },
  input: { width: '100%', padding: '14px 16px', borderRadius: '12px', border: '1px solid #eee', fontSize: '15px', outline: 'none', marginBottom: '12px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  error: { color: '#ea4335', fontSize: '13px', backgroundColor: '#fce8e6', padding: '10px', borderRadius: '8px', margin: '0 0 12px 0' },
  withdrawBtn: { width: '100%', padding: '16px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer', marginBottom: '12px' },
  note: { fontSize: '12px', color: '#888', textAlign: 'center', margin: 0 },
};

export default WithdrawModal;