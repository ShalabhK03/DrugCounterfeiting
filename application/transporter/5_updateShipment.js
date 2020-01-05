'use strict';

const helper = require('./contractHelper');

async function main(buyerCRN, drugName, transporterCRN) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to update shipment on the Network');
		const updateShipmentBuffer = await pharmanetContract.submitTransaction('updateShipment', buyerCRN, drugName, transporterCRN);

		console.log('.....Processing Update Shipment Response \n\n');
		let updateShipment = JSON.parse(updateShipmentBuffer.toString());
		console.log(updateShipment);
		console.log('\n\n.....Update Shipment process completed!');
		return updateShipment;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
