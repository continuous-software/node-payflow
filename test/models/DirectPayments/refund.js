"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var auth = payflow_api.getModel("authorization");
var cap = payflow_api.getModel("capture");
var refund = payflow_api.getModel("refund");

describe('RefundModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            refund.getParameters().should.be.a('object');

            //Check default parameters
            refund.getDefaultParameters().should.be.a('object');
            refund.getDefaultParameters().should.have.property('TRXTYPE');
            refund.getDefaultParameters().TRXTYPE.should.equal("C");
            refund.getDefaultParameters().should.have.property('TENDER');
            refund.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            refund.getValidationParameters().should.be.a('array');
            refund.getValidationParameters().should.have.length(3);

        });
    });
    describe('exchangeData', function () {
        it('should populate the object parameters variable', function () {

            var data = {
                TRXTYPE: "A",
                TENDER: "P",
                AMT: "100",
                EXPDATE: "1118"
            };


            refund.exchangeData(data);
            var params = refund.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            //TRXTYPE and TENDER should be overridden by the model defaults
            params.TRXTYPE.should.equal("C");
            params.TENDER.should.equal("C");
            params.AMT.should.equal("100");
            params.EXPDATE.should.equal("1118");


        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                ORIGID: "asdfasdfasdf"

            };
            refund.exchangeData(data);
            expect(refund.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {

            };
            refund.exchangeData(data);
            expect(refund.validateData).to.throw('ORIGID: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteCapture', function () {
    it('Should Return Result 0', function (done) {
        var data = {
            ACCT: "4716792779006088",
            EXPDATE: "1118",
            CVV2: "111",
            AMT: "100"
        };

        try {
            auth.exchangeData(data);
            auth.validateData();

            payflow_api.execute(auth.getParameters(), function (err, res) {
                if (err) { done(err); }

                cap.exchangeData({
                    ORIGID: res.response.decoded.PNREF,
                    AMT: auth.getParameters().AMT
                });
                payflow_api.execute(cap.getParameters(), function (err, res) {
                    if (err) { done(err); }
                    refund.exchangeData({
                        ORIGID: res.response.decoded.PNREF,
                    });
                    payflow_api.execute(refund.getParameters(), function (err, res) {
                        if (err) { done(err); }
                        res.response.decoded.RESULT.should.equal("0");
                        done();
                    });
                });
            });

        }
        catch (err)
        {
            console.log(err);
        }
    });
});
