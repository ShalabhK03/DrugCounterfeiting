'use strict';

const {Contract} = require('fabric-contract-api');

class ManufacturerContract extends Contract {

    constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.company');
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

    async addDrug(ctx, drugName, serialNo, mfgDate, expDate, companyCRN) {

        let iterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [companyCRN]);
    
        let responseRange = await iterator.next();
    
        if (!responseRange || !responseRange.value || !responseRange.value.key) {
          throw new Error('Manufacturer does not exsit on pharma supply chain.');
        }
    
        var companyKey = responseRange.value.key;
    
        let companyDetail = await ctx.stub
                    .getState(companyKey)
                    .catch(err => console.log(err));
                    
        let companyDetailJSON = JSON.parse(companyDetail);
    
        if(companyDetailJSON.organisationRole == "Manufacturer") {
    
          let productKey = ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [serialNo, drugName]);
    
          let drugObject = {
            productID: productKey,
            name: drugName,
            manufacturer: companyKey,
            manufacturingDate: mfgDate,
            expiryDate: expDate,
            owner: companyKey,
            shipment: [],
            createAt: new Date(),
          } 
    
          // Convert the JSON object to a buffer and send it to blockchain for storage
                let dataBuffer = Buffer.from(JSON.stringify(drugObject));
                await ctx.stub.putState(productKey, dataBuffer);
                // Return value of requested drug
          return drugObject;
        } else {
            throw new Error('Invalid Request...');
        }
    }

    async createShipment(ctx, buyerCRN, drugName, transporterCRN, assets) {
      var listOfAssets = assets.split(';');
      let poKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.transfer', [buyerCRN, drugName]);

      let poState = await ctx.stub
                      .getState(poKey)
                      .catch(err => console.log(err));

      let poStateJSON = JSON.parse(poState);

      console.log(poStateJSON);

      let poCompositeKeys = new Array();
      
      if(poStateJSON.quantity == listOfAssets.length - 1) {
        for(let i = 0; i < listOfAssets.length - 1; i++){
          let assetCompositeKey = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.drug', [listOfAssets[i], drugName]);
          
          let drugDetail = await ctx.stub
                  .getState(assetCompositeKey)
                  .catch(err => console.log(err));
          
          let drugDetailJSON = JSON.parse(drugDetail);

          poCompositeKeys.push(drugDetailJSON.productID);
        }
        
        let transporterIterator = await ctx.stub.getStateByPartialCompositeKey('org.pharma-network.pharmanet.company', [transporterCRN]);

        let transporterIteratorResponseRange = await transporterIterator.next();
  
        if (!transporterIteratorResponseRange || !transporterIteratorResponseRange.value || !transporterIteratorResponseRange.value.key) {
          throw new Error('The PO order do not match.');
        }
  
        var transporterKey = transporterIteratorResponseRange.value.key;

        let transporterDetail = await ctx.stub
                .getState(transporterKey)
                .catch(err => console.log(err));
      
        let transporterDetailJSON = JSON.parse(transporterDetail);

        let shipmentID = await ctx.stub.createCompositeKey('org.pharma-network.pharmanet.shipment', [buyerCRN, drugName]);

        // Create a PO object to be stored in blockchain
        let shipmentObject = {
          shipmentID: shipmentID,
          creator: ctx.clientIdentity.getID(),
          assets: poCompositeKeys,
          transporter: transporterDetailJSON.companyID,
          status: 'in-transit',
          createdAt: new Date(),
        };
              
        // Convert the JSON object to a buffer and send it to blockchain for storage
        let dataBuffer = Buffer.from(JSON.stringify(shipmentObject));
        await ctx.stub.putState(shipmentID, dataBuffer);
        // Return value of requested PO
        return shipmentObject;
      } else {
        throw new Error('Purcahse order quantity do not match list of assets.');
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

module.exports = ManufacturerContract;