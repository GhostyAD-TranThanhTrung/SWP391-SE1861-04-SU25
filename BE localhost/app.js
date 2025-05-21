import getConnection from './sqlconfig.js'
import express from 'express'
import cors from 'cors'

const app = express()
app.use(cors())
app.use(express.json())

app.get('/', async (req, res) => {
    const connection = await getConnection()

    if (connection) {
        res.send('Connected to SQL Server')
    } else {
        res.send('Failed to connect to SQL Server ')
    }
})
export default app