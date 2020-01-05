'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, retailerCRN, customerAadhar) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to retail drug on the Network');
		const drugBuffer = await pharmanetContract.submitTransaction('retailDrug', drugName, serialNo, retailerCRN, customerAadhar);

		console.log('.....Processing retail drug Response \n\n');
		let drug = JSON.parse(drugBuffer.toString());
		console.log(drug);
		console.log('\n\n.....Retail drug completed!');
		return drug;
	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
