"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var ref = payflow_api.getModel("reference");
var auth = payflow_api.getModel("authorization");

describe('ReferenceModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            ref.getParameters().should.be.a('object');

            //Check default parameters
            ref.getDefaultParameters().should.be.a('object');

            //Check validation parameters
            ref.getValidationParameters().should.be.a('array');
            ref.getValidationParameters().should.have.length(4);

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


            ref.exchangeData(data);
            var params = ref.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            params.TRXTYPE.should.equal("A");
            params.TENDER.should.equal("P");
            params.AMT.should.equal("100");
            params.EXPDATE.should.equal("1118");


        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                TRXTYPE: "A",
                TENDER: "C",
                ORIGID: "asdfasdfasdf",
                AMT: "100"
            };
            ref.exchangeData(data);
            expect(ref.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                TRXTYPE: "A",
                TENDER: "C",
                ORIGID: "asdfasdfasdf"
            };
            ref.exchangeData(data);
            expect(ref.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteReferenceTransaction', function () {
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

                ref.exchangeData({
                    ORIGID: res.response.decoded.PNREF,
                    AMT: auth.getParameters().AMT,
                    TRXTYPE: "S",
                    TENDER: "C"
                });
                ref.validateData();
                payflow_api.execute(ref.getParameters(), function (err, res) {
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
