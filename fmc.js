const DEFAULT_FMC_AMOUNT = 10000;
const DEFAULT_FMC_INTEREST = 6;
const DEFAULT_FMC_YEARS = 10;

function setDefaultFMCValues() {
    document.getElementById("fmcAmount").value = DEFAULT_FMC_AMOUNT;
    document.getElementById("fmcInterest").value = DEFAULT_FMC_INTEREST;
    document.getElementById("fmcYears").value = DEFAULT_FMC_YEARS;
    calculateFMC();
}

function calculateFMC() {
    const amount = parseFloat(document.getElementById("fmcAmount").value);
    const interest = parseFloat(document.getElementById("fmcInterest").value) / 100;
    const years = parseFloat(document.getElementById("fmcYears").value);

    if (isNaN(amount) || isNaN(interest) || isNaN(years)) {
        document.getElementById("result").innerText = "Please enter valid numbers.";
        return;
    }

    // Future Value formula: FV = PV / (1 + r)^n
    const futureValue = amount / Math.pow(1 + interest, years);
    document.getElementById("result").innerText = `₹${futureValue.toFixed(2)}`;
}

export function initFMC() {
    setDefaultFMCValues();
    document.querySelector(".fmcButton").addEventListener("click", calculateFMC);
}