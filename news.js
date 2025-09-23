function getTheGuardianNews() {
  return fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent("https://www.theguardian.com/uk/money/rss")
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data || !Array.isArray(data.items)) return [];
      return data.items.map((item) => ({
        thumbnail: item.enclosure.link.replace(/&amp;/g, "&") || "",
        title: item.title,
        description: item.description,
        pubDate: item.pubDate,
        link: item.link,
        author: item.author.split("-")[0] || "",
        source: "The Guardian",
      }));
    })
    .catch((err) => {
      console.error("Guardian fetch error:", err);
      return [];
    });
}

function getBBCNews() {
  return fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=" +
    encodeURIComponent(
      "https://feeds.bbci.co.uk/news/business/economy/rss.xml"
    )
  )
    .then((res) => res.json())
    .then((data) => {
      if (!data || !Array.isArray(data.items)) return [];
      return data.items.map((item) => ({
        thumbnail: item.thumbnail,
        title: item.title.split(" - ")[0],
        description: item.description,
        pubDate: item.pubDate,
        link: item.link,
        author: item.author || "News",
        source: "BBC",
      }));
    })
    .catch((err) => {
      console.error("BBC fetch error:", err);
      return [];
    });
}

export function getNews() {
  const newsList = document.getElementById("newsList");
  renderNewsLoading(newsList);
  Promise.all([getTheGuardianNews(), getBBCNews()])
    .then(([guardianItems, bbcItems]) => {
      const allItems = [...guardianItems, ...bbcItems];
      // Sort by date descending
      allItems.sort((a, b) => new Date(b.pubDate) - new Date(a.pubDate));
      newsList.innerHTML = ""; // Clean the loading skeleton
      allItems.forEach((item) => {
        const li = document.createElement("li");
        li.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${createNewsCard(
          item.thumbnail,
          item.title,
          item.description,
          item.pubDate,
          item.author,
          item.source
        )}</a>`;
        newsList.appendChild(li);
      });
    })
    .catch((err) => {
      console.error("Error:", err);
      renderNewsError(newsList);
    });
}
function createNewsCard(thumbnail, title, description, date, author, source = "News") {
  // Fallback thumbnail
  const fallbackImg = "https://via.placeholder.com/360x180?text=No+Image";
  // Clean description (strip HTML tags)
  const cleanDesc = description.replace(/<[^>]+>/g, "").slice(0, 120) + "...";
  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });

  return `
  <div class="news-card">
    <div class="news-card-img-container">
      <img src="${thumbnail || fallbackImg
    }" alt="News" class="news-card-img">
    </div>
    <div class="news-card-body">
      <h2 class="news-card-title">${title}</h2>
      <p class="news-card-desc">${cleanDesc}</p>
      <div class="news-card-footer">
        <span class="news-card-author">${author}</span>
        <span class="news-card-source">${source}</span>
        <span class="news-card-date">${formattedDate}</span>
      </div>
    </div>
  </div>
  `;
}


function renderNewsLoading(target) {
  target.innerHTML = "";
  const count = 6;
  for (let i = 0; i < count; i++) {
    const li = document.createElement("li");
    li.className = "news-skeleton";
    li.innerHTML = `
      <div class="news-card skeleton">
        <div class="news-card-img-container">
          <div class="skeleton-box img"></div>
        </div>
        <div class="news-card-body">
          <h2 class="skeleton-box title"></h2>
          <p class="skeleton-box line"></p>
          <p class="skeleton-box line short"></p>
          <div class="news-card-footer">
            <span class="skeleton-box chip"></span>
            <span class="skeleton-box chip"></span>
            <span class="skeleton-box chip"></span>
          </div>
        </div>
      </div>
    `;
    target.appendChild(li);
  }
}

function renderNewsError(target) {
  target.innerHTML = `<li class="news-error">Failed to load news. Please retry.</li>`;
}