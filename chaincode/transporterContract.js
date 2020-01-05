'use strict';

const {Contract} = require('fabric-contract-api');

class TransporterContract extends Contract {

  constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.transporter');
  }

  // This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
  }
    
  async registerCompany(ctx, companyCRN, companyName, location, organisationRole){
		
		const hierarchy = {
			manufacturer: "Manufacturer",
			distributor: "Distributor",
			retailer: "Retailer"
		}

        // Create a new composite key for the requested company account
		const companyKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.company', [companyCRN, companyName]);

		// Return value of company key if exist
		let companyBuffer = await ctx.stub
				.getState(companyKey)
				.catch(err => console.log(err));

		if(companyBuffer == null || companyBuffer == "") {
			// Create a company object to be stored in blockchain
			let companyRegistrationObject = {
				companyID: companyKey,
				name: companyName,
				location: location,
            	organisationRole: organisationRole,
            	hierarchyKey: 0,
				createdAt: new Date(),
			};

			if(organisationRole == hierarchy.manufacturer) {
				companyRegistrationObject.hierarchyKey = 1;
			} else if(organisationRole == hierarchy.distributor) {
				companyRegistrationObject.hierarchyKey = 2;
			} else if(organisationRole == hierarchy.retailer) {
				companyRegistrationObject.hierarchyKey = 3;
			} else {
				companyRegistrationObject.hierarchyKey = 0;
			}
		
			// Convert the JSON object to a buffer and send it to blockchain for storage
			let dataBuffer = Buffer.from(JSON.stringify(companyRegistrationObject));
			await ctx.stub.putState(companyKey, dataBuffer);
			// Return value of requested company
			return companyRegistrationObject;
		} else {
			throw new Error('Company already exist.');
		}
  }

  async updateShipment(ctx, buyerCRN, drugName, trasnsporterCRN) {

        let transporterIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [trasnsporterCRN]);
  
        let transporterResponseRange = await transporterIterator.next();
  
        if(!transporterResponseRange || !transporterResponseRange.value || !transporterResponseRange.value.key){
            throw new Error('Transporter is not registered to the network.');
        }
  
        var transporterDetails = await ctx.stub.getState(transporterResponseRange.value.key).catch(err => console.log(err));
  
        var transporterDetailsJSON = JSON.parse(transporterDetails);
  
        if(transporterDetailsJSON.organisationRole == 'Transporter') {
  
            let shipmentKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN, drugName]);
  
            let shipmentData = await ctx.stub.getState(shipmentKey).catch(err => console.log(err));
  
            let shipmentDataJSON = JSON.parse(shipmentData);
  
            var assetList = shipmentDataJSON.assets;
  
            var buyerIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN]);
  
            let buyerIteratorResponseRange = await buyerIterator.next();
  
            if(!buyerIteratorResponseRange || !buyerIteratorResponseRange.value || !buyerIteratorResponseRange.value.key){
              throw new Error('Buyer is not registered on the network.');
            }
  
            var buyerDetails = await ctx.stub.getState(buyerIteratorResponseRange.value.key).catch(err => console.log(err));
  
            var buyerDetailsJSON = JSON.parse(buyerDetails);
  
            for (let i = 0; i < assetList.length; i++) {
                let drugDetails = await ctx.stub.getState(assetList[i]);
                
                let drugDetailsJSON = JSON.parse(drugDetails);
  
                drugDetailsJSON.shipment.push(shipmentKey);
  
                drugDetailsJSON.owner = buyerDetailsJSON.companyID;
  
                let dataBuffer = Buffer.from(JSON.stringify(drugDetailsJSON));
  
                await ctx.stub.putState(drugDetailsJSON.productID, dataBuffer);
            }
  
            shipmentDataJSON.status = 'delivered';
  
            let shipmentDataBuffer = Buffer.from(JSON.stringify(shipmentDataJSON));
  
            await ctx.stub.putState(shipmentKey, shipmentDataBuffer);
  
            return shipmentDataJSON;
        } else {
            throw new Error('Transporter not registered.');
        }
  }

  async viewHistory(ctx, drugName, serialNo) {

      let drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);
  
      let iterator = await ctx.stub.getHistoryForKey(drugKey);
      let result = [];
      let history = await iterator.next();
      while(!history){
        if(history.value){
          result.push(JSON.parse(history.value.value.toString('utf8')));
        }
        history = await iterator.next();
      }
      await iterator.close();
      return result;
  }
  
  async viewDrugCurrentState(ctx, drugName, serialNo) {
      let drugKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);
  
      let drugDetail = await ctx.stub
                  .getState(drugKey)
                  .catch(err => console.log(err));
  
      return JSON.parse(drugDetail.toString());
  }
}

module.exports = TransporterContract;