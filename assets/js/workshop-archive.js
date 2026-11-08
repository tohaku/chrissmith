(() => {
  const search = document.getElementById('archive-search');
  if (!search) return;

  const archive = search.closest('main');
  const buttons = [...archive.querySelectorAll('[data-filter]')];
  const results = archive.querySelector('.workshop-results');
  const empty = archive.querySelector('#archive-empty');
  const years = [...archive.querySelectorAll('.workshop-year')].map(element => ({
    element,
    rows: [...element.querySelectorAll('.workshop-row')].map(row => ({
      element: row,
      categories: row.dataset.categories.split('|'),
      searchText: row.dataset.search,
    })),
  }));
  let category = '';

  function render() {
    const query = search.value.trim().toLowerCase();
    let count = 0;

    for (const year of years) {
      let yearCount = 0;
      for (const row of year.rows) {
        const visible = (!category || row.categories.includes(category)) && row.searchText.includes(query);
        row.element.hidden = !visible;
        if (visible) yearCount++;
      }
      year.element.hidden = yearCount === 0;
      count += yearCount;
    }

    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    results.textContent = `${count} ${count === 1 ? 'post' : 'posts'}`;
    empty.hidden = count > 0;
  }

  buttons.forEach(button => button.addEventListener('click', () => {
    category = button.dataset.filter;
    render();
  }));
  search.addEventListener('input', render);
  render(); // Include any search value restored by the browser.
})();
