const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const fromAmountInput = document.getElementById("currency-one");
const toAmountInput = document.getElementById("currency-two");
const reverseBtn = document.querySelector(".reverse");
const convertBtn = document.getElementById("convert-btn");


const API_BASE_URL = "https://open.er-api.com/v6/latest";
const CACHE_MAX_AGE = 3600000; // 1 hour in milliseconds
const CURRENCY_NAMES = {
  "USD": "United States Dollar", "INR": "Indian Rupee", "EUR": "Euro", "JPY": "Japanese Yen", "GBP": "British Pound Sterling",
  "AUD": "Australian Dollar", "CAD": "Canadian Dollar", "CHF": "Swiss Franc", "CNY": "Chinese Yuan", "AED": "United Arab Emirates Dirham",
  "AFN": "Afghan Afghani", "ALL": "Albanian Lek", "AMD": "Armenian Dram", "ANG": "Netherlands Antillean Guilder", "AOA": "Angolan Kwanza",
  "ARS": "Argentine Peso", "AWG": "Aruban Florin", "AZN": "Azerbaijani Manat", "BAM": "Bosnia-Herzegovina Convertible Mark", "BBD": "Barbadian Dollar",
  "BDT": "Bangladeshi Taka", "BGN": "Bulgarian Lev", "BHD": "Bahraini Dinar", "BIF": "Burundian Franc", "BMD": "Bermudian Dollar",
  "BND": "Brunei Dollar", "BOB": "Bolivian Boliviano", "BRL": "Brazilian Real", "BSD": "Bahamian Dollar", "BTN": "Bhutanese Ngultrum",
  "BWP": "Botswanan Pula", "BYN": "Belarusian Ruble", "BZD": "Belize Dollar", "CDF": "Congolese Franc", "CLP": "Chilean Peso",
  "COP": "Colombian Peso", "CRC": "Costa Rican Colón", "CUP": "Cuban Peso", "CVE": "Cape Verdean Escudo", "CZK": "Czech Koruna",
  "DJF": "Djiboutian Franc", "DKK": "Danish Krone", "DOP": "Dominican Peso", "DZD": "Algerian Dinar", "EGP": "Egyptian Pound",
  "ERN": "Eritrean Nakfa", "ETB": "Ethiopian Birr", "FJD": "Fijian Dollar", "FKP": "Falkland Islands Pound", "FOK": "Faroese Króna",
  "GEL": "Georgian Lari", "GGP": "Guernsey Pound", "GHS": "Ghanaian Cedi", "GIP": "Gibraltar Pound", "GMD": "Gambian Dalasi",
  "GNF": "Guinean Franc", "GTQ": "Guatemalan Quetzal", "GYD": "Guyanaese Dollar", "HKD": "Hong Kong Dollar", "HNL": "Honduran Lempira",
  "HRK": "Croatian Kuna", "HTG": "Haitian Gourde", "HUF": "Hungarian Forint", "IDR": "Indonesian Rupiah", "ILS": "Israeli New Shekel",
  "IMP": "Manx pound", "IQD": "Iraqi Dinar", "IRR": "Iranian Rial", "ISK": "Icelandic Króna", "JEP": "Jersey Pound",
  "JMD": "Jamaican Dollar", "JOD": "Jordanian Dinar", "KES": "Kenyan Shilling", "KGS": "Kyrgystani Som", "KHR": "Cambodian Riel",
  "KID": "Kiribati Dollar", "KMF": "Comorian Franc", "KRW": "South Korean Won", "KWD": "Kuwaiti Dinar", "KYD": "Cayman Islands Dollar",
  "KZT": "Kazakhstani Tenge", "LAK": "Laotian Kip", "LBP": "Lebanese Pound", "LKR": "Sri Lankan Rupee", "LRD": "Liberian Dollar",
  "LSL": "Lesotho Loti", "LYD": "Libyan Dinar", "MAD": "Moroccan Dirham", "MDL": "Moldovan Leu", "MGA": "Malagasy Ariary",
  "MKD": "Macedonian Denar", "MMK": "Myanma Kyat", "MNT": "Mongolian Tugrik", "MOP": "Macanese Pataca", "MRU": "Mauritanian Ouguiya",
  "MUR": "Mauritian Rupee", "MVR": "Maldivian Rufiyaa", "MWK": "Malawian Kwacha", "MXN": "Mexican Peso", "MYR": "Malaysian Ringgit",
  "MZN": "Mozambican Metical", "NAD": "Namibian Dollar", "NGN": "Nigerian Naira", "NIO": "Nicaraguan Córdoba", "NOK": "Norwegian Krone",
  "NPR": "Nepalese Rupee", "NZD": "New Zealand Dollar", "OMR": "Omani Rial", "PAB": "Panamanian Balboa", "ZMW": "Zambian Kwacha", "ZWL": "Zimbabwean Dollar"
};
const CURRENCIES = Object.keys(CURRENCY_NAMES);



