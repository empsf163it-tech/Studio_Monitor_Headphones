document.addEventListener('DOMContentLoaded', () => {
  document.querySelectorAll('[data-year]').forEach(el => el.textContent = new Date().getFullYear());
  const toggle = document.querySelector('.menu-toggle');
  const nav = document.querySelector('.main-nav');
  if (toggle && nav) toggle.addEventListener('click', () => {
    const open = nav.classList.toggle('open');
    toggle.setAttribute('aria-expanded', String(open));
    toggle.textContent = open ? '✕' : '☰';
  });

  const products = {
    m20x: {brand:'AUDIO-TECHNICA',name:'ATH-M20x',summary:'A straightforward wired option for studio monitoring.',type:'Closed-back',use:'Recording, podcasting',description:'A practical entry point for people setting up a basic recording or listening workflow.',image:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1100&q=85'},
    sony7506: {brand:'SONY',name:'MDR-7506',summary:'A familiar choice for recording and monitoring.',type:'Closed-back',use:'Recording, podcasting',description:'Often seen in recording and broadcast environments. Check the fit, cable arrangement, and sound character against your own needs.',image:'sony_mdr7506.jpg'},
    dt770: {brand:'BEYERDYNAMIC',name:'DT 770 PRO',summary:'Closed-back listening for studio sessions.',type:'Closed-back',use:'Recording, mixing',description:'Consider this style when you want isolation during recording. Check the exact impedance version and your audio source compatibility.',image:'https://images.unsplash.com/photo-1484704849700-f032a568e944?auto=format&fit=crop&w=1100&q=85'},
    m50x: {brand:'AUDIO-TECHNICA',name:'ATH-M50x',summary:'A versatile model for monitoring and everyday listening.',type:'Closed-back',use:'Recording, mixing',description:'A popular all-rounder to consider for studio monitoring and general listening. Compare fit, sound preferences, and included accessories.',image:'https://images.unsplash.com/photo-1546435770-a3e426bf472b?auto=format&fit=crop&w=1100&q=85'},
    hd560s: {brand:'SENNHEISER',name:'HD 560S',summary:'An open-back option for focused listening in a quiet room.',type:'Open-back',use:'Mixing',description:'Open-back headphones let sound travel in and out, so they are usually best in quiet environments rather than live recording situations.',image:'https://images.unsplash.com/photo-1487215078519-e21cc028cb29?auto=format&fit=crop&w=1100&q=85'},
    k371: {brand:'AKG',name:'K371',summary:'A foldable closed-back option for several workflows.',type:'Closed-back',use:'Recording, mixing, podcasting',description:'A closed-back model to consider across several uses. Check comfort, replacement-pad availability, and device compatibility.',image:'https://images.unsplash.com/photo-1590658268037-6bf12165a8df?auto=format&fit=crop&w=1100&q=85'}
  };
  const params = new URLSearchParams(window.location.search);
  const id = params.get('id');
  if (id && products[id] && document.getElementById('detail-name')) {
    const p = products[id];
    document.getElementById('detail-brand').textContent = p.brand;
    document.getElementById('detail-name').textContent = p.name;
    document.getElementById('detail-summary').textContent = p.summary;
    document.getElementById('detail-type').textContent = p.type;
    document.getElementById('detail-description').textContent = p.description;
    document.getElementById('detail-image').src = p.image;
    document.getElementById('detail-image').alt = p.name + ' headphones';
    document.title = p.name + ' — SonoVis';
  }

  const search = document.getElementById('product-search');
  const filter = document.getElementById('use-filter');
  const cards = [...document.querySelectorAll('.product-card')];
  const count = document.getElementById('result-count');
  const noResults = document.getElementById('no-results');
  function filterProducts() {
    if (!search || !filter) return;
    const term = search.value.trim().toLowerCase();
    const use = filter.value;
    let visible = 0;
    cards.forEach(card => {
      const matchesText = card.dataset.name.toLowerCase().includes(term);
      const matchesUse = use === 'all' || card.dataset.use.split(' ').includes(use);
      const show = matchesText && matchesUse;
      card.hidden = !show;
      if (show) visible++;
    });
    if (count) count.textContent = `Showing ${visible} of ${cards.length} example products`;
    if (noResults) noResults.hidden = visible !== 0;
    equalizeCardBaselines();
  }
  if (search) search.addEventListener('input', filterProducts);
  if (filter) filter.addEventListener('change', filterProducts);
  const useParam = params.get('use');
  if (useParam && filter) { filter.value = useParam; filterProducts(); }

  const selectA = document.getElementById('compare-a');
  const selectB = document.getElementById('compare-b');
  function updateCompare() {
    if (!selectA || !selectB) return;
    const a = products[selectA.value], b = products[selectB.value];
    document.getElementById('compare-name-a').textContent = a.name;
    document.getElementById('compare-name-b').textContent = b.name;
    document.getElementById('compare-type-a').textContent = a.type;
    document.getElementById('compare-type-b').textContent = b.type;
    document.querySelector('.compare-table tbody tr:nth-child(2) td:nth-child(2)').textContent = a.use;
    document.querySelector('.compare-table tbody tr:nth-child(2) td:nth-child(3)').textContent = b.use;
  }
  if (selectA && selectB) { selectA.addEventListener('change', updateCompare); selectB.addEventListener('change', updateCompare); updateCompare(); }

  // Dynamic baseline equalization for cards in rows
  function equalizeCardBaselines() {
    const cardGrids = document.querySelectorAll('.grid-3, .grid-4, .grid-2, .purpose-grid, .product-grid, .contact-info-cards');

    cardGrids.forEach(grid => {
      const cards = Array.from(grid.children).filter(el => 
        el.classList.contains('info-card') || 
        el.classList.contains('product-card') || 
        el.classList.contains('purpose-card')
      );
      if (cards.length < 2) return;

      // Reset inline min-heights first to measure natural content heights
      cards.forEach(card => {
        const h = card.querySelector('h3');
        if (h) h.style.minHeight = '';
        const p = card.querySelector('p:not(.product-kicker):not(.eyebrow)');
        if (p) p.style.minHeight = '';
      });

      // Check if cards are laid out side-by-side
      const visibleCards = cards.filter(c => !c.hidden);
      if (visibleCards.length < 2) return;
      if (Math.abs(visibleCards[0].offsetLeft - visibleCards[1].offsetLeft) < 10) {
        // Single column layout on mobile
        return;
      }

      // Group cards into rows by vertical offset
      const rows = new Map();
      visibleCards.forEach(card => {
        const rowKey = Math.round(card.offsetTop / 10) * 10;
        if (!rows.has(rowKey)) rows.set(rowKey, []);
        rows.get(rowKey).push(card);
      });

      // Equalize each row's heading heights so subtexts start at the exact same baseline
      rows.forEach(rowCards => {
        if (rowCards.length < 2) return;

        const headings = rowCards.map(c => c.querySelector('h3')).filter(Boolean);
        let maxHeadingH = 0;
        headings.forEach(h => {
          const hH = h.offsetHeight;
          if (hH > maxHeadingH) maxHeadingH = hH;
        });

        if (maxHeadingH > 0) {
          headings.forEach(h => {
            h.style.minHeight = `${maxHeadingH}px`;
          });
        }
      });
    });
  }

  equalizeCardBaselines();
  window.addEventListener('load', equalizeCardBaselines);
  if (document.fonts && document.fonts.ready) {
    document.fonts.ready.then(equalizeCardBaselines);
  }

  let resizeTimeout;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimeout);
    resizeTimeout = setTimeout(equalizeCardBaselines, 80);
  });
});