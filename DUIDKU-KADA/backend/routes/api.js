const express = require('express');
const router = express.Router();
const { transactions, budgets, budgetAdjustments, summary } = require('../data/mock-data');

router.get('/transactions', (req, res) => {
  res.json(transactions);
});

router.get('/transactions/:id', (req, res) => {
  const txn = transactions.find(t => t.id === parseInt(req.params.id));
  if (!txn) return res.status(404).json({ error: 'Transaction not found' });
  res.json(txn);
});

router.put('/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  transactions[idx] = { ...transactions[idx], ...req.body, id };
  res.json(transactions[idx]);
});

router.delete('/transactions/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = transactions.findIndex(t => t.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Transaction not found' });
  const removed = transactions.splice(idx, 1)[0];
  res.json(removed);
});

router.get('/budgets', (req, res) => {
  res.json(budgets);
});

router.get('/budgets/adjustments', (req, res) => {
  res.json(budgetAdjustments);
});

router.post('/budgets', (req, res) => {
  const budget = { id: Date.now(), ...req.body };
  budgets.push(budget);
  res.status(201).json(budget);
});

router.put('/budgets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = budgets.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  budgets[idx] = { ...budgets[idx], ...req.body, id };
  res.json(budgets[idx]);
});

router.delete('/budgets/:id', (req, res) => {
  const id = parseInt(req.params.id);
  const idx = budgets.findIndex(b => b.id === id);
  if (idx === -1) return res.status(404).json({ error: 'Budget not found' });
  const removed = budgets.splice(idx, 1)[0];
  res.json(removed);
});

const users = [];

router.post('/register', (req, res) => {
  const { name, email, password } = req.body;
  if (!name || !email || !password) return res.status(400).json({ error: 'All fields required' });
  if (users.find(u => u.email === email)) return res.status(400).json({ error: 'Email already registered' });
  const user = { name, email, password };
  users.push(user);
  res.status(201).json(user);
});

router.post('/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: 'Email and password required' });
  const user = users.find(u => u.email === email && u.password === password);
  if (!user) return res.status(401).json({ error: 'Invalid email or password' });
  res.json({ name: user.name, email: user.email });
});

router.get('/summary', (req, res) => {
  res.json(summary);
});

module.exports = router;
