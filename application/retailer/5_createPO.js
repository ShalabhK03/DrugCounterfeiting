'use strict';

const helper = require('./contractHelper');

async function main(buyerCRN, sellerCRN, drugName, quantity) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to create purchase order on the Network');
		const purchaseOrderBuffer = await pharmanetContract.submitTransaction('createPO', buyerCRN, sellerCRN, drugName, quantity);

		console.log('.....Processing create purchase order Response \n\n');
		let purchaseOrder = JSON.parse(purchaseOrderBuffer.toString());
		console.log(purchaseOrder);
		console.log('\n\n.....Create purchase order completed!');
		return purchaseOrder;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
