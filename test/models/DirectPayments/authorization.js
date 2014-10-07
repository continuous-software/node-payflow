"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var auth = payflow_api.getModel("authorization");

describe('AuthorizationModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            auth.getParameters().should.be.a('object');

            //Check default parameters
            auth.getDefaultParameters().should.be.a('object');
            auth.getDefaultParameters().should.have.property('TRXTYPE');
            auth.getDefaultParameters().TRXTYPE.should.equal("A");
            auth.getDefaultParameters().should.have.property('TENDER');
            auth.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            auth.getValidationParameters().should.be.a('array');
            auth.getValidationParameters().should.have.length(5);

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


            auth.exchangeData(data);
            var params = auth.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            //TRXTYPE and TENDER should be overridden by the model defaults
            params.TRXTYPE.should.equal("A");
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
                CVV2: "111",
                AMT: "100"
            };
            auth.exchangeData(data);
            expect(auth.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                ACCT: "4716792779006088",
                EXPDATE: "1118",
                CVV2: "111"
            };
            auth.exchangeData(data);
            expect(auth.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteAuthorization', function () {
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
