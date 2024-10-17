const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(
  cors({
    origin: "*",
  })
);
app.use((req, res, next) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  next();
});

app.use(express.json());
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lhuqf.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

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

    const itemCollection = client.db("addaGhorDB").collection("menuCollection");

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    app.post("/editItems", async (req, res) => {
      const newItem = req.body;

      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    app.get("/menus", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    app.put(`/editItems/:id`, async (req, res) => {
      const updatedItem = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: false };

      const item = {
        $set: {
          photoUrl: updatedItem.photoUrl,
          title: updatedItem.title,
          price: updatedItem.price,
          cookingTime: updatedItem.cookingTime,
          details: updatedItem.details,
        },
      };

      const result = await itemCollection.updateOne(filter, item, options);
      res.send(result);

    });

    app.delete("/editItems/:id", async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await itemCollection.deleteOne(query);
      res.send(result);
    });
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get("/", (req, res) => {
  res.send("Hey there...!!! Server is running...!!!");
});

app.listen(port, "0.0.0.0", () => console.log(`Server is running at ${port}`));
