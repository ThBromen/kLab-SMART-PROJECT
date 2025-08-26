const expenseForm = document.getElementById("expense-form");
const expenseList = document.getElementById("expense-list");
const totalDisplay = document.getElementById("total");
const filterCategory = document.getElementById("filter-category");
const ctx = document.getElementById("expenseChart").getContext("2d");

let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

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

// Render Transactions
function renderTransactions() {
  expenseList.innerHTML = "";
  let filtered = filterCategory.value === "All"
    ? transactions
    : transactions.filter(t => t.category === filterCategory.value);

  filtered.forEach((t, index) => {
    const li = document.createElement("li");
    li.classList.add(t.type.toLowerCase());
    li.innerHTML = `
      ${t.date} - ${t.description} (${t.category}) : 
      <strong>${t.type === "Expense" ? "-" : "+"}${t.amount} RWF</strong>
      <button onclick="deleteTransaction(${index})">X</button>
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
  totalDisplay.textContent = total;
}

// Add Transaction
expenseForm.addEventListener("submit", e => {
  e.preventDefault();
  const description = document.getElementById("description").value;
  const amount = parseFloat(document.getElementById("amount").value);
  const category = document.getElementById("category").value;
  const type = document.getElementById("type").value;
  const date = document.getElementById("date").value;

  if (!description || !amount || !category || !type || !date) return;

  const transaction = { description, amount, category, type, date };
  transactions.push(transaction);
  localStorage.setItem("transactions", JSON.stringify(transactions));

  expenseForm.reset();
  renderTransactions();
});

// Delete Transaction
function deleteTransaction(index) {
  transactions.splice(index, 1);
  localStorage.setItem("transactions", JSON.stringify(transactions));
  renderTransactions();
}

// Filter Change
filterCategory.addEventListener("change", renderTransactions);

// Initial Load
renderTransactions();
