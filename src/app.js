import express from "express";
import handlebars from "express-handlebars";
import { __dirname } from "./utils.js";
import { Server } from "socket.io";
import mongoose from "mongoose";
import viewsRouter from "./routes/views.router.js";
import cartRouter from "./routes/cartRouter.js";
import productRouter from "./routes/productsRouter.js";
import sessionRouter from "./routes/sessionRouter.js";
import MongoStore from 'connect-mongo';
import session from 'express-session';
import { messagesModel } from "./dao/models/messages.model.js";
import passport from 'passport';
import initializePassport from './config/passport.config.js';
import config from "./config/config.js";

const app = express();
const httpServer = app.listen(config.port, () => console.log("Servidor arriba en el puerto 8080!"));
const socketServer = new Server(httpServer);
mongoose.connect(config.mongoUrl);

app.engine('handlebars', handlebars.engine());
app.set("views", __dirname + "/views");
app.set("view engine", "handlebars");
app.use(express.static(__dirname + "/public"));

app.use((req, res, next) => {
    req.context = { socketServer };
    next();
});

app.use(
    session({
      store: MongoStore.create({
        mongoUrl: config.mongoUrl,
      }),
      secret: 'sdfv8ikm90sedfj8934timo',
      resave: false,
      saveUninitialized: false,
    })
);

initializePassport();

app.use(passport.initialize());
app.use(passport.session());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

app.use("/", viewsRouter)
app.use("/api", sessionRouter);
app.use("/api/products", productRouter);
app.use("/api/carts", cartRouter);

socketServer.on("connection", socket => {
    console.log("cliente conectado");
    socket.on('message', async (data) => {
        await messagesModel.create(data);
        const messages = await messagesModel.find().lean();
        socketServer.emit('new_message', messages);
    });
})
