(() => {
  const search = document.getElementById('archive-search');
  if (!search) return;
  const buttons = [...document.querySelectorAll('[data-filter]')];
  const rows = [...document.querySelectorAll('.workshop-row')];
  let category = '';
  function render() {
    const query = search.value.trim().toLocaleLowerCase();
    let count = 0;
    for (const row of rows) {
      const visible = (!category || row.dataset.categories.split('|').includes(category)) && row.dataset.search.includes(query);
      row.hidden = !visible;
      if (visible) count++;
    }
    document.querySelectorAll('.workshop-year').forEach(year => {
      year.hidden = !year.querySelector('.workshop-row:not([hidden])');
    });
    buttons.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === category)));
    document.querySelector('.workshop-results').textContent = `${count} ${count === 1 ? 'post' : 'posts'}`;
    document.getElementById('archive-empty').hidden = count > 0;
  }
  buttons.forEach(button => button.addEventListener('click', () => { category = button.dataset.filter; render(); }));
  search.addEventListener('input', render);
})();
