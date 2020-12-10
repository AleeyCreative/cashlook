
// Global
let showUI = false
let parsedValues = {amount: 0, base: "NGN"}
let uiWindow = buildUI()


function buildUI(){
    const uiWindow = document.createElement('div')
    uiWindow.setAttribute('class', 'uiWindow')
    uiWindow.setAttribute('style','display:none')
    uiWindow.innerHTML = buildUIContent()
    document.body.appendChild(uiWindow)

    let xButton = uiWindow.querySelector('button')
    xButton.addEventListener('click', toggleUI, false)
    return uiWindow

}


chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    switch(req.type){
        case "SELECTION":
            handleSelection()
            break
        default:
            console.log(`An event "${req.type}" was emitted`)
    }
})



function handleSelection(){
    let selectedText = document.getSelection().toString()
    parsedValues =  parser(selectedText)
    if(showUI === false) toggleUI()
    else updateIFrame(parsedValues)
}

function toggleUI(){
    if(showUI){
        uiWindow.setAttribute('style','display:none')
        showUI = false
        return
    }
    updateIFrame(parsedValues)
    uiWindow.setAttribute('style', 'display:block')
    showUI = true
}



function updateIFrame({base, amount, result, target, error}){
    let baseEl = uiWindow.querySelector('#base')
    let amountEl = uiWindow.querySelector('#amount')
    let resultEl = uiWindow.querySelector('#result')
    let errorEl = uiWindow.querySelector("#error")
    let targetEl = uiWindow.querySelector("#target")

    if(base) baseEl.value = base
    if(amount) amountEl.value = amount
    if(result) resultEl.value = result 
    if(target) targetEl.value = target
    if(error) errorEl.value = error
}

function fetchConversion(url, body) {
    return 
}

function handleRequest() {
    let reqUrl = reqUrlBuilder()
    fetch(url, body)
        .then(res =>  res.json())
        .then(res => handleSuccess)
        .catch(err => handleError)
    
}

function handleSuccess(res) {
    if(res.success){

    }
}


function reqUrlBuilder() {
    let url = "https://api.exchangerate.host/latest?"
    url = `${url}base=${parsedValues.base}&amount=${parsedValues.amount}`
}


function buildUIContent(){
 return `<div class="uiWindow">
 <button> X </button>
 <div>
     <label for="base"> 
         <select name="base" id="base">
             <option value="NGN"> Naira </option>
             <option value="USD"> Dollars </option>
         </select>
     </label>

     <label for="amount">
         <input type="number" id="amount" value="0.00">
     </label>
 </div>

 <div>
     <div class="result" id="result">
             N45.00
     </div>
     <div class="target" id="target"> </div>
 </div>
    <div class="error" id="error"> </div>
</div>
`   
}