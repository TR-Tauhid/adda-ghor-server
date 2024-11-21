const express = require("express");
require("dotenv").config();
const cors = require("cors");
const app = express();
const port = process.env.PORT || 5000;
app.use(cors());

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
  }
});

async function run() {
  try {
    await client.connect();
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );

    const itemCollection = client.db("addaGhorDB").collection("menuCollection");
    const clientsDataCollection = client
      .db("addaGhorDB")
      .collection("clientsDataCollection");

    // Add items to menu list

    app.post("/editItems", async (req, res) => {
      const newItem = req.body;

      const result = await itemCollection.insertOne(newItem);
      res.send(result);
    });

    // Fetch menu items

    app.get("/menus", async (req, res) => {
      const cursor = itemCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Update Items through put

    app.put(`/editItems/:id`, async (req, res) => {
      const updatedItem = req.body;
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };

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

    // Update new and existing user data through put operation

    app.put(`/login/:id`, async (req, res) => {
      const id = req.params.id;
      const userData = req.body;
      const filter = { uid: id };
      const options = { upsert: true, new: true };
      const clientInfo = {
        $set: {
          name: userData.name,
          email: userData.email,
          uid: userData.uid,
        },
      };
      const result = await clientsDataCollection.updateOne(
        filter,
        clientInfo,
        options
      );
      res.send(result);
    });

    // Fetch client list data

    app.get("/users", async (req, res) => {
      const cursor = clientsDataCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    });

    // Delete client from db

    app.delete("/users/:id", async (req, res) => {
      const id = req.params.id;
      const query = { uid: id };
      const result = await clientsDataCollection.deleteOne(query);
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

app.listen(port, () => console.log(`Server is running at ${port}`));
