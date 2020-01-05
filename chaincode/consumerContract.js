'use strict';

const {Contract} = require('fabric-contract-api');

class ConsumerContract extends Contract {

    constructor() {
		// Provide a custom name to refer to this smart contract
		super('org.pharma-network.pharmanet.consumer');
    }

    // This is a basic user defined function used at the time of instantiating the smart contract
	// to print the success message on console
	async instantiate(ctx) {
		console.log('Pharmanet Smart Contract Instantiated');
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

module.exports = ConsumerContract;