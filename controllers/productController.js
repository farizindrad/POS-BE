const Product = require("../models/Product");
require('dotenv').config();

const createProduct = async (req, res) => {
  try {
    const { product_name, price } = req.body;
    const photo = req.file ? req.file.filename : null;

    if (!product_name || !price) {
      return res.status(400).json({ message: "Nama dan harga produk wajib diisi." });
    }

    const newProduct = await Product.create({ product_name, photo, price });

    return res.status(201).json({
      message: "Produk berhasil ditambahkan",
      data: newProduct
    });
  } catch (error) {
    console.error("Gagal menambahkan produk:", error);
    return res.status(500).json({ message: "Terjadi kesalahan pada server" });
  }
};

const BASE_URL = process.env.BASE_URL;

const getAllProducts = async (req, res) => {
    try {
      const products = await Product.findAll({ order: [["created_at", "DESC"]] });
  
      const formattedProducts = products.map(product => ({
        ...product.dataValues,
        photo_url: BASE_URL + product.photo,
      }));
  
      return res.status(200).json({
        message: "Berhasil mengambil data Produk",
        data: formattedProducts,
      });
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

  const getProductById = async (req, res) => {
    try {
      const { id } = req.params;
      const product = await Product.findByPk(id);
  
      if (!product) {
        return res.status(404).json({ message: "Produk tidak ditemukan" });
      }
  
      return res.status(200).json({
        message: "Berhasil mengambil detail Produk",
        data: {
          ...product.dataValues,
          photo_url: BASE_URL + product.photo,
        },
      });
    } catch (error) {
      console.error("Gagal mengambil produk:", error);
      return res.status(500).json({ message: "Terjadi kesalahan pada server" });
    }
  };

module.exports = {
  createProduct,
  getAllProducts,
  getProductById
};
