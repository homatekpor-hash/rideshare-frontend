import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = 'https://rideshare-backend-production-32f5.up.railway.app';

function CorporatePanel() {
  const [accounts, setAccounts] = useState([]);
  const [showForm, setShowForm] = useState(false);
  const [showTopup, setShowTopup] = useState(null);
  const [showBooking, setShowBooking] = useState(null);
  const [message, setMessage] = useState('');
  const [form, setForm] = useState({ company_name: '', email: '', phone: '', address: '', contact_person: '' });
  const [topupAmount, setTopupAmount] = useState('');
  const [booking, setBooking] = useState({ employeeName: '', employeePhone: '', from_location: '', to_location: '', amount: '' });

  useEffect(() => { fetchAccounts(); }, []);

  const fetchAccounts = async () => {
    try {
      const res = await axios.get(`${API}/corporate/accounts`);
      setAccounts(res.data.accounts);
    } catch (e) { console.error(e); }
  };

  const handleCreate = async () => {
    if (!form.company_name || !form.email) { setMessage('Please fill company name and email.'); return; }
    try {
      await axios.post(`${API}/corporate/register`, form);
      setMessage('Corporate account created!');
      setShowForm(false);
      setForm({ company_name: '', email: '', phone: '', address: '', contact_person: '' });
      fetchAccounts();
    } catch (e) { setMessage('Failed to create account.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleTopup = async (id) => {
    if (!topupAmount || parseFloat(topupAmount) < 1) { setMessage('Enter valid amount.'); return; }
    try {
      await axios.post(`${API}/corporate/topup`, { corporateId: id, amount: parseFloat(topupAmount) });
      setMessage(`GH₵ ${topupAmount} added!`);
      setShowTopup(null); setTopupAmount('');
      fetchAccounts();
    } catch (e) { setMessage('Failed to topup.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleBook = async (id) => {
    if (!booking.employeeName || !booking.from_location || !booking.to_location || !booking.amount) { setMessage('Fill all fields.'); return; }
    try {
      await axios.post(`${API}/corporate/book`, { corporateId: id, ...booking, amount: parseFloat(booking.amount) });
      setMessage('Booking created!');
      setShowBooking(null);
      setBooking({ employeeName: '', employeePhone: '', from_location: '', to_location: '', amount: '' });
      fetchAccounts();
    } catch (e) { setMessage(e.response?.data?.error || 'Failed to book.'); }
    setTimeout(() => setMessage(''), 3000);
  };

  const handleDeactivate = async (id) => {
    if (window.confirm('Deactivate this account?')) {
      await axios.delete(`${API}/corporate/${id}`);
      fetchAccounts();
    }
  };

  return (
    <div>
      {message && <div style={styles.toast}>{message}</div>}
      <div style={styles.headerRow}>
        <p style={styles.title}>Corporate Accounts ({accounts.filter(a => a.is_active).length} active)</p>
        <button style={styles.addBtn} onClick={() => setShowForm(!showForm)}>+ New Account</button>
      </div>

      {showForm && (
        <div style={styles.card}>
          <p style={styles.cardTitle}>New Corporate Account</p>
          <input style={styles.input} placeholder="Company Name *" value={form.company_name} onChange={e => setForm({...form, company_name: e.target.value})} />
          <input style={styles.input} placeholder="Company Email *" value={form.email} onChange={e => setForm({...form, email: e.target.value})} />
          <input style={styles.input} placeholder="Phone" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} />
          <input style={styles.input} placeholder="Address" value={form.address} onChange={e => setForm({...form, address: e.target.value})} />
          <input style={styles.input} placeholder="Contact Person" value={form.contact_person} onChange={e => setForm({...form, contact_person: e.target.value})} />
          <div style={styles.btnRow}>
            <button style={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
            <button style={styles.saveBtn} onClick={handleCreate}>Create Account</button>
          </div>
        </div>
      )}

      {accounts.length === 0 ? (
        <div style={styles.empty}>
          <p style={styles.emptyIcon}>🏢</p>
          <p style={styles.emptyText}>No corporate accounts yet</p>
          <p style={styles.emptyHint}>Create accounts for companies to book rides for their employees</p>
        </div>
      ) : accounts.map(account => (
        <div key={account.id} style={{...styles.card, opacity: account.is_active ? 1 : 0.5}}>
          <div style={styles.accountHeader}>
            <div>
              <p style={styles.companyName}>{account.company_name}</p>
              <p style={styles.companyEmail}>{account.email}</p>
              {account.contact_person && <p style={styles.companyDetail}>Contact: {account.contact_person}</p>}
              {account.phone && <p style={styles.companyDetail}>Tel: {account.phone}</p>}
            </div>
            <div style={styles.balanceBox}>
              <p style={styles.balanceLabel}>Credit</p>
              <p style={styles.balanceNum}>GH₵ {account.credit_balance?.toFixed(2)}</p>
            </div>
          </div>
          {account.is_active === 1 && (
            <div style={styles.actionRow}>
              <button style={styles.topupBtn} onClick={() => setShowTopup(account.id)}>+ Add Credit</button>
              <button style={styles.bookBtn} onClick={() => setShowBooking(account.id)}>Book Ride</button>
              <button style={styles.deactivateBtn} onClick={() => handleDeactivate(account.id)}>Deactivate</button>
            </div>
          )}
          {showTopup === account.id && (
            <div style={styles.subForm}>
              <p style={styles.subTitle}>Add Credit to {account.company_name}</p>
              <input style={styles.input} type="number" placeholder="Amount (GH₵)" value={topupAmount} onChange={e => setTopupAmount(e.target.value)} />
              <div style={styles.btnRow}>
                <button style={styles.cancelBtn} onClick={() => setShowTopup(null)}>Cancel</button>
                <button style={styles.saveBtn} onClick={() => handleTopup(account.id)}>Add Credit</button>
              </div>
            </div>
          )}
          {showBooking === account.id && (
            <div style={styles.subForm}>
              <p style={styles.subTitle}>Book Ride for Employee</p>
              <input style={styles.input} placeholder="Employee Name" value={booking.employeeName} onChange={e => setBooking({...booking, employeeName: e.target.value})} />
              <input style={styles.input} placeholder="Employee Phone" value={booking.employeePhone} onChange={e => setBooking({...booking, employeePhone: e.target.value})} />
              <input style={styles.input} placeholder="From Location" value={booking.from_location} onChange={e => setBooking({...booking, from_location: e.target.value})} />
              <input style={styles.input} placeholder="To Location" value={booking.to_location} onChange={e => setBooking({...booking, to_location: e.target.value})} />
              <input style={styles.input} type="number" placeholder="Amount (GH₵)" value={booking.amount} onChange={e => setBooking({...booking, amount: e.target.value})} />
              <div style={styles.btnRow}>
                <button style={styles.cancelBtn} onClick={() => setShowBooking(null)}>Cancel</button>
                <button style={styles.saveBtn} onClick={() => handleBook(account.id)}>Book Ride</button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

const styles = {
  toast: { backgroundColor: '#333', color: 'white', padding: '10px 16px', borderRadius: '10px', marginBottom: '16px', fontSize: '13px' },
  headerRow: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' },
  title: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: 0 },
  addBtn: { padding: '10px 20px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', fontSize: '14px', fontWeight: 'bold', cursor: 'pointer' },
  card: { backgroundColor: 'white', borderRadius: '16px', padding: '20px', marginBottom: '16px', boxShadow: '0 2px 8px rgba(0,0,0,0.06)' },
  cardTitle: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 16px 0' },
  input: { width: '100%', padding: '10px 14px', borderRadius: '10px', border: '1px solid #eee', fontSize: '14px', outline: 'none', marginBottom: '10px', boxSizing: 'border-box', backgroundColor: '#f8f9fa' },
  btnRow: { display: 'flex', gap: '10px', marginTop: '8px' },
  cancelBtn: { flex: 1, padding: '10px', backgroundColor: '#f5f5f5', color: '#333', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px' },
  saveBtn: { flex: 2, padding: '10px', backgroundColor: '#1a1a2e', color: 'white', border: 'none', borderRadius: '10px', cursor: 'pointer', fontSize: '14px', fontWeight: 'bold' },
  accountHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' },
  companyName: { fontSize: '16px', fontWeight: 'bold', color: '#333', margin: '0 0 4px 0' },
  companyEmail: { fontSize: '13px', color: '#888', margin: '0 0 2px 0' },
  companyDetail: { fontSize: '12px', color: '#aaa', margin: 0 },
  balanceBox: { textAlign: 'right', backgroundColor: '#e6f4ea', borderRadius: '10px', padding: '8px 14px' },
  balanceLabel: { fontSize: '11px', color: '#888', margin: '0 0 2px 0' },
  balanceNum: { fontSize: '18px', fontWeight: 'bold', color: '#34a853', margin: 0 },
  actionRow: { display: 'flex', gap: '8px', flexWrap: 'wrap' },
  topupBtn: { padding: '8px 14px', backgroundColor: '#34a853', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  bookBtn: { padding: '8px 14px', backgroundColor: '#1a73e8', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', fontWeight: 'bold', cursor: 'pointer' },
  deactivateBtn: { padding: '8px 14px', backgroundColor: '#ea4335', color: 'white', border: 'none', borderRadius: '8px', fontSize: '13px', cursor: 'pointer' },
  subForm: { marginTop: '16px', paddingTop: '16px', borderTop: '1px solid #f0f0f0' },
  subTitle: { fontSize: '14px', fontWeight: 'bold', color: '#333', margin: '0 0 12px 0' },
  empty: { textAlign: 'center', padding: '48px 24px' },
  emptyIcon: { fontSize: '48px', margin: '0 0 12px 0' },
  emptyText: { fontSize: '18px', fontWeight: 'bold', color: '#333', margin: '0 0 8px 0' },
  emptyHint: { fontSize: '13px', color: '#888', margin: 0 },
};

export default CorporatePanel;