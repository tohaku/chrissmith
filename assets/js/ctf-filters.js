(() => {
  const browser = document.getElementById('ctf-browser');
  if (!browser) return;

  const form = browser.querySelector('form');
  const controls = [...form.querySelectorAll('select')];
  const results = browser.querySelector('.workshop-results');
  const empty = browser.querySelector('.ctf-empty');
  const cards = [...browser.querySelectorAll('.ctf-writeup-card')].map(element => ({
    element,
    difficulty: element.dataset.difficulty,
    platform: element.dataset.platform,
    topics: JSON.parse(element.dataset.topics),
  }));

  function render() {
    const { difficulty, platform, topic } = Object.fromEntries(controls.map(control => [control.name, control.value]));
    let count = 0;
    for (const card of cards) {
      const visible = (!difficulty || card.difficulty === difficulty)
        && (!platform || card.platform === platform)
        && (!topic || card.topics.includes(topic));
      card.element.hidden = !visible;
      if (visible) count++;
    }
    const selected = controls.filter(control => control.value).map(control => control.selectedOptions[0].textContent);
    results.textContent = `${count} ${count === 1 ? 'writeup' : 'writeups'}${selected.length ? ' · ' + selected.join(' · ') : ''}`;
    empty.hidden = count > 0;
  }

  function restore() {
    const params = new URLSearchParams(location.search);
    controls.forEach(control => {
      const value = (params.get(control.name) || '').toLowerCase();
      control.value = [...control.options].some(option => option.value === value) ? value : '';
    });
    render();
  }

  function update() {
    render();
    const url = new URL(location.href);
    controls.forEach(control => {
      if (control.value) url.searchParams.set(control.name, control.value);
      else url.searchParams.delete(control.name);
    });
    history.replaceState(null, '', url);
  }

  form.addEventListener('change', update);
  form.addEventListener('submit', event => event.preventDefault());
  form.addEventListener('reset', event => {
    event.preventDefault();
    controls.forEach(control => { control.value = ''; });
    update();
  });
  window.addEventListener('popstate', restore);
  restore();
  form.hidden = false;
})();
