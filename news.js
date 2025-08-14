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
  <div style="
    width: 340px;
    border-radius: 14px;
    overflow: hidden;
    background: #232946;
    box-shadow: 0 8px 24px rgba(0,0,0,0.18);
    font-family: 'Poppins', Arial, sans-serif;
    transition: box-shadow 0.2s;
    cursor: pointer;
    margin-bottom: 10px;
    border: 1px solid #eebbc3;
  "
  onmouseover="this.style.boxShadow='0 12px 32px rgba(0,0,0,0.28)';"
  onmouseout="this.style.boxShadow='0 8px 24px rgba(0,0,0,0.18)';">
    <div style="height: 160px; background: #eebbc3;">
      <img src="${
        thumbnail || fallbackImg
      }" alt="News" style="width:100%;height:100%;object-fit:cover;">
    </div>
    <div style="padding: 18px;">
      <h2 style="margin:0 0 10px 0;font-size:18px;color:#eebbc3;">${title}</h2>
      <p style="margin:0 0 12px 0;font-size:13px;color:#b8c1ec;">${cleanDesc}</p>
      <div style="display:flex;justify-content:space-between;align-items:center;font-size:12px;">
        <span style="color:#eebbc3;font-weight:500;">${source}</span>
        <span style="color:#b8c1ec;">${formattedDate}</span>
      </div>
    </div>
  </div>
  `;
}
