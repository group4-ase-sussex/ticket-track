//index.js
const cron = require("node-cron");
const express = require("express");
let nodemailer = require("nodemailer");

app = express();

//create mail transporter
let transporter = nodemailer.createTransport({
	service: "gmail",
	auth: {
		user:"sampleEmail@gmail.com",
		pass:"myPassword"
	}
});

//sending emails at periodic intervals
cron.schedule("* * * * Wednesday", function(){
	console.log("Running Cron Job");
	let mailOptions = {
		from: "senderEmail@gmail.com",
		to: "recipientEmail@gmail.com",
		subject: `CRON-JOB 001`,
		text: `Hi there, this is a test email form our cron job.`
	};

	transporter.sendMail(mailOptions, function(error, info){
		if(error){
			throw error;
		} else {
			console.log("Email sent successfully");
		}
	});
});

app.listen("2019");
