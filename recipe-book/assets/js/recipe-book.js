const storage = {
  get(key, fallback) {
    try {
      const value = localStorage.getItem(key)
      return value ? JSON.parse(value) : fallback
    } catch (err) {
      return fallback
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value))
    } catch (err) {
      // Ignore storage errors
    }
  },
}

const baseRecipes = [
  {
    id: 'kobi-bateta-shaak',
    title: 'Kobi Bateta Nu Shaak',
    subtitle: 'Gujarati style cabbage and potato',
    cuisine: 'Gujarati',
    diet: 'Vegetarian',
    difficulty: 'Easy',
    time: 20,
    baseServings: 1,
    tags: ['weeknight', 'pressure cooker', 'dry curry'],
    equipment: ['Electric multi cooker'],
    ingredients: [
      {
        item: 'Cabbage (kobi)',
        amount: 1,
        unit: 'cup',
        prep: 'thinly chopped',
      },
      {
        item: 'Potato (bateta)',
        amount: 1,
        unit: 'medium',
        prep: 'small cubes',
      },
      {
        item: 'Onion',
        amount: 1,
        unit: 'small',
        prep: 'finely chopped',
      },
      { item: 'Garlic', amount: 5, unit: 'cloves', prep: 'crushed' },
      {
        item: 'Tomato',
        amount: 3,
        unit: 'tbsp',
        prep: 'chopped',
        optional: true,
      },
      { item: 'Groundnut oil', amount: 1.5, unit: 'tbsp' },
      {
        item: 'All-in-one masala',
        amount: 1,
        unit: 'tsp',
        alt: 'Kitchen King masala',
      },
      { item: 'Turmeric', amount: 0.25, unit: 'tsp' },
      { item: 'Red chilli powder', amount: 0.5, unit: 'tsp' },
      { item: 'Salt', amount: 0, unit: '', toTaste: true },
      { item: 'Water', amount: 3, unit: 'tbsp', note: 'for light steam' },
    ],
    steps: [
      {
        title: 'Heat oil',
        body:
          'Switch cooker to Saute or Fry mode. Add groundnut oil, then crushed garlic. Saute until aromatic, do not brown.',
      },
      {
        title: 'Build onion base',
        body:
          'Add chopped onion. Cook until soft and slightly translucent.',
      },
      {
        title: 'Bloom spices',
        body:
          'Add turmeric, red chilli powder, and all-in-one masala. Stir for 20 to 30 seconds.',
      },
      {
        title: 'Add vegetables',
        body:
          'Add potato cubes and cook 2 minutes. Add cabbage, mix well, and add 2 to 3 tbsp water only.',
      },
      {
        title: 'Pressure cook',
        body:
          'Close lid. Cook for 1 whistle or about 5 minutes. Let pressure release naturally.',
      },
      {
        title: 'Finish',
        body:
          'Open lid, add salt, and saute briefly if extra water remains. Taste and adjust chilli or salt.',
      },
    ],
    notes: 'Dry style sabzi that stays light and fragrant.',
    createdAt: Date.parse('2026-02-01T10:00:00Z'),
  },
]

