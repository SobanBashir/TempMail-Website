let email = "";
let password = "12345678";
let token = "";



window.onload = function () {
  const savedEmail = localStorage.getItem("savedEmail");
  const savedToken = localStorage.getItem("savedToken");

  if (savedEmail && savedToken) {
    email = savedEmail;
    token = savedToken;

    document.getElementById("emailText").innerText = email;

    document.getElementById("copyBtn").disabled = false;

    loadInbox(); // 🔥 old inbox load
  } else {
    generateEmail(); 
  }
};




let seenMessages = new Set();



function goHome() {
  window.location.href = "index.html";
}


function toggleSettings() {
  const panel = document.getElementById("settingsPanel");

  if (panel.style.display === "block") {
    panel.style.display = "none";
  } else {
    panel.style.display = "block";
  }
}


window.addEventListener("click", function(e) {
  const panel = document.getElementById("settingsPanel");
  const btn = document.querySelector(".nav-settings-btn");

  if (!panel.contains(e.target) && !btn.contains(e.target)) {
    panel.style.display = "none";
  }
});

// window.onload = function() {
//   generateEmail(); // 🔥 auto email generate
// };

// Get domain list
async function getDomain() {
  const res = await fetch("https://api.mail.tm/domains");
  const data = await res.json();
  return data["hydra:member"][0].domain;
}

// Generate email
async function generateEmail() {

  // localStorage.removeItem("savedEmail");
  // localStorage.removeItem("savedToken");
  

  const copyBtn = document.getElementById("copyBtn");
  const emailText = document.getElementById("emailText");
  const messagesDiv = document.getElementById("messages");
  const emptyBox = document.getElementById("emptyState");

  // 🔒 disable button
  copyBtn.disabled = true;
  emailText.innerText = "⏳ Generating...";

 // 👉 generate email
const domain = await getDomain();
email = "user" + Math.floor(Math.random() * 10000) + "@" + domain;

// 👉 create account
const accRes = await fetch("https://api.mail.tm/accounts", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({
    address: email,
    password: password
  })
});

// ❌ agar account fail ho gaya
if (!accRes.ok) {
  copyBtn.disabled = false;
  return;
}

// 👉 LOGIN
await login();

console.log("EMAIL:", email);
console.log("TOKEN:", token);

// ❌ agar token nahi mila
if (!token) {
  console.error("Token not found");
  return;
}

// 🔥 SAVE (only if valid)
localStorage.setItem("savedEmail", email);
localStorage.setItem("savedToken", token);

// 👉 UI RESET
messagesDiv.innerHTML = "";
emptyBox.style.display = "block";

// 👉 show email
emailText.innerText = email;

// 👉 inbox load
loadInbox();

// 👉 enable button
copyBtn.disabled = false;
}
// COPY EMAIL
function copyEmail() {
  const emailText = document.getElementById("emailText").innerText;

  if (!emailText || emailText.includes("Generating")) return;

  navigator.clipboard.writeText(emailText);

  const btn = document.getElementById("copyBtn");

  // 👉 icon change
  btn.innerText = "✅";

  setTimeout(() => {
    btn.innerText = "📋";
  }, 2000);
}
// Login
 async function login() {
  const res = await fetch("https://api.mail.tm/token", {
    method: "POST",
    headers: {"Content-Type": "application/json"},
    body: JSON.stringify({ address: email, password: password })
  });

  const data = await res.json();
  token = data.token;
 }

 // Load inbox
