export const initializePaystackPayment = ({ email, amount, onSuccess, onCancel }) => {
  const handler = window.PaystackPop.setup({
    key: 'pk_test_e78b5b847921b259094d75e74ebe85a246ac0315',
    email: email,
    amount: amount * 100, // Paystack uses pesewas (kobo)
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
};