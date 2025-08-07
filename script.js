const convertBtn = document.getElementById("convert-btn");
const apibaseURL = "https://open.er-api.com/v6/latest";
const input = document.getElementById("currency-one");
const output = document.getElementById("currency-two");
const selector = document.getElementById("from-currency");
const currencies = [
  "USD",
  "INR",
  "AED",
  "AFN",
  "ALL",
  "AMD",
  "ANG",
  "AOA",
  "ARS",
  "AUD",
  "AWG",
  "AZN",
  "BAM",
  "BBD",
  "BDT",
  "BGN",
  "BHD",
  "BIF",
  "BMD",
  "BND",
  "BOB",
  "BRL",
  "BSD",
  "BTN",
  "BWP",
  "BYN",
  "BZD",
  "CAD",
  "CDF",
  "CHF",
  "CLP",
  "CNY",
  "COP",
  "CRC",
  "CUP",
  "CVE",
  "CZK",
  "DJF",
  "DKK",
  "DOP",
  "DZD",
  "EGP",
  "ERN",
  "ETB",
  "EUR",
  "FJD",
  "FKP",
  "FOK",
  "GBP",
  "GEL",
  "GGP",
  "GHS",
  "GIP",
  "GMD",
  "GNF",
  "GTQ",
  "GYD",
  "HKD",
  "HNL",
  "HRK",
  "HTG",
  "HUF",
  "IDR",
  "ILS",
  "IMP",
  "IQD",
  "IRR",
  "ISK",
  "JEP",
  "JMD",
  "JOD",
  "JPY",
  "KES",
  "KGS",
  "KHR",
  "KID",
  "KMF",
  "KRW",
  "KWD",
  "KYD",
  "KZT",
  "LAK",
  "LBP",
  "LKR",
  "LRD",
  "LSL",
  "LYD",
  "MAD",
  "MDL",
  "MGA",
  "MKD",
  "MMK",
  "MNT",
  "MOP",
  "MRU",
  "MUR",
  "MVR",
  "MWK",
  "MXN",
  "MYR",
  "MZN",
  "NAD",
  "NGN",
  "NIO",
  "NOK",
  "NPR",
  "NZD",
  "OMR",
  "PAB",
  "ZMW",
  "ZWL",
];
currencies.forEach((curr) => {
  selector.innerHTML += `<option value="${curr}">${curr}</option>`;
});
let from_currency = selector.value;
let to_currency = currencies[1];
let rates;

async function fetchRates() {
  try {
    const response = await fetch(`${apibaseURL}/${from_currency}`);
    const data = await response.json();
    rates = data.rates;
    return rates;
  } catch (err) {
    console.log(err);
    return err;
  }
}

convertBtn.addEventListener("click", async () => {
  console.log(selector.value);
  const rates = await fetchRates();
  const inputValue = input.value;
  const outputValue = inputValue * rates[to_currency];
  output.value = outputValue;
});
