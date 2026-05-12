function loadSavedEmails() {
  const saved = JSON.parse(localStorage.getItem("emails")) || [];
  const list = document.getElementById("savedList");

  list.innerHTML = "";

  // ❌ No emails case
  if (saved.length === 0) {
    list.innerHTML = `
      <div style="text-align:center; color: #94a3b8;">
        No saved emails
      </div>
    `;
    return;
  }

  // ✅ Show emails
  saved.forEach((item, index) => {
    const div = document.createElement("div");
    div.className = "saved-item";

    div.innerHTML = `
      <div class="saved-email">${item.email}</div>

      <div class="saved-actions">
        <button class="open-btn" onclick="openInbox(${index})">Open</button>
        <button class="delete-btn" onclick="deleteEmail(${index})">Delete</button>
      </div>
    `;

    list.appendChild(div);
  });
}

function openInbox(index) {
  const saved = JSON.parse(localStorage.getItem("emails"));
  localStorage.setItem("activeEmail", JSON.stringify(saved[index]));
  window.location.href = "saved-inbox.html";
}

function deleteEmail(index) {
  let saved = JSON.parse(localStorage.getItem("emails"));
  saved.splice(index, 1);
  localStorage.setItem("emails", JSON.stringify(saved));
  loadSavedEmails();
}

function goHome() {
  window.location.href = "temp.html";
}

loadSavedEmails();