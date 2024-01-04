const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const { check, validationResult } = require('express-validator');

const app = express();
const port = 3000;

mongoose.connect('mongodb://localhost/money-tracker', { useNewUrlParser: true, useUnifiedTopology: true });

const Transaction = mongoose.model('Transaction', {
  description: String,
  amount: Number,
  type: String,
});

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(__dirname + '/views/index.html');
});

app.post(
  '/addTransaction',
  [
    check('description').isString().trim().notEmpty(),
    check('amount').isNumeric(),
    check('type').isIn(['income', 'expense']),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { description, amount, type } = req.body;
      const transaction = new Transaction({ description, amount, type });
      await transaction.save();
      res.redirect('/');
    } catch (error) {
      res.status(500).send(error.message);
    }
  }
);

app.get('/getTransactions', async (req, res) => {
  try {
    const transactions = await Transaction.find();
    res.json(transactions);
  } catch (error) {
    res.status(500).send(error.message);
  }
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});
