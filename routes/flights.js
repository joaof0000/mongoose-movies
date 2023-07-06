const express = require("express");
const router = express.Router();
const Flight = require("../models/flight");
const Destination = require("../models/Destination");

// Route for creating a new flight
router.get("/new", (req, res) => {
  // Render the form to create a new flight
  res.render("new-flight");
});

router.post("/", async (req, res) => {
  // Retrieve the flight data from the request body
  const { airline, airport, flightNo, departs } = req.body;

  // Create a new instance of the Flight model
  const newFlight = new Flight({
    airline,
    airport,
    flightNo,
    departs: new Date(departs),
  });

  try {
    // Save the new flight to the database
    const savedFlight = await newFlight.save();
    res.redirect("/flights");
  } catch (error) {
    console.error(error);
    res.render("new-flight", { error: "Failed to create the flight." });
  }
});

// Route for viewing all flights
router.get("/", async (req, res) => {
  try {
    // Retrieve all flights from the database
    const flights = await Flight.find().sort({ departs: "asc" });

    // Render the view to display all flights
    res.render("flights", { flights });
  } catch (error) {
    console.error(error);
    res.render("flights", { error: "Failed to fetch flights." });
  }
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

module.exports = router;
