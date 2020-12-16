
function parser(selectedString) {
    try {
    let selString = isNotEmpty(selectedString)
    let amount = parseAmount(selString)
    let base = parseCurrency(selectedString)
    return {amount, base}
    } catch(e) {
        return {error: e.message}
    }
}

function isNotEmpty(selectedString) {
    if(selectedString !== "") return selectedString
    throw new Error("Nothing was selected")
}

function parseAmount(strg) {
    let regx = new RegExp("[+-]?([0-9]+,?)+(\.[0-9]+)?", 'g')
    let match = regx.exec(strg)
    if(match) return Number(match[0].split(",").join(""))
    throw new Error("Unable to parse amount")
}


function parseCurrency(strg) {
    return "USD" //for now
    throw new Error("Unable to parse currency")
}

