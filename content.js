// Global
let showUI = false;
let parsedValues = { inputAmount: 0, inputCurrency: "USD", outputCurrency: "NGN", outputAmount: 0 };
let uiWindow = buildUI();

chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
  switch (req.type) {
    case "SELECTION":
      handleSelection();
      break;
    default:
      console.log(`An event "${req.type}" was emitted`);
  }
});

function handleSelection() {
  let selectedText = document.getSelection().toString();
  try {
    parsedValues = parser(selectedText);
  } catch (e) {
    parsedValues = { ...parsedValues, error: e.message };
  }
  if (showUI === false) toggleUI();
  else updateIFrame(parsedValues);
}

function buildUI() {
  loadIcons();
  const uiWindow = document.createElement("div");
  uiWindow.setAttribute("class", "uiWindow");
  uiWindow.setAttribute("style", "display:none");
  uiWindow.innerHTML = buildUIContent();
  document.body.appendChild(uiWindow);
  // populateCurrencies(uiWindow);
  let xButton = uiWindow.querySelector("button");
  xButton.addEventListener("click", handleCloseButton, false);

  let convertButton = uiWindow.querySelector("#convert");
  convertButton.addEventListener("click", fetchConversion);
  return uiWindow;
}

function toggleUI() {
  if (showUI) {
    uiWindow.setAttribute("style", "display:none");
    showUI = false;
    return;
  }
  updateIFrame({ ...parsedValues, outputCurrency: null });
  uiWindow.setAttribute("style", "display:block");
  showUI = true;
}

function handleCloseButton(e) {
  console.log("Close button clicked !");
  uiWindow.querySelector("#inputAmount").value = 0;
  uiWindow.querySelector("#outputAmount").value = 0;
  toggleUI();
}

function handleOutputCurrencyChange(e) {
  parsedValues = { ...parsedValues, outputCurrency: e.target.value };
}

function updateIFrame({ inputCurrency, inputAmount, outputAmount, outputCurrency, error }) {
  let inputCurrencyEl = uiWindow.querySelector("#inputCurrency");
  let inputAmountEl = uiWindow.querySelector("#inputAmount");
  let outputAmountEl = uiWindow.querySelector("#outputAmount");
  let errorEl = uiWindow.querySelector("#error");
  let outputCurrencyEl = uiWindow.querySelector("#outputCurrency");

  if (inputCurrency) inputCurrencyEl.value = inputCurrency;
  if (inputAmount) inputAmountEl.value = formatCurrency(inputAmount);
  if (outputAmount) outputAmountEl.value = formatCurrency(parseInt(outputAmount));
  if (outputCurrency) outputCurrencyEl.value = outputCurrency;
  if (error) handleError(error);
}

function fetchConversion() {
  parsedValues.inputCurrency = uiWindow.querySelector("#inputCurrency").value;
  parsedValues.inputAmount = parseAmount(uiWindow.querySelector("#inputAmount").value);
  parsedValues.outputCurrency = uiWindow.querySelector("#outputCurrency").value;
  uiWindow.querySelector(".cashlook-loading").classList.add("visible");
  handleRequest(parsedValues);
}

function populateCurrencies(el) {
  let inputCurrencyEl = el.querySelector("#inputCurrency");
  let outputCurrencyEl = el.querySelector("#outputCurrency");

  //FIXING: window.currency is not ideal. Problem still exsts.
  for (let key in window.currencies) {
    let opt = document.createElement("option");
    opt.value = window.currencies[key];
    console.log("running");
    opt.textContent = window.currencies[key]["name"];
    inputCurrencyEl.appendChild(opt);
    outputCurrencyEl.appendChild(opt);
  }
}

function handleRequest(body) {
  let reqUrl = reqUrlBuilder(body);
  fetch(reqUrl)
    .then((res) => res.json())
    .then(handleSuccess)
    .catch((e) => handleError(e.message));
}

function handleSuccess(res) {
  if (res.success) {
    console.log(res);
    parsedValues.outputAmount = res.rates[parsedValues.outputCurrency];
    uiWindow.querySelector(".cashlook-loading").classList.toggle("visible");
    updateIFrame({ outputAmount: parsedValues.outputAmount });
  }
}

function handleError(msg) {
  let errorEl = uiWindow.querySelector("#error");
  errorEl.textContent = msg;
  uiWindow.querySelector(".cashlook-loading").classList.toggle("visible");
  errorEl.classList.add("cashlook-alert-show");
  toggleError();
}

function toggleError() {
  let errorEl = uiWindow.querySelector("#error");
  setTimeout((_) => {
    errorEl.classList.toggle("cashlook-alert-show");
  }, 2000);
}

function reqUrlBuilder({ inputCurrency, inputAmount, outputCurrency, ...props }) {
  let url = "https://api.exchangerate.host/latest?";
  url = `${url}base=${inputCurrency}&amount=${inputAmount}&symbols=${outputCurrency}`;
  return url;
}

function formatCurrency(num = 0) {
  let formatter = Intl.NumberFormat("en-US");
  return formatter.format(num);
}

function loadIcons() {
  let url = "https://cdn.materialdesignicons.com/5.4.55/css/materialdesignicons.min.css";
  let linkEl = document.createElement("link");
  linkEl.rel = "stylesheet";
  linkEl.href = url;
  document.head.appendChild(linkEl);
}

function buildUIContent() {
  return `<div class='cashlook-card'>
 <div class="cashlook-title">
     <h3> cashlook </h3>
     <button role='button' class='cashlook-close'>  </button>
 </div>

 <section class="cashlook-content">
     <div class="cashlook-container">
         <label for="inputCurrency"> 
             <select name="inputCurrency" class="cashlook-selectbox" id="inputCurrency">
                 <option value="NGN"> NGN </option>
                 <option value="CAD"> CAD </option>
                 <option value="USD"> USD </option>
                 <option value="EUR"> EUR </option>
                 <option value="GBP"> GBP </option>
             </select>
         </label>
         <input type="text" class="cashlook-inputbox" id="inputAmount" data-role='inputAmount' value="0">
         <button class="cashlook-btn convert" id="convert">
             <span class="mdi mdi-transfer"> convert </span>
         </button>
     </div>
 </section>

 <section class="cashlook-content">
     <div class="cashlook-container">
         <label for="inputCurrency"> 
             <select name="inputCurrency" class="cashlook-selectbox" id="outputCurrency">
                 <option value="NGN"> NGN </option>
                 <option value="CAD"> CAD </option>
                 <option value="USD"> USD </option>
                 <option value="EUR"> EUR </option>
                 <option value="GBP"> GBP </option>
             </select>
         </label>
         <input type="text" class="cashlook-inputbox" id="outputAmount"  value="0">
         <button class="cashlook-btn" id="convert">
             <span class="mdi mdi-36px cashlook-loading mdi-loading mdi-spin">  </span>
         </button>
     </div>
 </section>

 <div class="cashlook-alert mdi mdi-alert" id="error">
     Error
 </div>
</div>
`;
}