const elements = {
  searchInput: document.getElementById('searchInput'),
  cuisineSelect: document.getElementById('cuisineSelect'),
  dietSelect: document.getElementById('dietSelect'),
  difficultySelect: document.getElementById('difficultySelect'),
  timeSelect: document.getElementById('timeSelect'),
  tagChips: document.getElementById('tagChips'),
  favoriteOnly: document.getElementById('favoriteOnly'),
  resetFilters: document.getElementById('resetFilters'),
  filterCount: document.getElementById('filterCount'),
  recipeGrid: document.getElementById('recipeGrid'),
  emptyState: document.getElementById('emptyState'),
  sortBy: document.getElementById('sortBy'),
  viewToggle: document.querySelectorAll('[data-view]'),
  detailTitle: document.getElementById('detailTitle'),
  detailSubtitle: document.getElementById('detailSubtitle'),
  detailCuisine: document.getElementById('detailCuisine'),
  detailMeta: document.getElementById('detailMeta'),
  ingredientList: document.getElementById('ingredientList'),
  stepList: document.getElementById('stepList'),
  servingsRange: document.getElementById('servingsRange'),
  servingsDown: document.getElementById('servingsDown'),
  servingsUp: document.getElementById('servingsUp'),
  servingsCount: document.getElementById('servingsCount'),
  ratingButtons: document.getElementById('ratingButtons'),
  personalNote: document.getElementById('personalNote'),
  markCooked: document.getElementById('markCooked'),
  printRecipe: document.getElementById('printRecipe'),
  deleteRecipe: document.getElementById('deleteRecipe'),
  addToShopping: document.getElementById('addToShopping'),
  statTotal: document.getElementById('statTotal'),
  statFavorites: document.getElementById('statFavorites'),
  statLastCooked: document.getElementById('statLastCooked'),
  randomRecipe: document.getElementById('randomRecipe'),
  scrollLibrary: document.getElementById('scrollLibrary'),
  openAddModal: document.getElementById('openAddModal'),
  closeModal: document.getElementById('closeModal'),
  recipeModal: document.getElementById('recipeModal'),
  recipeForm: document.getElementById('recipeForm'),
  resetForm: document.getElementById('resetForm'),
  toggleCooking: document.getElementById('toggleCooking'),
  toggleCookingTool: document.getElementById('toggleCookingTool'),
  importFile: document.getElementById('importFile'),
  exportRecipes: document.getElementById('exportRecipes'),
  timerMinutes: document.getElementById('timerMinutes'),
  timerSeconds: document.getElementById('timerSeconds'),
  timerStart: document.getElementById('timerStart'),
  timerPause: document.getElementById('timerPause'),
  timerReset: document.getElementById('timerReset'),
  timerDisplay: document.getElementById('timerDisplay'),
  shoppingInput: document.getElementById('shoppingInput'),
  shoppingAdd: document.getElementById('shoppingAdd'),
  shoppingList: document.getElementById('shoppingList'),
}

let userRecipes = storage.get('recipeBookUserRecipes', [])
let recipes = [...baseRecipes, ...userRecipes]

const favorites = new Set(storage.get('recipeBookFavorites', []))
const ratings = storage.get('recipeBookRatings', {})
const notes = storage.get('recipeBookNotes', {})
const ingredientChecks = storage.get('recipeBookIngredientChecks', {})
const stepChecks = storage.get('recipeBookStepChecks', {})
const servingsByRecipe = storage.get('recipeBookServings', {})
let shoppingItems = storage.get('recipeBookShopping', [])
let lastCooked = storage.get('recipeBookLastCooked', '')

const state = {
  selectedId: recipes[0] ? recipes[0].id : null,
  view: 'grid',
  filters: {
    search: '',
    cuisine: 'all',
    diet: 'all',
    difficulty: 'all',
    time: 'all',
    tags: new Set(),
    favoritesOnly: false,
  },
}

const uniqueValues = (key) =>
  Array.from(new Set(recipes.map((recipe) => recipe[key]).filter(Boolean))).sort(
    (a, b) => a.localeCompare(b),
  )

const populateSelect = (select, values, label) => {
  if (!select) return
  select.innerHTML = ''
  const allOption = document.createElement('option')
  allOption.value = 'all'
  allOption.textContent = `All ${label}`
  select.appendChild(allOption)
  values.forEach((value) => {
    const option = document.createElement('option')
    option.value = value
    option.textContent = value
    select.appendChild(option)
  })
}

const renderTags = () => {
  if (!elements.tagChips) return
  elements.tagChips.innerHTML = ''
  const tags = Array.from(
    new Set(recipes.flatMap((recipe) => recipe.tags || [])),
  ).sort((a, b) => a.localeCompare(b))

  if (!tags.length) {
    elements.tagChips.textContent = 'No tags yet.'
    return
  }

  tags.forEach((tag) => {
    const button = document.createElement('button')
    button.type = 'button'
    button.className = 'chip'
    button.textContent = tag
    button.dataset.tag = tag
    if (state.filters.tags.has(tag)) {
      button.classList.add('is-active')
    }
    button.addEventListener('click', () => toggleTag(tag))
    elements.tagChips.appendChild(button)
  })
}

const toggleTag = (tag) => {
  if (state.filters.tags.has(tag)) {
    state.filters.tags.delete(tag)
  } else {
    state.filters.tags.add(tag)
  }
  renderTags()
  renderLibrary()
}

