import { PrismaClient } from "@prisma/client";
import { Express, RequestHandler } from "express";
import { RequestWithJWTBody } from "../dto/jwt";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { controller } from "../lib/controller";

const validSpecies = ["ball_python", "king_snake", "corn_snake", "redtail_boa"];
const validSex = ["m", "f"];

const getReptiles = (client: PrismaClient): RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        // Validate User
        const userId = req.jwtBody?.userId;
        if (!userId) {
            res.status(401).json({ message: "Unauthorized" });
            return;
        }

        // Find all reptiles with the user's userId
        const user = await client.user.findFirst({
            where: {
                id: userId
            },
            include: {
                reptiles: true,
            },
        });

        // Return the list of reptiles
        if (user){
            res.status(200).json( user.reptiles );
        }
        else {
            res.status(400).json({ message: "Invalid user" });
        }
    }

type CreateReptileBody = {
    species: string,
    name: string,
    sex: string,
}

const createReptile = (client: PrismaClient): RequestHandler =>
    async (req: RequestWithJWTBody, res) => {
        // Validate User
        const userId = req.jwtBody?.userId;
        if (userId){
            // Verify that the species and sex are valid
            const {species, name, sex} = req.body as CreateReptileBody;
            if (!validSpecies.includes(species)){
                res.status(400).json({ message: "Invalid species"})
            }
            else if (!validSex.includes(sex)){
                res.status(400).json({ message: "Invalid sex"})
            }
            else {
                // Create the new reptile
                const reptile = await client.reptile.create({
                    data: {
                        userId,
                        species,
                        name,
                        sex,
                    },
                });
                res.status(200).json({ reptile })
            }
        }
        else{
            res.status(401).json({ message: "Unauthorized" });
        }
    }

const getReptile = (client: PrismaClient): RequestHandler =>
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
            });

            // Verify user is authorized to access reptile data
            if (reptile && reptile.userId === userId){
                res.status(200).json({ reptile });
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

const updateReptile = (client: PrismaClient): RequestHandler =>
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
                // Verify that the species and sex are valid
                const {species, name, sex} = req.body as CreateReptileBody;
                if (!validSpecies.includes(species)){
                    res.status(400).json({ message: "Invalid species"})
                }
                if (!validSex.includes(sex)){
                    res.status(400).json({ message: "Invalid sex"})
                }
                else {
                    // Update the reptile
                    const reptile = await client.reptile.update({
                        where: {
                            id: reptileId
                        },
                        data: {
                            userId,
                            species,
                            name,
                            sex,
                        },
                    });
                    res.status(200).json({ reptile })
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

const deleteReptile = (client: PrismaClient): RequestHandler =>
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
                // Delete the reptile from the database
                const updatedReptile = await client.reptile.delete({
                    where: {
                        id: reptileId
                    },
                });
                res.status(200).json({ message: "Reptile successfully deleted" });
            }
            else {
                res.status(401).json({ message: "Unauthorized" });
            }
        }
        else {
            res.status(400).json({ message: "Invalid Reptile Id" });
        }
    }

export const reptilesController = controller(
    "reptiles",
    [
        { path: "/", method: "get", endpointBuilder: getReptiles },
        { path: "/", method: "post", endpointBuilder: createReptile },
        { path: "/:reptileId", method: "get", endpointBuilder: getReptile },
        { path: "/:reptileId", method: "post", endpointBuilder: updateReptile },
        { path: "/:reptileId", method: "delete", endpointBuilder: deleteReptile }
    ]
);