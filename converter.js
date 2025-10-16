const fromCurrencySelect = document.getElementById("from-currency");
const toCurrencySelect = document.getElementById("to-currency");
const fromAmountInput = document.getElementById("currency-one");
const toAmountInput = document.getElementById("currency-two");
const reverseBtn = document.querySelector(".reverse");
const convertBtn = document.getElementById("convert-btn");
const chartToggle = document.getElementById("chartToggle");
const converterContainer = document.getElementById("converterContainer");
const conversionMeta = document.getElementById("conversionMeta");

const API_BASE_URL = "https://open.er-api.com/v6/latest";
const CACHE_MAX_AGE = 3600000; // 1 hour in milliseconds
const CURRENCY_NAMES = {
  USD: "United States Dollar",
  INR: "Indian Rupee",
  EUR: "Euro",
  JPY: "Japanese Yen",
  GBP: "British Pound Sterling",
  AUD: "Australian Dollar",
  CAD: "Canadian Dollar",
  CHF: "Swiss Franc",
  CNY: "Chinese Yuan",
  AED: "United Arab Emirates Dirham",
  AFN: "Afghan Afghani",
  ALL: "Albanian Lek",
  AMD: "Armenian Dram",
  ANG: "Netherlands Antillean Guilder",
  AOA: "Angolan Kwanza",
  ARS: "Argentine Peso",
  AWG: "Aruban Florin",
  AZN: "Azerbaijani Manat",
  BAM: "Bosnia-Herzegovina Convertible Mark",
  BBD: "Barbadian Dollar",
  BDT: "Bangladeshi Taka",
  BGN: "Bulgarian Lev",
  BHD: "Bahraini Dinar",
  BIF: "Burundian Franc",
  BMD: "Bermudian Dollar",
  BND: "Brunei Dollar",
  BOB: "Bolivian Boliviano",
  BRL: "Brazilian Real",
  BSD: "Bahamian Dollar",
  BTN: "Bhutanese Ngultrum",
  BWP: "Botswanan Pula",
  BYN: "Belarusian Ruble",
  BZD: "Belize Dollar",
  CDF: "Congolese Franc",
  CLP: "Chilean Peso",
  COP: "Colombian Peso",
  CRC: "Costa Rican Colón",
  CUP: "Cuban Peso",
  CVE: "Cape Verdean Escudo",
  CZK: "Czech Koruna",
  DJF: "Djiboutian Franc",
  DKK: "Danish Krone",
  DOP: "Dominican Peso",
  DZD: "Algerian Dinar",
  EGP: "Egyptian Pound",
  ERN: "Eritrean Nakfa",
  ETB: "Ethiopian Birr",
  FJD: "Fijian Dollar",
  FKP: "Falkland Islands Pound",
  FOK: "Faroese Króna",
  GEL: "Georgian Lari",
  GGP: "Guernsey Pound",
  GHS: "Ghanaian Cedi",
  GIP: "Gibraltar Pound",
  GMD: "Gambian Dalasi",
  GNF: "Guinean Franc",
  GTQ: "Guatemalan Quetzal",
  GYD: "Guyanaese Dollar",
  HKD: "Hong Kong Dollar",
  HNL: "Honduran Lempira",
  HRK: "Croatian Kuna",
  HTG: "Haitian Gourde",
  HUF: "Hungarian Forint",
  IDR: "Indonesian Rupiah",
  ILS: "Israeli New Shekel",
  IMP: "Manx pound",
  IQD: "Iraqi Dinar",
  IRR: "Iranian Rial",
  ISK: "Icelandic Króna",
  JEP: "Jersey Pound",
  JMD: "Jamaican Dollar",
  JOD: "Jordanian Dinar",
  KES: "Kenyan Shilling",
  KGS: "Kyrgystani Som",
  KHR: "Cambodian Riel",
  KID: "Kiribati Dollar",
  KMF: "Comorian Franc",
  KRW: "South Korean Won",
  KWD: "Kuwaiti Dinar",
  KYD: "Cayman Islands Dollar",
  KZT: "Kazakhstani Tenge",
  LAK: "Laotian Kip",
  LBP: "Lebanese Pound",
  LKR: "Sri Lankan Rupee",
  LRD: "Liberian Dollar",
  LSL: "Lesotho Loti",
  LYD: "Libyan Dinar",
  MAD: "Moroccan Dirham",
  MDL: "Moldovan Leu",
  MGA: "Malagasy Ariary",
  MKD: "Macedonian Denar",
  MMK: "Myanma Kyat",
  MNT: "Mongolian Tugrik",
  MOP: "Macanese Pataca",
  MRU: "Mauritanian Ouguiya",
  MUR: "Mauritian Rupee",
  MVR: "Maldivian Rufiyaa",
  MWK: "Malawian Kwacha",
  MXN: "Mexican Peso",
  MYR: "Malaysian Ringgit",
  MZN: "Mozambican Metical",
  NAD: "Namibian Dollar",
  NGN: "Nigerian Naira",
  NIO: "Nicaraguan Córdoba",
  NOK: "Norwegian Krone",
  NPR: "Nepalese Rupee",
  NZD: "New Zealand Dollar",
  OMR: "Omani Rial",
  PAB: "Panamanian Balboa",
  ZMW: "Zambian Kwacha",
  ZWL: "Zimbabwean Dollar",
};
const CURRENCIES = Object.keys(CURRENCY_NAMES);

