const API_URL = '/api';
let token = localStorage.getItem('token');
let user = null;
let spendingChart = null;




// DOM Elements
const authSection = document.getElementById('auth-section');
const dashboardSection = document.getElementById('dashboard-section');
const authForm = document.getElementById('auth-form');
const toggleAuth = document.getElementById('toggle-auth');
const authTitle = document.getElementById('auth-title');
const nameInput = document.getElementById('name');
const authSubmit = document.getElementById('auth-submit');

// Initialize
if (token) {
    checkAuth();
}



toggleAuth.onclick = (e) => {
    e.preventDefault();
    const isLogin = authTitle.innerText === 'Login';
    authTitle.innerText = isLogin ? 'Register' : 'Login';
    authSubmit.innerText = isLogin ? 'Register' : 'Login';
    toggleAuth.innerText = isLogin ? 'Already have an account? Login' : 'Need an account? Register';
    nameInput.classList.toggle('hidden');
};

async function safeJson(res) {
    try {
        return await res.json();
    } catch (e) {
        return { error: 'Invalid server response' };
    }
}

authForm.onsubmit = async (e) => {
    e.preventDefault();
    const isLogin = authTitle.innerText === 'Login';
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    const payload = {
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
    };
    if (!isLogin) payload.name = nameInput.value;

    try {
        const res = await fetch(`${API_URL}${endpoint}`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        const data = await safeJson(res);
        if (data.token) {
            localStorage.setItem('token', data.token);
            token = data.token;
            checkAuth();
        } else {
            alert(data.error || 'Auth failed');
        }
    } catch (err) {
        console.error(err);
    }
};

async function checkAuth() {
    try {
        const res = await fetch(`${API_URL}/auth/profile`, {
            headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
            user = await safeJson(res);
            showDashboard();
        } else {
            logout();
        }
    } catch (err) {
        logout();
    }
}


function showDashboard() {
    authSection.classList.add('hidden');
    dashboardSection.classList.remove('hidden');
    document.getElementById('user-info').classList.remove('hidden');
    document.getElementById('user-name').innerText = `Hi, ${user.name || user.email}`;
    loadAll();
}

function logout() {
    localStorage.removeItem('token');
    token = null;
    user = null;
    authSection.classList.remove('hidden');
    dashboardSection.classList.add('hidden');
    document.getElementById('user-info').classList.add('hidden');
}

async function loadAll() {
    loadSummary();
    loadCategories();
    loadTransactions();
    loadBudgets();
    updateChart();
}

async function updateChart() {
    const res = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const transactions = await res.json();
    const expenses = transactions.filter(t => t.type === 'EXPENSE');
    
    const categoryTotals = {};
    expenses.forEach(t => {
        const catName = t.category.name;
        categoryTotals[catName] = (categoryTotals[catName] || 0) + Math.abs(parseFloat(t.amount));
    });

    const ctx = document.getElementById('spendingChart').getContext('2d');
    
    if (spendingChart) {
        spendingChart.destroy();
    }

    spendingChart = new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: Object.keys(categoryTotals),
            datasets: [{
                data: Object.values(categoryTotals),
                backgroundColor: [
                    '#6366f1', '#ec4899', '#f59e0b', '#10b981', '#ef4444', '#8b5cf6', '#06b6d4'
                ],
                borderWidth: 0
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'bottom',
                    labels: { color: '#94a3b8', font: { family: 'Inter' } }
                }
            }
        }
    });
}