async function loadInbox() {
  if (!token) return;

  const res = await fetch("https://api.mail.tm/messages", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const messagesDiv = document.getElementById("messages");
  const emptyBox = document.getElementById("emptyState");

  // 🔄 reset UI
  messagesDiv.innerHTML = "";

  // ❌ no messages
  if (data["hydra:member"].length === 0) {
    emptyBox.style.display = "block";
    return; // 🔥 yahan return zaroori hai
  }

  // ✅ messages exist
  emptyBox.style.display = "none";

  // 📩 show messages
  for (let msg of data["hydra:member"]) {
    addMessageToUI(msg);
  }
}
 
//  CHECK NEW EMAIL CODE
async function checkNewEmails() {
  if (!token) return;

  const res = await fetch("https://api.mail.tm/messages", {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  for (let msg of data["hydra:member"]) {
    if (!seenMessages.has(msg.id)) {
      addMessageToUI(msg); // 👈 sirf new add karo
    }
  }
}
  // ADD MESSAGE TO UI INBOX
function addMessageToUI(msg) {
  const messagesDiv = document.getElementById("messages");
  const emptyBox = document.getElementById("emptyState");

  if (!messagesDiv) return;

  // 🔥 FIX: hide empty state when message comes
  if (emptyBox) {
    emptyBox.style.display = "none";
  }

  const div = document.createElement("div");

  // 👉 check new message
  if (!seenMessages.has(msg.id)) {
    div.className = "message new-message";

    // highlight remove after 3 sec
    setTimeout(() => {
      div.classList.remove("new-message");
    }, 3000);

    seenMessages.add(msg.id);
  } else {
    div.className = "message";
  }

  // 👉 text
  div.innerText = msg.subject || "No Subject";

  // 👉 click open
  div.onclick = () => openMessage(msg.id);

  // 👉 newest on top
  messagesDiv.prepend(div);
}

async function openMessage(id) {
  const res = await fetch(`https://api.mail.tm/messages/${id}`, {
    headers: { Authorization: "Bearer " + token }
  });

  const data = await res.json();

  const text = data.text || data.html || "";

  // 🔍 OTP detect
  const otpMatch = text.match(/\d{4,6}/);
  const otp = otpMatch ? otpMatch[0] : null;

  const messagesDiv = document.getElementById("messages");

  messagesDiv.innerHTML = `
    <div class="full-message">
      <b>From:</b> ${data.from.address}<br>
      <b>Subject:</b> ${data.subject}<br><br>

      ${text}

      ${
        otp
          ? `<div class="otp-box">
               <span>OTP: <b id="otpText">${otp}</b></span>
               <button onclick="copyOTP(this)">📋 Copy</button>
             </div>`
          : ""
      }
    </div>

    <button onclick="loadInbox()" style="margin-top:10px;">
      ⬅ Back
    </button>
  `;

  // 🚀 AUTO COPY (optional)
  // if (otp) {
  //   navigator.clipboard.writeText(otp);
  //   console.log("OTP auto copied:", otp);
  // }

}

function copyOTP(btn) {
  const otp = document.getElementById("otpText").innerText;

  navigator.clipboard.writeText(otp);

  // ✅ button change
  btn.innerText = "Copied ✅";
  btn.style.background = "#16a34a";

  // 🔁 2 sec baad normal
  setTimeout(() => {
    btn.innerText = "📋 Copy";
    btn.style.background = "#22c55e";
  }, 2000);
}


function saveEmail() {
  let saved = JSON.parse(localStorage.getItem("emails")) || [];

  const exists = saved.find(item => item.email === email);

  if (!exists) {
    saved.push({ email: email, token: token });
    localStorage.setItem("emails", JSON.stringify(saved));
    alert("Email saved ✅");
  } else {
    alert("Already saved ⚠️");
  }
}

function openSavedPage() {
  window.location.href = "saved.html";
}


const elements = document.querySelectorAll(".scroll-animate");

function checkScroll() {
  const triggerBottom = window.innerHeight * 0.85;

  elements.forEach((el) => {
    const boxTop = el.getBoundingClientRect().top;

    if (boxTop < triggerBottom) {
      el.classList.add("active");
    }
  });
}

window.addEventListener("scroll", checkScroll);
window.addEventListener("load", checkScroll);


const faqQuestions = document.querySelectorAll(".faq-question");

faqQuestions.forEach((btn) => {
  btn.addEventListener("click", () => {
    const answer = btn.nextElementSibling;

    // toggle
    if (answer.style.display === "block") {
      answer.style.display = "none";
    } else {
      answer.style.display = "block";
    }
  });
});


setInterval(() => {
  if (token) checkNewEmails();
}, 3000);