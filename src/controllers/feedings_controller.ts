import { PrismaClient } from "@prisma/client";
import { Express, RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { controller } from "../lib/controller";

const getFeedings = (client: PrismaClient): RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        // Validate User
        const userId = req.jwtBody?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Validate reptile id
        const reptileId = Number(req.params.reptileId);
        if (reptileId){
            // Get reptile data if it exists in the database
            const reptile = await client.reptile.findFirst({
                where: {
                    id: reptileId
                },
                include: {
                    feedings: true,
                },
            });

            // Verify user is authorized to access reptile data
            if (reptile && reptile.userId === userId){
                // Return the list of feedings
                res.status(200).json( reptile.feedings );
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

type CreateFeedingBody = {
    foodItem: string,
}

const createFeeding = (client: PrismaClient): RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        // Validate User
        const userId = req.jwtBody?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Validate reptile id
        const reptileId = Number(req.params.reptileId);
        if (reptileId){
            // Get reptile data if it exists in the database
            const reptile = await client.reptile.findFirst({
                where: {
                    id: reptileId
                }
            });

            // Verify user is authorized to access reptile data
            if (reptile && reptile.userId === userId){
                const {foodItem} = req.body as CreateFeedingBody;
                const feeding = await client.feeding.create({
                    data: {
                        reptileId,
                        foodItem,
                    },
                });
                res.status(200).json({ feeding })
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

export const feedingsController = controller(
    "reptiles/:reptileId/feedings",
    [
        { path: "/", method: "get", endpointBuilder: getFeedings },
        { path: "/", method: "post", endpointBuilder: createFeeding },
    ]
);