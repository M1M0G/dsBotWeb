import {Channel, VoiceConnection} from "discord.js";

export interface ISong {
    id: string,
    url: string,
    title:string,
    length:string,
    description:string | null,
}

export interface IQueue {
    voiceChannel: Channel | undefined;
    connection: VoiceConnection | undefined;
    songs: ISong[];
    playing: boolean
}