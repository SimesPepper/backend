require('dotenv').config();
const express = require('express');
const cors = require('cors');
const uuid = require('uuid/v4');
const helmet = require('helmet')
const stripe = require('stripe')(process.env.API_KEY, { apiVersion: '2020-08-27'});

const server = express();

server.use(helmet())
server.use(express.json());
server.use(cors());
server.use( (req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
  });

server.get('/config', (req, res) => {
    res.send({
        publishableKey: process.env.API_KEY
    })
})

server.post('/create-payment-intent', async (req, res) => {

    const { paymentMethodType, currency } = req.body

    const params = {
        payment_method_types: [paymentMethodType],
        amount: 100,
        currency,
    }

    try{
        const paymentIntent = await stripe.paymentIntents.create( params )
        console.log(paymentIntent)

        res
            .json({
                clientSecret: paymentIntent.client_secret
            })

    }catch(error){
        console.log(error.message)
        return res.send({
            message: error.message
    
        })
    }
})


server.post('/checkout', async (req, res) => {

    console.log(req.body.amount)

    const { amount, token, description, address, email, name } = req.body;

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

        res.status(200).json({ receipt: charge.receipt_url })

    }catch (error) {
        res.status(201).json({error})
    }

    
})

const port = process.env.PORT || 3003;

server.listen(port, _ => {
    console.log(`running on ${port}`)
})  