/**
 * Populates a select element with currency options.
 * @param {HTMLSelectElement} selectElement - The select element to populate.
 * @param {string} defaultCurrency - The currency to select by default.
 */
function populateDropdown(selectElement, defaultCurrency) {
  const optionsHTML = CURRENCIES.map((currency) => {
    const fullName = CURRENCY_NAMES[currency] || currency;
    // Create a multi-line layout within the option
    return `<option value="${currency}" ${
      currency === defaultCurrency ? "selected" : ""
    }>
                    <span class="option-label">${currency}</span>
                    <span class="option-text">${fullName}</span>
                </option>`;
  }).join("");
  // Append the options after the <button> element
  selectElement.insertAdjacentHTML("beforeend", optionsHTML);
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

  const toGroup = toAmountInput.closest(".input-group");
  toGroup && toGroup.classList.remove("invalid");
  conversionMeta.textContent = "";

  if (isNaN(amount) || amount <= 0) {
    toAmountInput.value = "";
    conversionMeta.textContent = "";
    return;
  }

  convertBtn.disabled = true;
  convertBtn.setAttribute("aria-busy", "true");
  convertBtn.innerText = "Converting...";

  try {
    // Short-circuit when same currency selected
    if (fromCurrency === toCurrency) {
      toAmountInput.value = amount.toFixed(2);
      conversionMeta.textContent = `1 ${fromCurrency} = 1 ${toCurrency}`;
      return;
    }

    const cacheKey = `rates-${fromCurrency}`;
    const rates = await fetchWithCache(
      cacheKey,
      () => fetchRates(fromCurrency),
      CACHE_MAX_AGE
    );

    if (rates && rates[toCurrency]) {
      const rate = rates[toCurrency];
      const result = (amount * rate).toFixed(2);
      toAmountInput.value = result;
      conversionMeta.textContent = `1 ${fromCurrency} = ${rate.toFixed(
        4
      )} ${toCurrency}`;
    } else {
      toAmountInput.value = "";
      conversionMeta.textContent = "Conversion unavailable right now.";
      toGroup && toGroup.classList.add("invalid");
    }
  } catch (e) {
    toAmountInput.value = "";
    conversionMeta.textContent = "Conversion failed. Please try again.";
    toGroup && toGroup.classList.add("invalid");
  } finally {
    convertBtn.disabled = false;
    convertBtn.removeAttribute("aria-busy");
    convertBtn.innerText = "Convert";
  }
}

convertBtn.addEventListener("click", convertCurrency);
fromAmountInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") convertCurrency();
});
fromCurrencySelect.addEventListener("change", convertCurrency);
toCurrencySelect.addEventListener("change", convertCurrency);

reverseBtn.addEventListener("click", () => {
  // Swap the selected currencies
  const tempCurrency = fromCurrencySelect.value;
  fromCurrencySelect.value = toCurrencySelect.value;
  toCurrencySelect.value = tempCurrency;

  // Trigger a new conversion
  convertCurrency();

  // Trigger new chart on reverse
  if (chartToggle.checked) {
    loadCurrencyChart(fromCurrencySelect.value, toCurrencySelect.value);
  }
});
class CurrencyChart {
  constructor(options = {}) {
    this.config = {
      bisBaseUrl: "https://stats.bis.org/api/v1/data/WS_XRU",
      cacheTimeout: 120 * 60 * 1000, // 1 hour
      maxDataPoints: 2000,
      retryAttempts: 3,
      ...options,
    };

    this.currentChart = null;
    this.statusCallback = null;
    this.onError = null;
    this.onSuccess = null;
  }

