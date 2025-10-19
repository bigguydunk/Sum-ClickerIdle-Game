import { backend } from "declarations/backend"

let exp = 0;
let totalClicks = 0;
let expPerClick = 1;
let expPerSecond = 0;

// Shop items data
const shopItems = [
  {
    id: "clickUpgrade",
    name: "Magic Wand",
    icon: "🪄",
    description: "+1 mana per click",
    baseCost: 10,
    costMultiplier: 1.15,
    effect: () => { expPerClick += 1; },
    owned: 0
  },
  {
    id: "autoClicker1",
    name: "Apprentice Wizard",
    icon: "🧙‍♂️",
    description: "+1 mana per second",
    baseCost: 50,
    costMultiplier: 1.2,
    effect: () => { expPerSecond += 1; },
    owned: 0
  },
  {
    id: "autoClicker2",
    name: "Crystal Ball",
    icon: "🔮",
    description: "+5 mana per second",
    baseCost: 200,
    costMultiplier: 1.25,
    effect: () => { expPerSecond += 5; },
    owned: 0
  },
  {
    id: "autoClicker3",
    name: "Magic Portal",
    icon: "🌀",
    description: "+15 mana per second",
    baseCost: 1000,
    costMultiplier: 1.3,
    effect: () => { expPerSecond += 15; },
    owned: 0
  },
  {
    id: "autoClicker4",
    name: "Ancient Tome",
    icon: "📖",
    description: "+50 mana per second",
    baseCost: 5000,
    costMultiplier: 1.35,
    effect: () => { expPerSecond += 50; },
    owned: 0
  },
  {
    id: "autoClicker5",
    name: "Dragon Familiar",
    icon: "🐉",
    description: "+150 mana per second",
    baseCost: 20000,
    costMultiplier: 1.4,
    effect: () => { expPerSecond += 150; },
    owned: 0
  },
  {
    id: "multiplier",
    name: "Enchantment",
    icon: "✨",
    description: "x2 click power",
    baseCost: 500,
    costMultiplier: 2,
    effect: () => { expPerClick *= 2; },
    owned: 0
  },
  {
    id: "autoClicker6",
    name: "Celestial Staff",
    icon: "⚡",
    description: "+500 mana per second",
    baseCost: 100000,
    costMultiplier: 1.5,
    effect: () => { expPerSecond += 500; },
    owned: 0
  }
];

// Event listeners
document.getElementById("clickBtn").addEventListener("click", handleClick);
document.getElementById("saveBtn").addEventListener("click", handleSave);
document.getElementById("loadBtn").addEventListener("click", handleLoad);
document.getElementById("resetBtn").addEventListener("click", handleReset);

// Handle click to gain EXP
async function handleClick() {
  // Update locally only
  exp += expPerClick;
  totalClicks += 1;
  updateUI();
  
  // Add animation effect
  const btn = document.getElementById("clickBtn");
  btn.classList.add("clicked");
  setTimeout(() => btn.classList.remove("clicked"), 100);
  
  // Show floating text
  showFloatingText(`+${expPerClick}`, "exp");
}

// Handle shop item purchase
function buyShopItem(itemId) {
  const item = shopItems.find(i => i.id === itemId);
  if (!item) return;
  
  const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.owned));
  
  if (exp >= cost) {
    exp -= cost;
    item.owned += 1;
    item.effect();
    updateUI();
    renderShop();
    showFloatingText(`${item.icon} Bought!`, "upgrade");
  } else {
    showFloatingText("Not enough mana!", "error");
  }
}

// Handle game reset
async function handleReset() {
  if (confirm("Are you sure you want to reset all progress? (Local only, database will not be affected)")) {
    exp = 0;
    totalClicks = 0;
    expPerClick = 1;
    expPerSecond = 0;
    shopItems.forEach(item => {
      item.owned = 0;
    });
    updateUI();
    renderShop();
  }
}

// Handle save to database
async function handleSave() {
  const saveBtn = document.getElementById("saveBtn");
  saveBtn.disabled = true;
  saveBtn.textContent = "Saving...";
  
  try {
    // Prepare shopOwned array for backend as plain numbers (ensure exactly 8 elements)
    const shopOwned = shopItems.map(item => Number(item.owned) || 0);
    
    // Ensure all values are valid numbers
    const safeExp = Math.floor(Number(exp)) || 0;
    const safeTotalClicks = Math.floor(Number(totalClicks)) || 0;
    const safeExpPerClick = Math.floor(Number(expPerClick)) || 1;
    const safeExpPerSecond = Math.floor(Number(expPerSecond)) || 0;
    
    await backend.saveGame(
      safeExp,
      safeTotalClicks,
      safeExpPerClick,
      safeExpPerSecond,
      shopOwned
    );
    showFloatingText("Saved!", "upgrade");
    alert("Progress saved to blockchain! ✅");
  } catch (error) {
    console.error("Error saving game:", error);
    alert("Failed to save! ❌");
  } finally {
    saveBtn.disabled = false;
    saveBtn.textContent = "💾 Save Progress";
  }
}

