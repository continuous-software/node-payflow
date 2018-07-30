[![Build Status](https://travis-ci.org/continuous-software/node-payflow.svg?branch=master)](https://travis-ci.org/continuous-software/node-payflow) [![Greenkeeper badge](https://badges.greenkeeper.io/continuous-software/node-payflow.svg)](https://greenkeeper.io/)

![node-payflow](http://i.imgbox.com/0KUdCy3t.png)

## Installation ##

    $ npm install -s payflow

## Usage

```javascript
var PayFlow = require('payflow');
var client = new PayFlow.gateway({
    PARTNER: '<PLACEHOLDER',
    VENDOR: '<PLACEHOLDER',
    USER: '<PLACEHOLDER',
    PWD: '<PLACEHOLDER'
});
```

## Gateway API

This SDK is natively compatible with [42-cent](https://github.com/continuous-software/42-cent).  
It implements the [BaseGateway](https://github.com/continuous-software/42-cent-base) API.
