const express = require('express');
const axios = require('axios');
const bodyParser = require('body-parser');
const crypto = require('crypto');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors())

const PAYFORT_API_URL = 'https://sbcheckout.payfort.com/FortAPI/paymentPage'; // Use the sandbox URL for testing
const MERCHANT_IDENTIFIER = 'IyfLFgcQ';
const ACCESS_CODE = 'dd2jtvZ8OVHiTamw5eti';
const SHA_REQUEST_PHRASE = '95HpG/S9swwSir8oLUvZRI[&';
const SHA_RESPONSE_PHRASE = '91Zdb8HNI90ClhIcEEdrL9_+';

// Generate Signature (SHA256) for request
const generateSignature = (params) => {
  const sortedKeys = Object.keys(params).sort(); 
  let signatureString = SHA_REQUEST_PHRASE; 
  sortedKeys.forEach(key => {
      signatureString += key + "=" + params[key]; 
  });

  signatureString += SHA_REQUEST_PHRASE; 

  //console.log("Signature String:", signatureString); 

  return crypto.createHash("sha256").update(signatureString).digest("hex");
};

// Create Order API
app.post('/api/create-order', async (req, res) => {
  const orderData = req.body; 
  const orderReference = `ORDER-${Date.now()}`;

  const requestParams = {
    merchant_identifier: MERCHANT_IDENTIFIER,
    access_code: ACCESS_CODE,
    merchant_reference: orderReference,
    command: "PURCHASE", // Change to "AUTHORIZATION" if needed
    customer_email: 'abc@gmail.com',
    amount: orderData.amount*100,
    currency: 'AED',
    language: 'en',
    return_url: 'http://localhost:3000/payment-success', // Success redirect URL
    //payment_link_template:"DeepakInvoiceTest",  // Change this to your desired template
  };

  // Generate the signature
  const signature = generateSignature(requestParams);
  requestParams.signature = signature;

  res.json({
    status: "success",
    payment_url:PAYFORT_API_URL,
    params: requestParams
});

  
});

// Verify Payment API
app.post('/api/verify-payment', (req, res) => {
  const paymentData = req.body; 

  const signature = generateSignature(paymentData, SHA_RESPONSE_PHRASE);

  if (paymentData.signature === signature) {
    if (paymentData.payment_status === '000') {
      res.json({ status: 'success', message: 'Payment successful' });
    } else {
      res.json({ status: 'error', message: 'Payment failed' });
    }
  } else {
    res.json({ status: 'error', message: 'Invalid signature' });
  }
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});