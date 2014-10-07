"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var cap = payflow_api.getModel("capture");
var auth = payflow_api.getModel("authorization");

describe('CaptureModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            cap.getParameters().should.be.a('object');

            //Check default parameters
            cap.getDefaultParameters().should.be.a('object');
            cap.getDefaultParameters().should.have.property('TRXTYPE');
            cap.getDefaultParameters().TRXTYPE.should.equal("D");
            cap.getDefaultParameters().should.have.property('TENDER');
            cap.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            cap.getValidationParameters().should.be.a('array');
            cap.getValidationParameters().should.have.length(4);

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


            cap.exchangeData(data);
            var params = cap.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            //TRXTYPE and TENDER should be overridden by the model defaults
            params.TRXTYPE.should.equal("D");
            params.TENDER.should.equal("C");
            params.AMT.should.equal("100");
            params.EXPDATE.should.equal("1118");


        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                ORIGID: "asdfasdfasdf",
                AMT: "100"
            };
            cap.exchangeData(data);
            expect(cap.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                ORIGID: "asdfasdfasdf"
            };
            cap.exchangeData(data);
            expect(cap.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
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
                    res.response.decoded.RESULT.should.equal("0");
                    done();
                });
            });

        }
        catch (err)
        {
            console.log(err);
        }
    });
});
