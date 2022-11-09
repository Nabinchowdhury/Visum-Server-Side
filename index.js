const express = require("express")
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion } = require('mongodb');
const jwt = require("jsonwebtoken")

const app = express()
const port = process.env.PORT || 5000

app.use(cors());
app.use(express.json())

app.listen(port, () => {
    console.log(`Server is listening to port ${port}`)
})
app.get("/", (req, res) => {

    res.send("Service Review Server is Running")
})

const uri = process.env.DB_URL;
// console.log(uri)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const run = async () => {
    try {
        const servicesCollection = client.db("b6a11_serviceDB").collection("services")
        const reviewsCollection = client.db("b6a11_serviceDB").collection("reviewa")


        app.get("/services", async (req, res) => {
            let query = {}
            const limit = parseInt(req.query.limit)
            // console.log(limit)
            if (limit) {
                const cursor = servicesCollection.find(query).sort({ date: -1 }).limit(limit)
                const result = await cursor.toArray()
                res.send(result)
            }
            else {
                const cursor = servicesCollection.find(query).sort({ date: -1 })
                const result = await cursor.toArray()
                res.send(result)
            }
        })
        app.post("/addService", async (req, res) => {
            const service = req.body

            const result = await servicesCollection.insertOne(service)
            res.send(result)
        })

    } finally {

    }
}

run().catch(err => console.log(err))