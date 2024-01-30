//index.js
import pkg from 'node-cron';
const { schedule } = pkg;
import express from "express";
import { createTransport } from "nodemailer";
import axios from 'axios';

const app = express();

//create mail transporter
let transporter = createTransport({
    service: "gmail",
    auth: {
        user:"phambason639@gmail.com",
        pass:"ngys lskc bicu qvce"
    }
});

//global variable to store the latest minimum price
let latestMinPrice = 0;
let previousMinPrice = 0;

let fetchData = async () => {
	const allTickets = (await axios({
        method: 'post',
        url: 'https://www.fanpass.co.uk/api/tickets/finds',
        headers: {
            'authority': 'www.fanpass.co.uk',
            'accept': 'application/json',
            'accept-language': 'vi-VN,vi;q=0.9,en-GB;q=0.8,en;q=0.7,fr-FR;q=0.6,fr;q=0.5,en-US;q=0.4',
            'authorization': 'Basic Og==',
            'cookie': 'PHPSESSID=sl6pk3b8vouhi9oj2gcpo6lflo; _currency=GBP; _gcl_au=1.1.615867423.1706358637; __stripe_mid=78ae20f2-2cf2-4bc9-ac4f-e5380a1c9b48bda2d9; cookieconsent_status=dismiss; _locale=en_GB; _gid=GA1.3.6650640.1706570737; waiting_room[5644]=1; _ga_FT2WZXYXHD=GS1.1.1706570737.5.1.1706570763.34.0.0; _ga=GA1.1.1006852148.1706358637; __stripe_sid=de413436-f5da-40bd-8f47-89fd45e696074afa76; PHPSESSID=sl6pk3b8vouhi9oj2gcpo6lflo; _currency=GBP; _locale=en_GB',
            'dnt': '1',
            'origin': 'https://www.fanpass.co.uk',
            'referer': 'https://www.fanpass.co.uk/tickets-manchester-united-west-ham-5644',
            'sec-ch-ua': '"Not A(Brand";v="99", "Google Chrome";v="121", "Chromium";v="121"',
            'sec-ch-ua-mobile': '?0',
            'sec-ch-ua-platform': '"macOS"',
            'sec-fetch-dest': 'empty',
            'sec-fetch-mode': 'cors',
            'sec-fetch-site': 'same-origin',
            'user-agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36'
        },
        data: {
            'event': '5644',
            'units': '4'
        }
    }))?.data?.result?.results;

    if (!allTickets) {
        throw new Error('No tickets found');
    }

    const filterTickets = allTickets
        .filter(ticket => ticket.units === 4 && ticket.status === 'onsale')
        .sort((a, b) => a.public_price - b.public_price)
        .map(ticket => ticket.public_price);

    if (!filterTickets.length) {
        throw new Error('No tickets found');
    }

    previousMinPrice = latestMinPrice;
    latestMinPrice = filterTickets[0];
}

let sendSuccessMail = async (isPriceChanged) => {
    let mailOptions = {
        from: "senderEmail@gmail.com",
        to: "nguyenanh4179@gmail.com",
        subject: isPriceChanged ? "PRICE CHANGE" : "Price remain the same",
        text: `latestMinPrice: ${latestMinPrice}, previousMinPrice: ${previousMinPrice}`
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            throw error;
        } else {
            console.log("Email sent successfully");
        }
    });
}

let sendFailedMail = async () => {
    let mailOptions = {
        from: "senderEmail@gmail.com",
        to: "nguyenanh4179@gmail.com",
        subject: "Check price",
        text: "Something went wrong"
    };

    transporter.sendMail(mailOptions, function(error, info) {
        if (error) {
            throw error;
        } else {
            console.log("Email sent successfully");
        }
    });
}

// Sending emails at periodic intervals - every 1 minute
schedule("*/15 * * * *", async function() {
    console.log("Running Cron Job");
    try {
        await fetchData();
        if (latestMinPrice < previousMinPrice) {
            await sendSuccessMail(true);
        }
        await sendSuccessMail(false);
    } catch (error) {
        console.log(error);
        await sendFailedMail();
    }
});

app.listen("2019");
console.log("Listening on PORT 2019");
