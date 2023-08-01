document.getElementById('login-form').addEventListener("submit", async(e) => {
  e.preventDefault();

  let email = document.getElementById("emailInput").value;
  let password = document.getElementById("passwordInput").value;

  try {
    console.log('Sending Login Request');
    const response = await axios.post("/user/login", {
      email: email,
      password: password
    })

    // Store the Token
    const token = response.data.token;
    const id = response.data.id;
    if(token) {
      console.log('Storing Token', token);
      localStorage.setItem('token', token);
      localStorage.setItem('id', id);
      window.location.href = "/main.html";
    }
    showPopupNotification("WELCOME");
  } catch (err) {
    console.log('Login error', err);
    if(err.response.status === 404)  {
      showPopupNotification("USER DOES NOT EXIST...CREATE AN ACCOUNT", "error")
    } else {
      showPopupNotification("INCORRECT PASSWORD!", "error");
    }
  }
});

function forgotPass() {
  window.location.href = "/forgotPass.html";
}

//POPUP NOTIFICATION
function showPopupNotification(message, type="success") {
  const popup = document.getElementById("popupNotification");
  popup.innerText = message;
  
  if(type === "error") {
    popup.classList.remove("success");
    popup.classList.add("error");
  } else {
    popup.classList.remove("error");
    popup.classList.add("success");
  }

  popup.classList.add("show");

  setTimeout(() => {
    popup.classList.remove("show");
  }, 3000);
}