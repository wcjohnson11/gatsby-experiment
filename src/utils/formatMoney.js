function formatMoney(amount, decimalPlace) {

    return amount.toFixed(decimalPlace).replace(/\d(?=(\d{3})+\.)/g, '$&,')
};

export default formatMoney