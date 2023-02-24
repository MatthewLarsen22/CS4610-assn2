import express, { RequestHandler } from "express";
import { PrismaClient, User } from "@prisma/client";
import bcrypt from "bcrypt";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
import jwt from "jsonwebtoken";
import { JWTBody, RequestWithJWTBody } from "./dto/jwt";
import { usersController } from "./controllers/users_controller";
import { reptilesController } from "./controllers/reptiles_controller";
import { feedingsController } from "./controllers/feedings_controller";
import { husbandryRecordsController } from "./controllers/husbandry_records_controller";
import { schedulesController } from "./controllers/schedules_controller";

dotenv.config();
const client = new PrismaClient();
const app = express();

app.use(express.json());
app.use(cookieParser());

//sign up

type LoginBody = {
    email: string,
    password: string
}

// log in
app.post("/sessions", async (req, res) => {
    const {email, password} = req.body as LoginBody;
    const user = await client.user.findFirst({
        where: {
            email,
        }
    });
    if (!user) {
        res.status(404).json({ message: "Invalid email or password" });
        return;
    }

    const isValid = await bcrypt.compare(password, user.passwordHash);
    if (!isValid) {
        res.status(404).json({ message: "Invalid email or password" });
        return;
    }

    const token = jwt.sign({
        userId: user.id
    }, process.env.ENCRYPTION_KEY!!, {
        expiresIn: '10m'
    });

    res.json({
        user,
        token
    })
});

usersController(app, client);
reptilesController(app, client);
feedingsController(app, client);
husbandryRecordsController(app, client);
schedulesController(app, client);

app.get("/", (req, res) => {
  res.send(`<h1>Hello, world!</h1>`);
});

app.listen(3000, () => {
  console.log("I got started!");
});

export default app;