function formatMoney(amount, decimalPlace) {

    const dollarAmountWithCents = amount.toFixed(decimalPlace).replace(/\d(?=(\d{3})+\.)/g, '$&,')

    return dollarAmountWithCents.substring(0, dollarAmountWithCents.length - 3)
};

export default formatMoney