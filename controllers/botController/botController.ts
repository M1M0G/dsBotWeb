import {Server} from "ws";
import {VoiceChannel, Client, Channel, VoiceConnection} from "discord.js";
import ytdl from "ytdl-core";
import {v4 as uuid} from "uuid";
import {Request, Response} from "express";
import {IQueue, ISong} from "../types";

export class BotController {
    private sockets: any;
    private bot: Client;
    public queue: IQueue | undefined;

    constructor(sockets:any, bot:Client) {
        this.sockets = sockets;
        this.bot = bot
    }

    exec = async (req:Request, res:Response) => {
        const url = req.body.url
        const voiceChannel = await this.bot.channels.cache.get('824758559341674547')
        const songInfo = await ytdl.getInfo(url);
        const song:ISong = {
            id: uuid(),
            url:songInfo.videoDetails.video_url,
            title: songInfo.videoDetails.title,
            length: songInfo.videoDetails.lengthSeconds,
            description: songInfo.videoDetails.description
        };
        // res.send(songInfo)

        if (!this.queue) {
            this.queue = {
                voiceChannel: voiceChannel,
                connection: undefined,
                songs: [],
                playing: false
            }
            this.queue.songs.push(song);
            console.log('pushing song')
            try {
                const connection = await (voiceChannel as VoiceChannel).join()
                this.queue.connection = connection;
                this.queue.playing = true
                this.sockets.checkQueueBroadcast(this.queue)
                this.play(this.queue.songs[0])
            }
            catch (e) {
               console.log("Ошибка при созданнии подключения: " + e)
                // @ts-ignore
                await this.queue.voiceChannel.leave()
                this.queue = undefined

            }
        } else {
            this.queue.songs.push(song);
            this.sockets.checkQueueBroadcast(this.queue)
        }
    }

    play = (song:ISong) => {
        if (!song) {
            console.log(this.queue)
            setTimeout( () => {
                if (this.queue?.connection?.dispatcher) return;
                // @ts-ignore
                this.queue.voiceChannel!.leave();
                this.queue = undefined
            }, 1000);
            return;
        }
        const stream = ytdl(song.url, { filter: 'audioonly' });
        this.queue!.connection!.on('disconnect', () => {this.queue = undefined})
        const dispatcher = this.queue!.connection!.play(stream)
        dispatcher.on('finish', () => {
            console.log('Music ended!');
            this.queue!.songs.shift();
            this.sockets.checkQueueBroadcast(this.queue!)
            this.play(this.queue!.songs[0]);
        })
            .on('error', (error: any) => {
                this.queue!.playing = false
                console.error('Ошибка в проигрывании песни: '+ error);
            });
    }

    stop = () => {
        const {queue} = this
        if(queue){
            queue.songs = [];
            queue.connection!.dispatcher.end();
        } else {
            return;
        }
    }

    pause = () => {
        const {queue} = this
        if(queue){
            if(queue.playing){
                console.log(queue?.playing + "true")
                queue.connection?.dispatcher.pause(true);
                queue.playing = false;
            } else {
                console.log(queue?.playing + "false")
                queue.connection?.dispatcher.resume();
                queue.playing = true;
            }
        } else {
            return;
        }
    }

    skip = () => {
        if (!this.queue) {
            return;
        } else {
            this.queue.connection!.dispatcher.end();
        }
    }
}
