const DEFAULT_RECIPES = [
  {
    id: 'dragon-blade',
    name: 'Dragon Blade',
    category: 'weapon',
    icon: '⚔️',
    description: 'A legendary sword forged with the essence of the Ender Dragon.',
    grid: ['', 'Ender Pearl', '', 'Diamond', 'Netherite', 'Diamond', '', 'Blaze Rod', ''],
    result: 'Dragon Blade'
  },
  {
    id: 'ender-crown',
    name: 'Ender Crown',
    category: 'armor',
    icon: '👑',
    description: 'Grants night vision and resistance to endermen aggression.',
    grid: ['Ender Pearl', 'Amethyst', 'Ender Pearl', 'Diamond', '', 'Diamond', '', '', ''],
    result: 'Ender Crown'
  },
  {
    id: 'legend-pickaxe',
    name: 'Legend Pickaxe',
    category: 'tool',
    icon: '⛏️',
    description: 'Mines 3×3 areas and has unbreaking V enchantment built-in.',
    grid: ['Diamond', 'Diamond', 'Diamond', '', 'Stick', '', '', 'Stick', ''],
    result: 'Legend Pick'
  },
  {
    id: 'void-compass',
    name: 'Void Compass',
    category: 'special',
    icon: '🧭',
    description: 'Points to the nearest legendary dungeon entrance.',
    grid: ['', 'Ender Eye', '', 'Ender Eye', 'Compass', 'Ender Eye', '', 'Ender Eye', ''],
    result: 'Void Compass'
  },
  {
    id: 'dragon-scale',
    name: 'Dragon Scale Armor',
    category: 'armor',
    icon: '🛡️',
    description: 'Purple armor set with fire resistance and knockback immunity.',
    grid: ['Scale', 'Scale', 'Scale', 'Scale', '', 'Scale', 'Scale', 'Scale', 'Scale'],
    result: 'Dragon Chestplate'
  },
  {
    id: 'legend-bow',
    name: 'Legend Bow',
    category: 'weapon',
    icon: '🏹',
    description: 'Shoots explosive arrows that deal dragon breath damage.',
    grid: ['', 'String', 'Blaze Rod', 'String', '', 'String', '', 'String', 'Blaze Rod'],
    result: 'Legend Bow'
  }
];

const STORAGE_KEY = 'legendcraft_recipes';

function getRecipes() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored) {
    try {
      return JSON.parse(stored);
    } catch {
      return [...DEFAULT_RECIPES];
    }
  }
  return [...DEFAULT_RECIPES];
}

function saveRecipes(recipes) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(recipes));
}

function generateId(name) {
  return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Date.now().toString(36);
}

function renderCraftGrid(grid) {
  return grid.map(slot => {
    const filled = slot && slot.trim() !== '';
    return `<div class="craft-slot ${filled ? 'filled' : ''}">${filled ? slot : ''}</div>`;
  }).join('');
}

function renderRecipeCard(recipe, index) {
  return `
    <div class="recipe-card" data-category="${recipe.category}" style="animation-delay: ${index * 0.1}s">
      <div class="recipe-header">
        <div class="recipe-icon">${recipe.icon || '🔮'}</div>
        <div class="recipe-info">
          <h3>${recipe.name}</h3>
          <span class="recipe-category">${recipe.category}</span>
        </div>
      </div>
      <p class="recipe-desc">${recipe.description || ''}</p>
      <div class="recipe-craft">
        <div class="craft-grid">${renderCraftGrid(recipe.grid)}</div>
        <span class="craft-arrow">→</span>
        <div class="craft-result">
          ${recipe.icon || '🔮'}
          <span>${recipe.result}</span>
        </div>
      </div>
    </div>
  `;
}

function renderRecipes(filter = 'all') {
  const grid = document.getElementById('recipesGrid');
  if (!grid) return;

  const recipes = getRecipes();
  const filtered = filter === 'all' ? recipes : recipes.filter(r => r.category === filter);

  if (filtered.length === 0) {
    grid.innerHTML = '<p style="text-align:center;color:var(--purple-200);grid-column:1/-1;opacity:0.7;">No recipes found in this category.</p>';
    return;
  }

  grid.innerHTML = filtered.map((r, i) => renderRecipeCard(r, i)).join('');
}

function initCraftingFilters() {
  const buttons = document.querySelectorAll('.filter-btn');
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      buttons.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      renderRecipes(btn.dataset.filter);
    });
  });
}

window.CraftingAPI = {
  getRecipes,
  saveRecipes,
  generateId,
  renderRecipes,
  DEFAULT_RECIPES
};
