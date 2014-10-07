"use strict";

var payflow_api = require('../');

payflow_api.configure({
    host: "pilot-payflowpro.paypal.com",
    port: "443",
    credentials: {
        PARTNER: "PayPal",
        VENDOR: "andrewawesome",
        USER: "andrewawesome",
        PWD: "andrewawesome1"
    },
    timeout: 30000
});