  // Set callbacks for status updates and events
  setCallbacks({ onStatus, onError, onSuccess } = {}) {
    this.statusCallback = onStatus;
    this.onError = onError;
    this.onSuccess = onSuccess;
    return this;
  }

  // Main method to render chart for any currency pair
  async renderChart(container, fromCurrency, toCurrency, options = {}) {
    const {
      startDate = this.getDefaultStartDate(),
      endDate = this.getDefaultEndDate(),
      theme = "light",
      height = 420,
    } = options;

    // Show loader
    const loader = container.querySelector("#chartLoader");
    if (loader) loader.style.display = "flex";

    // Remove previous chart if any
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }

    // Validate inputs
    if (!container || !fromCurrency || !toCurrency) {
      throw new Error("Container, fromCurrency, and toCurrency are required");
    }

    // Setup canvas if not exists
    const canvas = this.setupCanvas(container, height);
    const pair = `${fromCurrency}-${toCurrency}`;
    const meta = this.getCurrencyMeta(fromCurrency, toCurrency, theme);

    this.updateStatus(`Loading ${meta.label}…`, "loading");

    try {
      let series = [];

      if (fromCurrency === "USD") {
        // Direct USD to target currency
        series = await this.fetchSeries(
          this.getCurrencyRefArea(toCurrency),
          toCurrency,
          startDate,
          endDate
        );
      } else if (toCurrency === "USD") {
        // Inverse: target to USD, then invert values
        const directSeries = await this.fetchSeries(
          this.getCurrencyRefArea(fromCurrency),
          fromCurrency,
          startDate,
          endDate
        );
        series = directSeries.map((d) => ({
          date: d.date,
          value: 1 / d.value,
        }));
      } else {
        // Cross-rate: need both currencies vs USD
        const [fromUsdSeries, toUsdSeries] = await Promise.all([
          this.fetchSeries(
            this.getCurrencyRefArea(fromCurrency),
            fromCurrency,
            startDate,
            endDate
          ),
          this.fetchSeries(
            this.getCurrencyRefArea(toCurrency),
            toCurrency,
            startDate,
            endDate
          ),
        ]);
        series = this.calculateCrossRate(toUsdSeries, fromUsdSeries); // to/from = target per source
      }

      if (!series.length) {
        this.updateStatus("No data available for the selected range.", "info");
        this.renderEmptyChart(canvas, meta);
        return { success: false, message: "No data available" };
      }

      // Downsample if needed
      const { dates, values } = this.downsampleData(series);

      // Render the chart
      this.createChart(canvas, dates, values, meta);

      const lastPoint = series[series.length - 1];
      const successMessage = `${meta.label}: ${this.formatNumber(
        lastPoint.value
      )} (${lastPoint.date})`;
      this.updateStatus(successMessage, "success");

      if (this.onSuccess) {
        this.onSuccess({
          pair,
          data: series,
          meta,
          lastValue: lastPoint.value,
        });
      }

      return { success: true, data: series, meta };
    } catch (error) {
      console.error("Chart rendering error:", error);
      const errorMessage = `Error loading ${meta.label}: ${error.message}`;
      this.updateStatus(errorMessage, "error");
      this.renderEmptyChart(canvas, meta);

      if (this.onError) {
        this.onError({ pair, error, meta });
      }

      return { success: false, error: error.message };
    } finally {
      // Hide loader after chart is rendered or on error
      if (loader) loader.style.display = "none";
    }
  }

  // Setup canvas element
  setupCanvas(container, height) {
    let canvas = container.querySelector("canvas");
    if (!canvas) {
      canvas = document.createElement("canvas");
      container.innerHTML = "";
      container.appendChild(canvas);
    }
    container.style.height = `${height}px`;
    container.style.position = "relative";
    return canvas;
  }

  // Get currency metadata for styling
  getCurrencyMeta(from, to, theme = "light") {
    const colors = {
      light: ["#2563eb", "#16a34a", "#dc2626", "#7c3aed", "#ea580c", "#0891b2"],
      dark: ["#60a5fa", "#4ade80", "#f87171", "#a78bfa", "#fb923c", "#22d3ee"],
    };

    const colorIndex =
      (from.charCodeAt(0) + to.charCodeAt(0)) % colors[theme].length;

    return {
      label: `${from} → ${to}`,
      unit: `${to} per ${from}`,
      color: colors[theme][colorIndex],
      pair: `${from}-${to}`,
    };
  }

  // Get BIS reference area code for currency
  getCurrencyRefArea(currency) {
    const mapping = {
      INR: "IN",
      CHF: "CH",
      EUR: "XM",
      JPY: "JP",
      GBP: "GB",
      AUD: "AU",
      CAD: "CA",
      CNY: "CN",
      SEK: "SE",
      NOK: "NO",
      DKK: "DK",
      NZD: "NZ",
      MXN: "MX",
      ZAR: "ZA",
      BRL: "BR",
      KRW: "KR",
      SGD: "SG",
      HKD: "HK",
      PLN: "PL",
      CZK: "CZ",
      HUF: "HU",
      ILS: "IL",
      CLP: "CL",
      PHP: "PH",
      AED: "AE",
      SAR: "SA",
      MYR: "MY",
      THB: "TH",
      RUB: "RU",
      TRY: "TR",
    };
    return mapping[currency] || currency.substring(0, 2);
  }

  // Fetch currency series from BIS API
  async fetchSeries(refArea, currency, startDate, endDate) {
    const url = this.buildApiUrl(refArea, currency, startDate, endDate);

    try {
      const data = await this.fetchWithCache(url);
      return this.parseBISResponse(data);
    } catch (error) {
      throw error;
    }
  }

  // Build BIS API URL
  buildApiUrl(refArea, currency, startDate, endDate) {
    const startYear = startDate ? new Date(startDate).getFullYear() : "";
    const endYear = endDate ? new Date(endDate).getFullYear() : "";

    const params = new URLSearchParams({
      startPeriod: startYear,
      endPeriod: endYear,
      detail: "dataonly",
    });

    return `${this.config.bisBaseUrl}/D.${refArea}.${currency}.A/all?${params}`;
  }

  // Cache-enabled fetch with retry logic
  async fetchWithCache(url) {
    const cacheKey = `bis-cache:${url}`;

    // Try cache first
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        const { savedAt, data } = JSON.parse(cached);
        if (Date.now() - savedAt < this.config.cacheTimeout) {
          return data;
        } else {
          localStorage.removeItem(cacheKey);
        }
      }
    } catch (e) {
      console.log("Currency Chart Cache Errors:", e);
    }

    // Fetch with retry
    const data = await this.fetchWithRetry(url);

    // Cache the result
    try {
      localStorage.setItem(
        cacheKey,
        JSON.stringify({
          savedAt: Date.now(),
          data,
        })
      );
    } catch (e) {
      console.log("Currency Chart Cache Write Errors:", e);
    }

    return data;
  }

  // Fetch with exponential backoff retry
  async fetchWithRetry(url) {
    let lastError;

    for (let attempt = 0; attempt < this.config.retryAttempts; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            Accept: "application/vnd.sdmx.data+json;version=1.0.0",
            "Accept-Encoding": "identity",
          },
        });

        if (response.status === 429 || response.status === 503) {
          const delay =
            Math.min(2000 * Math.pow(2, attempt), 10000) + Math.random() * 250;
          this.updateStatus(
            `Rate limited. Retrying in ${Math.round(delay)}ms...`,
            "loading"
          );
          await this.sleep(delay);
          continue;
        }

        if (!response.ok) {
          throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error;
        if (attempt < this.config.retryAttempts - 1) {
          const delay =
            Math.min(500 * Math.pow(2, attempt), 4000) + Math.random() * 250;
          this.updateStatus(
            `Network error. Retrying in ${Math.round(delay)}ms...`,
            "loading"
          );
          await this.sleep(delay);
        }
      }
    }

    throw lastError || new Error("Failed after retries");
  }

  // Parse BIS SDMX-JSON response
  parseBISResponse(json) {
    const dataset = json?.data?.dataSets?.[0];
    const series = dataset?.series;
    if (!series) return [];

    const firstSeriesKey = Object.keys(series)[0];
    const observations = series[firstSeriesKey]?.observations || {};

    const timeDimension = json?.data?.structure?.dimensions?.observation?.find(
      (d) => d.id === "TIME_PERIOD"
    );
    const timeValues = timeDimension?.values || [];

    const result = [];
    for (const [index, observation] of Object.entries(observations)) {
      const timeValue = timeValues[parseInt(index)];
      const date = timeValue?.id || timeValue?.name;
      const value = parseFloat(observation[0]);

      if (date && Number.isFinite(value)) {
        result.push({ date, value });
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Calculate cross-rate between two USD-based series
  calculateCrossRate(numeratorSeries, denominatorSeries) {
    const numeratorMap = new Map(numeratorSeries.map((d) => [d.date, d.value]));
    const denominatorMap = new Map(
      denominatorSeries.map((d) => [d.date, d.value])
    );

    const result = [];
    for (const date of numeratorMap.keys()) {
      if (denominatorMap.has(date)) {
        const num = numeratorMap.get(date);
        const den = denominatorMap.get(date);
        if (Number.isFinite(num) && Number.isFinite(den) && den !== 0) {
          result.push({ date, value: num / den });
        }
      }
    }

    return result.sort((a, b) => a.date.localeCompare(b.date));
  }

  // Downsample data if too dense
  downsampleData(series) {
    const step = Math.ceil(series.length / this.config.maxDataPoints);
    const dates = [];
    const values = [];

    for (let i = 0; i < series.length; i += step) {
      dates.push(series[i].date);
      values.push(series[i].value);
    }

    return { dates, values };
  }

  // Create Chart.js chart
  createChart(canvas, labels, data, meta) {
    const ctx = canvas.getContext("2d");

    if (this.currentChart) {
      this.currentChart.destroy();
    }

    // Create gradient
    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
    gradient.addColorStop(0, this.hexToRGBA(meta.color, 0.2));
    gradient.addColorStop(1, this.hexToRGBA(meta.color, 0.0));

    this.currentChart = new Chart(ctx, {
      type: "line",
      data: {
        labels,
        datasets: [
          {
            label: meta.label,
            data,
            borderColor: meta.color,
            backgroundColor: gradient,
            pointRadius: 0,
            borderWidth: 2,
            tension: 0.25,
            fill: true,
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        animation: { duration: 250 },
        plugins: {
          legend: { display: false },
          tooltip: {
            mode: "index",
            intersect: false,
            callbacks: {
              label: (context) =>
                `${meta.label}: ${this.formatNumber(context.parsed.y)}`,
            },
          },
        },
        interaction: { mode: "index", intersect: false },
        scales: {
          x: {
            type: "category",
            ticks: { maxRotation: 0, autoSkipPadding: 12 },
            grid: { display: false },
          },
          y: {
            ticks: { callback: (value) => this.formatNumber(value) },
            grid: { color: "rgba(0,0,0,0.1)" },
          },
        },
      },
    });
  }

  // Render empty chart
  renderEmptyChart(canvas, meta) {
    this.createChart(canvas, [], [], meta);
  }

  // Utility methods
  formatNumber(value) {
    if (!Number.isFinite(value)) return "-";
    return value.toLocaleString(undefined, {
      minimumFractionDigits: 2,
      maximumFractionDigits: 6,
    });
  }

  hexToRGBA(hex, alpha = 1) {
    const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    if (!result) return `rgba(0,0,0,${alpha})`;

    const r = parseInt(result[1], 16);
    const g = parseInt(result[2], 16);
    const b = parseInt(result[3], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }

  updateStatus(message, type = "info") {
    if (this.statusCallback) {
      this.statusCallback(message, type);
    }
  }

  sleep(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  getDefaultStartDate() {
    const date = new Date();
    date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split("T")[0];
  }

  getDefaultEndDate() {
    return new Date().toISOString().split("T")[0];
  }

  // Cleanup method
  destroy() {
    if (this.currentChart) {
      this.currentChart.destroy();
      this.currentChart = null;
    }
  }
}

chartToggle.addEventListener("change", () => {
  if (chartToggle.checked) {
    loadCurrencyChart(fromCurrencySelect.value, toCurrencySelect.value);
  } else {
    // Hide or clear chart
    const container = document.getElementById("currencyChart");
    container.innerHTML = "";
  }
});

function loadCurrencyChart(from, to) {
  const container = document.getElementById("currencyChart");
  const chart = new CurrencyChart({
    maxDataPoints: 1500,
  });

  chart.setCallbacks({
    onStatus: (msg, type) => {
      console.log(`Currency chart: ${msg} (${type})`);
    },
  });
  chart.renderChart(container, from, to, {
    height: 250,
    startDate: "2024-01-01",
  });
}

function initialize() {
  populateDropdown(fromCurrencySelect, "USD");
  populateDropdown(toCurrencySelect, "INR");
  convertCurrency(); // Perform an initial conversion on load
}

export const converter = {
  init: initialize,
};