/**
 * Populates a select element with currency options.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {string} defaultCurrency - The currency to select by default.
 */
function populateDropdown(selectElement, defaultCurrency) {
  const optionsHTML = CURRENCIES
    .map(currency => {
        const fullName = CURRENCY_NAMES[currency] || currency;
        // Create a multi-line layout within the option
        return `<option value="${currency}" ${currency === defaultCurrency ? "selected" : ""}>
                    <span class="option-label">${currency}</span>
                    <span class="option-text">${fullName}</span>
                </option>`
    })
    .join("");
  // Append the options after the <button> element
  selectElement.insertAdjacentHTML('beforeend', optionsHTML);
}

/**
 * Fetches exchange rates for a given base currency from the API.
 * @param {string} baseCurrency - The base currency code (e.g., "USD").
 * @returns {Promise<object>} A promise that resolves to the rates object.
 */
async function fetchRates(baseCurrency) {
  try {
    const response = await fetch(`${API_BASE_URL}/${baseCurrency}`);
    if (!response.ok) throw new Error(`HTTP error! status: ${response.status}`);
    const data = await response.json();
    return data.rates;
  } catch (err) {
    console.error("Failed to fetch rates:", err);
    toAmountInput.value = "Error";
    return null; // Return null on error
  }
}

/**
 * Your original caching function, slightly modified for clarity.
 * Fetches data with localStorage caching.
 * @param {string} key - The unique key for the cache entry.
 * @param {function} fetcher - An async function that returns the data to be cached.
 * @param {number} maxAge - Time in ms before the cache is considered stale.
 * @returns {Promise<any>} The cached or freshly fetched data.
 */
async function fetchWithCache(key, fetcher, maxAge) {
  const now = Date.now();
  const rawItem = localStorage.getItem(key);

  if (rawItem) {
    try {
      const { data, timestamp } = JSON.parse(rawItem);
      if (now - timestamp < maxAge) {
        console.log(`✅ [Cache Hit] Returning cached data for: ${key}`);
        return data;
      }
      console.log(`⌛ [Stale Cache] Revalidating: ${key}`);
    } catch (e) {
      console.warn(`⚠️ Error parsing cache for key: ${key}`);
    }
  }

  console.log(`🌐 [Cache Miss] Fetching fresh data for: ${key}`);
  const data = await fetcher();
  if (data) {
    const item = JSON.stringify({ data, timestamp: now });
    localStorage.setItem(key, item);
  }
  return data;
}


async function convertCurrency() {
  const fromCurrency = fromCurrencySelect.value;
  const toCurrency = toCurrencySelect.value;
  const amount = parseFloat(fromAmountInput.value);

  if (isNaN(amount) || amount === 0) {
    toAmountInput.value = "";
    return;
  }

  convertBtn.innerText = "Converting...";

  // Use a dynamic cache key based on the "from" currency
  const cacheKey = `rates-${fromCurrency}`;
  const rates = await fetchWithCache(cacheKey, () => fetchRates(fromCurrency), CACHE_MAX_AGE);

  if (rates && rates[toCurrency]) {
    const rate = rates[toCurrency];
    const result = (amount * rate).toFixed(2);
    toAmountInput.value = result;
    convertBtn.innerText = "Convert";
  } else if (rates) {
    toAmountInput.value = "N/A"; // Rate not available
    convertBtn.innerText = "Convert";
  }
}


convertBtn.addEventListener("click", convertCurrency);
fromCurrencySelect.addEventListener("change", convertCurrency);
toCurrencySelect.addEventListener("change", convertCurrency);

reverseBtn.addEventListener("click", () => {
  // Swap the selected currencies
  const tempCurrency = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempCurrency;

  // Trigger a new conversion
  convertCurrency();
});

function initialize() {
  populateDropdown(fromCurrencySelect, "USD");
  populateDropdown(toCurrencySelect, "INR");
  convertCurrency(); // Perform an initial conversion on load
}

initialize();
