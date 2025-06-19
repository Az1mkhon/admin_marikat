const apiBaseUrl = "http://api.marikat.uz/api/v1/";

// Sign Up Event Listener
const signupForm = document.getElementById("signupform");

signupForm.addEventListener("submit", async (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  try {
    const res = await fetch(`${apiBaseUrl}auth/signUp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ username, password }),
    });

    if (!res.ok) {
      alert("Sign-up failed!");
      return;
    }

    const data = await res.json();
    window.location.replace("/pages/login.html"); 
  } catch (error) {
    console.error("Error during sign-up:", error);
  }
});
