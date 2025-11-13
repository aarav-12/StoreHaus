// assets/recommend.js

async function fetchRecommendations(cart, catalog) {
  try {
    const res = await fetch('http://localhost:5000/recommend', {
      method: 'POST',
      headers: {'Content-Type': 'application/json'},
      body: JSON.stringify({ cart, catalog })
    });
    return await res.json();
  } catch (e) {
    console.error('Recommend fetch error', e);
    return { error: 'Network' };
  }
}

function renderRecommendations(container, suggestions) {
  if (!suggestions || suggestions.length === 0) {
    container.innerHTML = '<p>No suggestions.</p>';
    return;
  }
  container.innerHTML = `
    <div class="ai-suggest-row">
      ${suggestions.map(s => {
        const imgSrc = s.image && s.image.trim() ? s.image : '/assets/placeholder.png';
        console.log('Suggestion image:', imgSrc); // Debugging line
        return `
          <div class="card ai-suggest-vertical">
            <div class="card__media">
              <img src="${imgSrc}" alt="${s.title}" class="card__img"/>
            </div>
            <div class="card__content">
              <h4 class="card__title">${s.title}</h4>
              <p class="card__text">${s.reason}</p>
              <a href="${s.handle ? '/products/' + s.handle : '#'}" class="card__btn">View</a>
            </div>
          </div>
        `;
      }).join('')}
    </div>
  `;
}

async function initRecommend() {
  const container = document.getElementById('ai-recommendations');
  if (!container) return;
  // Fetch cart data from Shopify API
  const cartRes = await fetch('/cart.js');
  const cart = await cartRes.json();
  let catalog = null;
const catalogElement = document.getElementById('ProductCatalogJSON');
if (catalogElement) {
    try {
     
    catalog = JSON.parse(catalogElement.textContent);
  } catch (e) {
    console.error('Catalog JSON parse error', e);
  }
}
  const result = await fetchRecommendations(cart, catalog);
  console.log(result);
   console.log(catalogElement)
  if (result.error) {
    container.innerHTML = '<p>AI down</p>';
    return;
  }
  renderRecommendations(container, result.suggestions || []);
}

document.addEventListener('DOMContentLoaded', initRecommend);