const formatAmount = (value) => {
  if (!value || Number.isNaN(value)) return ''
  const rounded = Math.round(value * 100) / 100
  const whole = Math.floor(rounded)
  const fraction = rounded - whole

  const fractionMap = {
    0.25: '1/4',
    0.33: '1/3',
    0.5: '1/2',
    0.66: '2/3',
    0.75: '3/4',
  }

  const fractionKey = Object.keys(fractionMap).find(
    (key) => Math.abs(Number(key) - fraction) < 0.02,
  )

  if (!whole && fractionKey) {
    return fractionMap[fractionKey]
  }

  if (whole && fractionKey) {
    return `${whole} ${fractionMap[fractionKey]}`
  }

  return `${rounded}`
}

const formatIngredient = (ingredient, ratio) => {
  if (ingredient.toTaste) {
    return `${ingredient.item} - to taste`
  }
  const amount = ingredient.amount ? ingredient.amount * ratio : 0
  const amountLabel = amount ? formatAmount(amount) : ''
  const unitLabel = ingredient.unit ? ` ${ingredient.unit}` : ''
  const prepLabel = ingredient.prep ? `, ${ingredient.prep}` : ''
  const altLabel = ingredient.alt ? ` (or ${ingredient.alt})` : ''
  const noteLabel = ingredient.note ? ` (${ingredient.note})` : ''
  return `${amountLabel}${unitLabel} ${ingredient.item}${prepLabel}${altLabel}${noteLabel}`.trim()
}

const getRecipeById = (id) => recipes.find((recipe) => recipe.id === id)

const getFilteredRecipes = () => {
  const search = state.filters.search.toLowerCase()
  return recipes.filter((recipe) => {
    if (state.filters.cuisine !== 'all' && recipe.cuisine !== state.filters.cuisine) {
      return false
    }
    if (state.filters.diet !== 'all' && recipe.diet !== state.filters.diet) {
      return false
    }
    if (
      state.filters.difficulty !== 'all' &&
      recipe.difficulty !== state.filters.difficulty
    ) {
      return false
    }
    if (state.filters.time !== 'all' && recipe.time > Number(state.filters.time)) {
      return false
    }
    if (state.filters.tags.size) {
      const hasTag = (recipe.tags || []).some((tag) => state.filters.tags.has(tag))
      if (!hasTag) return false
    }
    if (state.filters.favoritesOnly && !favorites.has(recipe.id)) {
      return false
    }
    if (search) {
      const haystack = [
        recipe.title,
        recipe.subtitle,
        recipe.cuisine,
        recipe.diet,
        recipe.tags?.join(' '),
        recipe.ingredients.map((item) => item.item).join(' '),
      ]
        .join(' ')
        .toLowerCase()
      if (!haystack.includes(search)) return false
    }
    return true
  })
}

const sortRecipes = (list) => {
  const value = elements.sortBy ? elements.sortBy.value : 'latest'
  const sorted = [...list]
  if (value === 'alpha') {
    return sorted.sort((a, b) => a.title.localeCompare(b.title))
  }
  if (value === 'time') {
    return sorted.sort((a, b) => a.time - b.time)
  }
  if (value === 'rating') {
    return sorted.sort(
      (a, b) => (ratings[b.id] || 0) - (ratings[a.id] || 0),
    )
  }
  return sorted.sort((a, b) => (b.createdAt || 0) - (a.createdAt || 0))
}

