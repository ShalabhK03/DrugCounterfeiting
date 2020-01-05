'use strict';

const helper = require('./contractHelper');

async function main(drugName, serialNo) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to get history of drug on the Network');
		const historyBuffer = await pharmanetContract.submitTransaction('viewHistory', drugName, serialNo);

		console.log('.....Processing Drug History Response \n\n');
		let history = JSON.parse(historyBuffer.toString());
		console.log(history);
		console.log('\n\n.....Drug History process completed!');
		return history;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
