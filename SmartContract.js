"use-strict";

const { Contract } = require("fabric-contract-api");
const clientIdentity = require("fabric-shim").ClientIdentity;

const list = new Map();
list.set("Manufacturer", 1);
list.set("Dealer", 2);
list.set("Customer", 3);

class CarnetContract extends Contract {
  constructor() {
    //provide a custom name to refer this Smart Contract.
    super("org.cartracking-network.carnet");
  }

  //All the custom function are defined below.

  // This is a basic user defined function used at the time of instantiating the smart contract
  // to print the success message on console
  async instantiate(ctx) {
    console.log("Carnet Smart Contract Instantiated");
  }

  /**
   * Create a new Organization on the network
   * @param ctx - The transaction context object
   * @param orgCRN - Serial number of the organiation
   * @param organisationName - Name of the Organisation
   * @param organisationRole - Role of the registered organisation
   * @param location- location of the oragnisation
   * @returns
   */
  async registerOrganisation(
    ctx,
    orgCRN,
    organisationName,
    organisationRole,
    location
  ) {
    //Creating the composite key for the new Organisation
    const orgKey = ctx.stub.createCompositekey(
      "org.cartracking-network.carnet.org",
      [orgCRN]
    );
    //Creation of Json object to store the Organisation details.
    let requestObject = {
      orgCRN: orgCRN,
      organisationName: organisationName,
      organisationRole: organisationRole,
      hierarchyKey: list.get(organisationRole),
      location: location,
    };
    //Converting the json object to buffer and storing it in Blockchain
    let databuffer = Buffer.from(JSON.stringify(requestObject));
    await ctx.stub.putState(orgKey, databuffer);
    //returning the json onject.
    return requestObject;
  }

  /**
   * Create a new Car on the network called by manufacturer
   * @param ctx - The transaction context object
   * @param carCRN - Serial number of the car
   * @param color - color of the car
   * @param manufacturerCRN - Serial number of the manufacturer
   * @price- price of the car
   * @returns
   */
  async registerCar(ctx, carCRN, color, manufacturerCRN, price) {
    //verify if the function is called by a Manufacturer
    let verifyManufacturer = ctx.stub.clientIdentity.getMSPID();
    if (verifyManufacturer === "manufacturerMSP") {
      //Create Composite key
      const carKey = ctx.stub.createCompositekey(
        "org.cartracking-network.carnet.car",
        [carCRN]
      );
      //Create te Json Object
      let requestObject = {
        carCRN: carCRN,
        color: color,
        manufacturCRN: manufacturCRN,
        price: price,
        status: "Created",
        owner: manufacturerCRN,
      };
    }
    //Converting the JSON object into buffer and storing it in blockchain
    let databuffer = Buffer.from(JSON.stringify(requestObject));
    await ctx.stub.putState(carkey, databuffer);
    // returning the object
    return requestObject;
  }

  /**
   * Get details of the Car on the network
   * @param ctx - The transaction context object
   * @param carCRN - Serial number of the car
   */
  async carDetails(ctx, carCRN) {
    //Verify the function can only be called by either Manufacturer or Dealer
    let verifyManufacturer = ctx.stub.clientIdentity.getMSPID();
    let verifyDealer = ctx.stub.clientIdentity.getMSPID();
    if (
      verifyManufacturer === "manufacturerMSP" ||
      verifyDealer === "dealerMSP"
    ) {
      let carKey = ctx.stub.createCompositekey(
        "org.cartracking-network.carnet.car",
        [carCRN]
      );
      let databuffer = await ctx.stub
        .getState(carKey)
        .catch((err) =>
          console.log("Car with the mentioned serial number doesnot exist")
        );
      //convert buffer into json object and return
      return JSON.parse(databuffer.toString());
    }
  }

  /**
   * Sell Car to the Dealer
   * @param ctx - The transaction context object
   * @param carCRN - Serial number of the car
   * @param dealerCRN - Serial number of the dealer
   * @param manufacturerCRN - Serial number of the manufacturer
   * @returns
   */
  async deliverCar(ctx, carCRN, dealerCRN, manufacturerCRN) {
    //Verify if this funtion is called by Manufacturer
    let verifyManufacturer = await ctx.ClientIdentity.getMSPID();
    //calling the function carDeatils to retrieve the car details
    let carObject = this.carDetails(ctx, carCRN);
    //Verify if the function is called by Manufacturer and and also if he is the owner of the car
    if (
      verifyManufacturer === "manufacturerMSP" &&
      manufacturerCRN === carObject.owner
    ) {
      if (carObject !== undefined) {
        carObject.status = "READY_FOR_SALE";
        carObject.owner = dealerCRN;
        //creating the composite key
        const carKey = ctx.stub.createCompositekey(
          "org.cartracking-network.carnet.car",
          [carCRN]
        );
        //converting the json object to buffer and saving it in blockchain
        let databuffer = Buffer.from(JSON.stringify(carObject));
        await ctx.stub.putState(carKey, carObject);
      }
    }
  }

  /**
   * Sell car to the customer
   * @param ctx - The transaction context object
   * @param carCRN - Serial number of the car
   * @param color - color of the car
   * @param manufacturerCRN - Serial number of the manufacturer
   * @param price- price of the car
   * @returns
   */
  async sellCar(ctx, carCRN, dealerCRN, adhaarNumber) {
    //Verify if this funtion is called by Dealer
    let verifyDealer = await ctx.clientIdentity.getMSPID();
    //calling the function carDeatils to retrieve the car details
    let carObject = this.carDetails(ctx, carCRN);
    //Verify if the function is called by Dealer and and also if he is the owner of the car
    if (verifyDealer === "dealerMSP" && dealerCRN === carObject.owner) {
      if (carObject !== undefined) {
        carObject.status = "SOLD";
        carObject.owner = adhaarNumber;
        //creating the composite key
        const carKey = ctx.stub.createCompositekey(
          "org.cartracking-network.carnet.car",
          [carCRN]
        );
        //converting the json object to buffer and saving it in blockchain
        let databuffer = Buffer.from(JSON.stringify(carObject));
        await ctx.stub.putState(carKey, carObject);
      }
    }
  }
}
