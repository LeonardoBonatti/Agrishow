document.addEventListener('DOMContentLoaded', () => {
  
  // Elements
  const searchInput = document.getElementById('searchInput');
  const clearSearchBtn = document.getElementById('clearSearch');
  const autocompleteResults = document.getElementById('autocompleteResults');
  const machineList = document.getElementById('machineList');
  const resultsInfo = document.getElementById('resultsInfo');
  const chipsContainer = document.getElementById('chipsContainer');
  const modalOverlay = document.getElementById('machineDetailModal');
  const closeModalBtn = document.getElementById('closeModalBtn');
  const modalBody = document.getElementById('modalBody');

  // State
  let currentFilter = 'all';
  let searchTerm = '';

  // Initial render
  generateChips(maquinasMock);
  renderMachines(maquinasMock);

  // --- Search & Autocomplete Event Listeners ---
  searchInput.addEventListener('input', (e) => {
    searchTerm = e.target.value.trim().toLowerCase();
    
    if (searchTerm.length > 0) {
      clearSearchBtn.classList.remove('hidden');
      if (searchTerm.length >= 2) {
        showAutocomplete(searchTerm);
      } else {
        autocompleteResults.classList.add('hidden');
      }
    } else {
      clearSearchBtn.classList.add('hidden');
      autocompleteResults.classList.add('hidden');
    }
    
    // Apply filter on the fly
    applyFilters();
  });

  clearSearchBtn.addEventListener('click', () => {
    searchInput.value = '';
    searchTerm = '';
    clearSearchBtn.classList.add('hidden');
    autocompleteResults.classList.add('hidden');
    applyFilters();
  });

  // --- Dynamic Filtering Chips ---
  function generateChips(machines) {
    const families = new Set(machines.map(m => m.familia));
    const sortedFamilies = Array.from(families).sort();
    
    sortedFamilies.forEach(family => {
      if(family && family !== 'Outros') {
        const btn = document.createElement('button');
        btn.className = 'chip';
        btn.setAttribute('data-filter', family);
        btn.textContent = family;
        chipsContainer.appendChild(btn);
      }
    });
  }

  // --- Filtering ---
  chipsContainer.addEventListener('click', (e) => {
    if (e.target.classList.contains('chip')) {
      // Remove active class from all
      chipsContainer.querySelectorAll('.chip').forEach(c => c.classList.remove('active'));
      // Add active class to clicked
      e.target.classList.add('active');
      // Update state
      currentFilter = e.target.getAttribute('data-filter');
      applyFilters();
    }
  });

  function applyFilters() {
    let filtered = maquinasMock;

    // Filter by family
    if (currentFilter !== 'all') {
      filtered = filtered.filter(m => m.familia === currentFilter);
    }

    // Filter by search term
    if (searchTerm) {
      const searchWords = searchTerm.split(' ').filter(w => w.length > 0);
      filtered = filtered.filter(m => {
        const fullString = `${m.nome} ${m.modelo} ${m.codigo} ${m.familia}`.toLowerCase();
        // Return true if EVERY typed word exists in the full string
        return searchWords.every(word => fullString.includes(word));
      });
    }

    // Update info text
    if (currentFilter === 'all' && !searchTerm) {
      resultsInfo.textContent = `Exibindo todas as máquinas (${filtered.length})`;
    } else {
      resultsInfo.textContent = `${filtered.length} resultado(s) encontrado(s)`;
    }

    renderMachines(filtered);
  }

  // --- Render logic ---
  function renderMachines(machines) {
    machineList.innerHTML = '';

    if (machines.length === 0) {
      machineList.innerHTML = `
        <div class="empty-state">
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg>
          <h3>Nenhuma máquina encontrada</h3>
          <p>Tente ajustar os filtros ou o termo de busca.</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    machines.forEach(machine => {
      const card = document.createElement('article');
      card.className = 'machine-card';
      // Open modal when the whole card is clicked
      card.addEventListener('click', () => openModal(machine));

      card.innerHTML = `
        <div class="mc-img-box">
          <img src="${machine.imagem}" alt="${machine.nome} ${machine.modelo}" loading="lazy">
          <div class="mc-badges">
            <span class="badge">${machine.familia}</span>
          </div>
        </div>
        <div class="mc-content">
          <div class="mc-title-row">
            <div>
              <h2 class="mc-title">${machine.nome} <br/>${machine.modelo}</h2>
              <div class="mc-code">Cód: ${machine.codigo}</div>
            </div>
          </div>
          <div class="mc-stripe"></div>
          <div class="mc-details-grid">
            <div class="mc-detail-item">
              <span class="mcd-label">Indústria</span>
              <span class="mcd-val">${machine.detalhes && machine.detalhes['Industria'] ? machine.detalhes['Industria'] : '-'}</span>
            </div>
            <div class="mc-detail-item">
              <span class="mcd-label">Arranjo</span>
              <span class="mcd-val" title="${machine.detalhes && machine.detalhes['Arranjo'] ? machine.detalhes['Arranjo'] : ''}">${machine.detalhes && machine.detalhes['Arranjo'] ? String(machine.detalhes['Arranjo']).split(' ')[0] + '...' : '-'}</span>
            </div>
          </div>
          <div class="mc-action">
            <button class="btn-primary">Ver Ficha Técnica</button>
          </div>
        </div>
      `;
      fragment.appendChild(card);
    });

    machineList.appendChild(fragment);
  }

  // --- Autocomplete ---
  function showAutocomplete(term) {
    const searchWords = term.split(' ').filter(w => w.length > 0);
    const matches = maquinasMock.filter(m => {
      const fullString = `${m.nome} ${m.modelo} ${m.codigo}`.toLowerCase();
      return searchWords.every(word => fullString.includes(word));
    });

    autocompleteResults.innerHTML = '';
    
    if (matches.length > 0) {
      matches.slice(0, 5).forEach(m => {
        const item = document.createElement('div');
        item.className = 'autocomplete-item';
        item.innerHTML = `
          <div class="autocomplete-title">${m.nome} ${m.modelo}</div>
          <div class="autocomplete-subtitle">Cód: ${m.codigo} &bull; ${m.familia}</div>
        `;
        item.addEventListener('click', () => {
          searchInput.value = m.nome + ' ' + m.modelo;
          searchTerm = searchInput.value.toLowerCase();
          autocompleteResults.classList.add('hidden');
          applyFilters();
        });
        autocompleteResults.appendChild(item);
      });
      autocompleteResults.classList.remove('hidden');
    } else {
      autocompleteResults.classList.add('hidden');
    }
  }

  // Hide autocomplete when clicking outside
  document.addEventListener('click', (e) => {
    if (!e.target.closest('.search-section')) {
      autocompleteResults.classList.add('hidden');
    }
  });

  // --- Modal Logic ---
  function openModal(machine) {
    const commercialKeys = ['VALOR FEIRA', 'BORSO', 'Preço CPQ 14%', 'SPAR', 'Desconto Vigente PSC'];
    let techHtml = '';
    let currHtml = '';

    if (machine.detalhes) {
      Object.entries(machine.detalhes).forEach(([key, value]) => {
        if (value === undefined || value === '-' || value === null || String(value).trim() === '') return;
        
        let valStr = String(value);
        if (key.toLowerCase().includes('preço') || key.toLowerCase().includes('spar') || key.toLowerCase().includes('preco') || key.toUpperCase() === 'VALOR FEIRA' || key.toUpperCase() === 'BORSO' || key.toLowerCase().includes('acima')) {
          const num = parseFloat(value);
          if (!isNaN(num)) {
            valStr = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(num);
          }
        }

        if (key.toLowerCase().includes('desconto') || key.toLowerCase().includes('margem') || key.toLowerCase().includes('buydown')) {
          const num = parseFloat(value);
          if (!isNaN(num) && num < 10 && num > -10) { 
            valStr = num === 0 ? '0%' : (num * 100).toFixed(2).replace('.', ',') + '%';
          } else if (!isNaN(num)) {
            valStr = num + '%';
          }
        }

        const itemHtml = `
          <div class="modal-spec-item">
            <span class="spec-label">${key}</span>
            <div class="spec-value">${valStr}</div>
          </div>
        `;

        // Case-insensitive check to categorize the key
        const isCommercial = commercialKeys.some(cKey => cKey.toLowerCase() === key.toLowerCase()) ||
                             key.toLowerCase().includes('desconto') ||
                             key.toLowerCase().includes('margem') ||
                             key.toLowerCase().includes('3%') ||
                             key.toLowerCase().includes('acima') ||
                             key.toLowerCase().includes('buydown') ||
                             key.toLowerCase().includes('preço') ||
                             key.toLowerCase().includes('preco') ||
                             key.toLowerCase().includes('martelo');

        if (isCommercial) {
          currHtml += itemHtml;
        } else {
          techHtml += itemHtml;
        }
      });
    }

    if (!currHtml) {
      currHtml = `<div class="empty-state" style="padding: 1rem 0;"><h3>Valores não disponíveis</h3></div>`;
    }

    modalBody.innerHTML = `
      <div class="modal-hero">
        <img src="${machine.imagem}" alt="${machine.nome}">
      </div>
      <div class="modal-info-panel">
        <div class="modal-header">
          <div class="mc-code" style="margin-bottom: 8px;">Cód: ${machine.codigo} &bull; ${machine.familia}</div>
          <h2 class="modal-title">${machine.nome} ${machine.modelo}</h2>
          <div class="mc-stripe" style="width: 60px;"></div>
        </div>
        
        <div class="modal-tabs">
          <button class="modal-tab-btn active" data-target="tab-tech">Ficha Técnica</button>
          <button class="modal-tab-btn" data-target="tab-com">Valores & Condições</button>
          <button class="modal-tab-btn" data-target="tab-cdc">Banco CAT</button>
        </div>

        <div id="tab-tech" class="modal-tab-content active">
          <div class="modal-spec-list">
            <div class="modal-spec-item">
              <span class="spec-label">Modelo</span>
              <div class="spec-value">${machine.modelo}</div>
            </div>
            <div class="modal-spec-item">
              <span class="spec-label">Material</span>
              <div class="spec-value">${machine.codigo}</div>
            </div>
            ${techHtml}
          </div>
        </div>

        <div id="tab-com" class="modal-tab-content">
          <div class="modal-spec-list">
            ${currHtml}
          </div>
        </div>

        <div id="tab-cdc" class="modal-tab-content">
          <div style="padding: 1rem 0;">
            <style>
            .fin-t-wrap { margin-bottom: 20px; border-radius: 8px; border: 1px solid #e2e8f0; overflow: hidden; font-family: 'Inter', sans-serif; }
            .fin-t-head { background: #FFCC09; color: #111; text-align: center; font-weight: 700; padding: 10px; font-size: 0.95rem; margin: 0; }
            .fin-tbl { width: 100%; border-collapse: collapse; text-align: center; }
            .fin-tbl th { background: #f8fafc; color: #475569; font-size: 0.75rem; padding: 8px; font-weight: 600; border-bottom: 2px solid #e2e8f0; }
            .fin-tbl td { padding: 8px; font-size: 0.85rem; color: #334155; border-bottom: 1px solid #f1f5f9; }
            .fin-tbl tr:last-child td { border-bottom: none; }
            .fin-term { font-weight: 700; color: #0f172a; background: #f8fafc; border-right: 1px solid #e2e8f0; vertical-align: middle; }
            </style>

            <div class="fin-t-wrap">
              <h4 class="fin-t-head">CDC - BD 2,5%</h4>
              <table class="fin-tbl">
                <thead><tr><th>Meses</th><th>Entrada</th><th>Taxa (a.m.)</th></tr></thead>
                <tbody>
                  <tr><td rowspan="3" class="fin-term">12</td><td>10%</td><td>0,859%</td></tr><tr><td>20%</td><td>0,803%</td></tr><tr><td>30%</td><td>0,730%</td></tr>
                  <tr><td rowspan="3" class="fin-term">24</td><td>10%</td><td>1,083%</td></tr><tr><td>20%</td><td>1,053%</td></tr><tr><td>30%</td><td>1,014%</td></tr>
                  <tr><td rowspan="3" class="fin-term">36</td><td>10%</td><td>1,156%</td></tr><tr><td>20%</td><td>1,135%</td></tr><tr><td>30%</td><td>1,108%</td></tr>
                  <tr><td rowspan="3" class="fin-term">48</td><td>10%</td><td>1,195%</td></tr><tr><td>20%</td><td>1,179%</td></tr><tr><td>30%</td><td>1,158%</td></tr>
                </tbody>
              </table>
            </div>

            <div class="fin-t-wrap">
              <h4 class="fin-t-head">CDC - BD 5,0%</h4>
              <table class="fin-tbl">
                <thead><tr><th>Meses</th><th>Entrada</th><th>Taxa (a.m.)</th></tr></thead>
                <tbody>
                  <tr><td rowspan="3" class="fin-term">12</td><td>10%</td><td>0,405%</td></tr><tr><td>20%</td><td>0,290%</td></tr><tr><td>30%</td><td>0,142%</td></tr>
                  <tr><td rowspan="3" class="fin-term">24</td><td>10%</td><td>0,840%</td></tr><tr><td>20%</td><td>0,778%</td></tr><tr><td>30%</td><td>0,699%</td></tr>
                  <tr><td rowspan="3" class="fin-term">36</td><td>10%</td><td>0,987%</td></tr><tr><td>20%</td><td>0,944%</td></tr><tr><td>30%</td><td>0,889%</td></tr>
                  <tr><td rowspan="3" class="fin-term">48</td><td>10%</td><td>1,064%</td></tr><tr><td>20%</td><td>1,031%</td></tr><tr><td>30%</td><td>0,988%</td></tr>
                </tbody>
              </table>
            </div>

            <div class="fin-t-wrap">
              <h4 class="fin-t-head">FINAME - BD 2,5%</h4>
              <table class="fin-tbl">
                <thead><tr><th>Meses</th><th>Entrada</th><th>Taxa (a.m.)</th></tr></thead>
                <tbody>
                  <tr><td rowspan="3" class="fin-term">12</td><td>10%</td><td>0,869%</td></tr><tr><td>20%</td><td>0,863%</td></tr><tr><td>30%</td><td>0,861%</td></tr>
                  <tr><td rowspan="3" class="fin-term">24</td><td>10%</td><td>0,987%</td></tr><tr><td>20%</td><td>0,883%</td></tr><tr><td>30%</td><td>0,863%</td></tr>
                  <tr><td rowspan="3" class="fin-term">36</td><td>10%</td><td>0,977%</td></tr><tr><td>20%</td><td>0,949%</td></tr><tr><td>30%</td><td>0,923%</td></tr>
                  <tr><td rowspan="3" class="fin-term">48</td><td>10%</td><td>0,999%</td></tr><tr><td>20%</td><td>0,984%</td></tr><tr><td>30%</td><td>0,963%</td></tr>
                </tbody>
              </table>
            </div>

          </div>
        </div>
        
        <div style="margin-top: 2rem;">
            <button class="btn-primary" style="background-color: var(--black); color: var(--white);" onclick="alert('Funcionalidade de contato/reserva não implementada.')">
              Solicitar Contato
            </button>
        </div>
      </div>
    `;

    // Tab switching logic
    const tabBtns = modalBody.querySelectorAll('.modal-tab-btn');
    const tabContents = modalBody.querySelectorAll('.modal-tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));
        
        btn.classList.add('active');
        const targetId = btn.getAttribute('data-target');
        modalBody.querySelector('#' + targetId).classList.add('active');
      });
    });

    modalOverlay.classList.remove('hidden');
    // Prevent background scrolling
    document.body.style.overflow = 'hidden';
  }

  closeModalBtn.addEventListener('click', () => {
    modalOverlay.classList.add('hidden');
    document.body.style.overflow = '';
  });

  // --- FAKE LOGIN SYSTEM ---
  const loginOverlay = document.getElementById('loginOverlay');
  const fakeLoginForm = document.getElementById('fakeLoginForm');
  
  if (loginOverlay && fakeLoginForm) {
    if (localStorage.getItem('sotreq_auth_token')) {
      loginOverlay.classList.add('hidden');
      document.body.style.overflow = '';
    } else {
      document.body.style.overflow = 'hidden';
    }

    fakeLoginForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const btn = document.querySelector('.login-btn');
      btn.textContent = 'Autenticando...';
      btn.style.opacity = '0.8';

      setTimeout(() => {
          localStorage.setItem('sotreq_auth_token', 'true');
          loginOverlay.classList.add('hidden');
          document.body.style.overflow = '';
      }, 800);
    });
  }

});
