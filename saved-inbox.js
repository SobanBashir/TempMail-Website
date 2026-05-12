let email = "";
let token = "";

function loadSavedInbox() {
  const data = JSON.parse(localStorage.getItem("activeEmail"));

  if (!data) {
    alert("No saved email found");
    return;
  }

  email = data.email;
  token = data.token;

  document.getElementById("emailText").innerText = email;

  loadInbox();
}

async function loadInbox() {
  const res = await fetch("https://api.mail.tm/messages", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const messagesDiv = document.getElementById("messages");
  const emptyBox = document.getElementById("emptyState");

  messagesDiv.innerHTML = "";

  if (data["hydra:member"].length === 0) {
    emptyBox.style.display = "block";
    return;
  }

  emptyBox.style.display = "none";

  data["hydra:member"].forEach(msg => {
  const div = document.createElement("div");
  div.innerText = msg.subject || "(No Subject)";
  div.setAttribute("data-id", msg.id);

  div.onclick = () => openMessage(msg.id);
  messagesDiv.appendChild(div);

  // ⏳ AUTO DELETE after 20 sec
  if (!messageTimers[msg.id]) {
    messageTimers[msg.id] = setTimeout(() => {
      const el = document.querySelector(`[data-id="${msg.id}"]`);
      if (el) el.remove();

      // agar sab delete ho jaye → empty show karo
      if (messagesDiv.children.length === 0) {
        document.getElementById("emptyState").style.display = "block";
      }
    }, 10000); // 20 sec
  }
});
}

async function openMessage(id) {
  const res = await fetch(`https://api.mail.tm/messages/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  document.getElementById("messages").innerHTML = `
    <h4>${data.subject}</h4>
    <p>${data.text}</p>
    <button onclick="loadInbox()">⬅ Back</button>
  `;
}

function copyEmail() {
  navigator.clipboard.writeText(email);
  alert("Copied ✅");
}

function goBack() {
  window.location.href = "saved.html";
}

let messageTimers = {};

loadSavedInbox();