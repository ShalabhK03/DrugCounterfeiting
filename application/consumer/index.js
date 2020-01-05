const express = require('express');
const app = express();
const cors = require('cors');
const port = 8000;

// Import all function modules

const addToWallet = require('./1_addToWallet');
const viewHistory = require('./2_viewHistory');
const viewDrugCurrentState = require('./3_viewDrugCurrentState');

// Define Express app settings
app.use(cors());
app.use(express.json()); // for parsing application/json
app.use(express.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.set('title', 'Pharma App');

app.get('/', (req, res) => res.send('Hello Consumer'));

app.post('/addToWallet/consumer', (req, res) => {
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
