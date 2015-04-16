var conf = require('../config.js');
var PayFlowGateway = require('../index.js').gateway;
var assert = require('assert');
var GatewayError = require('42-cent-base').GatewayError;
var model = require('42-cent-model');
var CreditCard = require('42-cent-model').CreditCard;
var Prospect = require('42-cent-model').Prospect;

describe('Payflow service', function () {

  var service;

  function randomAmount () {
    return Math.ceil(Math.random() * 100);
  }

  beforeEach(function () {
    conf.testMode = true;
    service = PayFlowGateway(conf);
  });

  describe('authorization and capture -> submit credit card transaction', function () {

    it('should submit transaction request', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '17',
        expirationMonth: '01',
        cvv: '000'
      };
      var prospect = {
        customerFirstName: 'Ellen',
        customerLastName: 'Johson',
        billingAddress: '14 Main Street',
        billingCity: 'Pecan Springs',
        billingZip: '44628',
        billingState: 'TX',
        shippingFirstName: 'China',
        shippingLastName: 'Bayles',
        shippingAddress: '12 Main Street',
        shippingCity: 'Pecan Springs',
        shippingZip: '44628'
      };

      service.submitTransaction({amount: randomAmount()}, cc, prospect).then(function (result) {
        assert.equal(result.authCode, result._original.AUTHCODE, 'it should have the authorization code');
        assert.equal(result.transactionId, result._original.PNREF, 'it should have the transaction id');
        done();
      });
    });

    it('should reject the promise when the web service returns an error code', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '99',
        expirationMonth: '01',
        cvv: '000'
      };

      service.submitTransaction({amount: randomAmount()}, cc).then(function (result) {
        throw new Error('it should not go here');
      }, function (err) {
        assert(err instanceof GatewayError);
        assert.equal(err.message, 'Invalid expiration date: 0199');
        assert(err._original, 'original should be defined');
        done();
      });
    });
  });

  describe('authorization only', function () {

    it('should authorize the transaction', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '17',
        expirationMonth: '01',
        cvv: '000'
      };
      var prospect = {
        customerFirstName: 'Ellen',
        customerLastName: 'Johson',
        billingAddress: '14 Main Street',
        billingCity: 'Pecan Springs',
        billingZip: '44628',
        billingState: 'TX',
        shippingFirstName: 'China',
        shippingLastName: 'Bayles',
        shippingAddress: '12 Main Street',
        shippingCity: 'Pecan Springs',
        shippingZip: '44628'
      };

      service.authorizeTransaction({amount: randomAmount()}, cc, prospect).then(function (result) {
        assert.equal(result.authCode, result._original.AUTHCODE, 'it should have the authorization code');
        assert.equal(result.transactionId, result._original.PNREF, 'it should have the transaction id');
        done();
      });
    });

    it('should reject the promise when the web service returns an error code', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '99',
        expirationMonth: '01',
        cvv: '000'
      };

      service.authorizeTransaction({amount: randomAmount()}, cc).then(function (result) {
        throw new Error('it should not go here');
      }, function (err) {
        assert(err instanceof GatewayError);
        assert.equal(err.message, 'Invalid expiration date: 0199');
        assert(err._original, 'original should be defined');
        done();
      });
    });
  });

  xdescribe('get batch list', function () {

    xit('should get some stats', function (done) {
      service.getSettledBatchList(new Date(Date.now() - 24 * 3600 * 1000 * 30)).then(function (result) {
        console.log(result);
        done();
      }, function (err) {
        console.log(err);
      })
    });

    xit('should reject the promise when the webservice returns an error', function (done) {
      service.getSettledBatchList(new Date(), new Date(Date.now() - 24 * 3600 * 100)).then(function (result) {
        throw new Error('should not get here');
      }, function (error) {
        assert(error instanceof GatewayError);
        assert.equal(error.message, 'Invalid/missing report parameters provided: start_date', 'it should have the appropriate message');
        done();
      });
    });
  });

  describe('refund transaction', function () {

    it('should perform a refund', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '18',
        expirationMonth: '01',
        cvv: '000'
      };

      service.submitTransaction({amount: randomAmount()}, cc).then(function (result) {
        var transId = result.transactionId;
        return service.refundTransaction(transId);
      })
        .then(function (res) {
          assert(res._original, '_original should be defined');
          done();
        });
    });

    it('should support partial refund', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '18',
        expirationMonth: '01',
        cvv: '000'
      };

      var amount = randomAmount();
      service.submitTransaction({amount: amount}, cc).then(function (result) {
        var transId = result.transactionId;
        return service.refundTransaction(transId, {amount: amount});
      })
        .then(function (res) {
          assert(res._original, '_original should be defined');
          done();
        });
    });

    it('should reject the promise if gateway service return error', function (done) {
      service.refundTransaction('666')
        .then(function (result) {
          throw new Error('should not get here');
        }, function (err) {
          assert(err._original, '_original should be defined');
          assert(err.message, 'Invalid account number');
          done();
        });
    });
  });

  describe('void transaction', function () {

    it('should void a non settled transaction', function (done) {
      var cc = {
        creditCardNumber: '4111111111111111',
        expirationYear: '18',
        expirationMonth: '01',
        cvv: '000'
      };

      service.submitTransaction({amount: randomAmount()}, cc).then(function (result) {
        var transId = result.transactionId;
        return service.voidTransaction(transId);
      })
        .then(function (res) {
          assert(res._original, '_original should be defined');
          done();
        });
    });

    it('should reject the promise if gateway service return error', function (done) {
      service.voidTransaction('666')
        .then(function (result) {
          throw new Error('should not get here');
        }, function (err) {
          assert(err._original, '_original should be defined');
          assert(err.message, 'Invalid account number');
          done();
        });
    });

  });

  describe('create customer profile', function () {

    var random = Math.floor(Math.random() * 1000);

    it('should create a customer profile', function (done) {

      var cc = new CreditCard()
        .withCreditCardNumber('4111111111111111')
        .withExpirationMonth('12')
        .withExpirationYear('2014')
        .withCvv('123');

      var billing = {
        customerFirstName: 'bob',
        customerLastName: 'leponge',
        email: 'bob@eponge.com'
      };

      service.createCustomerProfile(cc, billing)
        .then(function (result) {
          assert(result.profileId, ' profileId Should be defined');
          assert(result._original, '_original should be defined');
          done();
        })
        .catch(function (err) {
          console.log(err);

        });
    });

    it('should reject the promise when the gateway return an error', function (done) {
      var cc = new CreditCard()
        .withCreditCardNumber('123')
        .withExpirationMonth('12')
        .withExpirationYear('2014')
        .withCvv('123');

      var billing = {
        customerFirstName: 'bob',
        customerLastName: 'leponge',
        email: 'bob@eponge.com'
      };

      service.createCustomerProfile(cc, billing)
        .then(function (result) {
          throw new Error('it should not get here');
        }, function (err) {
          assert(err._original, '_original should be defined');
          assert.equal(err.message, 'Invalid account number');
          done();
        });
    });
  });

  describe('charge customer profile', function () {


    it('should charge a existing customer', function (done) {

      var random = Math.floor(Math.random() * 1000);


      var cc = new CreditCard()
        .withCreditCardNumber('4111111111111111')
        .withExpirationMonth('12')
        .withExpirationYear('2014')
        .withCvv('123');

      var billing = {
        customerFirstName: 'bob',
        customerLastName: 'leponge',
        email: 'bob@eponge.com'
      };

      service.createCustomerProfile(cc, billing)
        .then(function (result) {
          var randomAmount = Math.floor(Math.random() * 300);
          assert(result.profileId, ' profileId Should be defined');
          assert(result._original, '_original should be defined');

          return service.chargeCustomer({amount: randomAmount}, {profileId: result.profileId});
        })
        .then(function (res) {
          assert.equal(res.transactionId, res._original.PNREF);
          assert(res._original, '_original should be defined');
          done();
        })
        .catch(function (err) {
          console.log(err);
        });
    });

    it('should reject the promise when the gateway return an error', function (done) {
      return service.chargeCustomer({amount: 234}, {profileId: '1234'})
        .then(function () {
          throw new Error('should not get here');
        }, function (err) {
          assert(err._original, '_original should be defined');
          assert.equal(err.message, 'Invalid account number');
          done();
        }
      );
    });
  });


  //need to buy the service to be able to test it ...
  xdescribe('create a subscription', function () {

    it('should create a subscription', function (done) {
      var cc = new model.CreditCard()
        .withCreditCardNumber('4111111111111111')
        .withExpirationMonth('01')
        .withExpirationYear('17')
        .withCvv('000');
      var prospect = new model.Prospect({
        customerFirstName: 'Ellen',
        customerLastName: 'Johson',
        billingAddress: '14 Main Street',
        billingCity: 'Pecan Springs',
        billingZip: '44628',
        billingState: 'TX',
        shippingFirstName: 'China',
        shippingLastName: 'Bayles',
        shippingAddress: '12 Main Street',
        shippingCity: 'Pecan Springs',
        shippingZip: '44628'
      });
      var subscriptionPlan = new model.SubscriptionPlan()
        .withAmount(Math.floor(Math.random() * 100))
        .withIterationCount(12)
        .withPeriodLength(1)
        .withPeriodUnit('months')
        .withStartingDate(new Date(Date.now() + 24 * 7 * 3600 * 1000));

      service.createSubscription(cc, prospect, subscriptionPlan)
        .then(function (result) {
          assert(result.subscriptionId, 'subscripitionId should be defined');
          assert(result._original, '_original should be defined');
          done();
        });
    });

    xit('should reject the promise if the gateway returns an error', function (done) {
      done();
    });

  });
});
