"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var auth = payflow_api.getModel("authorization");
var voidtrx = payflow_api.getModel("void");

describe('VoidModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            voidtrx.getParameters().should.be.a('object');

            //Check default parameters
            voidtrx.getDefaultParameters().should.be.a('object');
            voidtrx.getDefaultParameters().should.have.property('TRXTYPE');
            voidtrx.getDefaultParameters().TRXTYPE.should.equal("V");
            voidtrx.getDefaultParameters().should.have.property('TENDER');
            voidtrx.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            voidtrx.getValidationParameters().should.be.a('array');
            voidtrx.getValidationParameters().should.have.length(3);

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


            voidtrx.exchangeData(data);
            var params = voidtrx.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            //TRXTYPE and TENDER should be overridden by the model defaults
            params.TRXTYPE.should.equal("V");
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
            voidtrx.exchangeData(data);
            expect(voidtrx.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {

            };
            voidtrx.exchangeData(data);
            expect(voidtrx.validateData).to.throw('ORIGID: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteVoid', function () {
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

                voidtrx.exchangeData({
                    ORIGID: res.response.decoded.PNREF
                });
                payflow_api.execute(voidtrx.getParameters(), function (err, res) {
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
