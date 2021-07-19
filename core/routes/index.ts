import bodyParser from 'body-parser';
import path from 'path';
import express, {Request, Response, NextFunction} from 'express'
import {Client} from "discord.js";
import {BotController as BotCtrl} from "../../controllers/botController/botController";
const indexHTML = path.join(__dirname,"../../build/index.html");
const staticPath = path.join(__dirname, '../../build');

const sseSongDur = (_:Request, res:Response, connection:any) => {
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Connection', 'keep-alive');
    res.flushHeaders();

     const durationTimer = setInterval(() => {

         if (connection.dispatcher !== null){
             res.write(`data: ${JSON.stringify({playTime: connection.dispatcher.streamTime - connection.dispatcher.pausedTime})}\n\n`);
         } else {
             res.write('event: close-from-server\n data:null\n\n')
             clearInterval(durationTimer);
             res.end('Ok')
             }
    }, 1000)
}

const createRoutes = (app:express.Application, sockets: any, bot: Client) =>{
    const BotController = new BotCtrl(sockets, bot)
    app.use(bodyParser.json())
    app.use('/api/discord', require('../auth/discord'));
    app.use(express.static(staticPath));

    app.use(function (req:Request, res:Response, next:NextFunction) {
        res.header("Access-Control-Allow-Origin", "*");
        res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
        next();
    })
    app.use((err: Error, req: Request, res: Response, next:NextFunction) => {
        switch (err.message) {
            case 'NoCodeProvided':
                return res.status(400).send({
                    status: 'ERROR',
                    error: err.message,
                });
            default:
                return res.status(500).send({
                    status: 'ERROR',
                    error: err.message,
                });
        }
    });

    app.get("/api", (_:Request, res:Response) => {
        res.send("Hello, World!");
    });

    app.post('/api/play',(req:Request, res:Response) =>{
        BotController.exec(req, res)
        res.end("200")
    })

    app.get("/api/pause", (_:Request, res:Response) => {
        BotController.pause()
        res.end('200')
    });

    app.get("/api/skip", (_:Request, res:Response) => {
        BotController.skip()
        res.end('200')
    });

    app.get("/api/stop", (_:Request, res:Response) => {
        BotController.stop()
        res.end('200')
    });


    app.get('/api/duration', (req:Request, res:Response) => {

        sseSongDur(req, res, BotController.queue!.connection)
    })

    app.get('/api/queue', (req:Request, res:Response) => {
        if(BotController.queue){
            res.json({queue: BotController.queue.songs})
        } else {
            res.json({queue: null})
        }
    })


    app.get('/*', (req:Request, res:Response) => res.sendFile(indexHTML))
}

module.exports = createRoutes;