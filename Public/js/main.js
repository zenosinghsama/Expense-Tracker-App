let amountInput = document.getElementById("amount");
let descriptionInput = document.getElementById("description");
let categoryInput = document.getElementById("category");
let addExpenseBtn = document.getElementById("addExpenseButton");
let updateExpenseBtn = document.getElementById("updateExpenseBtn");

window.addEventListener("DOMContentLoaded", async () => {
  try {
    const token = localStorage.getItem("token");
    const tokenDecoded = parseJwt(token);
    const premiumMember = tokenDecoded.ispremiumuser;
    let expenseList = null;
    if (!token) {
      return (window.location.href = "/view/login.html");
    }
    if (premiumMember) {
      premiumUserMsg();
      showLeaderBoard();
      showDownloadsHistory();
    }
    document.getElementById(
      "loggedName"
    ).innerHTML = `👋🏼Welcome<span class=" font-extrabold text-[#002D74]"> ${tokenDecoded.name}</span>`;
    const res = await axios.get("/admin/expenses", {
      headers: { Authorization: `${token}` },
    });
    expenseList = res.data.allExpenses;

    let pageLimit = parseInt(localStorage.getItem("pageLimit")) || 5;
    let currentPage = 1;
    let prevPageButton = document.getElementById("prevPage");
    let nextPageButton = document.getElementById("nextPage");
    let pageNumberContainer = document.getElementById("pageNumber");
    let pageLimitInput = document.getElementById("pageLimit");
    let savePageLimitButton = document.getElementById("savePageLimit");

    pageLimitInput.value = pageLimit;

    function displayExpenses() {
      document.getElementById("addExpenseList").innerHTML = "";
      let startIndex = (currentPage - 1) * pageLimit;
      let endIndex = startIndex + pageLimit;
      let expensesToDisplay = expenseList.slice(startIndex, endIndex);
      expensesToDisplay.forEach((expenseItem) => {
        showExpenses(expenseItem);
      });
      pageNumberContainer.innerHTML = currentPage;
      prevPageButton.disabled = currentPage === 1;
      document.getElementById("showingCurrPage").innerHTML = currentPage;
      document.getElementById("showingRange").innerHTML = Math.ceil(
        expenseList.length / pageLimit
      );
      if (prevPageButton.disabled) prevPageButton.classList.add("bg-red-200");
      else prevPageButton.classList.remove("bg-red-200");
      nextPageButton.disabled =
        currentPage === Math.ceil(expenseList.length / pageLimit);
      if (nextPageButton.disabled) nextPageButton.classList.add("bg-red-200");
      else nextPageButton.classList.remove("bg-red-200,bg-green-300");
    }
    prevPageButton.addEventListener("click", function () {
      currentPage--;
      displayExpenses();
    });
    nextPageButton.addEventListener("click", function () {
      currentPage++;
      displayExpenses();
    });
    savePageLimitButton.addEventListener("click", function () {
      let newPageLimit = parseInt(pageLimitInput.value);
      if (newPageLimit > 0 && newPageLimit <= expenseList.length) {
        pageLimit = newPageLimit;
        localStorage.setItem("pageLimit", pageLimit);
        currentPage = 1;
        displayExpenses();
      } else {
        alert(`EXPENSE RANGE ALLOWED IS MIN: 1 AND MAX: ${expenseList.length}`);
        return;
      }
    });
    displayExpenses();
    
  } catch (err) {
   showPopupNotification("SERVER ERROR IN FETCHING DATA", "error");
  }
});

//SHOW EXPENSES
async function showExpenses(expenseItem) {
  try {
    document.getElementById("amount").value = "";
    document.getElementById("description").value = "";
    document.getElementById("category").value = "";
    document.getElementById("expenseRadio").checked = false;
    document.getElementById("incomeRadio").checked = false;

    const date = new Date(`${expenseItem.updatedAt}`);
    let expenseBox = "";
    let incomeBox = "";

    if (expenseItem.amountType === "expense") {
      expenseBox = expenseItem.amount;
      incomeBox = 0;
    } else if (expenseItem.amountType === "income") {
      incomeBox = expenseItem.amount;
      expenseBox = 0;
    }

    const addExpenseList = document.getElementById("addExpenseList");
    const html = `
      <tr id = "${expenseItem.id}">
      <td>${incomeBox}</td>
      <td>${expenseBox}</td>
      <td>${expenseItem.description}</td>
      <td>${expenseItem.category}</td>
      <td>${date.toDateString()}</td>

      <td>
      <button onclick = "editExpense('${expenseItem.id}', '${
        expenseItem.amount
      }', '${expenseItem.description}', '${expenseItem.category}', '${
        expenseItem.amountType
      }')">EDIT
      </button>

      <button onclick = "deleteExpense('${expenseItem.id}')">DELETE
      </button>

      </td>
      </tr>`;

    addExpenseList.innerHTML += html;
   
  } catch (err) {
    showPopupNotification("ERROR FETCHING EXPENSE DATA!", "ERROR");
  }
}

