const express = require("express");
const fs = require("fs");
const path = require("path");

const app = express();
const PORT = process.env.PORT || 3000;
const DATA_DIR = path.join(__dirname, "data");
const PRODUCTS_FILE = path.join(DATA_DIR, "products.json");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

if (!fs.existsSync(DATA_DIR)) fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(PRODUCTS_FILE)) {
  fs.writeFileSync(PRODUCTS_FILE, JSON.stringify([
    { id: 1, name: "Legging Power", category: "Roupas", price: 119.90, description: "Legging fitness de alta elasticidade.", image: "", stock: 12 },
    { id: 2, name: "Top Energy", category: "Roupas", price: 79.90, description: "Top confortável para seus treinos.", image: "", stock: 15 },
    { id: 3, name: "Garrafa Fitness", category: "Acessórios", price: 39.90, description: "Garrafa para acompanhar sua hidratação.", image: "", stock: 20 },
    { id: 4, name: "Kit Mini Bands", category: "Acessórios", price: 49.90, description: "Kit de faixas elásticas para exercícios.", image: "", stock: 10 }
  ], null, 2));
}
if (!fs.existsSync(ORDERS_FILE)) fs.writeFileSync(ORDERS_FILE, "[]");

const readJson = (file) => JSON.parse(fs.readFileSync(file, "utf8"));
const writeJson = (file, data) => fs.writeFileSync(file, JSON.stringify(data, null, 2));

app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));

app.get("/api/products", (_req, res) => res.json(readJson(PRODUCTS_FILE)));

app.post("/api/orders", (req, res) => {
  const { customer, phone, address, items, total } = req.body;
  if (!customer || !phone || !Array.isArray(items) || !items.length) {
    return res.status(400).json({ error: "Informe nome, telefone e pelo menos um produto." });
  }
  const orders = readJson(ORDERS_FILE);
  const order = {
    id: Date.now(),
    customer, phone, address: address || "",
    items, total: Number(total) || 0,
    status: "Recebido",
    createdAt: new Date().toISOString()
  };
  orders.unshift(order);
  writeJson(ORDERS_FILE, orders);
  res.status(201).json({ message: "Pedido registrado!", order });
});

// Painel demonstrativo: proteger com autenticação real antes de publicar.
app.get("/api/admin/orders", (_req, res) => res.json(readJson(ORDERS_FILE)));

app.post("/api/admin/products", (req, res) => {
  const { name, category, price, description, image, stock } = req.body;
  if (!name || !category || !Number.isFinite(Number(price))) {
    return res.status(400).json({ error: "Nome, categoria e preço são obrigatórios." });
  }
  const products = readJson(PRODUCTS_FILE);
  const product = {
    id: Date.now(), name, category, price: Number(price),
    description: description || "", image: image || "", stock: Number(stock) || 0
  };
  products.push(product);
  writeJson(PRODUCTS_FILE, products);
  res.status(201).json(product);
});

app.delete("/api/admin/products/:id", (req, res) => {
  const products = readJson(PRODUCTS_FILE);
  const updated = products.filter(p => p.id !== Number(req.params.id));
  writeJson(PRODUCTS_FILE, updated);
  res.json({ message: "Produto removido." });
});

app.get("*", (_req, res) => res.sendFile(path.join(__dirname, "public", "index.html")));

app.listen(PORT, () => console.log(`Lívia Taiza Fitness disponível em http://localhost:${PORT}`));