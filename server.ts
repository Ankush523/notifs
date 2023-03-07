import express, { Application, Request, Response } from "express";
import http from "http";
import path from "path";
import { Server, Socket } from "socket.io";
import fetch from "node-fetch";

var app: Application = express();
const server: http.Server = http.createServer(app);
const io: Server = new Server(server);

const port = process.env.PORT || 3001;
server.listen(port, () => {
  console.log(`Server started on port ${port}`);
});

const alchemyWebhookURL = "https://dashboard.alchemyapi.io/api/webhook/wh_zlo1b25whi7n0b4e";

app.use(express.json());

app.post("/alchemyhook", (req: Request, res: Response) => {
  console.log("Transaction notification received:", req.body);
  io.emit("notification", req.body);
  res.status(200).end();
});

// const __dirname = path.resolve();


// app.get("/*", (req: Request, res: Response) => {
//   res.sendFile(path.join(__dirname + "/index.html"));
// });

io.on("connection", (socket: Socket) => {
  console.log("Client connected");

  socket.on("registerAddress", async (address: string) => {
    console.log("Registering new address:", address);
    try {
      const body = {
        addresses_to_add: [address],
        addresses_to_remove: [],
      };
      const response = await fetch(alchemyWebhookURL, {
        method: "PATCH",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          "X-Alchemy-Token": "YijtXcZlhNuK7LTQuVUtFY4nUtAIJUq0",
        },
      });
      const result = await response.json();
      console.log("Address registration successful:", result);
    } catch (error) {
      console.error("Address registration failed:", error);
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected");
  });
});
