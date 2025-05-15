// models/Transaction.js
const { DataTypes } = require("sequelize");
const sequelize = require("../config/config");

const Transaction = sequelize.define("Transaction", {
  id: {
    type: DataTypes.UUID,
    defaultValue: DataTypes.UUIDV4,
    primaryKey: true,
  },
  total_amount: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
  },
  amount_paid: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  kembali: {
    type: DataTypes.FLOAT,
    allowNull: true,
  },
  status: {
    type: DataTypes.ENUM("pending", "paid"),
    allowNull: false,
    defaultValue: "pending",
  },
}, {
  timestamps: true,
  createdAt: "created_at",
  updatedAt: "updated_at",
  tableName: "transactions",
});

module.exports = Transaction;
