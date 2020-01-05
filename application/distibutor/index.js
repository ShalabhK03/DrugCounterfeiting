const express = require('express');
const app = express();
const cors = require('cors');
const port = 5000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const createShipment = require('./3_createShipment');
const viewHistory = require('./4_viewHistory');
const viewDrugCurrentState = require('./5_viewDrugCurrentState');
const createPO = require('./6_createPO');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('Hello Distributor'));

app.post('/addToWallet/distributor', (req, res) => {
    addToWallet.execute(req.body.certificatePath, req.body.privateKeyPath).then ((result) => {
        console.log('User Credentials added to wallet');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/registerCompany', (req, res) => {
    registerCompany.execute(req.body.companyCRN, req.body.companyName, req.body.location, req.body.organisationRole).then ((result) => {
        console.log('Register Company request submitted.');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createPO', (req, res) => {
    createPO.execute(req.body.buyerCRN, req.body.sellerCRN, req.body.drugName, req.body.quantity).then ((result) => {
        console.log('Create purchase order request submitted.');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/createShipment', (req, res) => {
    console.log(req.body.listOfAssets);
    createShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN, req.body.listOfAssets).then ((result) => {
        console.log('Create Shipment request submitted.');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewHistory', (req, res) => {
    viewHistory.execute(req.body.drugName, req.body.serialNo).then ((result) => {
        console.log('Drug History request submitted.');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.post('/viewDrugCurrentState', (req, res) => {
    viewDrugCurrentState.execute(req.body.drugName, req.body.serialNo).then ((result) => {
        console.log('Drug current status request submitted.');
        res.json(result);
    })
    .catch((e) => {
        const result = {
            status: 'error',
            message: 'Failed',
            error: e
        };
        res.status(500).send(result);
    });
});

app.listen(port, () => console.log(`Distributed Pharma App listening on port ${port}!`));
