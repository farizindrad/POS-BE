const Transaction = require("./Transaction");
const TransactionItem = require("./TransactionItem");
const Product = require("./Product");

Transaction.hasMany(TransactionItem, {
  foreignKey: "transaction_id",
  as: "items",
});

TransactionItem.belongsTo(Transaction, {
  foreignKey: "transaction_id",
  as: "transaction",
});

TransactionItem.belongsTo(Product, {
  foreignKey: "product_id",
  as: "product",
});

Product.hasMany(TransactionItem, {
  foreignKey: "product_id",
  as: "transaction_items",
});
