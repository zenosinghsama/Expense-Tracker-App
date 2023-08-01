const User = require("../Models/userModel");
const Expense = require("../Models/expenseModel");
const Downloads = require('../Models/downloadReportsModel');
const { uploadToS3 } = require('../Services/s3Services');

const getLeaderBoard = async (req, res) => {
  try {
    const usersLeaderBoard = await User.findAll({
      order: [["totalExpenses", "DESC"]],
    });
    res.status(200).json(usersLeaderBoard);
  } catch (err) {
    console.log("ERROR IN FETCHING LEADER BOARD DATA",err);
    res.status(500).json(err.message);
  }
};

const getExpenseReport = async (req, res) => {
  try {
    const userId = req.user.id;
    const allExpenses = await Expense.findAll({ where: {userId }})
    if(allExpenses) {
      const stringifiedExpenses = JSON.stringify(allExpenses);
      
      const filename = `ExpenseReport${userId}/${new Date()}.json`;
      const fileUrl = await uploadToS3(stringifiedExpenses, filename);
      if(fileUrl) {
        await Downloads.create({ fileUrl, userId });
        return res.status(200).json({ fileUrl, success: true})
      }
    } else {
      return res.json({ message: "NO DATA EXISTS", success: false})
    }
  } catch (err) {
    console.log("ERROR IN FETCHING DATA",err);
    res.status(500).json({ fileUrl: "", success: false });
  }
}

const showUserDownloads = async (req, res) => {
  try {
    const userId = req.user.id;
    const prevDownloads = await Downloads.findAll({ where: { userId }})
    if(prevDownloads) {
      return res.status(200).json({ prevDownloads, success: true })
    } else {
      return res.json({ message: "NO PREVIOUS DOWNLOADS", success: false})
    }
  } catch(err){
    console.log("ERROR IN FETCHING PREV DOWNLOADS DATA", err)
    res.status(500).json(err.message)
  }
}


module.exports = {
  getLeaderBoard,
  getExpenseReport,
  showUserDownloads
};