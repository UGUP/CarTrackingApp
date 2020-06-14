const express = require("express");
const app = express();
const cors = require("cors");
const port = 3000;

// Import all function modules
const addToWallet = require("./addToWallet");
const registerOrganization = require("./registerOrganization");
const registerCar = require("./registerCar");
const deliverCar = require("./deliverCar");
const sellCar = require("./sellCar");

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set("title", "Car Traking App");

app.get("/", (req, res) => res.send("hello world"));

app.post("/addToWallet", (req, res) => {
  addToWallet
    .execute(
      req.body.certificatePath,
      req.body.privateKeyPath,
      req.body.organization
    )
    .then(() => {
      console.log("User credentials added to wallet");
      const result = {
        status: "success",
        message: "User credentials added to wallet",
      };
      res.json(result);
    })
    .catch((e) => {
      const result = {
        status: "error",
        message: "Failed",
        error: e,
      };
      res.status(500).send(result);
    });
});

app.post("/registerOrganization", (req, res) => {
  registerOrganization
    .execute(
      req.body.orgCRN,
      req.body.organisationName,
      req.body.organisationRole,
      req.body.location
    )
    .then((organization) => {
      console.log("New Organization created");
      const result = {
        status: "success",
        message: "New Organization created",
        organization: organization,
      };
      res.json(result);
    })
    .catch((e) => {
      const result = {
        status: "error",
        message: "Failed",
        error: e,
      };
      res.status(500).send(result);
    });
});

app.post("/registerCar", (req, res) => {
  registerCar
    .execute(
      req.body.carCRN,
      req.body.color,
      req.body.manufacturerCRN,
      req.body.price
    )
    .then((car) => {
      console.log("New car is registered on the network");
      const result = {
        status: "success",
        message: "New car is registered on the network",
        car: car,
      };
      res.json(result);
    })
    .catch((e) => {
      const result = {
        status: "error",
        message: "Failed",
        error: e,
      };
      res.status(500).send(result);
    });
});

app.post("/deliverCar", (req, res) => {
  deliverCar
    .execute(req.body.carCRN, req.body.dealerCRN, req.body.manufacturerCRN)
    .then((deliverCar) => {
      console.log("Car delivered to the Dealer");
      const result = {
        status: "success",
        message: "car deliverred to the dealer",
        deliverCar: deliverCar,
      };
      res.json(result);
    })
    .catch((e) => {
      const result = {
        status: "error",
        message: "Failed",
        error: e,
      };
      res.status(500).send(result);
    });
});

app.post("/sellCar", (req, res) => {
  sellCar
    .execute(req.body.carCRN, req.body.dealerCRN, req.body.adhaarNumber)
    .then((sellCar) => {
      console.log("Car sold to customer");
      const result = {
        status: "success",
        message: "Car sold to customer",
        sellCar: sellCar,
      };
      res.json(result);
    })
    .catch((e) => {
      const result = {
        status: "error",
        message: "Failed",
        error: e,
      };
      res.status(500).send(result);
    });
});

app.listen(port, () =>
  console.log(`Distributed Car Tracking App listening on port ${port}!`)
);
