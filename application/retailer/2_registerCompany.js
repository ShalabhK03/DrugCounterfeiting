'use strict';

const helper = require('./contractHelper');

async function main(companyCRN, companyName, location, organisationRole) {

	try {
		const pharmanetContract = await helper.getContractInstance();

		console.log('.....Requesting to register a company on the Network');
		const newUserBuffer = await pharmanetContract.submitTransaction('registerCompany', companyCRN, companyName, location, organisationRole);

		console.log('.....Processing Company Register Transaction Response \n\n');
		let newUser = JSON.parse(newUserBuffer.toString());
		console.log(newUser);
		console.log('\n\n.....Reister Company Transaction Complete!');
		return newUser;

	} catch (error) {

		console.log(`\n\n ${error} \n\n`);
		throw new Error(error);

	} finally {
		helper.disconnect();
	}
}

module.exports.execute = main;
