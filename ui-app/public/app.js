const nameInput = document.querySelector('[data-testid="input-name"]');
const emailInput = document.querySelector('[data-testid="input-email"]');
const messageInput = document.querySelector('[data-testid="textarea-message"]');
const liveOutput = document.querySelector('[data-testid="input-name-live-output"]');
const validationMessage = document.querySelector('[data-testid="input-validation-message"]');
const validateButton = document.querySelector('[data-testid="btn-validate-inputs"]');
const clearButton = document.querySelector('[data-testid="btn-clear-inputs"]');

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

nameInput.addEventListener('input', () => {
  liveOutput.textContent = nameInput.value
    ? `You typed: ${nameInput.value}`
    : 'You typed: (nothing yet)';
});

validateButton.addEventListener('click', () => {
  const errors = [];
  if (!nameInput.value.trim()) errors.push('Name is required.');
  if (!EMAIL_RE.test(emailInput.value.trim())) errors.push('A valid email is required.');
  validationMessage.textContent = errors.length ? errors.join(' ') : 'All fields are valid!';
});

clearButton.addEventListener('click', () => {
  nameInput.value = '';
  emailInput.value = '';
  messageInput.value = '';
  liveOutput.textContent = 'You typed: (nothing yet)';
  validationMessage.textContent = '';
});

// Checkboxes & Radio Buttons
const termsCheckbox = document.querySelector('[data-testid="checkbox-terms"]');
const newsletterCheckbox = document.querySelector('[data-testid="checkbox-newsletter"]');
const interestCheckboxes = Array.from(
  document.querySelectorAll('[data-testid^="checkbox-interest-"]'),
);
const checkboxOutput = document.querySelector('[data-testid="checkbox-selected-output"]');

function updateCheckboxOutput() {
  const interests = interestCheckboxes
    .filter((checkbox) => checkbox.checked)
    .map((checkbox) => checkbox.dataset.testid.replace('checkbox-interest-', ''))
    .map((name) => name.charAt(0).toUpperCase() + name.slice(1));
  checkboxOutput.textContent = `Terms accepted: ${termsCheckbox.checked ? 'Yes' : 'No'} | Newsletter: ${newsletterCheckbox.checked ? 'Yes' : 'No'} | Interests: ${interests.join(', ')}`;
}

[termsCheckbox, newsletterCheckbox, ...interestCheckboxes].forEach((checkbox) => {
  checkbox.addEventListener('change', updateCheckboxOutput);
});
updateCheckboxOutput();

const radioButtons = Array.from(document.querySelectorAll('[data-testid^="radio-"]'));
const radioOutput = document.querySelector('[data-testid="radio-selected-output"]');
const radioLabels = { male: 'Male', female: 'Female', other: 'Other' };

radioButtons.forEach((radio) => {
  radio.addEventListener('change', () => {
    const option = radio.dataset.testid.replace('radio-', '');
    radioOutput.textContent = `Selected: ${radioLabels[option] ?? option}`;
  });
});

// Web Table
const tableBody = document.querySelector('[data-testid="data-table-body"]');
const addRowButton = document.querySelector('[data-testid="btn-add-row"]');
const errorMessage = document.querySelector('[data-testid="table-error-message"]');

function renderRow(user) {
  const tr = document.createElement('tr');
  tr.setAttribute('data-testid', `table-row-${user.id}`);
  tr.innerHTML = `
    <td id="table-row-${user.id}-name">${user.name}</td>
    <td id="table-row-${user.id}-email">${user.email}</td>
    <td id="table-row-${user.id}-role">${user.role}</td>
    <td><button type="button" data-testid="btn-edit-${user.id}">Edit</button></td>
  `;

  tr.querySelector(`[data-testid="btn-edit-${user.id}"]`).addEventListener('click', () => {
    enterEditMode(tr, user);
  });

  return tr;
}

function enterEditMode(tr, user) {
  const nameCell = tr.querySelector(`#table-row-${user.id}-name`);
  const emailCell = tr.querySelector(`#table-row-${user.id}-email`);
  const actionCell = tr.children[3];

  nameCell.innerHTML = `<input type="text" data-testid="table-row-${user.id}-name-input" value="${user.name}" />`;
  emailCell.innerHTML = `<input type="email" data-testid="table-row-${user.id}-email-input" value="${user.email}" />`;
  actionCell.innerHTML = `<button type="button" data-testid="btn-save-${user.id}">Save</button>`;

  actionCell
    .querySelector(`[data-testid="btn-save-${user.id}"]`)
    .addEventListener('click', async () => {
      const newName = tr.querySelector(
        `[data-testid="table-row-${user.id}-name-input"]`,
      ).value;
      const newEmail = tr.querySelector(
        `[data-testid="table-row-${user.id}-email-input"]`,
      ).value;
      const updated = await saveUser(user.id, newName, newEmail);
      tr.replaceWith(renderRow(updated));
    });
}

async function saveUser(id, name, email) {
  const res = await fetch(`/api/users/${id}`, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name, email }),
  });
  return res.json();
}

async function fetchUsers() {
  try {
    const res = await fetch('/api/users');
    if (!res.ok) throw new Error('bad response');
    const users = await res.json();
    tableBody.innerHTML = '';
    users.forEach((user) => tableBody.appendChild(renderRow(user)));
    errorMessage.hidden = true;
  } catch (error) {
    errorMessage.hidden = false;
  }
}

addRowButton.addEventListener('click', async () => {
  const res = await fetch('/api/users', { method: 'POST' });
  const user = await res.json();
  tableBody.appendChild(renderRow(user));
});

fetchUsers();
