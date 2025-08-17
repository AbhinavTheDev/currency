export function getNews() {
  fetch(
    "https://api.rss2json.com/v1/api.json?rss_url=" +
      encodeURIComponent(
        "https://feeds.bbci.co.uk/news/business/economy/rss.xml"
      )
  )
    .then((res) => res.json())
    .then((data) => {
      const newsList = document.getElementById("newsList");
      newsList.innerHTML = ""; // Clear previous news items
      data.items.forEach((item) => {
        const li = document.createElement("li");
        // Clean the title by removing the source part after " - "
        const cleanedTitle = item.title.split(" - ")[0];
        li.innerHTML = `<a href="${item.link}" target="_blank" rel="noopener noreferrer">${createNewsCard(
          item.thumbnail,
          cleanedTitle,
          item.description,
          item.pubDate,
          item.author || "News"
        )}</a>`;
        newsList.appendChild(li);
      });
    })
    .catch((err) => console.error("Error:", err));
}

function createNewsCard(thumbnail, title, description, date, source = "News") {
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
      <img src="${
        thumbnail || fallbackImg
      }" alt="News" class="news-card-img">
    </div>
    <div class="news-card-body">
      <h2 class="news-card-title">${title}</h2>
      <p class="news-card-desc">${cleanDesc}</p>
      <div class="news-card-footer">
        <span class="news-card-source">${source}</span>
        <span class="news-card-date">${formattedDate}</span>
      </div>
    </div>
  </div>
  `;
}
