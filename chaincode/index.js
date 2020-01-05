'use strict';

const manufacturerContract = require('./manufacturerContract');
const distributorContract = require('./distributorContract');
const retailerContract = require('./retailerContract');
const transporterContract = require('./transporterContract');
const consumerContract = require('./consumerContract');

module.exports.contracts = [manufacturerContract, distributorContract, retailerContract, transporterContract, consumerContract];
