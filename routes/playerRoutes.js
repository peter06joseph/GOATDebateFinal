"use strict";
const express = require("express");
const router = express.Router();
const Search = require("../models/Search");

// GET /players — show the search form
router.get("/", (req, res) => {
    res.render("search");
});

// POST /players/search — always LeBron or Michael Jordan
router.post("/search", async (req, res) => {
    const { playerChoice } = req.body; // "lebron" or "jordan"

    // Map choice to search query
    const query =
        playerChoice === "jordan"
            ? "michael jordan"
            : "lebron"; // default to LeBron

    // Save GOAT pick to MongoDB
    await Search.create({
        playerName: playerChoice === "jordan" ? "Michael Jordan" : "LeBron James",
        date: new Date()
    });

    try {
        const response = await fetch(
            `https://api.balldontlie.io/v1/players?search=${encodeURIComponent(query)}`,
            {
                headers: {
                    "Authorization": `Bearer ${process.env.BALLDONTLIE_API_KEY}`
                }
            }
        );

        if (!response.ok) {
            throw new Error(`BallDontLie API error: ${response.status}`);
        }

        const data = await response.json();
        const player = data.data[0];

        if (!player) {
            return res.render("result", {
                player: null,
                filters: { playerChoice },
                matchCount: 0,
                message: "Could not find that player from the API."
            });
        }

        const resultPlayer = {
            id: player.id,
            name: `${player.first_name} ${player.last_name}`,
            team: player.team?.full_name || "Unknown Team",
            position: player.position || "N/A",
        };



        res.render("result", {
            player: resultPlayer,
            filters: { playerChoice },
            matchCount: 1,
            message: null
        });

    } catch (e) {
        console.error(e);
        res.render("result", {
            player: null,
            filters: { playerChoice },
            matchCount: 0,
            message: "Error fetching player data: " + e.message
        });
    }
});

module.exports = router;
