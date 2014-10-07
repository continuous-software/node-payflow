"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var nrc = payflow_api.getModel("nonreferencedcredit");

describe('NonReferencedCreditModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            nrc.getParameters().should.be.a('object');

            //Check default parameters
            nrc.getDefaultParameters().should.be.a('object');
            nrc.getDefaultParameters().should.have.property('TRXTYPE');
            nrc.getDefaultParameters().TRXTYPE.should.equal("C");
            nrc.getDefaultParameters().should.have.property('TENDER');
            nrc.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            nrc.getValidationParameters().should.be.a('array');
            nrc.getValidationParameters().should.have.length(5);

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


            nrc.exchangeData(data);
            var params = nrc.getParameters();
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
                ACCT: "4716792779006088",
                EXPDATE: "1118",
                AMT: "100"
            };
            nrc.exchangeData(data);
            expect(nrc.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                ACCT: "4716792779006088",
                EXPDATE: "1118"
            };
            nrc.exchangeData(data);
            expect(nrc.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteNonReferencedCredit', function () {
    it('Should Return Result 0', function (done) {
        var data = {
            ACCT: "4716792779006088",
            EXPDATE: "1118",
            AMT: "100"
        };

        try {
            nrc.exchangeData(data);
            nrc.validateData();

            payflow_api.execute(nrc.getParameters(), function (err, res) {
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
