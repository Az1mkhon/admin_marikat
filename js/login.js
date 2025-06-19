const apiBaseUrl = "http://api.marikat.uz/api/v1/"; // Change to HTTPS if possible

// Login Event Listener
const loginForm = document.getElementById("loginform");

loginForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${apiBaseUrl}auth/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    const data = await res.json();

    if (!res.ok) {
      throw new Error(data.message || `HTTP error! Status: ${res.status}`);
    }
    localStorage.setItem("accessToken", data.token);
    window.location.replace("/pages/orders.html");
  } catch (error) {
    console.error("Login failed:", error.message);
  }
});