// Handle load from database
async function handleLoad() {
  if (confirm("Load saved progress from blockchain? This will overwrite your current progress.")) {
    const loadBtn = document.getElementById("loadBtn");
    loadBtn.disabled = true;
    loadBtn.textContent = "Loading...";
    
    try {
      const state = await backend.getGameState();
      exp = Number(state.exp);
      totalClicks = Number(state.totalClicks);
      expPerClick = Number(state.expPerClick);
      expPerSecond = Number(state.expPerSecond);
      if (Array.isArray(state.shopOwned)) {
        state.shopOwned.forEach((owned, idx) => {
          if (shopItems[idx]) shopItems[idx].owned = Number(owned);
        });
      }
      updateUI();
      showFloatingText("Loaded!", "upgrade");
      alert("Progress loaded from blockchain! ✅");
    } catch (error) {
      console.error("Error loading game:", error);
      alert("Failed to load! ❌");
    } finally {
      loadBtn.disabled = false;
      loadBtn.textContent = "📂 Load Progress";
    }
  }
}

// Show floating text animation
function showFloatingText(text, type = "exp") {
  const floatingText = document.createElement("div");
  floatingText.className = `floating-text ${type}`;
  floatingText.textContent = text;
  
  const btn = document.getElementById("clickBtn");
  const rect = btn.getBoundingClientRect();
  
  floatingText.style.left = `${rect.left + rect.width / 2}px`;
  floatingText.style.top = `${rect.top}px`;
  
  document.body.appendChild(floatingText);
  
  setTimeout(() => {
    floatingText.remove();
  }, 1000);
}

// Format large numbers
function formatNumber(num) {
  if (num >= 1e9) return (num / 1e9).toFixed(2) + "B";
  if (num >= 1e6) return (num / 1e6).toFixed(2) + "M";
  if (num >= 1e3) return (num / 1e3).toFixed(2) + "K";
  return Math.floor(num).toString();
}

// Render shop items
function renderShop() {
  const shopContainer = document.getElementById("shopContainer");
  shopContainer.innerHTML = "";
  shopItems.forEach(item => {
    const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.owned));
    const canAfford = exp >= cost;
    const itemDiv = document.createElement("div");
    itemDiv.className = `shop-item ${!canAfford ? 'disabled' : ''}`;
    itemDiv.dataset.itemId = item.id;
    itemDiv.onclick = () => canAfford && buyShopItem(item.id);
    itemDiv.innerHTML = `
      <div class="shop-item-icon">${item.icon}</div>
      <div class="shop-item-name">${item.name}</div>
      <div class="shop-item-description">${item.description}</div>
      <div class="shop-item-stats">
        <span class="shop-item-cost">🔮 ${formatNumber(cost)}</span>
        <span class="shop-item-owned">Owned: ${item.owned}</span>
      </div>
    `;
    shopContainer.appendChild(itemDiv);
  });
}

function updateShopUI() {
  const shopContainer = document.getElementById("shopContainer");
  if (!shopContainer.children.length) return;
  shopItems.forEach((item, idx) => {
    const cost = Math.floor(item.baseCost * Math.pow(item.costMultiplier, item.owned));
    const canAfford = exp >= cost;
    const itemDiv = shopContainer.children[idx];
    if (!itemDiv) return;
    itemDiv.className = `shop-item ${!canAfford ? 'disabled' : ''}`;
    // Always set the click handler so you can buy items
    itemDiv.onclick = () => canAfford && buyShopItem(item.id);
    // Update cost and owned
    const costSpan = itemDiv.querySelector('.shop-item-cost');
    if (costSpan) costSpan.textContent = `🔮 ${formatNumber(cost)}`;
    const ownedSpan = itemDiv.querySelector('.shop-item-owned');
    if (ownedSpan) ownedSpan.textContent = `Owned: ${item.owned}`;
  });
}

// Update UI with current values
function updateUI() {
  document.getElementById("expValue").textContent = formatNumber(exp);
  document.getElementById("clickValue").textContent = formatNumber(totalClicks);
  document.getElementById("expPerClickValue").textContent = formatNumber(expPerClick);
  document.getElementById("expPerSecond").textContent = formatNumber(expPerSecond);
  updateShopUI();
}

// Passive income loop
setInterval(() => {
  if (expPerSecond > 0) {
    exp += expPerSecond / 10; // Update every 100ms
    updateUI();
  }
}, 100);

// Initialize the game (start fresh, don't load from backend)
renderShop();
updateUI();
