const ADMIN_CREDENTIALS = {
  username: 'Legendcraft',
  password: 'Legendcraft'
};

let isAdminLoggedIn = false;
let editingRecipeId = null;

function checkAdminSession() {
  return sessionStorage.getItem('lc_admin') === 'true';
}

function setAdminSession(active) {
  if (active) {
    sessionStorage.setItem('lc_admin', 'true');
  } else {
    sessionStorage.removeItem('lc_admin');
  }
  isAdminLoggedIn = active;
  document.body.classList.toggle('admin-mode', active);
  const panel = document.getElementById('adminPanel');
  if (panel) panel.classList.toggle('active', active);
  if (active) renderAdminList();
}

function openModal(id) {
  document.getElementById(id)?.classList.add('active');
}

function closeModal(id) {
  document.getElementById(id)?.classList.remove('active');
}

function renderAdminList() {
  const list = document.getElementById('adminRecipesList');
  if (!list) return;

  const recipes = CraftingAPI.getRecipes();

  if (recipes.length === 0) {
    list.innerHTML = '<p style="text-align:center;color:var(--text-secondary);opacity:0.7;padding:2rem;">No recipes yet.</p>';
    return;
  }

  list.innerHTML = recipes.map(recipe => `
    <div class="admin-recipe-item" data-id="${recipe.id}">
      <div class="admin-recipe-info">
        <span>${recipe.icon || '🔮'}</span>
        <div>
          <h4>${recipe.name}</h4>
          <small>${recipe.category}</small>
        </div>
      </div>
      <div class="admin-recipe-actions">
        <button class="btn-edit" data-action="edit" data-id="${recipe.id}">Edit</button>
        <button class="btn-delete" data-action="delete" data-id="${recipe.id}">Delete</button>
      </div>
    </div>
  `).join('');

  list.querySelectorAll('[data-action]').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      if (btn.dataset.action === 'edit') openRecipeEditor(id);
      if (btn.dataset.action === 'delete') deleteRecipe(id);
    });
  });
}

function openRecipeEditor(id) {
  editingRecipeId = id || null;
  const form = document.getElementById('recipeForm');
  const title = document.getElementById('recipeModalTitle');

  form.reset();
  document.querySelectorAll('.grid-slot').forEach(s => s.value = '');

  if (id) {
    const recipe = CraftingAPI.getRecipes().find(r => r.id === id);
    if (!recipe) return;
    title.textContent = 'Edit Recipe';
    document.getElementById('recipeId').value = recipe.id;
    document.getElementById('recipeName').value = recipe.name;
    document.getElementById('recipeCategory').value = recipe.category;
    document.getElementById('recipeDesc').value = recipe.description || '';
    document.getElementById('recipeIcon').value = recipe.icon || '';
    document.getElementById('recipeResult').value = recipe.result;
    recipe.grid.forEach((val, i) => {
      const slot = document.querySelector(`.grid-slot[data-slot="${i}"]`);
      if (slot) slot.value = val;
    });
  } else {
    title.textContent = 'Add Recipe';
    document.getElementById('recipeId').value = '';
  }

  openModal('recipeModal');
}

function deleteRecipe(id) {
  if (!confirm('Delete this recipe permanently?')) return;
  const recipes = CraftingAPI.getRecipes().filter(r => r.id !== id);
  CraftingAPI.saveRecipes(recipes);
  CraftingAPI.renderRecipes(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  renderAdminList();
}

function saveRecipeFromForm(e) {
  e.preventDefault();

  const grid = [];
  document.querySelectorAll('.grid-slot').forEach(slot => {
    grid.push(slot.value.trim());
  });

  const recipeData = {
    name: document.getElementById('recipeName').value.trim(),
    category: document.getElementById('recipeCategory').value,
    description: document.getElementById('recipeDesc').value.trim(),
    icon: document.getElementById('recipeIcon').value.trim() || '🔮',
    grid,
    result: document.getElementById('recipeResult').value.trim()
  };

  let recipes = CraftingAPI.getRecipes();
  const existingId = document.getElementById('recipeId').value;

  if (existingId) {
    recipes = recipes.map(r => r.id === existingId ? { ...r, ...recipeData } : r);
  } else {
    recipes.push({ id: CraftingAPI.generateId(recipeData.name), ...recipeData });
  }

  CraftingAPI.saveRecipes(recipes);
  CraftingAPI.renderRecipes(document.querySelector('.filter-btn.active')?.dataset.filter || 'all');
  renderAdminList();
  closeModal('recipeModal');
}

function initAdmin() {
  const adminBtn = document.getElementById('adminBtn');
  const adminModal = document.getElementById('adminModal');
  const loginForm = document.getElementById('adminLoginForm');
  const exitBtn = document.getElementById('exitAdminBtn');
  const addBtn = document.getElementById('addRecipeBtn');
  const recipeForm = document.getElementById('recipeForm');

  if (checkAdminSession()) setAdminSession(true);

  adminBtn?.addEventListener('click', () => {
    if (isAdminLoggedIn) {
      setAdminSession(false);
    } else {
      openModal('adminModal');
      document.getElementById('loginError').textContent = '';
    }
  });

  document.getElementById('closeAdminModal')?.addEventListener('click', () => closeModal('adminModal'));
  document.getElementById('closeRecipeModal')?.addEventListener('click', () => closeModal('recipeModal'));
  document.getElementById('cancelRecipeBtn')?.addEventListener('click', () => closeModal('recipeModal'));

  adminModal?.addEventListener('click', (e) => {
    if (e.target === adminModal) closeModal('adminModal');
  });

  document.getElementById('recipeModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'recipeModal') closeModal('recipeModal');
  });

  loginForm?.addEventListener('submit', (e) => {
    e.preventDefault();
    const user = document.getElementById('adminUser').value.trim();
    const pass = document.getElementById('adminPass').value;
    const errorEl = document.getElementById('loginError');

    if (user === ADMIN_CREDENTIALS.username && pass === ADMIN_CREDENTIALS.password) {
      setAdminSession(true);
      closeModal('adminModal');
      loginForm.reset();
      errorEl.textContent = '';
    } else {
      errorEl.textContent = 'Invalid username or password.';
      gsap.fromTo(errorEl, { x: -10 }, { x: 10, duration: 0.05, repeat: 5, yoyo: true });
    }
  });

  exitBtn?.addEventListener('click', () => setAdminSession(false));
  addBtn?.addEventListener('click', () => openRecipeEditor(null));
  recipeForm?.addEventListener('submit', saveRecipeFromForm);
}

document.addEventListener('DOMContentLoaded', initAdmin);
