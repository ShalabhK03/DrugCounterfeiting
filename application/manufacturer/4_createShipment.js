'use strict';

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, transporterCRN, listOfAssets) {

	try {
		let asset = "";
		const pharmanetContract = await helper.getContractInstance();
		for(var i=0 ; i < listOfAssets.length; i++){
			asset = asset + listOfAssets[i] + ";";
		}

		console.log('.....Requesting to create shipment on the Network');
		const newShipmentBuffer = await pharmanetContract.submitTransaction('createShipment', buyerCRN, drugName, transporterCRN, asset);

		console.log('.....Processing Create Shipment Response \n\n');
		let newShipment = JSON.parse(newShipmentBuffer.toString());
		console.log(newShipment);
		console.log('\n\n.....Create Shipment process completed!');
		return newShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