const renderLibrary = () => {
  if (!elements.recipeGrid) return
  const filtered = sortRecipes(getFilteredRecipes())
  elements.recipeGrid.innerHTML = ''
  const count = filtered.length
  if (elements.filterCount) {
    elements.filterCount.textContent = `${count} result${count === 1 ? '' : 's'}`
  }
  if (!count) {
    if (elements.emptyState) elements.emptyState.style.display = 'block'
    return
  }
  if (elements.emptyState) elements.emptyState.style.display = 'none'

  filtered.forEach((recipe) => {
    const card = document.createElement('article')
    card.className = 'recipe-card'
    if (recipe.id === state.selectedId) {
      card.classList.add('is-selected')
    }
    card.addEventListener('click', () => {
      state.selectedId = recipe.id
      renderLibrary()
      renderDetail()
    })

    const top = document.createElement('div')
    top.className = 'card-top'
    const title = document.createElement('h4')
    title.textContent = recipe.title
    const favButton = document.createElement('button')
    favButton.className = 'favorite-button'
    favButton.textContent = favorites.has(recipe.id) ? 'Favorited' : 'Favorite'
    if (favorites.has(recipe.id)) favButton.classList.add('is-active')
    favButton.addEventListener('click', (event) => {
      event.stopPropagation()
      toggleFavorite(recipe.id)
    })
    top.appendChild(title)
    top.appendChild(favButton)

    const subtitle = document.createElement('p')
    subtitle.textContent = recipe.subtitle || 'Personal recipe'

    const meta = document.createElement('div')
    meta.className = 'meta-row'
    meta.innerHTML = `
      <span class="meta-pill">${recipe.time} min</span>
      <span class="meta-pill">${recipe.difficulty}</span>
      <span class="meta-pill">${recipe.diet}</span>
      <span class="meta-pill">Rating: ${ratings[recipe.id] || 0}/5</span>
    `

    card.appendChild(top)
    card.appendChild(subtitle)
    card.appendChild(meta)
    elements.recipeGrid.appendChild(card)
  })
}

const renderDetail = () => {
  const recipe = getRecipeById(state.selectedId)
  if (!recipe) {
    if (elements.detailTitle) elements.detailTitle.textContent = 'Select a recipe'
    if (elements.detailSubtitle) {
      elements.detailSubtitle.textContent = 'Pick a card from your library to begin.'
    }
    if (elements.detailCuisine) elements.detailCuisine.textContent = 'Recipe'
    if (elements.detailMeta) elements.detailMeta.innerHTML = ''
    if (elements.ingredientList) elements.ingredientList.innerHTML = ''
    if (elements.stepList) elements.stepList.innerHTML = ''
    if (elements.personalNote) elements.personalNote.value = ''
    return
  }

  if (elements.detailTitle) elements.detailTitle.textContent = recipe.title
  if (elements.detailSubtitle) {
    elements.detailSubtitle.textContent = recipe.subtitle || 'Personal recipe'
  }
  if (elements.detailCuisine) {
    elements.detailCuisine.textContent = recipe.cuisine || 'Recipe'
  }

  if (elements.deleteRecipe) {
    elements.deleteRecipe.style.display = recipe.isUser ? 'inline-flex' : 'none'
  }

  const metaItems = [
    `${recipe.time} min`,
    recipe.difficulty,
    recipe.diet,
    `${recipe.baseServings} servings`,
  ]
  if (recipe.equipment && recipe.equipment.length) {
    metaItems.push(recipe.equipment.join(', '))
  }

  if (elements.detailMeta) {
    elements.detailMeta.innerHTML = metaItems
      .filter(Boolean)
      .map((item) => `<span class="meta-pill">${item}</span>`)
      .join('')
  }

  const servings = servingsByRecipe[recipe.id] || recipe.baseServings
  if (elements.servingsRange) {
    elements.servingsRange.value = servings
    elements.servingsRange.max = Math.max(8, recipe.baseServings * 4)
  }
  if (elements.servingsCount) {
    elements.servingsCount.textContent = `${servings} serving${servings === 1 ? '' : 's'}`
  }

  renderIngredients(recipe, servings)
  renderSteps(recipe)
  renderRatings(recipe)
  renderNotes(recipe)
}

const renderIngredients = (recipe, servings) => {
  if (!elements.ingredientList) return
  elements.ingredientList.innerHTML = ''
  const ratio = servings / recipe.baseServings
  const checks = ingredientChecks[recipe.id] || []
  recipe.ingredients.forEach((ingredient, index) => {
    const li = document.createElement('li')
    const label = document.createElement('label')
    label.className = 'ingredient-item'
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = Boolean(checks[index])
    checkbox.addEventListener('change', () => {
      const updated = ingredientChecks[recipe.id] || []
      updated[index] = checkbox.checked
      ingredientChecks[recipe.id] = updated
      storage.set('recipeBookIngredientChecks', ingredientChecks)
    })

    const text = document.createElement('span')
    text.textContent = formatIngredient(ingredient, ratio)

    label.appendChild(checkbox)
    label.appendChild(text)

    if (ingredient.optional) {
      const optional = document.createElement('span')
      optional.className = 'optional'
      optional.textContent = 'optional'
      label.appendChild(optional)
    }

    li.appendChild(label)
    elements.ingredientList.appendChild(li)
  })
}

