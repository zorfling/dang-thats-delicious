import axios from 'axios';
import dompurify from 'dompurify';

function searchResultsHTML(stores) {
  return stores
    .map(
      store => `
      <a href="/store/${store.slug}" class="search__result">
        <strong>${store.name}</strong>
      </a>
    `
    )
    .join('');
}

function typeAhead(search) {
  if (!search) return;

  const searchInput = search.querySelector('input[name="search"]');
  const searchResults = search.querySelector('.search__results');

  searchInput.on('input', function () {
    // if there's no value, hide typeaheads
    if (!this.value) {
      searchResults.style.display = 'none';
      return;
    }

    // show the search results
    searchResults.style.display = 'block';
    searchResults.innerHTML = '';

    axios
      .get(`/api/search/?q=${this.value}`)
      .then((res) => {
        if (res.data.length) {
          searchResults.innerHTML = dompurify.sanitize(searchResultsHTML(res.data));
          return;
        }
        // tell them nothing came back
        searchResults.innerHTML = dompurify.sanitize(
          `<div class="search__result">No results for ${this.value}</div>`
        );
      })
      .catch((err) => {
        console.error(err);
      });
  });

  // handle key events
  searchInput.on('keyup', (e) => {
    const downKey = 40;
    const upKey = 38;
    const enterKey = 13;
    // if they aren't pressing up down or enter
    if (![upKey, downKey, enterKey].includes(e.keyCode)) {
      return;
    }

    const activeClass = 'search__result--active';
    const current = search.querySelector(`.${activeClass}`);
    const items = search.querySelectorAll('.search__result');
    let next;
    if (e.keyCode === downKey && current) {
      next = current.nextElementSibling || items[0];
    } else if (e.keyCode === downKey) {
      next = items[0];
    } else if (e.keyCode === upKey && current) {
      next = current.previousElementSibling || items[items.length - 1];
    } else if (e.keyCode === upKey) {
      next = items[items.length - 1];
    } else if (e.keyCode === enterKey && current.href) {
      window.location = current.href;
    }

    if (current) {
      current.classList.remove(activeClass);
    }
    next.classList.add(activeClass);
  });
}

export default typeAhead;
