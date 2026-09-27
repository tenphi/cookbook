const smallScreen = matchMedia("(max-width: 40rem)");

function arrangePagination() {
  for (const pagination of document.querySelectorAll(".pagination-links")) {
    const previous = pagination.querySelector(':scope > a[rel="prev"]');
    const next = pagination.querySelector(':scope > a[rel="next"]');
    if (!previous || !next) continue;
    if (smallScreen.matches && pagination.firstElementChild !== next)
      previous.before(next);
    if (!smallScreen.matches && pagination.firstElementChild !== previous)
      next.before(previous);
  }
}

arrangePagination();
smallScreen.addEventListener("change", arrangePagination);
document.addEventListener("astro:page-load", arrangePagination);
