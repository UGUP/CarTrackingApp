"use strict";

/**
 * This is a Node.JS application to add a new Car on the network.
 */

const fs = require("fs");
const yaml = require("js-yaml");
const { FileSystemWallet, Gateway } = require("fabric-network");
let gateway;

async function main(carCRN, color, manufacturerCRN, price) {
  try {
    const carnetContract = await getContractInstance();
    // Create a new Car assert
    console.log(".....Create a new Organisation");
    const dataBuffer = await carnetContract.submitTransaction(
      "registerCar",
      carCRN,
      color,
      manufacturerCRN,
      price
    );
    // process response
    console.log(".....Processing Create car Transaction Response \n\n");
    let newCar = JSON.parse(dataBuffer.toString());
    console.log(newCar);
    console.log("\n\n.....Create Car Transaction Complete!");
    return newCar;
  } catch (error) {
    console.log(`\n\n ${error} \n\n`);
    throw new Error(error);
  } finally {
    // Disconnect from the fabric gateway
    console.log(".....Disconnecting from Fabric Gateway");
    gateway.disconnect();
  }
}

async function getContractInstance() {
  // A gateway defines which peer is used to access Fabric network
  // It uses a common connection profile (CCP) to connect to a Fabric Peer
  gateway = new Gateway();

  // A wallet is where the credentials to be used for this transaction exist
  // Credentials for user IIT_ADMIN was initially added to this wallet.
  const wallet = new FileSystemWallet("./identity/maufacturer");

  //username of this Client user accessing the network
  const fabricUserName = "MANUFACTURER_ADMIN";

  // Load connection profile; will be used to locate a gateway; The CCP is converted from YAML to JSON.
  let connectionProfile = yaml.safeLoad(
    fs.readFileSync("./connection-profile-maufacturer.yaml", "utf8")
  );

  // Set connection options; identity and wallet
  let connectionOptions = {
    wallet: wallet,
    identity: fabricUserName,
    discovery: { enabled: false, asLocalhost: true },
  };

  // Connect to gateway using specified parameters
  console.log(".....Connecting to Fabric Gateway");
  await gateway.connect(connectionProfile, connectionOptions);

  // Access certification channel
  console.log(".....Connecting to channel - cartrackingchannel");
  const channel = await gateway.getNetwork("cartrackingchannel");

  // Get instance of deployed Certnet contract
  // @param Name of chaincode
  // @param Name of smart contract
  console.log(".....Connecting to Carnet Smart Contract");
  return channel.getContract("carnet", "org.cartracking-network.carnet");
}

module.exports.execute = main;
