const Transaction = require("../models/Transaction");
const TransactionItem = require("../models/TransactionItem");
const Product = require("../models/Product");
const { v4: uuidv4 } = require("uuid");

async function saveBill(req, res) {
    try {
      const { items } = req.body; 
      
      if (!items || items.length === 0) {
        return res.status(400).json({ message: "Items tidak boleh kosong." });
      }
  
      let totalAmount = 0;
  
      const productList = await Product.findAll({
        where: { id: items.map(i => i.product_id) },
      });
  
      const transactionId = uuidv4(); 
  
      const transactionItems = items.map(item => {
        const product = productList.find(p => p.id === item.product_id);
        const price = product.price;
        totalAmount += price * item.quantity;
        return {
          id: uuidv4(),
          transaction_id: transactionId,
          product_id: item.product_id,
          quantity: item.quantity,
          price,
        };
      });
  
      await Transaction.create({
        id: transactionId,
        total_amount: totalAmount,
        status: "pending",
      });
  
      await TransactionItem.bulkCreate(transactionItems);
  
      return res.status(201).json({ 
        message: "Bill berhasil disimpan.",
        transaction_id: transactionId,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal menyimpan bill." });
    }
};

async function chargeTransaction(req, res) {
    try {
      const { transaction_id, amount_paid } = req.body;
  
      if (!transaction_id || amount_paid == null) {
        return res.status(400).json({ message: "Data tidak lengkap." });
      }
  
      const transaction = await Transaction.findByPk(transaction_id);
  
      if (!transaction) {
        return res.status(404).json({ message: "Transaksi tidak ditemukan." });
      }
  
      if (transaction.status === "paid") {
        return res.status(400).json({ message: "Transaksi sudah dibayar." });
      }
  
      if (amount_paid < transaction.total_amount) {
        return res.status(400).json({ message: "Jumlah pembayaran kurang dari total transaksi." });
      }
  
      const kembali = amount_paid - transaction.total_amount;
  
      await transaction.update({
        amount_paid,
        kembali,
        status: "paid",
      });
  
      return res.json({
        message: "Transaksi berhasil dibayar.",
        kembali,
      });
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal memproses pembayaran." });
    }
}

async function createAndChargeTransaction(req, res) {
    try {
      const { items, amount_paid } = req.body;
  
      if (!items || !Array.isArray(items) || items.length === 0 || amount_paid == null) {
        return res.status(400).json({ message: "Data tidak lengkap: items dan amount_paid wajib diisi." });
      }
  
      const productIds = items.map(i => i.product_id);
      const products = await Product.findAll({
        where: { id: productIds },
      });
  
      if (products.length !== items.length) {
        return res.status(400).json({ message: "Beberapa produk tidak ditemukan." });
      }
  
      let totalAmount = 0;
      items.forEach(item => {
        const product = products.find(p => p.id === item.product_id);
        totalAmount += product.price * item.quantity;
      });
  
      if (amount_paid < totalAmount) {
        return res.status(400).json({ message: "Jumlah pembayaran kurang dari total transaksi." });
      }
  
      const newTransactionId = uuidv4();
      await Transaction.create({
        id: newTransactionId,
        total_amount: totalAmount,
        status: "pending",
      });
  
      const transactionItems = items.map(item => ({
        id: uuidv4(),
        transaction_id: newTransactionId,
        product_id: item.product_id,
        quantity: item.quantity,
        price: products.find(p => p.id === item.product_id).price,
      }));
      await TransactionItem.bulkCreate(transactionItems);
  
      const kembali = amount_paid - totalAmount;
      await Transaction.update(
        { amount_paid, kembali, status: "paid" },
        { where: { id: newTransactionId } }
      );
  
      return res.status(201).json({
        message: "Transaksi berhasil dibuat dan dibayar.",
        transaction_id: newTransactionId,
        kembali,
      });
  
    } catch (err) {
      console.error(err);
      return res.status(500).json({ message: "Gagal memproses transaksi." });
    }
}

module.exports = {
  saveBill,
  chargeTransaction,
  createAndChargeTransaction,
};
