
// Global
let showUI = false
let parsedValues = {amount: 0, base: "NGN", target: "NGN"}
let uiWindow = buildUI()


function buildUI(){
    const uiWindow = document.createElement('div')
    uiWindow.setAttribute('class', 'uiWindow')
    uiWindow.setAttribute('style','display:none')
    uiWindow.innerHTML = buildUIContent()
    document.body.appendChild(uiWindow)

    let xButton = uiWindow.querySelector('button')
    xButton.addEventListener('click', toggleUI, false)

    let targetPicker = uiWindow.querySelector("#convert")
    targetPicker.addEventListener('click', fetchConversion)
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
    updateIFrame({...parsedValues, target: null})
    uiWindow.setAttribute('style', 'display:block')
    showUI = true
}

function handleTargetChange(e) {
    parsedValues = {...parsedValues, target: e.target.value}
}

function updateIFrame({base, amount, result, target, error}){
    let baseEl = uiWindow.querySelector('#base')
    let amountEl = uiWindow.querySelector('#amount')
    let resultEl = uiWindow.querySelector('#result')
    let errorEl = uiWindow.querySelector("#error")
    let targetEl = uiWindow.querySelector("#target")

    if(base) baseEl.value = base
    if(amount) amountEl.value = formatCurrency(amount)
    if(result) resultEl.value = formatCurrency(result) 
    if(target) targetEl.value = target
    if(error) errorEl.value = error
}

function fetchConversion() {
    let base = uiWindow.querySelector('#base').value
    let amount = parseAmount(uiWindow.querySelector('#amount').value)
    let target = uiWindow.querySelector("#target").value
    handleRequest({base, amount, target})
}

function handleRequest(body) {
    let reqUrl = reqUrlBuilder(body)
    fetch(reqUrl)
        .then(res =>  res.json())
        .then(handleSuccess)
        .catch(handleError)
    
}

function handleSuccess(res) {
    if(res.success){
        alert('done')
    }
}

function handleError(e) {
    let errorEl = uiWindow.querySelector("#error") 
    errorEl.textContent = e.message
    errorEl.classList.add('cashlook-alert-show')
    toggleError()
}

function toggleError() {
    let errorEl = uiWindow.querySelector("#error") 
    setTimeout(_ => {
        errorEl.classList.toggle('cashlook-alert-show')
    }, 2000)
    
}

function reqUrlBuilder({base, amount, target, ...props}) {
    let url = "https://api.exchangerate.host/latest?"
    url = `${url}base=${base}&amount=${amount}&symbols=${target}`
    return url
}

function formatCurrency(num = 0){
    let formatter = Intl.NumberFormat('en-US')
    return formatter.format(num)
}



function buildUIContent(){
 return `<div class='cashlook-card'>
 <div class="cashlook-title">
     <h3> cashlook </h3>
     <button role='button' class='cashlook-close'>  </button>
 </div>

 <section class="cashlook-content">
     <div class="cashlook-container">
         <label for="base"> 
             <select name="base" class="cashlook-selectbox" id="base">
                 <option value="USD"> USD </option>
                 <option value="NGN"> NGN </option>
                 <option value="CAD"> CAD </option>
             </select>
         </label>
         <input type="text" class="cashlook-inputbox" id="amount" data-role='amount' value="45,000">
         <button class="cashlook-btn convert" id="convert">
             <span class="mdi mdi-transfer"> convert </span>
         </button>
     </div>
 </section>

 <section class="cashlook-content">
     <div class="cashlook-container">
         <label for="base"> 
             <select name="base" class="cashlook-selectbox" id="target">
                 <option value="USD"> USD </option>
                 <option value="NGN"> NGN </option>
                 <option value="CAD"> CAD </option>
             </select>
         </label>
         <input type="text" class="cashlook-inputbox" id="result"  value="45,000">
         <button class="cashlook-btn" id="convert">
             <span class="mdi mdi-36px mdi-loading mdi-spin">  </span>
         </button>
     </div>
 </section>

 <div class="cashlook-alert" id="error">
     Error
 </div>
</div>
`   
}