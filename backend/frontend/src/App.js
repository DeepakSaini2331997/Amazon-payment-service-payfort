import React, { useState } from 'react';
import axios from 'axios';

const PaymentPage = () => {
    const [amount, setAmount] = useState('');
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);

    const API_URL = 'http://localhost:5000/api';

    const handlePayment = async () => {
        setLoading(true);

        try {
            const response = await axios.post(`${API_URL}/create-order`, { amount, customerEmail: email });
            setLoading(false);

            if (response.data.status === "success" && response.data.payment_url && response.data.params) {
                console.log("Received payment data:", response.data); 
                const form = document.createElement('form');
                form.method = 'POST';
                form.action = response.data.payment_url; // PayFort API endpoint

                // Add hidden inputs for each required parameter
                Object.entries(response.data.params).forEach(([key, value]) => {
                    const input = document.createElement('input');
                    input.type = 'hidden';
                    input.name = key;
                    input.value = value;
                    form.appendChild(input);
                });

                document.body.appendChild(form);
                form.submit(); 
            } else {
                console.error("Invalid response from server:", response.data);
                alert("Error processing payment!");
            }
        } catch (error) {
            setLoading(false);
            console.error("Payment error:", error);
            alert("Payment failed. Please try again.");
        }
    };
    return (
        <div>
            <h2>Make a Payment</h2>
            <input 
                type="email" 
                placeholder="Enter Email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
            />
            <input 
                type="number" 
                placeholder="Enter Amount" 
                value={amount} 
                onChange={(e) => setAmount(e.target.value)} 
            />
            <button onClick={handlePayment} disabled={loading}>
                {loading ? "Processing..." : "Pay Now"}
            </button>
        </div>
    );
};

export default PaymentPage;
