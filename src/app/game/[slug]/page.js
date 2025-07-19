import styles from "./game.module.css";
import Room from "./Room.js";
import { socket } from "@/socket.js";
import { useEffect, useState } from "react";
import Play from "@/components/Play/Play.js"


export default async function Game({ params }) {
    const { roomID } = await params
    return (
        <Play />
    )
}