function exportCSV() {
    const table = document.getElementById('transaction-list');
    let csv = 'Date,Description,Category,Type,Amount\n';
    
    // We'll fetch the data instead of scraping the table for better accuracy
    fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    })
    .then(res => res.json())
    .then(transactions => {
        transactions.forEach(t => {
            const row = [
                new Date(t.date).toLocaleDateString(),
                t.description || '',
                t.category.name,
                t.type,
                t.amount
            ].map(v => `"${v}"`).join(',');
            csv += row + '\n';
        });
        
        const blob = new Blob([csv], { type: 'text/csv' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.setAttribute('hidden', '');
        a.setAttribute('href', url);
        a.setAttribute('download', 'transactions.csv');
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    });
}



async function loadSummary() {
    const res = await fetch(`${API_URL}/dashboard/summary`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const data = await res.json();
    document.getElementById('total-balance').innerText = `$${data.balance.toFixed(2)}`;
    document.getElementById('total-income').innerText = `$${data.totalIncome.toFixed(2)}`;
    document.getElementById('total-expense').innerText = `$${data.totalExpense.toFixed(2)}`;
}


async function loadCategories() {
    const res = await fetch(`${API_URL}/categories`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const categories = await res.json();
    const currentType = document.getElementById('t-type').value;
    
    const select = document.getElementById('t-category');
    const budgetSelect = document.getElementById('b-category');
    const list = document.getElementById('category-list');
    
    select.innerHTML = '<option value="">Select Category</option>';
    budgetSelect.innerHTML = '<option value="">Select Category</option>';
    list.innerHTML = '';
    
    // Filter categories to match selected type for the transaction dropdown
    const filtered = categories.filter(c => c.type === currentType);
    filtered.forEach(c => {
        const option = `<option value="${c.id}">${c.name}</option>`;
        select.innerHTML += option;
    });

    // We still show all categories in the budget and general category list
    categories.forEach(c => {
        const option = `<option value="${c.id}">${c.name} (${c.type})</option>`;
        budgetSelect.innerHTML += option;
        
        const li = document.createElement('li');
        li.style.display = 'flex';
        li.style.justifyContent = 'space-between';
        li.style.padding = '0.5rem 0';
        li.innerHTML = `
            <span>${c.name} (${c.type})</span>
            <button onclick="deleteCategory('${c.id}')" style="padding: 2px 8px; background: var(--expense); font-size: 12px;">Delete</button>
        `;
        list.appendChild(li);
    });
}


async function loadBudgets() {
    const now = new Date();
    const res = await fetch(`${API_URL}/budgets?month=${now.getMonth()+1}&year=${now.getFullYear()}`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const budgets = await res.json();
    const list = document.getElementById('budget-list');
    list.innerHTML = '';
    
    budgets.forEach(b => {
        const div = document.createElement('div');
        div.style.marginBottom = '1rem';
        const isExceeded = b.percentUsed > 100;
        const progress = Math.min(b.percentUsed, 100);
        const color = isExceeded ? 'var(--expense)' : (b.percentUsed > 85 ? '#f59e0b' : 'var(--income)');
        
        div.innerHTML = `
            <div style="display: flex; justify-content: space-between; font-size: 14px; margin-bottom: 4px;">
                <span class="${isExceeded ? 'danger' : ''}">${b.category.name} ${isExceeded ? '⚠️ EXCEEDED' : ''}</span>
                <span class="${isExceeded ? 'danger' : ''}">$${b.spent.toFixed(2)} / $${Number(b.amount).toFixed(2)}</span>
            </div>
            <div style="background: var(--border); height: 8px; border-radius: 4px; overflow: hidden;">
                <div style="background: ${color}; width: ${progress}%; height: 100%;"></div>
            </div>
        `;
        list.appendChild(div);
    });

}


async function loadTransactions() {
    const res = await fetch(`${API_URL}/transactions`, {
        headers: { 'Authorization': `Bearer ${token}` }
    });
    const transactions = await res.json();
    const list = document.getElementById('transaction-list');
    list.innerHTML = '';
    
    transactions.forEach(t => {
        const tr = document.createElement('tr');
        const date = new Date(t.date).toLocaleDateString();
        tr.innerHTML = `
            <td>${date}</td>
            <td>${t.description || '-'}</td>
            <td>${t.category.name}</td>
            <td class="${t.type === 'INCOME' ? 'income' : 'expense'}">
                ${t.type === 'INCOME' ? '+' : '-'}$${Math.abs(t.amount).toFixed(2)}
            </td>
            <td>
                ${t.receiptUrl ? `<a href="${t.receiptUrl}" target="_blank" style="color: var(--primary); font-size: 12px;">View</a>` : '-'}
            </td>
            <td>
                <button onclick="deleteTransaction('${t.id}')" style="padding: 2px 8px; background: var(--expense); font-size: 12px;">Delete</button>
            </td>
        `;

        list.appendChild(tr);
    });
}

document.getElementById('category-form').onsubmit = async (e) => {
    e.preventDefault();
    const name = document.getElementById('c-name').value;
    const type = document.getElementById('c-type').value;
    
    await fetch(`${API_URL}/categories`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ name, type })
    });
    document.getElementById('c-name').value = '';
    loadCategories();
};

document.getElementById('transaction-form').onsubmit = async (e) => {
    e.preventDefault();
    const amount = document.getElementById('t-amount').value;
    const description = document.getElementById('t-description').value;
    const type = document.getElementById('t-type').value;
    const categoryId = document.getElementById('t-category').value;
    const receiptFile = document.getElementById('t-receipt').files[0];
    
    const formData = new FormData();
    formData.append('amount', amount);
    formData.append('description', description);
    formData.append('type', type);
    formData.append('categoryId', categoryId);
    if (receiptFile) formData.append('receipt', receiptFile);
    
    await fetch(`${API_URL}/transactions`, {
        method: 'POST',
        headers: { 
            'Authorization': `Bearer ${token}`
        },
        body: formData
    });
    document.getElementById('transaction-form').reset();
    loadAll();
};


document.getElementById('budget-form').onsubmit = async (e) => {
    e.preventDefault();
    const categoryId = document.getElementById('b-category').value;
    const amount = document.getElementById('b-amount').value;
    const now = new Date();
    
    await fetch(`${API_URL}/budgets`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ 
            categoryId, 
            amount: parseFloat(amount), 
            month: now.getMonth() + 1, 
            year: now.getFullYear() 
        })
    });
    loadBudgets();
};


async function deleteCategory(id) {
    const res = await fetch(`${API_URL}/categories/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    if (!res.ok) {
        const data = await res.json();
        alert(data.error);
    }
    loadCategories();
}

async function deleteTransaction(id) {
    await fetch(`${API_URL}/transactions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
    });
    loadAll();
}

document.getElementById('toggle-password-view').onclick = () => {
    const passInput = document.getElementById('password');
    const toggleBtn = document.getElementById('toggle-password-view');
    if (passInput.type === 'password') {
        passInput.type = 'text';
        toggleBtn.innerText = 'Hide';
    } else {
        passInput.type = 'password';
        toggleBtn.innerText = 'Show';
    }
};

// Filter categories based on transaction type
document.getElementById('t-type').onchange = () => {
    loadCategories();
};

