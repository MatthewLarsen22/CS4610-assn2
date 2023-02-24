import { PrismaClient } from "@prisma/client";
import { Express, RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { controller } from "../lib/controller";

const validType = ["feed", "record", "clean"];

const getSchedulesForUser = (client: PrismaClient): RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        // Validate User
        const userId = req.jwtBody?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        const user = await client.user.findFirst({
            where: {
                id: userId
            },
            include: {
                schedules: true,
            },
        });

        // Return the schedules
        if (user){
            res.status(200).json( user.schedules );
        }
        else {
            res.status(400).json({ message: "Invalid user" });
        }
    }

const getSchedulesForReptile = (client: PrismaClient): RequestHandler =>
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
                    schedules: true,
                },
            });

            // Verify user is authorized to access reptile data
            if (reptile && reptile.userId === userId){
                // Return the list of schedules
                res.status(200).json( reptile.schedules );
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }


type CreateScheduleBody = {
    type: string,
    description: string,
    monday: boolean,
    tuesday: boolean,
    wednesday: boolean,
    thursday: boolean,
    friday: boolean,
    saturday: boolean,
    sunday: boolean,
}

const createSchedule = (client: PrismaClient): RequestHandler =>
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
                const {
                    type,
                    description,
                    monday,
                    tuesday,
                    wednesday,
                    thursday,
                    friday,
                    saturday,
                    sunday
                } = req.body as CreateScheduleBody;
                if (!validType.includes(type)){
                    res.status(400).json({ message: "Invalid schedule type"})
                }
                else {
                    // Update the schedule
                    const schedule = await client.schedule.create({
                        data: {
                            reptileId,
                            userId,
                            type,
                            description,
                            monday,
                            tuesday,
                            wednesday,
                            thursday,
                            friday,
                            saturday,
                            sunday,
                        },
                    });
                    res.status(200).json({ schedule })
                }
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

export const schedulesController = controller(
    "",
    [
        { path: "/schedules", method: "get", endpointBuilder: getSchedulesForUser },
        { path: "/reptiles/:reptileId/schedules", method: "get", endpointBuilder: getSchedulesForReptile },
        { path: "/reptiles/:reptileId/schedules", method: "post", endpointBuilder: createSchedule },
    ]
);