const renderSteps = (recipe) => {
  if (!elements.stepList) return
  elements.stepList.innerHTML = ''
  const checks = stepChecks[recipe.id] || []
  recipe.steps.forEach((step, index) => {
    const li = document.createElement('li')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = Boolean(checks[index])
    checkbox.addEventListener('change', () => {
      const updated = stepChecks[recipe.id] || []
      updated[index] = checkbox.checked
      stepChecks[recipe.id] = updated
      storage.set('recipeBookStepChecks', stepChecks)
    })
    const title = document.createElement('span')
    title.className = 'step-title'
    title.textContent = step.title
    const body = document.createElement('span')
    body.textContent = step.body
    li.appendChild(checkbox)
    li.appendChild(title)
    li.appendChild(body)
    elements.stepList.appendChild(li)
  })
}

const renderRatings = (recipe) => {
  if (!elements.ratingButtons) return
  elements.ratingButtons.innerHTML = ''
  const current = ratings[recipe.id] || 0
  for (let i = 1; i <= 5; i += 1) {
    const button = document.createElement('button')
    button.type = 'button'
    button.textContent = `${i}`
    if (i === current) button.classList.add('is-active')
    button.addEventListener('click', () => {
      ratings[recipe.id] = i
      storage.set('recipeBookRatings', ratings)
      renderRatings(recipe)
      renderLibrary()
    })
    elements.ratingButtons.appendChild(button)
  }
}

const renderNotes = (recipe) => {
  if (!elements.personalNote) return
  const saved = notes[recipe.id]
  elements.personalNote.value = saved !== undefined ? saved : recipe.notes || ''
}

const toggleFavorite = (id) => {
  if (favorites.has(id)) {
    favorites.delete(id)
  } else {
    favorites.add(id)
  }
  storage.set('recipeBookFavorites', Array.from(favorites))
  updateStats()
  renderLibrary()
}

const updateStats = () => {
  if (elements.statTotal) elements.statTotal.textContent = `${recipes.length}`
  if (elements.statFavorites) {
    elements.statFavorites.textContent = `${favorites.size}`
  }
  if (elements.statLastCooked) {
    elements.statLastCooked.textContent = lastCooked || '--'
  }
}

const resetFilters = () => {
  state.filters = {
    search: '',
    cuisine: 'all',
    diet: 'all',
    difficulty: 'all',
    time: 'all',
    tags: new Set(),
    favoritesOnly: false,
  }
  if (elements.searchInput) elements.searchInput.value = ''
  if (elements.cuisineSelect) elements.cuisineSelect.value = 'all'
  if (elements.dietSelect) elements.dietSelect.value = 'all'
  if (elements.difficultySelect) elements.difficultySelect.value = 'all'
  if (elements.timeSelect) elements.timeSelect.value = 'all'
  if (elements.favoriteOnly) elements.favoriteOnly.checked = false
  renderTags()
  renderLibrary()
}

const addShoppingItems = (items) => {
  shoppingItems = [...shoppingItems, ...items]
  storage.set('recipeBookShopping', shoppingItems)
  renderShoppingList()
}

const renderShoppingList = () => {
  if (!elements.shoppingList) return
  elements.shoppingList.innerHTML = ''
  shoppingItems.forEach((item, index) => {
    const li = document.createElement('li')
    const checkbox = document.createElement('input')
    checkbox.type = 'checkbox'
    checkbox.checked = Boolean(item.checked)
    checkbox.addEventListener('change', () => {
      shoppingItems[index].checked = checkbox.checked
      storage.set('recipeBookShopping', shoppingItems)
    })
    const label = document.createElement('span')
    label.textContent = item.text
    li.appendChild(checkbox)
    li.appendChild(label)
    elements.shoppingList.appendChild(li)
  })
}

const createId = (title) =>
  title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')

const parseIngredientLine = (line) => {
  const text = line.trim()
  if (!text) return null
  const optional = text.toLowerCase().includes('optional')
  const cleaned = text.replace(/optional/gi, '').trim()
  const parts = cleaned.split(' ')
  const amount = Number.parseFloat(parts[0])
  if (!Number.isNaN(amount)) {
    const unit = parts[1] || ''
    const item = parts.slice(2).join(' ')
    return { item, amount, unit, optional }
  }
  return { item: cleaned, amount: 0, unit: '', optional }
}

