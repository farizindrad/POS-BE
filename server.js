const express = require("express");
const app = express();
const multer = require("multer");
const cors = require("cors");

// app.use(cors({
//     origin: "https://pos.otisrohman.my.id",
//     methods: ["GET", "POST", "PUT", "DELETE", "PATCH"],
// }));

const allowedOrigins = [
    "https://pos.otisrohman.my.id",
    "https://pos-frontend-beta.vercel.app"
  ];
  
  const allowedMethods = ["GET", "POST", "PUT", "DELETE", "PATCH"];
  
  app.use((req, res, next) => {
    const origin = req.headers.origin;
    const method = req.method;
  
    if (origin && !allowedOrigins.includes(origin)) {
      return res.status(403).json({ message: "Forbidden: Invalid Origin" });
    }
  
    if (origin) {
      res.setHeader("Access-Control-Allow-Origin", origin);
      res.setHeader("Access-Control-Allow-Methods", allowedMethods.join(","));
      res.setHeader("Access-Control-Allow-Headers", "Content-Type");
    }
  
    // Tangani preflight (OPTIONS)
    if (method === "OPTIONS") {
      return res.sendStatus(200);
    }
  
    next();
  });

const upload = require("./middlewares/upload");
const { createProduct, getAllProducts, getProductById } = require("./controllers/productController");
const { saveBill, chargeTransaction, createAndChargeTransaction } = require("./controllers/transactionController");

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use("/uploads", express.static("uploads"));

app.post("/products", upload.single("photo"), createProduct);
app.get("/products", getAllProducts);
app.get("/products/:id", getProductById);

app.post("/save", saveBill);
app.patch("/charge", chargeTransaction);
app.post("/charge", createAndChargeTransaction);

app.use((err, req, res, next) => {
    if (err) {
      if (err instanceof multer.MulterError) {
        return res.status(400).json({ message: err.message });
      }
      if (err.message === "Hanya gambar yang diperbolehkan!") {
        return res.status(400).json({ message: err.message });
      }
      console.error(err);
      return res.status(500).json({ message: "Internal Server Error" });
    }
    next();
  });

const port = process.env.PORT || 1231;

app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});

