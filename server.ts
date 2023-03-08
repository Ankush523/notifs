 import express from "express";
 import path from "path";
 import { Server } from "socket.io";
 import fetch from "node-fetch";
 import { config as env } from 'dotenv'

 const WEBHOOK_ID = process.env.WEBHOOK_ID as string;
 const AUTH_TOKEN = process.env.AUTH_TOKEN as string;
 const WEB_URL = process.env.WEB_URL as string;

 const PORT = process.env.PORT || 3001;
 const __dirname = path.resolve();
 const app = express()
  .use(express.static(path.join(__dirname, 'public')))
  .use(express.json())
  .post('/alchemyhook',(req, res) => { notificationReceived(req); res.status(200).end() })
  .get('/*', (req, res) => res.sendFile(path.join(__dirname + '/index.html')))
  .listen(PORT, () => console.log(`Listening on ${PORT}`))

  
 const io = new Server(app);

 io.on('connection', (socket) => {
  console.log('Client connected');
  socket.on('disconnect', () => console.log('Client disconnected'));
  socket.on('register address', (msg) => {
    console.log('Registering new address: ' + msg)
    //send address to Alchemy to add to notification
    addAddress(msg);
  });
});

function notificationReceived(req : any) {
  console.log("notification received!");
  io.emit('notification', JSON.stringify(req.body));
}

async function addAddress(new_address : string) {
  console.log("adding address " + new_address);
  const body = { webhook_id: WEBHOOK_ID, addresses_to_add: [new_address], addresses_to_remove: [] };
  try {
    const response = await fetch(WEB_URL, {
      method: 'PATCH',
      body: JSON.stringify(body),
      headers: {'Content-Type': 'application/json' , 
                'X-Alchemy-Token': AUTH_TOKEN}
    })
    const result = await response.json();
    console.log("Address registration successful:", result);
  }
  catch (err) {
    console.error(err);
  }
}