//ADD EXPENSE TO DB
async function saveToDb(event) {
  event.preventDefault();

  let amountType = document.querySelector(
    'input[name="amountType"]:checked'
  ).value;
  
  let amount = event.target.amount.value;
  let description = event.target.description.value;
  let category = event.target.category.value;

  const obj = {
    amount,
    description,
    category,
    amountType,
  };

  try {
    const token = localStorage.getItem("token");

    const response = await axios.post("/admin/add-expense", obj, {
      headers: {
        Authorization: token,
      },
    });
    showExpenses(response.data.newAddedExpense);
    showPopupNotification("EXPENSE ADDED SUCCESSFULLY");
  } catch (err) {
    console.log(err);
    showPopupNotification("ERROR IN ADDING EXPENSE!", "error");
  }
}

//JWT TOKEN PARSER
function parseJwt(token) {
  var base64Url = token.split(".")[1];
  var base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
  var jsonPayload = decodeURIComponent(
    window
      .atob(base64)
      .split("")
      .map(function (c) {
        return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join("")
  );
  return JSON.parse(jsonPayload);
}

var textEle = document.createElement("span");
textEle.innerText = " PREMIUM  MEMBER ";

var crownIcon = document.createElement("i");
crownIcon.classList.add("fas", "fa-crown");

crownIcon.appendChild(textEle);
//PREMIUM USER MESSAGE
function premiumUserMsg() {
  document.getElementById("buyPremiumBtn").remove();
  var memType = document.getElementById("memType");
  memType.appendChild(crownIcon);
}

//SHOW LEADER BOARD
function showLeaderBoard() {
  document.getElementById("downloadReportBtn").classList.remove("hidden");

  let inputBtnElement = document.createElement("button");
  inputBtnElement.type = "button";
  inputBtnElement.id = "leaderBtn";
  inputBtnElement.innerText = "Show LeaderBoard";
  inputBtnElement.className = "primary-button-show";

  let leaderBoardTableVisible = false;

  inputBtnElement.onclick = async () => {
    try {
      const token = localStorage.getItem("token");
      const leaderBoardData = await axios.get("/premium/showLeaderBoard", {
        headers: {
          Authorization: token,
        },
      });

      let leaderBoardElement = document.getElementById("addedLeaderBoardList");
      
      const leaderBoardTable = document.getElementById("leaderBoardTable");

      if(!leaderBoardTableVisible) {
        leaderBoardTableVisible = true;
        document.getElementById("leaderBoardModal").style.display = "block";
        // leaderBoardTable.classList.remove("hidden");
        leaderBoardElement.innerHTML = "";

        leaderBoardData.data.forEach((leaderDetails, index) => {
          leaderBoardElement.innerHTML += `
          <tr>
          <td class="number">${index + 1}</td>
          <td class="name">${leaderDetails.name}</td>
          <td class="points">${leaderDetails.totalExpenses}</td>
          </tr>`;
        });
      } else {
        leaderBoardTableVisible = false;
        document.getElementById("leaderBoardModal").style.display = "none";
        // leaderBoardTable.classList.add("hidden");
      }
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };
  document.getElementById("leaderBoardButtonDiv").appendChild(inputBtnElement);
}

document.getElementById("closeModalBtn").onclick = function() {
  document.getElementById("leaderBoardModal").style.display = "none";
};
//SHOW PREVIOUS DOWNLOADS
function showDownloadsHistory() {
  let downloadHisBtn = document.createElement("button");
  downloadHisBtn.type = "button";
  downloadHisBtn.id = "downloadHisBtn";
  downloadHisBtn.innerText = "Downloaded Reports";
  downloadHisBtn.className = "primary-button-show";

  let downloadsView = false;

  downloadHisBtn.onclick = async () => {
    try {
      const token = localStorage.getItem("token");
      const prevDownloads = await axios.get("/premium/showPrevDownloads", {
        headers: {
          Authorization: token,
        },
      });

      let downloadedElement = document.getElementById("addedDownloadList");

      if (!downloadsView) {
        document.getElementById("downloadsTable").classList.toggle("hidden");
        prevDownloads.data.prevDownloads.forEach((downloadDetail) => {
          const date = new Date(`${downloadDetail.createdAt}`);

          downloadedElement.innerHTML += `
          <tr>
            <td><a href='${
              downloadDetail.fileUrl
            }'>${date.toUTCString()}</a></td>
          </tr>`;
        });
        downloadsView = true;
      } else {
        document.getElementById("downloadsTable").classList.toggle("hidden");
        downloadedElement.innerHTML = "";
        downloadsView = false;
      }
    } catch (err) {
      console.log(err);
      throw new Error(err);
    }
  };
  document.getElementById("leaderBoardButtonDiv").appendChild(downloadHisBtn);
}

//EDIT EXPENSE
function editExpense(expenseId, expAmount, expDescription, expCategory, expType) {
  amountInput.value = expAmount;
  descriptionInput.value = expDescription;
  categoryInput.value = expCategory;

  if(expType === 'income') {
    document.getElementById('incomeRadio').checked = true;
  } else {
    document.getElementById('expenseRadio').checked = true;
  }

  removeExpense(expenseId);

  document.querySelector("#addExpenseButton").style.display = "none";
  document.querySelector("#updateExpenseBtn").style.display = "block";

  updateExpenseBtn.setAttribute("onclick", `updateExpense('${expenseId}')`);
}

//UPDATE EXPENSE IN DATABASE
async function updateExpense(expenseId) {
  let amount = amountInput.value;
  let description = descriptionInput.value;
  let category = categoryInput.value;
  let amountType = document.querySelector('input[name="amountType"]:checked').value;

  const obj = {
    amount, description, category, amountType
  };
  const token = localStorage.getItem("token");

  try {
    const response = await axios.put(`/admin/update-expense/${expenseId}`, obj, {
      headers: {
        Authorization : token
      }
    });

    if(response.status === 200) {

      amount = "";
      description = "";
      category = "";
      document.getElementById("incomeRadio").checked = false;
      document.getElementById("expenseRadio").checked = false;

      document.querySelector("#addExpenseButton").style.display = "block";
      document.querySelector("#updateExpenseBtn").style.display = "none";
      updateExpenseBtn.removeAttribute("onclick");
      showPopupNotification("EXPENSE UPDATED SUCCESSFULLY!")
     
    } else {
      window.location.reload();
    }
  } catch(err) {
    console.log(err)
    showPopupNotification("ERROR IN UPDATING EXPENSE!", "error");
  }

  try {
    const result = await axios.get(`/admin/getExpenseById/${expenseId}`, {
      headers: {
        Authorization: token
      }
    });

    if(result) {
      
      showExpenses(result.data.updateUserExpense);
      return;
    } else {
      window.location.reload();
    }
  } catch(err) {
    console.log(err);
    window.location.reload();
  }
}

//REMOVE EXPENSE FROM SCREEN
async function removeExpense(expenseId) {
  try {
    const removeExp = document.getElementById(expenseId);
   if (removeExp !== null) {
    removeExp.remove();
   }
  } catch(err) {
    console.log(err);
    document.querySelector('.error-textMsg').innerText = `SERVER ERROR - ${err}, IN REMOVING DATA`;
    document.querySelector('#error-alert').classList.toggle("hidden");
  }
}

//DELETE EXPENSE
async function deleteExpense(expenseId) {
  try {
    const token = localStorage.getItem("token");
    await axios.delete(`/admin/delete-expense/${expenseId}`, {
      headers: {
        Authorization: token,
      },
    });
    removeExpense(expenseId);
   
    showPopupNotification("EXPENSE DELETED SUCCESSFULLY!");
  } catch (err) {
    console.log(err);
    showPopupNotification("ERROR DELETING EXPENSE!", "error");
  }
}

//BUY PREMIUM
document.getElementById("buyPremiumBtn").addEventListener("click", async function (e) {
  try {
    const token = localStorage.getItem("token");
    const response = await axios.get("/purchase/premiumMembership", {
      headers: {
         Authorization: token 
        },
    });

    //Payment Handler
    var options = {
      key: response.data.key_id,
      order_id: response.data.order.id,
      // This handler function will handle the success payment
      handler: async function (response) {
        try {
          const res = await axios.post(
            "/purchase/updateStatus",
            {
              order_id: options.order_id,
              payment_id: response.razorpay_payment_id,
            },
            {
              headers: {
                Authorization: token,
              },
            }
          );

          premiumUserMsg();
          alert("You are now a Premium User");
          localStorage.setItem("token", res.data.token);
          showLeaderBoard();
          showDownloadsHistory();

        } catch (err) {
          console.log(err);
          throw new Error(err);
        }
      },
    };

    //Open Payment Model
    const rzpl = new Razorpay(options);
    rzpl.open();
    e.preventDefault();

    rzpl.on("payment.failed", async (response) => {
      try {
        alert(`Alert: ${response.error.description}`);
      } catch (error) {
        console.group(error);
        alert(`PAYMENT FAILED DUE TO ${error.error.description}`);
      }
    });
  } catch (err) {
    console.log(err);
    alert("SOMETHING WENT WRONG. PLEASE TRY AGAIN LATER");
    throw new Error(err);
  }
});

//DOWNLOAD REPORT
async function downloadReport() {
  const token = localStorage.getItem("token");
  try {
    const response = await axios.get("/premium/downloadReport", {
      headers: { Authorization: token },
    });

    if (response.status === 200) {
      const downloadLink = document.createElement("a");
      downloadLink.href = response.data.fileUrl;
      downloadLink.download = "myExpense.csv";
      downloadLink.click();

    } else {
      console.log("ISSUE IN FETCHING REPORT");
      throw new Error(response.data.message);
    }
  } catch (err) {
    console.log(err);
    document.querySelector('.error-textMsg').innerText = `SERVER ERROR - ${err}, IN DELETING DATA`;
    document.querySelector('#error-alert').classList.toggle("hidden");
  }
}

//LOGOUT
document.getElementById('logoutBtn').addEventListener('click', function() {
  localStorage.removeItem('token')
  return window.location.href = '/login.html'
});

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

