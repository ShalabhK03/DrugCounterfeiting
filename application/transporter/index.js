const express = require('express');
const app = express();
const cors = require('cors');
const port = 7000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const registerCompany = require('./2_registerCompany');
const viewHistory = require('./3_viewHistory');
const viewDrugCurrentState = require('./4_viewDrugCurrentState');
const updateShipment = require('./5_updateShipment');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('Hello Transporter'));

app.post('/addToWallet/transporter', (req, res) => {
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

app.post('/updateShipment', (req, res) => {
    updateShipment.execute(req.body.buyerCRN, req.body.drugName, req.body.transporterCRN).then ((result) => {
        console.log('Update shipment request submitted.');
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
