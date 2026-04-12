export const initializePaystackPayment = ({ email, amount, onSuccess, onCancel }) => {
  if (!email || !amount) {
    alert('Missing payment details. Please try again.');
    return;
  }

  const loadPaystack = () => {
    return new Promise((resolve, reject) => {
      if (window.PaystackPop) { resolve(); return; }
      const script = document.createElement('script');
      script.src = 'https://js.paystack.co/v1/inline.js';
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
  };

  loadPaystack().then(() => {
    const handler = window.PaystackPop.setup({
      key: 'pk_test_e78b5b847921b259094d75e74ebe85a246ac0315',
      email: email,
      amount: Math.round(amount * 100),
      currency: 'GHS',
      channels: ['mobile_money', 'card'],
      label: 'Ryde Ghana',
      callback: function(response) {
        onSuccess(response.reference);
      },
      onClose: function() {
        onCancel();
      },
    });
    handler.openIframe();
  }).catch(() => {
    alert('Payment system failed to load. Please check your internet connection.');
  });
};