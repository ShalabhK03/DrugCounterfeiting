'use strict';

const {Contract} = require('fabric-contract-api');

class RetailerContract extends Contract {

    constructor() {
		  // Provide a custom name to refer to this smart contract
		  super('org.pharma-network.pharmanet.retailer');
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

    async createPO(ctx, buyerCRN, sellerCRN, drugName, quantity) {
        
        //Check and fetch the buyer details
        let buyerIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [buyerCRN]);

        let buyerResponseRange = await buyerIterator.next();
    
        if (!buyerResponseRange || !buyerResponseRange.value || !buyerResponseRange.value.key) {
          throw new Error('Buyer does not exsit on pharma supply chain.');
        }
    
        var buyerKey = buyerResponseRange.value.key;

        let buyerDetail = await ctx.stub
                .getState(buyerKey)
                .catch(err => console.log(err));

        let buyerDetailJSON = JSON.parse(buyerDetail);

        //Check and fetch the seller details
        let sellerIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [sellerCRN]);

        let sellerResponseRange = await sellerIterator.next();
    
        if (!sellerResponseRange || !sellerResponseRange.value || !sellerResponseRange.value.key) {
          throw new Error('Buyer does not exsit on pharma supply chain.');
        }
    
        var sellerKey = sellerResponseRange.value.key;

        let sellerDetail = await ctx.stub
                .getState(sellerKey)
                .catch(err => console.log(err));
        
        let sellerDetailJSON = JSON.parse(sellerDetail);

        // Check if order is placed by Distributor or Retailer
        if(buyerDetailJSON.organisationRole == "Distributor" || buyerDetailJSON.organisationRole == "Retailer") {

          // Check the hierarchy for PO
          if(buyerDetailJSON.hierarchyKey > sellerDetailJSON.hierarchyKey) {
              let poKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.transfer', [buyerCRN, drugName]);

              // Create a PO object to be stored in blockchain
			        let poObject = {
                    poID: poKey,
                    drugName: drugName,
                    quantity: quantity,
                    buyer: buyerDetailJSON.companyID,
                    seller: sellerDetailJSON.companyID,
			    	        createdAt: new Date(),
              };
                
              // Convert the JSON object to a buffer and send it to blockchain for storage
			        let dataBuffer = Buffer.from(JSON.stringify(poObject));
			        await ctx.stub.putState(poKey, dataBuffer);
			        // Return value of requested PO
			        return poObject;
          } else {
              throw new Error('Supply chain tried to break the hierarchy while adding the PO.');
          }

        } else {
            throw new Error('The buyer is not authorized to place PO.');
        }
    }
    
    async retailDrug(ctx, drugName, serialNo, retailerCRN, customerAadhar) {

        //Check and fetch the retailer details
        let retailerIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [retailerCRN]);

        let retailerResponseRange = await retailerIterator.next();
    
        if (!retailerResponseRange || !retailerResponseRange.value || !retailerResponseRange.value.key) {
          throw new Error('Retailer does not exsit on pharma supply chain.');
        }
    
        var retailerKey = retailerResponseRange.value.key;

        let retailerDetail = await ctx.stub
                .getState(retailerKey)
                .catch(err => console.log(err));

        let retailerDetailJSON = JSON.parse(retailerDetail);

        // Fetch Drug Details
        let drugKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);
        
        let drugBuffer = await ctx.stub
				        .getState(drugKey)
                .catch(err => console.log(err));
                
        let drugBufferJSON = JSON.parse(drugBuffer);

        if(drugBufferJSON.owner == retailerDetailJSON.companyID) {
            drugBufferJSON.owner = customerAadhar;
            // Convert the JSON object to a buffer and send it to blockchain for storage
		        let dataBuffer = Buffer.from(JSON.stringify(drugBufferJSON));
		        await ctx.stub.putState(drugKey, dataBuffer);
		        // Return value of requested user account
		        return drugBufferJSON;
        } else {
            throw new Error('The owner of the drug is not a retailer, hence this transaction will not be completed.')
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

module.exports = RetailerContract;