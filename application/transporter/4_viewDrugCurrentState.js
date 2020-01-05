'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to get current status of drug on the Network');
		const currentStatusBuffer = await pharmanetContract.submitTransaction('viewDrugCurrentState', drugName, serialNo);

		console.log('.....Processing Drug Current Status Response \n\n');
		let status = JSON.parse(currentStatusBuffer.toString());
		console.log(status);
		console.log('\n\n.....Drug current status process completed!');
		return status;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
