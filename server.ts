// import express, { Application, Request, Response } from "express";
// import http from "http";
// import path from "path";
// import { Server, Socket } from "socket.io";
// import fetch from "node-fetch";

// var app: Application = express();
// const server: http.Server = http.createServer(app);
// const io: Server = new Server(server);
// const __dirname = path.resolve();

// const port = process.env.PORT || 3001;
// server.listen(port, () => {
//   console.log(`Server started on port ${port}`);
// });

// const alchemyWebhookURL = "https://notifs-seven.vercel.app/alchemyhook";

// app.use(express.static(path.join(__dirname, 'public')))
// app.use(express.json());

// app.post("/alchemyhook", (req: Request, res: Response) => {
//   console.log("Transaction notification received:", req.body);
//   io.emit("notification", req.body);
//   res.status(200).end();
// });



// app.get("/*", (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname + "/index.html"));
// });

// io.on("connection", (socket: Socket) => {
//   console.log("Client connected");

//   socket.on("register address", async (address: string) => {
//     console.log("Registering new address:", address);
//     let body = {
//       webhook_id: "wh_h4a583i5bcjzx04d",
//       addresses_to_add: [address],
//       addresses_to_remove: []
//     };
//     try {
//       const response = await fetch(alchemyWebhookURL, {
//         method: "PATCH",
//         body: JSON.stringify(body),
//         headers: {
//           "Content-Type": "application/json",
//           "X-Alchemy-Token": "YijtXcZlhNuK7LTQuVUtFY4nUtAIJUq0",
//         },
//       });
     
//       const result = await response.json();
//        console.log("Address registration successful:", result);
//     } 
//     catch (error) {
//       console.error("Address registration failed:", error);
//       console.log(body)
//     }
//   });

//   socket.on("disconnect", () => {
//     console.log("Client disconnected");
//   });
// });


 import express from "express";
 import path from "path";
 import { Server } from "socket.io";
 import fetch from "node-fetch";
 import { config as env } from 'dotenv'

 const WEBHOOK_ID = process.env.WEBHOOK_ID as string;
 const AUTH_TOKEN = process.env.AUTH_TOKEN as string;

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
  io.emit('notification', req.body);
}

async function addAddress(new_address : string) {
  console.log("adding address " + new_address);
  const body = { webhook_id: WEBHOOK_ID, addresses_to_add: [new_address], addresses_to_remove: [] };
  try {
    const response = await fetch('https://polygon-mumbai.g.alchemy.com/v2/Fgf4x-uKrbj5Jtl2LQMLOUNkiif5mOzj', {
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