const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const cookieParser = require("cookie-parser");
const dotenv = require("dotenv");
const cors = require("cors");
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const UserModel = require("./models/Users");

dotenv.config();

const app = express();
const port = process.env.PORT || 4000;

// Middleware
app.use(
  cors({
    origin: ["https://frontend-steel-pi.vercel.app"],
    methods: ["GET", "POST", "DELETE", "PATCH", "PUT", "FETCH"],
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());

app.get("/", (req, res) => {
  res.setHeader("Access-Control-Allow-Credentials", true);
  res.send("API is Running...");
});

mongoose.connect(
  "mongodb+srv://merninventory:1234@cluster0.jyjxmfl.mongodb.net/Inventory",
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  }
);

const verifyUser = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.json("Token is missing");
  } else {
    jwt.verify(token, "jwt-secret-key", (err, decoded) => {
      if (err) {
        return res.json("Error with token");
      } else {
        if (decoded.role === "admin") {
          next();
        } else {
          return res.json("not admin");
        }
      }
    });
  }
};

app.get("/dashboard", verifyUser, (req, res) => {
  res.json("Success");
});

app.post("/register", (req, res) => {
  const { name, email, password } = req.body;
  bcrypt
    .hash(password, 10)
    .then((hash) => {
      UserModel.create({ name, email, password: hash })
        .then((user) => res.json("success"))
        .catch((err) => res.json(err));
    })
    .catch((err) => res.json(err));
});

app.post("/login", (req, res) => {
  const { email, password } = req.body;
  UserModel.findOne({ email: email }).then((user) => {
    if (user) {
      bcrypt.compare(password, user.password, (err, response) => {
        if (response) {
          const token = jwt.sign(
            { email: user.email, role: user.role },
            "jwt-secret-key",
            { expiresIn: "1d" }
          );
          res.cookie("token", token);
          console.log(user.role);
          return res.json({ Status: "Success", role: user.role });
        } else {
          return res.json("password is incorrect");
        }
      });
    } else {
      return res.json("No record found");
    }
  });
});

const uri =
  "mongodb+srv://merninventory:1234@cluster0.jyjxmfl.mongodb.net/?retryWrites=true&w=majority";

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    await client.connect();
    const store = client.db("Inventory").collection("gadgets");

    // CREATE (UPLOAD PRODUCTS)
    app.post("/upload-product", async (req, res) => {
      const data = req.body;
      const result = await store.insertOne(data);
      res.send(result);
    });

    // READ (VIEW PRODUCTS)
    app.get("/view-product", async (req, res) => {
      const gadgets = await store.find().toArray();
      res.setHeader(
        "Access-Control-Allow-Origin",
        "https://frontend-steel-pi.vercel.app"
      );
      res.setHeader(
        "Access-Control-Allow-Methods",
        "GET, POST, OPTIONS, PUT, PATCH, DELETE"
      );
      res.setHeader(
        "Access-Control-Allow-Headers",
        "Content-Type, Authorization"
      );
      res.setHeader("Access-Control-Allow-Credentials", "true");
      res.json(gadgets);
    });

    // UPDATE (UPDATE PRODUCTS)
    app.patch("/update-product/:id", async (req, res) => {
      try {
        const id = req.params.id;
        const updateProductData = req.body;
        if (Object.keys(updateProductData).length === 0) {
          return res
            .status(400)
            .json({ error: "No data provided for update." });
        }

        const filter = { _id: new ObjectId(id) };
        const updateDoc = {
          $set: {
            ...updateProductData,
          },
        };

        const options = { upsert: true };

        const result = await store.updateOne(filter, updateDoc, options);

        if (result.matchedCount === 0 && result.modifiedCount === 0) {
          return res
            .status(404)
            .json({ error: "No product found with the provided ID." });
        }

        res.json({ status: "Product updated successfully." });
      } catch (error) {
        console.error("Error in update-product route:", error);
        res.status(500).json({ error: "Internal Server Error" });
      }
    });

    // DELETE (DELETE PRODUCTS)
    app.delete("/delete-product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await store.deleteOne(filter);
      res.send(result);
    });

    // FIND BY BRAND
    app.get("/searchByBrand", async (req, res) => {
      let query = {};
      if (req.query?.brand) {
        query = { brand: req.query.brand };
      }
      const result = await store.find(query).toArray();
      res.send(result);
    });

    // FIND BY CATEGORY
    app.get("/searchByCategory", async (req, res) => {
      let query = {};
      if (req.query?.category) {
        query = { category: req.query.category };
      }
      const result = await store.find(query).toArray();
      res.send(result);
    });

    // FIND BY PRODUCT NAME
    app.get("/searchByPName", async (req, res) => {
      let query = {};
      if (req.query?.productName) {
        query = { productName: req.query.productName };
      }
      const result = await store.find(query).toArray();
      res.send(result);
    });

    // SEARCH BY PRODUCT ID
    app.get("/Product/:id", async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const result = await store.findOne(filter);
      res.send(result);
    });

    // PLACE ORDER
    app.post("/place-order", async (req, res) => {
      try {
        const orderData = req.body.cart;

        const updatePromises = orderData.map(async (item) => {
          const productId = item.id;
          const quantity = item.quantity;

          const product = await store.findOne({ _id: new ObjectId(productId) });

          if (!product || product.quantity < quantity) {
            throw new Error(
              `Insufficient quantity for the product with ID: ${productId}`
            );
          }

          const filter = { _id: new ObjectId(productId) };
          const updateDoc = {
            $inc: { quantity: -quantity },
          };

          const result = await store.updateOne(filter, updateDoc);
          return result;
        });

        await Promise.all(updatePromises);

        res.json({ status: "Order placed successfully!" });
      } catch (error) {
        console.error("Error placing order:", error);
        res.status(400).json({ error: error.message });
      }
    });

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } catch (error) {
    console.error("Error in run function:", error);
  } finally {
    // Ensure that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.listen(port, () => {
  console.log(`App listening on port ${port}`);
});
