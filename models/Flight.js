const express = require("express");
const router = express.Router();
const Flight = require("./flight");
const Destination = require("../models/Destination");

// Update the new-flight route
router.get("/new", (req, res) => {
  // Create an in-memory flight for default departure date
  const newFlight = new Flight();
  const dt = newFlight.departs;
  let departsDate = `${dt.getFullYear()}-${(dt.getMonth() + 1)
    .toString()
    .padStart(2, "0")}`;
  departsDate += `-${dt.getDate().toString().padStart(2, "0")}T${dt
    .toTimeString()
    .slice(0, 5)}`;

  // Render the form with the default departure date
  res.render("new-flight", { departsDate });
});

// Update the show-flight route
router.get("/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    res.render("show-flight", { flight });
  } catch (error) {
    console.error(error);
    res.render("error", { message: "Failed to fetch flight details." });
  }
});

// Update the add-destination route
router.post("/:id/add-destination", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);

    const { airport, arrival } = req.body;

    const newDestination = new Destination({
      airport,
      arrival: new Date(arrival),
    });

    const usedAirports = new Set(
      flight.destinations.map((destination) => destination.airport)
    );
    usedAirports.add(flight.airport); // Exclude flight's own airport
    const availableAirports = ["AUS", "DFW", "DEN", "LAX", "SAN"].filter(
      (airport) => !usedAirports.has(airport)
    );

    flight.destinations.push(newDestination);
    await flight.save();

    res.render("show-flight", { flight, availableAirports });
  } catch (error) {
    console.error(error);
    res.render("error", { message: "Failed to add destination." });
  }
});

// Update the flights route
router.get("/", async (req, res) => {
  try {
    const flights = await Flight.find().sort({ departs: "asc" });

    const currentDate = new Date();

    res.render("flights", { flights, currentDate });
  } catch (error) {
    console.error(error);
    res.render("error", { message: "Failed to fetch flights." });
  }
});

module.exports = router;
