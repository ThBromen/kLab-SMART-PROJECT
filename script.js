const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const filterCategory = document.getElementById("filter-category");
const ctx = document.getElementById("expenseChart").getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

// Navigation functionality
document.addEventListener('DOMContentLoaded', function() {
  // Navigation button event listeners
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', (e) => {
      // Remove active class from all buttons and sections
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
      document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
      
      // Add active class to clicked button
      btn.classList.add('active');
      
      // Show corresponding section
      const sectionId = btn.getAttribute('data-section');
      document.getElementById(sectionId).classList.add('active');
      
      // Update displays when switching sections
      if (sectionId === 'view-expenses') {
        renderTransactions();
      } else if (sectionId === 'statistics') {
        updateStatistics();
        updateChart();
      }
    });
  });
});

// Initialize Chart
let expenseChart = new Chart(ctx, {
  type: "doughnut",
  data: {
    labels: ["Food", "Rent", "Travel", "Shopping", "Other"],
    datasets: [{
      label: "Expenses",
      data: [0, 0, 0, 0, 0],
      backgroundColor: ["#ff6384", "#36a2eb", "#ffce56", "#4bc0c0", "#9966ff"],
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
  }
});

// Update Chart
function updateChart() {
  let categories = ["Food", "Rent", "Travel", "Shopping", "Other"];
  let totals = categories.map(cat =>
    transactions.filter(t => t.category === cat && t.type === "Expense")
                .reduce((sum, t) => sum + t.amount, 0)
  );
  expenseChart.data.datasets[0].data = totals;
  expenseChart.update();
}

// Update Statistics
function updateStatistics() {
  const totalIncome = transactions
    .filter(t => t.type === 'Income')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const totalExpenses = transactions
    .filter(t => t.type === 'Expense')
    .reduce((sum, t) => sum + t.amount, 0);
  
  const netBalance = totalIncome - totalExpenses;
  const totalTransactionCount = transactions.length;
  
  // Update statistics display
  document.getElementById('total-income').textContent = `${totalIncome.toLocaleString()} RWF`;
  document.getElementById('total-expenses').textContent = `${totalExpenses.toLocaleString()} RWF`;
  document.getElementById('net-balance').textContent = `${netBalance.toLocaleString()} RWF`;
  document.getElementById('total-transactions').textContent = totalTransactionCount;
  
  // Color coding for net balance
  const netBalanceEl = document.getElementById('net-balance');
  if (netBalance >= 0) {
    netBalanceEl.style.color = '#28a745';
  } else {
    netBalanceEl.style.color = '#dc3545';
  }
}

// Render Transactions
function renderTransactions() {
  expenseList.innerHTML = "";
  let filtered = filterCategory.value === "All"
    ? transactions
    : transactions.filter(t => t.category === filterCategory.value);

  if (filtered.length === 0) {
    expenseList.innerHTML = '<li style="text-align: center; padding: 15px; background: #f8f9fa; border-left: none;">No transactions found</li>';
    updateTotals();
    return;
  }

  // Sort by date (newest first)
  filtered.sort((a, b) => new Date(b.date) - new Date(a.date));

  filtered.forEach((t, index) => {
    const li = document.createElement("li");
    li.classList.add(t.type.toLowerCase());
    li.innerHTML = `
      <div>
        <strong>${t.description}</strong><br>
        <small>${t.date} - ${t.category}</small>
      </div>
      <div style="text-align: right;">
        <strong>${t.type === "Expense" ? "-" : "+"}${t.amount.toLocaleString()} RWF</strong><br>
        <button onclick="deleteTransaction(${transactions.indexOf(t)})">Delete</button>
      </div>
    `;
    expenseList.appendChild(li);
  });

  updateTotals();
  updateChart();
}

// Update Totals
function updateTotals() {
  let total = transactions.reduce((sum, t) =>
    t.type === "Expense" ? sum - t.amount : sum + t.amount, 0
  );
  totalDisplay.textContent = total.toLocaleString();
  
  // Color coding for total
  if (total >= 0) {
    totalDisplay.style.color = '#28a745';
  } else {
    totalDisplay.style.color = '#dc3545';
  }
}

// Add Transaction
expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;

  if (!description || !amount || !category || !type || !date) {
    alert("Please fill in all fields!");
    return;
  }

  const transaction = { description, amount, category, type, date };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  expenseForm.reset();
  
  // Set today's date as default after reset
  document.getElementById('date').valueAsDate = new Date();
  
  alert("Transaction added successfully!");
  
  // If currently viewing expenses or statistics, update the display
  const activeSection = document.querySelector('.content-section.active');
  if (activeSection.id === 'view-expenses') {
    renderTransactions();
  } else if (activeSection.id === 'statistics') {
    updateStatistics();
    updateChart();
  }
});

// Delete Transaction
function deleteTransaction(index) {
  if (confirm("Are you sure you want to delete this transaction?")) {
    transactions.splice(index, 1);
    localStorage.setItem("transactions", JSON.stringify(transactions));
    renderTransactions();
    updateStatistics();
  }
}

// Filter Change
filterCategory.addEventListener("change", renderTransactions);

// Set default date to today
document.getElementById('date').valueAsDate = new Date();

// Initial Load
renderTransactions();
updateStatistics();