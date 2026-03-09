import express from "express";

const router = express.Router();

router.get("/search", async (req, res) => {
    const { q } = req.query;

    if (!q || q.trim().length < 3) {
        return res.json([]);
    }

    try {
        // Backend fetch bypasses browser CORS and can include required User-Agent
        const url = `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(q)}&limit=10&countrycodes=in&addressdetails=1`;

        const response = await fetch(url, {
            headers: {
                "User-Agent": "WeeflyCabBooking/1.0 (contact: support@wheefly.com)",
                "Accept-Language": "en-US,en;q=0.9",
            }
        });

        if (!response.ok) {
            console.error(`Nominatim Error Status: ${response.status} ${response.statusText}`);
            const errText = await response.text();
            console.error(`Nominatim Error Body: ${errText}`);
            throw new Error(`Nominatim error: ${response.statusText}`);
        }

        const data = await response.json();
        res.json(data);
    } catch (error) {
        console.error("Nominatim Proxy Error:", error.message);
        res.status(500).json({ error: "Failed to fetch suggestions" });
    }
});

export default router;

