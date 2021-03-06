"use strict";

/**
 * This is a Node.JS module to load a user's Identity to his wallet.
 * This Identity will be used to sign transactions initiated by this user.
 * Defaults:
 *  User Name: $ORGANIZATION_ADMIN
 *  User Organization: $Organization
 *  User Role: Admin
 *
 */

const fs = require("fs"); // FileSystem Library
const { FileSystemWallet, X509WalletMixin } = require("fabric-network"); // Wallet Library provided by Fabric
const path = require("path"); // Support library to build filesystem paths in NodeJs

const crypto_materials = path.resolve(__dirname, "../network/crypto-config"); // Directory where all Network artifacts are stored

async function main(certificatePath, privateKeyPath, organization) {
  const lowerCaseParam = organization.toLowerCase();
  const upperCaseParam = organization.toUpperCase();

  // A wallet is a filesystem path that stores a collection of Identities
  const wallet = new FileSystemWallet(`./identity/${lowerCaseParam}`);

  // Main try/catch block
  try {
    // Fetch the credentials from our previously generated Crypto Materials required to create this user's identity
    const certificate = fs.readFileSync(certificatePath).toString();
    // IMPORTANT: Change the private key name to the key generated on your computer
    const privatekey = fs.readFileSync(privateKeyPath).toString();

    // Load credentials into wallet
    const identityLabel = `${upperCaseParam}_ADMIN`;
    const identity = X509WalletMixin.createIdentity(
      `${lowerCaseParam}MSP`,
      certificate,
      privatekey
    );

    await wallet.import(identityLabel, identity);
  } catch (error) {
    console.log(`Error adding to wallet. ${error}`);
    console.log(error.stack);
    throw new Error(error);
  }
}

module.exports.execute = main;
