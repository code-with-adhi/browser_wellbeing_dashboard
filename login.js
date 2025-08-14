// ** IMPORTANT **: Replace this with your actual Render API URL
const API_URL = "https://browser-wellbeing-server.onrender.com";

const loginForm = document.getElementById("loginForm");
const messageEl = document.getElementById("message");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault(); // Prevents the form from reloading the page
  messageEl.textContent = "Logging in...";

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const response = await fetch(`${API_URL}/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });

    const data = await response.json();

    if (response.ok) {
      // Login was successful. Save the token to the browser's local storage.
      localStorage.setItem("authToken", data.token);
      // Redirect the user to the dashboard page.
      window.location.href = "/dashboard.html";
    } else {
      // Login failed. Show the error message from the server.
      messageEl.textContent = data.error || "Login failed.";
    }
  } catch (error) {
    console.error("Login request failed:", error);
    messageEl.textContent = "Could not connect to the server.";
  }
});
