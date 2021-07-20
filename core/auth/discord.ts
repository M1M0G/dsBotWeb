import {Request, Response} from "express";

const express = require('express');

const discord = express.Router();
import fetch from 'node-fetch';
import {catchAsyncErrors} from "../utils/catchAsync";

const CLIENT_ID = process.env.CLIENT_ID as string
const CLIENT_SECRET = process.env.CLIENT_SECRET as string;
const redirect = encodeURIComponent(`${process.env.REDIRECT}`);

discord.get("/auth", (_:Request, res:Response) => {
    res.redirect(`https://discord.com/api/oauth2/authorize?client_id=667735586169159694&redirect_uri=${redirect}&response_type=code&scope=identify%20guilds`)
})

discord.get('/callback', catchAsyncErrors(async (req:Request, res:Response) => {
    if (!req.query.code) throw new Error('NoCodeProvided');
    const code = req.query.code.toString();
    const response = await fetch(`https://discordapp.com/api/oauth2/token?grant_type=authorization_code&code=${code}&redirect_uri=${redirect}`,
        {
            method: 'POST',
            body: new URLSearchParams({
                client_id:CLIENT_ID,
                client_secret: CLIENT_SECRET,
                code,
                grant_type: 'authorization_code',
                scope: 'identify guilds',
            }),
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded',
            },
        });
    const json = await response.json();
    console.log(json)
    res.redirect(`/auth?token=${json.access_token}`);
}));

module.exports = discord;