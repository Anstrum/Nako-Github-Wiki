/**
 * NAKO // PROJECT VAULT & OWL ARCHIVES
 * Moteur JavaScript natif (Zéro dépendance)
 * Gestion du JSON, filtres par toggles catégorisés, recherche, thème et modals
 */

(() => {
  'use strict';

  // État de l'application
  const state = {
    projects: [],
    filters: {
      search: '',
      status: 'all',
      ai: 'all',
      collaboration: 'all',
      technology: 'all'
    },
    theme: localStorage.getItem('nako-theme') || 'dark',
    selectedProject: null
  };

  // Libellés d'affichage
  const STATUS_CONFIG = {
    'in-progress': { label: 'En cours', icon: '🚀', class: 'status-in-progress' },
    'completed': { label: 'Terminé', icon: '✅', class: 'status-completed' },
    'paused': { label: 'En pause', icon: '⏸️', class: 'status-paused' },
    'idea': { label: 'Idée / Prévu', icon: '💡', class: 'status-idea' }
  };

  const AI_CONFIG = {
    'none': { label: 'Sans IA', icon: '🚫', class: 'card-ai-none', desc: '100% fait main' },
    'research': { label: 'IA Veille & Idées', icon: '💡', class: 'card-ai-research', desc: 'Idéation & documentation' },
    'assisted-code': { label: 'IA Code partiel', icon: '⚡', class: 'card-ai-assisted-code', desc: 'Copilot / complétion ciblée' },
    'full': { label: 'IA Code complet', icon: '🤖', class: 'card-ai-full', desc: 'Génération intégrale' }
  };

  const COLLAB_CONFIG = {
    'solo': { label: 'Solo', icon: '👤' },
    'team': { label: 'En équipe', icon: '👥' }
  };

  // Éléments du DOM
  const elements = {
    themeToggleBtn: document.getElementById('theme-toggle-btn'),
    themeIcon: document.getElementById('theme-icon'),
    searchInput: document.getElementById('search-input'),
    resetFiltersBtn: document.getElementById('reset-filters-btn'),
    resultsCount: document.getElementById('results-count'),
    projectsGrid: document.getElementById('projects-grid'),
    
    // KPI counters
    kpiTotal: document.getElementById('kpi-total'),
    kpiInProgress: document.getElementById('kpi-in-progress'),
    kpiCompleted: document.getElementById('kpi-completed'),
    
    // Toggle lists containers
    togglesStatus: document.getElementById('toggles-status'),
    togglesAi: document.getElementById('toggles-ai'),
    togglesCollab: document.getElementById('toggles-collab'),
    togglesTech: document.getElementById('toggles-tech'),

    // Modals
    detailModal: document.getElementById('detail-modal'),
    detailModalClose: document.getElementById('detail-modal-close'),
    detailModalContent: document.getElementById('detail-modal-content'),
    
    newProjectModal: document.getElementById('new-project-modal'),
    openNewProjectBtn: document.getElementById('open-new-project-btn'),
    newProjectModalClose: document.getElementById('new-project-modal-close'),
    jsonGeneratorForm: document.getElementById('json-generator-form'),
    jsonOutputPreview: document.getElementById('json-output-preview'),
    copyJsonBtn: document.getElementById('copy-json-btn')
  };

  // Initialisation
  document.addEventListener('DOMContentLoaded', init);

  async function init() {
    applyTheme(state.theme);
    setupEventListeners();
    await loadProjectsData();
  }

  // Application du thème Dark/Light
  function applyTheme(theme) {
    state.theme = theme;
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('nako-theme', theme);
    if (elements.themeIcon) {
      elements.themeIcon.textContent = theme === 'dark' ? '🌙' : '☀️';
    }
  }

  function toggleTheme() {
    const nextTheme = state.theme === 'dark' ? 'light' : 'dark';
    applyTheme(nextTheme);
  }

  // Chargement des données JSON
  async function loadProjectsData() {
    try {
      const response = await fetch('projects.json');
      if (!response.ok) throw new Error('Impossible de charger projects.json');
      state.projects = await response.json();
      
      updateKpis();
      buildToggleFilters();
      renderProjects();
    } catch (err) {
      console.error('Erreur chargement projets:', err);
      if (elements.projectsGrid) {
        elements.projectsGrid.innerHTML = `
          <div class="empty-state">
            <div class="empty-state-icon">⚠️</div>
            <h3 class="empty-state-title">Erreur de chargement des données</h3>
            <p class="empty-state-desc">Le fichier <code>projects.json</code> n'a pas pu être lu. Vérifiez son format ou rechargez la page.</p>
          </div>
        `;
      }
    }
  }

  // Mise à jour des KPIs dans le Hero
  function updateKpis() {
    const total = state.projects.length;
    const inProgress = state.projects.filter(p => p.status === 'in-progress').length;
    const completed = state.projects.filter(p => p.status === 'completed').length;

    if (elements.kpiTotal) elements.kpiTotal.textContent = total;
    if (elements.kpiInProgress) elements.kpiInProgress.textContent = inProgress;
    if (elements.kpiCompleted) elements.kpiCompleted.textContent = completed;
  }

  // Construction des Toggles catégorisés
  function buildToggleFilters() {
    // 1. Toggles Statut
    renderCategoryToggles(elements.togglesStatus, 'status', [
      { key: 'all', label: 'Tous', icon: '✦' },
      { key: 'in-progress', label: 'En cours', icon: '🚀' },
      { key: 'completed', label: 'Terminé', icon: '✅' },
      { key: 'paused', label: 'En pause', icon: '⏸️' },
      { key: 'idea', label: 'Idée / Prévu', icon: '💡' }
    ]);

    // 2. Toggles IA
    renderCategoryToggles(elements.togglesAi, 'ai', [
      { key: 'all', label: 'Tous', icon: '✦' },
      { key: 'none', label: 'Sans IA', icon: '🚫' },
      { key: 'research', label: 'Aide & Veille', icon: '💡' },
      { key: 'assisted-code', label: 'Code partiel', icon: '⚡' },
      { key: 'full', label: 'Complet', icon: '🤖' }
    ]);

    // 3. Toggles Collaboration
    renderCategoryToggles(elements.togglesCollab, 'collaboration', [
      { key: 'all', label: 'Tous', icon: '✦' },
      { key: 'solo', label: 'Solo', icon: '👤' },
      { key: 'team', label: 'En équipe', icon: '👥' }
    ]);

    // 4. Toggles Technologies (dynamique selon ce qui est dans projects.json)
    const techCounts = {};
    state.projects.forEach(p => {
      (p.technologies || []).forEach(t => {
        techCounts[t] = (techCounts[t] || 0) + 1;
      });
    });

    const sortedTechs = Object.entries(techCounts)
      .sort((a, b) => b[1] - a[1])
      .map(([tech, count]) => ({ key: tech, label: tech, count }));

    renderCategoryToggles(elements.togglesTech, 'technology', [
      { key: 'all', label: 'Tous', icon: '✦' },
      ...sortedTechs
    ]);
  }

  function renderCategoryToggles(container, categoryKey, items) {
    if (!container) return;
    container.innerHTML = '';

    items.forEach(item => {
      const btn = document.createElement('button');
      btn.className = `toggle-btn ${state.filters[categoryKey] === item.key ? 'active' : ''}`;
      btn.dataset.category = categoryKey;
      btn.dataset.value = item.key;

      const count = item.count !== undefined 
        ? item.count 
        : (item.key === 'all' 
            ? state.projects.length 
            : state.projects.filter(p => {
                if (categoryKey === 'status') return p.status === item.key;
                if (categoryKey === 'ai') return p.ai_usage === item.key;
                if (categoryKey === 'collaboration') return p.collaboration === item.key;
                return false;
              }).length);

      btn.innerHTML = `
        <span>${item.icon || ''} ${item.label}</span>
        <span class="badge-count">${count}</span>
      `;

      btn.addEventListener('click', () => {
        handleToggleClick(categoryKey, item.key);
      });

      container.appendChild(btn);
    });
  }

  function handleToggleClick(categoryKey, value) {
    // Si on reclique sur le même, on revient à 'all'
    if (state.filters[categoryKey] === value && value !== 'all') {
      state.filters[categoryKey] = 'all';
    } else {
      state.filters[categoryKey] = value;
    }
    updateTogglesVisualState();
    renderProjects();
  }

  function updateTogglesVisualState() {
    ['status', 'ai', 'collaboration', 'technology'].forEach(cat => {
      const container = getContainerForCategory(cat);
      if (!container) return;
      const btns = container.querySelectorAll('.toggle-btn');
      btns.forEach(btn => {
        if (btn.dataset.value === state.filters[cat]) {
          btn.classList.add('active');
        } else {
          btn.classList.remove('active');
        }
      });
    });
  }

  function getContainerForCategory(cat) {
    if (cat === 'status') return elements.togglesStatus;
    if (cat === 'ai') return elements.togglesAi;
    if (cat === 'collaboration') return elements.togglesCollab;
    if (cat === 'technology') return elements.togglesTech;
    return null;
  }

  // Filtrage des projets
  function getFilteredProjects() {
    return state.projects.filter(p => {
      // 1. Recherche texte (titre, tagline, description, technos)
      if (state.filters.search) {
        const q = state.filters.search.toLowerCase();
        const inTitle = (p.title || '').toLowerCase().includes(q);
        const inTagline = (p.tagline || '').toLowerCase().includes(q);
        const inDesc = (p.description || '').toLowerCase().includes(q);
        const inTech = (p.technologies || []).some(t => t.toLowerCase().includes(q));
        if (!inTitle && !inTagline && !inDesc && !inTech) return false;
      }

      // 2. Filtre Statut
      if (state.filters.status !== 'all' && p.status !== state.filters.status) {
        return false;
      }

      // 3. Filtre IA
      if (state.filters.ai !== 'all' && p.ai_usage !== state.filters.ai) {
        return false;
      }

      // 4. Filtre Collaboration
      if (state.filters.collaboration !== 'all' && p.collaboration !== state.filters.collaboration) {
        return false;
      }

      // 5. Filtre Technologie
      if (state.filters.technology !== 'all' && !(p.technologies || []).includes(state.filters.technology)) {
        return false;
      }

      return true;
    });
  }

  // Rendu de la grille de projets
  function renderProjects() {
    if (!elements.projectsGrid) return;
    const filtered = getFilteredProjects();

    // Mise à jour du compteur de résultats
    if (elements.resultsCount) {
      elements.resultsCount.textContent = `Affichage de ${filtered.length} sur ${state.projects.length} projets`;
    }

    if (filtered.length === 0) {
      elements.projectsGrid.innerHTML = `
        <div class="empty-state">
          <div class="empty-state-icon">🔍</div>
          <h3 class="empty-state-title">Aucun projet ne correspond à vos filtres</h3>
          <p class="empty-state-desc">Essayez de réinitialiser la recherche ou de changer les toggles sélectionnés.</p>
          <button class="reset-filters-btn" id="inline-reset-btn">✕ Tout réinitialiser</button>
        </div>
      `;
      const inlineReset = document.getElementById('inline-reset-btn');
      if (inlineReset) inlineReset.addEventListener('click', resetAllFilters);
      return;
    }

    elements.projectsGrid.innerHTML = filtered.map(p => createProjectCardHtml(p)).join('');

    // Attachement des événements sur les cartes
    attachCardEvents();
  }

  function createProjectCardHtml(project) {
    const status = STATUS_CONFIG[project.status] || { label: project.status, icon: '📌', class: 'status-paused' };
    const ai = AI_CONFIG[project.ai_usage] || AI_CONFIG['none'];
    const collab = COLLAB_CONFIG[project.collaboration] || COLLAB_CONFIG['solo'];
    const version = project.version || 'v1.0';

    // Bannière image ou fallback graphique stylé
    const bannerHtml = project.image 
      ? `<img src="${project.image}" alt="${project.title}" class="card-banner-img" loading="lazy">`
      : `<div class="card-banner-fallback"><span>${project.title.slice(0, 2).toUpperCase()}</span></div>`;

    // Barre de progression (si en cours et < 100%)
    const progressHtml = (project.progress && project.progress < 100) ? `
      <div class="progress-container">
        <div class="progress-label-row">
          <span>Avancement</span>
          <span>${project.progress}%</span>
        </div>
        <div class="progress-track">
          <div class="progress-bar" style="width: ${project.progress}%"></div>
        </div>
      </div>
    ` : '';

    // Tags technologiques
    const techTagsHtml = (project.technologies || []).map(t => `
      <button class="tech-tag-btn" data-tech="${t}">${t}</button>
    `).join('');

    // Liens utiles
    const githubLink = project.links && project.links.github 
      ? `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="card-link-btn" title="Dépôt GitHub">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="currentColor"><path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/></svg>
          Code
        </a>`
      : '';

    const demoLink = project.links && project.links.demo
      ? `<a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="card-link-btn" title="Démo en ligne">
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path><polyline points="15 3 21 3 21 9"></polyline><line x1="10" y1="14" x2="21" y2="3"></line></svg>
          Démo
        </a>`
      : '';

    return `
      <article class="project-card" data-id="${project.id}">
        <div class="card-banner-wrap">
          ${bannerHtml}
          <div class="card-status-badge ${status.class}">
            <span>${status.icon}</span>
            <span>${status.label}</span>
          </div>
          <div class="card-top-right-meta">
            <span class="meta-pill">${version}</span>
            <span class="meta-pill">${collab.icon} ${collab.label}</span>
          </div>
        </div>

        <div class="card-body">
          <div class="card-header-meta">
            <span class="card-ai-badge ${ai.class}" title="${ai.desc}">
              <span>${ai.icon}</span>
              <span>${ai.label}</span>
            </span>
            <span>${project.dates ? project.dates.lastUpdate || '' : ''}</span>
          </div>

          <h3 class="card-title">${project.title}</h3>
          <p class="card-tagline">${project.tagline || ''}</p>
          ${project.detailed_progress && project.detailed_progress.current_milestone ? `
            <div class="card-milestone-pill" title="Jalon : ${project.detailed_progress.current_milestone}">
              <span>🎯</span>
              <span>${project.detailed_progress.current_milestone}</span>
            </div>
          ` : ''}

          ${progressHtml}

          <div class="card-tech-chips">
            ${techTagsHtml}
          </div>

          <div class="card-actions-row">
            ${githubLink}
            ${demoLink}
            <button class="card-details-btn" data-project-id="${project.id}">
              Détails ➔
            </button>
          </div>
        </div>
      </article>
    `;
  }

  function attachCardEvents() {
    // Clic sur bouton détails
    document.querySelectorAll('.card-details-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const pId = e.currentTarget.dataset.projectId;
        openProjectDetailModal(pId);
      });
    });

    // Clic sur tag techno pour filtrer directement
    document.querySelectorAll('.tech-tag-btn').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const tech = e.currentTarget.dataset.tech;
        state.filters.technology = tech;
        updateTogglesVisualState();
        renderProjects();
      });
    });
  }

  // Modal de détails
  function openProjectDetailModal(projectId) {
    const project = state.projects.find(p => p.id === projectId);
    if (!project || !elements.detailModal || !elements.detailModalContent) return;

    const status = STATUS_CONFIG[project.status] || { label: project.status, icon: '📌', class: 'status-paused' };
    const ai = AI_CONFIG[project.ai_usage] || AI_CONFIG['none'];
    const collab = COLLAB_CONFIG[project.collaboration] || COLLAB_CONFIG['solo'];

    const bannerHtml = project.image 
      ? `<img src="${project.image}" alt="${project.title}" class="modal-banner-img">`
      : '';

    const highlightsHtml = (project.highlights && project.highlights.length > 0) ? `
      <div>
        <h4 class="modal-section-title">Points Clés & Fonctionnalités</h4>
        <ul class="modal-highlights-list">
          ${project.highlights.map(h => `<li>${h}</li>`).join('')}
        </ul>
      </div>
    ` : '';

    const techChipsHtml = (project.technologies || []).map(t => `
      <span class="tech-chip">${t}</span>
    `).join('');

    elements.detailModalContent.innerHTML = `
      ${bannerHtml}
      
      <div style="display: flex; gap: 8px; flex-wrap: wrap;">
        <span class="card-status-badge ${status.class}" style="position: static;">
          ${status.icon} ${status.label}
        </span>
        <span class="badge-version">${project.version || 'v1.0'}</span>
        <span class="badge-version">${collab.icon} ${collab.label}</span>
        <span class="card-ai-badge ${ai.class}" style="padding: 4px 10px;">
          ${ai.icon} ${ai.label} (${ai.desc})
        </span>
      </div>

      <div>
        <h3 style="font-size: 1.4rem; font-weight: 800; margin-bottom: 6px;">${project.title}</h3>
        <p style="font-size: 0.95rem; color: var(--text-muted); font-style: italic;">${project.tagline || ''}</p>
      </div>

      <div>
        <h4 class="modal-section-title">Description Complète</h4>
        <p style="font-size: 0.92rem; line-height: 1.6; color: var(--text-secondary);">${project.description || 'Pas de description détaillée disponible.'}</p>
      </div>

      ${highlightsHtml}

      ${project.detailed_progress ? `
        <div class="modal-progress-breakdown">
          <h4 class="modal-section-title">📊 Point Précis sur l'Avancement</h4>
          <div class="progress-milestone-bar">
            <div class="milestone-current">
              <span class="milestone-label">Jalon actuel :</span>
              <strong class="milestone-value">${project.detailed_progress.current_milestone || 'En cours'}</strong>
            </div>
            ${project.detailed_progress.codebase_size ? `<div class="milestone-codebase">📦 ${project.detailed_progress.codebase_size}</div>` : ''}
          </div>

          <div class="progress-columns-grid">
            <div>
              <h5 class="progress-subhead">Ce qui est déjà implémenté</h5>
              <ul class="progress-checklist">
                ${(project.detailed_progress.implemented || []).map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
            <div>
              <h5 class="progress-subhead">Prochaines étapes (Feuille de route)</h5>
              <ul class="progress-nextlist">
                ${(project.detailed_progress.next_steps || []).map(item => `<li>${item}</li>`).join('')}
              </ul>
            </div>
          </div>
        </div>
      ` : ''}

      <div>
        <h4 class="modal-section-title">Technologies Utilisées</h4>
        <div style="display: flex; gap: 6px; flex-wrap: wrap;">
          ${techChipsHtml}
        </div>
      </div>

      <div style="display: flex; gap: 12px; margin-top: 10px; border-top: 1px solid var(--border-subtle); padding-top: 16px;">
        ${project.links?.github ? `<a href="${project.links.github}" target="_blank" rel="noopener noreferrer" class="action-btn-primary">Voir sur GitHub</a>` : ''}
        ${project.links?.demo ? `<a href="${project.links.demo}" target="_blank" rel="noopener noreferrer" class="action-btn-secondary">Tester la démo</a>` : ''}
      </div>
    `;

    elements.detailModal.classList.add('open');
  }

  function closeDetailModal() {
    if (elements.detailModal) elements.detailModal.classList.remove('open');
  }

  // Modal Générateur JSON
  function openNewProjectModal() {
    if (elements.newProjectModal) {
      elements.newProjectModal.classList.add('open');
      updateGeneratedJson();
    }
  }

  function closeNewProjectModal() {
    if (elements.newProjectModal) elements.newProjectModal.classList.remove('open');
  }

  function updateGeneratedJson() {
    if (!elements.jsonGeneratorForm || !elements.jsonOutputPreview) return;
    const form = elements.jsonGeneratorForm;

    const projectData = {
      id: (form.pTitle.value || 'nouveau-projet').toLowerCase().replace(/[^a-z0-9]/g, '-'),
      title: form.pTitle.value || 'Nouveau Projet',
      tagline: form.pTagline.value || "Phrase d'accroche résumant le projet.",
      version: form.pVersion.value || 'v1.0.0',
      status: form.pStatus.value,
      progress: parseInt(form.pProgress.value, 10) || 0,
      featured: false,
      flagship: false,
      collaboration: form.pCollab.value,
      ai_usage: form.pAi.value,
      image: form.pImage.value || '',
      description: form.pDesc.value || 'Description complète du projet...',
      technologies: (form.pTech.value || 'JavaScript, HTML, CSS').split(',').map(s => s.trim()).filter(Boolean),
      links: {
        github: form.pGithub.value || 'https://github.com/Anstrum',
        demo: form.pDemo.value || ''
      },
      dates: {
        started: new Date().toISOString().slice(0, 7),
        lastUpdate: new Date().toISOString().slice(0, 7)
      },
      highlights: [
        'Fonctionnalité remarquable 1',
        'Fonctionnalité remarquable 2'
      ]
    };

    elements.jsonOutputPreview.textContent = JSON.stringify(projectData, null, 2);
  }

  function copyGeneratedJson() {
    if (!elements.jsonOutputPreview) return;
    navigator.clipboard.writeText(elements.jsonOutputPreview.textContent)
      .then(() => {
        if (elements.copyJsonBtn) {
          const original = elements.copyJsonBtn.textContent;
          elements.copyJsonBtn.textContent = '✅ Copié !';
          setTimeout(() => { elements.copyJsonBtn.textContent = original; }, 2000);
        }
      })
      .catch(err => console.error('Erreur de copie:', err));
  }

  // Réinitialisation de tous les filtres
  function resetAllFilters() {
    state.filters = {
      search: '',
      status: 'all',
      ai: 'all',
      collaboration: 'all',
      technology: 'all'
    };
    if (elements.searchInput) elements.searchInput.value = '';
    updateTogglesVisualState();
    renderProjects();
  }

  // Configuration des écouteurs d'événements
  function setupEventListeners() {
    // Thème
    if (elements.themeToggleBtn) {
      elements.themeToggleBtn.addEventListener('click', toggleTheme);
    }

    // Recherche avec debounce léger
    if (elements.searchInput) {
      elements.searchInput.addEventListener('input', (e) => {
        state.filters.search = e.target.value.trim();
        renderProjects();
      });
    }

    // Bouton Réinitialiser
    if (elements.resetFiltersBtn) {
      elements.resetFiltersBtn.addEventListener('click', resetAllFilters);
    }

    // Fermeture Modal Détails
    if (elements.detailModalClose) {
      elements.detailModalClose.addEventListener('click', closeDetailModal);
    }
    if (elements.detailModal) {
      elements.detailModal.addEventListener('click', (e) => {
        if (e.target === elements.detailModal) closeDetailModal();
      });
    }

    // Modal Nouveau Projet
    if (elements.openNewProjectBtn) {
      elements.openNewProjectBtn.addEventListener('click', openNewProjectModal);
    }
    if (elements.newProjectModalClose) {
      elements.newProjectModalClose.addEventListener('click', closeNewProjectModal);
    }
    if (elements.newProjectModal) {
      elements.newProjectModal.addEventListener('click', (e) => {
        if (e.target === elements.newProjectModal) closeNewProjectModal();
      });
    }
    if (elements.jsonGeneratorForm) {
      elements.jsonGeneratorForm.addEventListener('input', updateGeneratedJson);
    }
    if (elements.copyJsonBtn) {
      elements.copyJsonBtn.addEventListener('click', copyGeneratedJson);
    }

    // Touche Échap pour fermer les modals
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        closeDetailModal();
        closeNewProjectModal();
      }
    });
  }
})();
