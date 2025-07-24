const express = require('express');
const router = express.Router();
const Transaction = require('../models/Transaction');
const verifyToken = require('../middleware/verifyToken');

router.post('/', verifyToken, async (req, res) => {
  console.log('req.user:', req.user);
  const { type, amount, category, description, date } = req.body;
  try {
    const newTx = new Transaction({
      userId: req.user.id,
      type,
      amount,
      category,
      description,
      date
    });
    await newTx.save();
    res.json(newTx);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.get('/', verifyToken, async (req, res) => {
  try {
    const txs = await Transaction.find({ userId: req.user.id }).sort({ date: -1 });
    res.json(txs);
  } catch (err) {
    res.status(500).json(err);
  }
});

router.delete('/:id', verifyToken, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });

    if (tx.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    await tx.deleteOne();
    res.json({ msg: 'Transaction deleted successfully' });
  } catch (err) {
    res.status(500).json({ msg: 'Server error' });
  }
});


router.put('/:id', verifyToken, async (req, res) => {
  try {
    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ msg: 'Transaction not found' });

    if (tx.userId.toString() !== req.user.id) {
      return res.status(403).json({ msg: 'Unauthorized access' });
    }
    Object.assign(tx, req.body);
    const updatedTx = await tx.save();
    res.json(updatedTx);
  } catch (err) {
    res.status(500).json({ msg: 'Update failed' });
  }
});

module.exports = router;

