const express = require('express');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// MongoDB Connection
mongoose.connect('your mongodb url', { useNewUrlParser: true, useUnifiedTopology: true });
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
    user: "yourEmail",
    pass: "yourPassword",
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
