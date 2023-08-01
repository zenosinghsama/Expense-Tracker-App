document.getElementById("signup-form").addEventListener("submit", async(e) => {
  e.preventDefault();
  const name = document.getElementById("nameInput").value
  const email = document.getElementById("emailInput").value
  const password = document.getElementById("passwordInput").value

  if(name === "" || email === "" || password === "" ) {
    document.querySelector("#errorAlert").innerText = "ALL FIELDS MANDATORY!";
    alertAwakeSleep();
    return;
  }

  try {
    const response = await axios.post("/user/signup", {
      name: name,
      email: email,
      password: password
    })

    if(response.status === 201) {
      document.querySelector("#successAlert").innerText = `${response.data.UserAddedResponse}`;
      successAlertAwakeSleep();

      window.location.href = "/login.html";
    } else {
      throw new Error("ERROR CREATING USER");
    }
  } catch(err) {
    document.querySelector("#errorAlert").innerText = `${err.response.data.message}`;
    alertAwakeSleep();
  }
});


function alertAwakeSleep() {
  document.querySelector("#errorAlert").classList.toggle("hidden");
  setTimeout(function() {
    document.getElementById("errorAlert").classList.toggle("hidden");
  }, 1500);
}

function successAlertAwakeSleep() {
  document.querySelector("#successAlert").classList.toggle("hidden");
  setTimeout(function() {
    document.getElementById("successAlert").classList.toggle("hidden");
  }, 2000);
}