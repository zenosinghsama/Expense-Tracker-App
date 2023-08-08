const express = require("express");
const app = express();
require('dotenv').config()
const cors = require("cors");
const bodyParser = require("body-parser");
const sequelize = require("./Util/database");
const path = require("path");


//MODELS
const Order = require("./Models/orders");
const User = require("./Models/userModel");
const Expense = require("./Models/expenseModel");
const ForgotPass = require("./Models/forgotPassModel");
const Downloads = require("./Models/downloadReportsModel");

///Routes
const userRoutes = require("./Routes/userRoutes");
const ExpenseRoutes = require("./Routes/expenseRoutes");
const OrderRoutes = require("./Routes/purchase");
const PremiumRoutes = require("./Routes/premiumFeatures");
const ResetPassRoutes = require("./Routes/resetPass");



//Middleware
app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, "/Public/")));
app.use(express.static(path.join(__dirname, "/Views/")));

app.get("/", (req, res, next) => {
  res.sendFile(path.join(__dirname, "Views", "login.html"));
});

//REGISTERING ROUTES TO APP
app.use(userRoutes);
app.use(ExpenseRoutes);
app.use(OrderRoutes);
app.use("/premium", PremiumRoutes);
app.use("/password", ResetPassRoutes);

//ASSOCIATIONS
User.hasMany(Expense);
Expense.belongsTo(User);

User.hasMany(Order);
Order.belongsTo(User);

User.hasMany(ForgotPass);
ForgotPass.belongsTo(User);

User.hasMany(Downloads, { foreignKey: "userId", sourceKey: "id" });
Downloads.belongsTo(User);

//Server
sequelize
  .sync()
  .then(() => {
    app.listen(process.env.PORT || 4000);
  })
  .catch((err) => {
    console.log(err);
  });