// const { MongoClient, ObjectID } = require('mongodb');
// const express = require('express');
// const bodyParser = require('body-parser');
// const nodemailer = require('nodemailer');
// const mongoose = require("mongoose");

// const app = express();
// app.use(bodyParser.json());

// // MongoDB Connection URL
// const url = 'mongodb+srv://aditya2test:N0DX5uUKuYZmGuF4@cluster0.mgkp1lm.mongodb.net/';
// const dbName = 'test'; // Replace with your MongoDB database name

// const uri = `mongodb+srv://aditya2test:N0DX5uUKuYZmGuF4@cluster0.mgkp1lm.mongodb.net/`;


// // Connect to MongoDB using Mongoose
// mongoose.connect(uri, {
//   useNewUrlParser: true,
//   useUnifiedTopology: true,
// });

// const db = mongoose.connection;

// db.on("error", console.error.bind(console, "MongoDB connection error:"));
//   server.listen(process.env.PORT || 1337, () => {
//   console.log("webhook is listening");
// });

// db.once("open", () => {
//   console.log("Connected to MongoDB");

// })




// // Create a new MongoClient
// const client = new MongoClient(url);

// // Connect to MongoDB
// client.connect(function (err) {
//   if (err) {
//     console.error('Error connecting to MongoDB', err);
//     return;
//   }
//   console.log('Connected to MongoDB');

//   const db = client.db(dbName);
//   const collection = db.collection('recipients');

//   // Nodemailer transporter setup
//   const transporter = nodemailer.createTransport({
//     /* Your nodemailer transporter configuration here */
//   });

//   app.post('/sendmail', (req, res) => {
//     let Sender = req.body['Sender'];
//     let Recipient = req.body['Recipient'];
//     let MessageBody = req.body['MessageBody'];
//     let Subject = req.body['Subject'];

//     let htmlBody = '<p>' + MessageBody + '</p>' + '<img src = "' + Server + '/recipients/' + Recipient + '" style="display:none">';
//     var mailOptions = {
//       from: Sender,
//       to: Recipient,
//       subject: Subject,
//       html: htmlBody,
//     };
//     transporter.sendMail(mailOptions, function (error, info) {
//       if (error) {
//         console.log(error);
//         res.status(500).send({ error: 'An error occurred while sending the email' });
//       } else {
//         // Insert recipient into MongoDB
//         collection.insertOne({ email: Recipient, opened: false, lastseen: null }, (err, result) => {
//           if (err) {
//             console.error('Error inserting recipient into MongoDB', err);
//             res.status(500).send({ error: 'An error occurred while inserting the recipient into the database' });
//           } else {
//             console.log('Recipient inserted into MongoDB');
//             res.send({ status: 'success' });
//           }
//         });
//       }
//     });
//   });

//   app.get('/recipients/:recipient', (req, res) => {
//     var Recipient = req.params['recipient'];
//     var date_ob = new Date().toISOString().slice(0, 19).replace('T', ' ');

//     // Update recipient in MongoDB
//     collection.updateOne({ email: Recipient }, { $set: { opened: true, lastseen: date_ob } }, (err, result) => {
//       if (err) {
//         console.error('Error updating recipient in MongoDB', err);
//         res.status(500).send({ error: 'An error occurred while updating the recipient in the database' });
//       } else {
//         console.log('Recipient updated in MongoDB');
//         res.send({ status: 'success', time: date_ob });
//       }
//     });
//   });

//   // Start the server
//   const PORT = 3001;
//   app.listen(PORT, (err) => {
//     if (err) {
//       console.error('Error starting the server:', err);
//     } else {
//       console.log(`Server is running on port ${PORT}`);
//     }
//   });


// });



const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('mongodb+srv://aditya2test:N0DX5uUKuYZmGuF4@cluster0.mgkp1lm.mongodb.net/', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;

db.on('error', console.error.bind(console, 'MongoDB connection error:'));
db.once('open', () => {
  console.log('Connected to MongoDB');
});

// Define a schema for the recipients collection
const recipientSchema = new mongoose.Schema({
  email: String,
  opened: Boolean,
  lastseen: Date
});

// Create a model based on the schema
const Recipient = mongoose.model('Recipient', recipientSchema);

// Nodemailer transporter setup
const transporter = nodemailer.createTransport({
  /* Your nodemailer transporter configuration here */
  service: "gmail",
  auth: {
    user: "pradhantestay@gmail.com",
    pass: "tathkjmyrfgwwxdf",
  },
});

app.post('/sendmail', async (req, res) => {
  try {
    const { Sender, Recipient, MessageBody, Subject } = req.body;

    const htmlBody = `<p>${MessageBody}</p><img src="${Server}/recipients/${Recipient}" style="display:none">`;

    const mailOptions = {
      from: Sender,
      to: Recipient,
      subject: Subject,
      html: htmlBody,
    };

    await transporter.sendMail(mailOptions);

    // Insert recipient into MongoDB using Mongoose
    await Recipient.create({ email: Recipient, opened: false, lastseen: null });

    console.log('Email sent and recipient inserted into MongoDB');
    res.send({ status: 'success' });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({ error: 'An error occurred while sending the email or inserting the recipient' });
  }
});

app.get('/recipients/:recipient', async (req, res) => {
  try {
    const recipientEmail = req.params.recipient;
    const date_ob = new Date().toISOString().slice(0, 19).replace('T', ' ');

    // Update recipient in MongoDB using Mongoose
    const result = await Recipient.updateOne({ email: recipientEmail }, { $set: { opened: true, lastseen: date_ob } });

    console.log('Recipient updated in MongoDB');
    res.send({ status: 'success', time: date_ob });
  } catch (error) {
    console.error('An error occurred:', error);
    res.status(500).send({ error: 'An error occurred while updating the recipient in the database' });
  }
});

// Start the server
const PORT = 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
