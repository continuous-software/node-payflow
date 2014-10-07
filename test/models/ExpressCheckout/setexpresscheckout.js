"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var setec = payflow_api.getModel("setexpresscheckout");

describe('SetExpressCheckoutModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            setec.getParameters().should.be.a('object');

            //Check default parameters
            setec.getDefaultParameters().should.be.a('object');
            setec.getDefaultParameters().should.have.property('ACTION');
            setec.getDefaultParameters().ACTION.should.equal("S");
            setec.getDefaultParameters().should.have.property('TENDER');
            setec.getDefaultParameters().TENDER.should.equal("P");

            //Check validation parameters
            setec.getValidationParameters().should.be.a('array');
            setec.getValidationParameters().should.have.length(6);

        });
    });
    describe('exchangeData', function () {
        it('should populate the object parameters variable', function () {

            var data = {
                TRXTYPE: "A",
                ACTION: "G",
                TENDER: "C",
                AMT: "100"
            };


            setec.exchangeData(data);
            var params = setec.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('ACTION');
            //ACTION and TENDER should be overridden by the model defaults
            params.ACTION.should.equal("S");
            params.TENDER.should.equal("P");
            params.AMT.should.equal("100");



        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                TRXTYPE: "S",
                RETURNURL: "http://localhost",
                CANCELURL: "http://localhost",
                AMT: "100.00"
            };
            setec.exchangeData(data);
            expect(setec.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                TRXTYPE: "S",
                RETURNURL: "http://localhost",
                CANCELURL: "http://localhost"

            };
            setec.exchangeData(data);
            expect(setec.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteSetExpressCheckout', function () {
    it('Should Return Result 0', function (done) {
        var data = {
            TRXTYPE: "S",
            RETURNURL: "http://localhost",
            CANCELURL: "http://localhost",
            AMT: "100.00"
        };

        try {
            setec.exchangeData(data);
            setec.validateData();

            payflow_api.execute(setec.getParameters(), function (err, res) {
                if (err) { done(err); }
                res.response.decoded.RESULT.should.equal("0");
                done();
            });

        }
        catch (err)
        {
            console.log(err);
        }
    });
});
