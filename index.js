const express = require("express")
const cors = require("cors")
require('dotenv').config()
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
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
// console.log(process.env.Access_Token_Secret)

const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

const verifyToken = (req, res, next) => {
    const authHeader = req.headers.authorization
    // console.log(authHeader)
    if (!authHeader) {
        return res.status(401).send({ message: "Unauthorized Credentials" })
    }
    const token = authHeader.split(" ")[1]
    jwt.verify(token, process.env.Access_Token_Secret, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: "Unauthorized Access" })
        }
        req.decoded = decoded
    })
    next()
}

const run = async () => {
    try {
        const servicesCollection = client.db("b6a11_serviceDB").collection("services")
        const reviewsCollection = client.db("b6a11_serviceDB").collection("reviews")


        app.post("/jwt", (req, res) => {
            const user = req.body
            const token = jwt.sign(user, process.env.Access_Token_Secret, { expiresIn: "1d" })

            res.send({ token })
        })

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

        app.get("/services/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await servicesCollection.findOne(query)
            res.send(result)
        })

        app.post("/addReview", async (req, res) => {
            const review = req.body

            const result = await reviewsCollection.insertOne(review)
            res.send(result)
        })
        app.get("/reviews", verifyToken, async (req, res) => {
            let query = {}
            const service = req.query.service
            const email = req.query.email
            if (service) {
                query = { service_id: service }
            }
            if (email) {
                query = { reviewer_email: email }
            }
            const cursor = reviewsCollection.find(query).sort({ date: -1 })
            const result = await cursor.toArray()
            // console.log(result)
            res.send(result)

        })

        app.delete("/reviews/:id", async (req, res) => {
            const id = req.params.id
            const query = { _id: ObjectId(id) }
            const result = await reviewsCollection.deleteOne(query)
            res.send(result)
        })

    } finally {

    }
}

run().catch(err => console.log(err))