const parseStepLine = (line, index) => {
  const text = line.trim()
  if (!text) return null
  const [maybeTitle, ...rest] = text.split(':')
  if (rest.length) {
    return { title: maybeTitle.trim(), body: rest.join(':').trim() }
  }
  return { title: `Step ${index + 1}`, body: text }
}

const openModal = () => {
  if (!elements.recipeModal) return
  elements.recipeModal.classList.add('is-open')
  elements.recipeModal.setAttribute('aria-hidden', 'false')
}

const closeModal = () => {
  if (!elements.recipeModal) return
  elements.recipeModal.classList.remove('is-open')
  elements.recipeModal.setAttribute('aria-hidden', 'true')
}

const renderAll = () => {
  populateSelect(elements.cuisineSelect, uniqueValues('cuisine'), 'cuisines')
  populateSelect(elements.dietSelect, uniqueValues('diet'), 'diets')
  populateSelect(elements.difficultySelect, uniqueValues('difficulty'), 'levels')
  populateSelect(elements.timeSelect, ['15', '30', '45', '60'], 'minutes')
  renderTags()
  renderLibrary()
  renderDetail()
  renderShoppingList()
  updateStats()
}

const setupEvents = () => {
  if (elements.searchInput) {
    elements.searchInput.addEventListener('input', (event) => {
      state.filters.search = event.target.value
      renderLibrary()
    })
  }
  if (elements.cuisineSelect) {
    elements.cuisineSelect.addEventListener('change', (event) => {
      state.filters.cuisine = event.target.value
      renderLibrary()
    })
  }
  if (elements.dietSelect) {
    elements.dietSelect.addEventListener('change', (event) => {
      state.filters.diet = event.target.value
      renderLibrary()
    })
  }
  if (elements.difficultySelect) {
    elements.difficultySelect.addEventListener('change', (event) => {
      state.filters.difficulty = event.target.value
      renderLibrary()
    })
  }
  if (elements.timeSelect) {
    elements.timeSelect.addEventListener('change', (event) => {
      state.filters.time = event.target.value
      renderLibrary()
    })
  }
  if (elements.favoriteOnly) {
    elements.favoriteOnly.addEventListener('change', (event) => {
      state.filters.favoritesOnly = event.target.checked
      renderLibrary()
    })
  }
  if (elements.resetFilters) {
    elements.resetFilters.addEventListener('click', resetFilters)
  }
  if (elements.sortBy) {
    elements.sortBy.addEventListener('change', renderLibrary)
  }
  if (elements.viewToggle) {
    elements.viewToggle.forEach((button) => {
      button.addEventListener('click', () => {
        state.view = button.dataset.view
        if (elements.recipeGrid) {
          elements.recipeGrid.classList.toggle('is-list', state.view === 'list')
        }
      })
    })
  }

  if (elements.servingsRange) {
    elements.servingsRange.addEventListener('input', (event) => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe) return
      const value = Number(event.target.value)
      servingsByRecipe[recipe.id] = value
      storage.set('recipeBookServings', servingsByRecipe)
      renderDetail()
    })
  }
  if (elements.servingsDown) {
    elements.servingsDown.addEventListener('click', () => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe) return
      const current = servingsByRecipe[recipe.id] || recipe.baseServings
      const next = Math.max(1, current - 1)
      servingsByRecipe[recipe.id] = next
      storage.set('recipeBookServings', servingsByRecipe)
      renderDetail()
    })
  }
  if (elements.servingsUp) {
    elements.servingsUp.addEventListener('click', () => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe) return
      const current = servingsByRecipe[recipe.id] || recipe.baseServings
      const next = current + 1
      servingsByRecipe[recipe.id] = next
      storage.set('recipeBookServings', servingsByRecipe)
      renderDetail()
    })
  }

  if (elements.personalNote) {
    elements.personalNote.addEventListener('input', (event) => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe) return
      notes[recipe.id] = event.target.value
      storage.set('recipeBookNotes', notes)
    })
  }

  if (elements.addToShopping) {
    elements.addToShopping.addEventListener('click', () => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe) return
      const servings = servingsByRecipe[recipe.id] || recipe.baseServings
      const ratio = servings / recipe.baseServings
      const items = recipe.ingredients.map((ingredient) => ({
        text: formatIngredient(ingredient, ratio),
        checked: false,
      }))
      addShoppingItems(items)
    })
  }

  if (elements.shoppingAdd) {
    elements.shoppingAdd.addEventListener('click', () => {
      const text = elements.shoppingInput.value.trim()
      if (!text) return
      addShoppingItems([{ text, checked: false }])
      elements.shoppingInput.value = ''
    })
  }

  if (elements.markCooked) {
    elements.markCooked.addEventListener('click', () => {
      lastCooked = new Date().toISOString().slice(0, 10)
      storage.set('recipeBookLastCooked', lastCooked)
      updateStats()
    })
  }

  if (elements.printRecipe) {
    elements.printRecipe.addEventListener('click', () => window.print())
  }

  if (elements.deleteRecipe) {
    elements.deleteRecipe.addEventListener('click', () => {
      const recipe = getRecipeById(state.selectedId)
      if (!recipe || !recipe.isUser) return
      const confirmed = window.confirm('Delete this recipe?')
      if (!confirmed) return
      userRecipes = userRecipes.filter((item) => item.id !== recipe.id)
      storage.set('recipeBookUserRecipes', userRecipes)
      recipes = [...baseRecipes, ...userRecipes]
      state.selectedId = recipes[0] ? recipes[0].id : null
      renderAll()
    })
  }

  if (elements.randomRecipe) {
    elements.randomRecipe.addEventListener('click', () => {
      const list = getFilteredRecipes()
      if (!list.length) return
      const pick = list[Math.floor(Math.random() * list.length)]
      state.selectedId = pick.id
      renderLibrary()
      renderDetail()
    })
  }

  if (elements.scrollLibrary) {
    elements.scrollLibrary.addEventListener('click', () => {
      const target = document.getElementById('library')
      if (target) target.scrollIntoView({ behavior: 'smooth' })
    })
  }

  if (elements.openAddModal) {
    elements.openAddModal.addEventListener('click', openModal)
  }
  if (elements.closeModal) {
    elements.closeModal.addEventListener('click', closeModal)
  }
  if (elements.resetForm) {
    elements.resetForm.addEventListener('click', () => {
      if (elements.recipeForm) elements.recipeForm.reset()
    })
  }

  if (elements.recipeForm) {
    elements.recipeForm.addEventListener('submit', (event) => {
      event.preventDefault()
      const title = document.getElementById('recipeTitle').value.trim()
      const subtitle = document.getElementById('recipeSubtitle').value.trim()
      const cuisine = document.getElementById('recipeCuisine').value.trim()
      const diet = document.getElementById('recipeDiet').value.trim()
      const difficulty = document.getElementById('recipeDifficulty').value
      const time = Number.parseInt(document.getElementById('recipeTime').value, 10)
      const servings = Number.parseInt(
        document.getElementById('recipeServings').value,
        10,
      )
      const tags = document
        .getElementById('recipeTags')
        .value.split(',')
        .map((tag) => tag.trim())
        .filter(Boolean)
      const ingredientLines = document
        .getElementById('recipeIngredients')
        .value.split('\n')
        .map((line) => parseIngredientLine(line))
        .filter(Boolean)
      const stepLines = document
        .getElementById('recipeSteps')
        .value.split('\n')
        .map((line, index) => parseStepLine(line, index))
        .filter(Boolean)
      const notesValue = document.getElementById('recipeNotes').value.trim()

      if (!title || !ingredientLines.length || !stepLines.length) return

      const recipe = {
        id: createId(title),
        title,
        subtitle,
        cuisine: cuisine || 'Custom',
        diet: diet || 'Any',
        difficulty,
        time: time || 20,
        baseServings: servings || 2,
        tags,
        ingredients: ingredientLines,
        steps: stepLines,
        notes: notesValue,
        createdAt: Date.now(),
        isUser: true,
      }

      userRecipes = [...userRecipes, recipe]
      storage.set('recipeBookUserRecipes', userRecipes)
      recipes = [...baseRecipes, ...userRecipes]
      state.selectedId = recipe.id
      closeModal()
      if (elements.recipeForm) elements.recipeForm.reset()
      renderAll()
    })
  }

  if (elements.importFile) {
    elements.importFile.addEventListener('change', (event) => {
      const file = event.target.files[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = () => {
        try {
          const data = JSON.parse(reader.result)
          if (Array.isArray(data.userRecipes)) {
            const incoming = data.userRecipes.map((recipe) => ({
              ...recipe,
              id: recipe.id || createId(recipe.title || 'recipe'),
              isUser: true,
              createdAt: recipe.createdAt || Date.now(),
            }))
            userRecipes = [...userRecipes, ...incoming]
            storage.set('recipeBookUserRecipes', userRecipes)
            recipes = [...baseRecipes, ...userRecipes]
          }
          if (Array.isArray(data.favorites)) {
            data.favorites.forEach((id) => favorites.add(id))
            storage.set('recipeBookFavorites', Array.from(favorites))
          }
          if (data.ratings) {
            Object.assign(ratings, data.ratings)
            storage.set('recipeBookRatings', ratings)
          }
          if (data.notes) {
            Object.assign(notes, data.notes)
            storage.set('recipeBookNotes', notes)
          }
          if (data.shopping) {
            shoppingItems = data.shopping
            storage.set('recipeBookShopping', shoppingItems)
          }
          renderAll()
        } catch (err) {
          window.alert('Invalid recipe file.')
        }
      }
      reader.readAsText(file)
    })
  }

  if (elements.exportRecipes) {
    elements.exportRecipes.addEventListener('click', () => {
      const payload = {
        userRecipes,
        favorites: Array.from(favorites),
        ratings,
        notes,
        shopping: shoppingItems,
      }
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      })
      const url = URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = 'recipe-book-export.json'
      document.body.appendChild(link)
      link.click()
      link.remove()
      URL.revokeObjectURL(url)
    })
  }

  if (elements.toggleCooking) {
    elements.toggleCooking.addEventListener('click', () => {
      document.body.classList.toggle('is-cooking-mode')
    })
  }
  if (elements.toggleCookingTool) {
    elements.toggleCookingTool.addEventListener('click', () => {
      document.body.classList.toggle('is-cooking-mode')
    })
  }

  if (elements.timerStart) {
    elements.timerStart.addEventListener('click', startTimer)
  }
  if (elements.timerPause) {
    elements.timerPause.addEventListener('click', pauseTimer)
  }
  if (elements.timerReset) {
    elements.timerReset.addEventListener('click', resetTimer)
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape') closeModal()
  })
}

