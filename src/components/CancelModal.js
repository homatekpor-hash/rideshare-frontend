import React, { useState } from 'react';
import axios from 'axios';

const API = 'https://api.rydeghanas.com';

const RIDER_REASONS = [
  'Driver is taking too long',
  'Found another ride',
  'Change of plans',
  'Driver asked me to cancel',
  'Wrong pickup location',
  'Price is too high',
  'Other',
];

const DRIVER_REASONS = [
  'Passenger not at pickup',
  'Passenger unreachable',
  'Vehicle breakdown',
  'Emergency situation',
  'Passenger was rude',
  'Wrong drop-off location',
  'Other',
];

function CancelModal({ bookingId, role, onClose, onSuccess }) {
  const [selectedReason, setSelectedReason] = useState('');
  const [otherReason, setOtherReason] = useState('');
  const [loading, setLoading] = useState(false);

  const reasons = role === 'driver' ? DRIVER_REASONS : RIDER_REASONS;

  const handleCancel = async () => {
    const reason = selectedReason === 'Other' ? otherReason : selectedReason;
    if (!reason) { alert('Please select a reason'); return; }
    setLoading(true);
    try {
      await axios.put(`${API}/bookings/${bookingId}/cancel-with-reason`, { reason });
      onSuccess('Booking cancelled: ' + reason);
      onClose();
    } catch (e) {
      alert('Failed to cancel booking');
    }
    setLoading(false);
  };

  return (
    <div style={styles.overlay}>
      <div style={styles.modal}>
        <div style={styles.header}>
          <p style={styles.title}>Cancel Booking</p>
          <button style={styles.closeBtn} onClick={onClose}>✕</button>
        </div>
        <p style={styles.subtitle}>Please tell us why you're cancelling:</p>
        <div style={styles.reasons}>
          {reasons.map((reason, i) => (
            <button key={i} style={{...styles.reasonBtn, backgroundColor: selectedReason === reason ? '#fce8e6' : '#f8f9fa', borderColor: selectedReason === reason ? '#ea4335' : '#eee', color: selectedReason === reason ? '#ea4335' : '#333'}} onClick={() => setSelectedReason(reason)}>
              <span style={styles.reasonRadio}>{selectedReason === reason ? '🔴' : '⚪'}</span>
              {reason}
            </button>
          ))}
        </div>
        {selectedReason === 'Other' && (
          <textarea style={styles.otherInput} placeholder="Please describe your reason..." value={otherReason} onChange={(e) => setOtherReason(e.target.value)} rows={3} />
        )}
        <div style={styles.btnRow}>
          <button style={styles.keepBtn} onClick={onClose}>Keep Booking</button>
          <button style={{...styles.cancelBtn, opacity: loading ? 0.7 : 1}} onClick={handleCancel} disabled={loading || !selectedReason}>
            {loading ? 'Cancelling...' : 'Cancel Booking'}
          </button>
        </div>
      </div>
    </div>
  );
}

const styles = {
  overlay: { position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'flex-end', zIndex: 9000 },
  modal: { backgroundColor: 'white', borderRadius: '24px 24px 0 0', padding: '24px', width: '100%', maxWidth: '480px', margin: '0 auto', maxHeight: '80vh', overflowY: 'auto' },
  header: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' },
  title: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  closeBtn: { background: 'none', border: 'none', fontSize: '20px', cursor: 'pointer', color: '#888' },
  subtitle: { fontSize: '14px', color: '#666', margin: '0 0 16px 0' },
  reasons: { display: 'flex', flexDirection: 'column', gap: '8px', marginBottom: '16px' },
  reasonBtn: { display: 'flex', alignItems: 'center', gap: '10px', padding: '12px 14px', borderRadius: '12px', border: '1px solid', cursor: 'pointer', fontSize: '14px', textAlign: 'left', fontWeight: '500' },
  reasonRadio: { fontSize: '16px', flexShrink: 0 },
  otherInput: { width: '100%', padding: '12px', borderRadius: '10px', border: '1px solid #ddd', fontSize: '14px', outline: 'none', marginBottom: '16px', boxSizing: 'border-box', resize: 'vertical' },
  btnRow: { display: 'flex', gap: '10px' },
  keepBtn: { flex: 1, padding: '14px', backgroundColor: '#f5f5f5', color: '#333', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
  cancelBtn: { flex: 1, padding: '14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '12px', fontSize: '15px', fontWeight: 'bold', cursor: 'pointer' },
};

export default CancelModal;