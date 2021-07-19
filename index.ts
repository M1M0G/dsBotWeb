import express from "express";
import {createBot} from "./core/bot";
import {SocketController} from "./core/sockets";
const createRoutes = require('./core/routes')

const app:express.Application = express();
const port: number = Number(process.env.PORT) || 4000;

const server = require('http').createServer(app);
const bot = createBot()
const sockets = new SocketController(server)

sockets.connect()
createRoutes(app, sockets, bot)




server.listen(port, () => {
    console.log(`Listening on ${port}`)
})
