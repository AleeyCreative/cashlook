const currencies = {
    USD: new RegExp("USD|\$|(US\s+)?dollars?", "ig"),
    NGN: new RegExp("NGN?|Naira|NGR|", "ig")
}

module,exports = currencies // future: es6 exports