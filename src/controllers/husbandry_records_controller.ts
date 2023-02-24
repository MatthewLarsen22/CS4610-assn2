import { PrismaClient } from "@prisma/client";
import { Express, RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { controller } from "../lib/controller";

const getHusbandryRecords = (client: PrismaClient): RequestHandler =>
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
                    husbandryRecords: true,
                },
            });

            // Verify user is authorized to access reptile data
            if (reptile && reptile.userId === userId){
                // Return the list of husbandry records
                res.status(200).json( reptile.husbandryRecords );
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

type CreateHusbandryRecordBody = {
    length: number,
    weight: number,
    temperature: number,
    humidity: number,
}

const createHusbandryRecord = (client: PrismaClient): RequestHandler =>
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
                const {length, weight, temperature, humidity} = req.body as CreateHusbandryRecordBody;
                const husbandryRecord = await client.husbandryRecord.create({
                    data: {
                        reptileId,
                        length,
                        weight,
                        temperature,
                        humidity,
                    }
                });
                res.status(200).json({ husbandryRecord })
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

export const husbandryRecordsController = controller(
    "reptiles/:reptileId/husbandry-records",
    [
        { path: "/", method: "get", endpointBuilder: getHusbandryRecords },
        { path: "/", method: "post", endpointBuilder: createHusbandryRecord },
    ]
);