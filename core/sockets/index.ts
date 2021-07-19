import * as WebSocket from "ws";
import {IQueue} from "../../controllers/types";

export class SocketController {
    private wss: WebSocket.Server;
    private ws: WebSocket | undefined;

    constructor(server:any){
        this.wss = new WebSocket.Server({ server });
    }

    connect = () => {
        this.wss.on('connection', (ws: WebSocket) => {
            this.ws = ws;
        })
        setInterval(() => {
            this.wss.clients.forEach(ws => {

                if(ws.readyState === ws.CLOSED)
                {
                    console.log('Убиваю' + ws.url)
                    return ws.terminate();
                }
                ws.ping(null, false);
            });
        }, 10000);
    }

    checkQueueBroadcast = (queue:IQueue) => {
        // console.log(`Клиенты на получение очереди: ${this.wss.clients.size}`)
        this.wss.clients.forEach(client => {
            if(client.readyState === WebSocket.OPEN) {
                console.log('отправление очереди '+ Date.now())
                client.send(`${JSON.stringify({queue: queue.songs})}`)
            }
        })
    }

    pauseBroadcast = (queue:IQueue) => {

    }
}