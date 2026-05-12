function contactValidateForm(e) {
  e.preventDefault();

  const name = document.getElementById("contact-name").value.trim();
  const email = document.getElementById("contact-email").value.trim();
  const reason = document.getElementById("contact-reason").value;
  const message = document.getElementById("contact-message").value.trim();
  const errorDiv = document.getElementById("contact-error");
  const submitBtn = document.getElementById("contact-submit");

  errorDiv.innerText = "";
  errorDiv.style.color = "red";

  // ✅ Validation
  if (name === "") {
    errorDiv.innerText = "Please enter your name";
    return;
  }

  if (email === "") {
    errorDiv.innerText = "Enter your email";
    return;
  }

  const emailPattern = /^[^ ]+@[^ ]+\.[a-z]{2,3}$/;
  if (!email.match(emailPattern)) {
    errorDiv.innerText = "Enter a valid email";
    return;
  }

  if (reason === "") {
    errorDiv.innerText = "Please select a reason";
    return;
  }

  if (message === "") {
    errorDiv.innerText = "Message cannot be empty";
    return;
  }

  // ✅ BUTTON DISABLE (IMPORTANT 🔥)
  submitBtn.disabled = true;
  submitBtn.innerText = "Sending...";

  // 🚀 EmailJS Send
  emailjs.send("service_2ei9mst", "template_rj1ptq4", {
    name: name,
    email: email,
    reason: reason,
    message: message
  })
  .then(function(response) {
    errorDiv.style.color = "lightgreen";
    errorDiv.innerText = "Message sent successfully ✅";

    document.getElementById("contact-form").reset();

    // ✅ BUTTON ENABLE BACK
    submitBtn.disabled = false;
    submitBtn.innerText = "Send";
  })
  .catch(function(error) {
    errorDiv.style.color = "red";
    errorDiv.innerText = "Failed to send ❌";

    console.error(error);

    // ❗ FAIL par bhi enable wapas
    submitBtn.disabled = false;
    submitBtn.innerText = "Send";
  });
}