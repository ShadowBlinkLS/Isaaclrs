const express = require('express')
const userRouter = require('./router/userRouter')

const app = express()
app.use(express.static("./public"))

app.use(userRouter)

app.listen(3000, ()=>{
    console.log('Ecoute sur le port 3000')
})