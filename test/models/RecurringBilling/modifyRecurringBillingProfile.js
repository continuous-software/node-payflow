"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var createRecurringBillingProfile = payflow_api.getModel("createrecurringbillingprofile");
var modifyRecurringBillingProfile = payflow_api.getModel("modifyrecurringbillingprofile");

describe('modifyRecurringBillingProfileModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            modifyRecurringBillingProfile.getParameters().should.be.a('object');

            //Check default parameters
            modifyRecurringBillingProfile.getDefaultParameters().should.be.a('object');
            modifyRecurringBillingProfile.getDefaultParameters().should.have.property('TRXTYPE');
            modifyRecurringBillingProfile.getDefaultParameters().TRXTYPE.should.equal("R");
            modifyRecurringBillingProfile.getDefaultParameters().should.have.property('ACTION');
            modifyRecurringBillingProfile.getDefaultParameters().ACTION.should.equal("M");

            //Check validation parameters
            modifyRecurringBillingProfile.getValidationParameters().should.be.a('array');
            modifyRecurringBillingProfile.getValidationParameters().should.have.length(2);

        });
    });
    describe('exchangeData', function () {
        it('should populate the object parameters variable', function () {

            var data = {
                TRXTYPE: "R",
                ACTION: "A"

            };

            modifyRecurringBillingProfile.exchangeData(data);
            var params = modifyRecurringBillingProfile.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('ACTION');

            //TRXTYPE AND ACTION should be overridden by the model defaults
            params.TRXTYPE.should.equal("R");
            params.ACTION.should.equal("M");
        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                ORIGPROFILEID: "TESTTEST1",
                START: "02272020"
            };
            modifyRecurringBillingProfile.exchangeData(data);
            expect(modifyRecurringBillingProfile.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {

            };
            modifyRecurringBillingProfile.exchangeData(data);
            expect(modifyRecurringBillingProfile.validateData).to.throw('ORIGPROFILEID: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteCreateRecurringProfile', function () {
    it('Should Return Result 0', function (done) {
        var data = {
            ACCT: "4716792779006088",
            EXPDATE: "1118",
            CVV2: "111",
            TENDER: "C",
            AMT: "100",
            START: "02272020",
            TERM: "0",
            PAYPERIOD: "MONT",
            PROFILENAME: "TESTTEST1"
        };

        try {
            createRecurringBillingProfile.exchangeData(data);
            createRecurringBillingProfile.validateData();

            payflow_api.execute(createRecurringBillingProfile.getParameters(), function (err, res) {
                if (err) { done(err); }
                var data = {
                    ORIGPROFILEID: res.response.decoded.PROFILEID,
                    START: "02272020"
                };
                modifyRecurringBillingProfile.exchangeData(data);
                modifyRecurringBillingProfile.validateData();
                payflow_api.execute(modifyRecurringBillingProfile.getParameters(), function (err, res) {
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
