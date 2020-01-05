'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo, mfgDate, expDate, companyCRN) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to add drug on the Network');
		const newDrugBuffer = await pharmanetContract.submitTransaction('addDrug', drugName, serialNo, mfgDate, expDate, companyCRN);

		console.log('.....Processing Add Drug Transaction Response \n\n');
		let newDrug = JSON.parse(newDrugBuffer.toString());
		console.log(newDrug);
		console.log('\n\n.....Adding Drug Complete!');
		return newDrug;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
