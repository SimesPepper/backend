require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uuid = require('uuid/v4');
const stripe = require('stripe')(process.env.API_KEY);

const server = express();

server.use(express.json());
server.use(cors());

const charge = (token, amount, description) => {
    return stripe.charges.create({
        amount: amount *100,
        currency: 'USD',
        source: token.id,
        description: description
    })
}

server.get('/', (req, res) => {
    res.send('got it')
})
server.post('/checkout', async (req, res) => {

    const { amount, token, description, address, email, name } = req.body;
    // console.log(token.token.card)
    try{

        const customer = await stripe.customers.create({
            email: token.email,
            source: token.id
        })
        const charge = await stripe.charges.create({
            amount: amount * 100,
            currency: "usd",
            source: token.token.id,
            receipt_email: email, // get email
            description: `Purchased `,
            shipping: {
                name: name,
                address: {
                    line1: address.line1,
                    line2: address.line2,
                    city: address.city,
                    country: 'USA',
                    postal_code: token.token.card.address_zip
                }

            }
            
        });
        // charge(token, amount)

        console.log({charge})
        // console.log(req.body)
        status = 'success'
        res.json({ status })

    }catch (error) {
        console.error(error)
        status = 'failure'
    }

    
})

const port = process.env.PORT || 3003;

server.listen(port, _ => {
    console.log(`running on ${port}`)
})  