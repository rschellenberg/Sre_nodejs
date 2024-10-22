const express = require('express');
const AWS = require('aws-sdk');
const os = require("os");
const host = os.hostname();
const app = express();
const port = 80;

// Configure AWS SDK
AWS.config.update({
    region: 'ca-central-1'
});

// Use DynamoDB as an example
const dynamoDB = new AWS.DynamoDB.DocumentClient();

// Middleware to parse JSON bodies
app.use(express.json());
app.engine('html', require('ejs').renderFile);
app.set('view engine', 'html');


// Route to write data to DynamoDB
app.post('/write', async (req, res) => {
    const { id, value } = req.body;
    const params = {
        TableName: 'ppsre',
        Item: {
            index: parseInt(id, 10),
            id: parseInt(value,10)
        }
    };

    try {
        await dynamoDB.put(params).promise();
        res.status(200).send('Data written successfully');
    } catch (error) {
        console.error('Error writing to DynamoDB:', error);
        res.status(500).send('Error writing data');
    }
});

// Route to read data from DynamoDB
app.get('/read/:id', async (req, res) => {
    const params = {
        TableName: 'ppsre',
        Key: {
            index: parseInt(req.params.id, 10)
//index: 1
        }
    };

    try {
        const data = await dynamoDB.get(params).promise();
        if (data.Item) {
            res.status(200).send(`Value: ${data.Item.id}`);
        } else {
            res.status(404).send('Data not found');
        }
    } catch (error) {
        console.error('Error reading from DynamoDB:', error);
        res.status(500).send('Error reading data');
    }
});
app.get('/', function (req, res) {
  res.render('index.html', {});
});
// Start the server
app.listen(port, () => {
    console.log(`Server is running on http://${host}:${port}`);
});