let timerState = {
  intervalId: null,
  remaining: 0,
}

const formatTime = (value) => {
  const minutes = String(Math.floor(value / 60)).padStart(2, '0')
  const seconds = String(value % 60).padStart(2, '0')
  return `${minutes}:${seconds}`
}

const updateTimerDisplay = () => {
  if (!elements.timerDisplay) return
  elements.timerDisplay.textContent = formatTime(timerState.remaining)
}

const startTimer = () => {
  if (timerState.intervalId) return
  const minutes = Number(elements.timerMinutes.value) || 0
  const seconds = Number(elements.timerSeconds.value) || 0
  if (!timerState.remaining) {
    timerState.remaining = minutes * 60 + seconds
  }
  if (timerState.remaining <= 0) return
  timerState.intervalId = setInterval(() => {
    timerState.remaining -= 1
    updateTimerDisplay()
    if (timerState.remaining <= 0) {
      pauseTimer()
    }
  }, 1000)
}

const pauseTimer = () => {
  if (timerState.intervalId) {
    clearInterval(timerState.intervalId)
    timerState.intervalId = null
  }
}

const resetTimer = () => {
  pauseTimer()
  const minutes = Number(elements.timerMinutes.value) || 0
  const seconds = Number(elements.timerSeconds.value) || 0
  timerState.remaining = minutes * 60 + seconds
  updateTimerDisplay()
}

const revealOnScroll = () => {
  const items = document.querySelectorAll('[data-reveal]')
  if (!items.length) return
  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible')
          obs.unobserve(entry.target)
        }
      })
    },
    { threshold: 0.2 },
  )
  items.forEach((item) => observer.observe(item))
}

renderAll()
setupEvents()
resetTimer()
revealOnScroll()
