"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var createRecurringBillingProfile = payflow_api.getModel("createrecurringbillingprofile");
var cancelRecurringBillingProfile = payflow_api.getModel("cancelrecurringbillingprofile");

describe('cancelRecurringBillingProfileModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            cancelRecurringBillingProfile.getParameters().should.be.a('object');

            //Check default parameters
            cancelRecurringBillingProfile.getDefaultParameters().should.be.a('object');
            cancelRecurringBillingProfile.getDefaultParameters().should.have.property('TRXTYPE');
            cancelRecurringBillingProfile.getDefaultParameters().TRXTYPE.should.equal("R");
            cancelRecurringBillingProfile.getDefaultParameters().should.have.property('ACTION');
            cancelRecurringBillingProfile.getDefaultParameters().ACTION.should.equal("C");

            //Check validation parameters
            cancelRecurringBillingProfile.getValidationParameters().should.be.a('array');
            cancelRecurringBillingProfile.getValidationParameters().should.have.length(1);

        });
    });
    describe('exchangeData', function () {
        it('should populate the object parameters variable', function () {

            var data = {
                TRXTYPE: "R",
                ACTION: "A"

            };

            cancelRecurringBillingProfile.exchangeData(data);
            var params = cancelRecurringBillingProfile.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('ACTION');

            //TRXTYPE AND ACTION should be overridden by the model defaults
            params.TRXTYPE.should.equal("R");
            params.ACTION.should.equal("C");
        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {
                ORIGPROFILEID: "TESTTEST1"
            };
            cancelRecurringBillingProfile.exchangeData(data);
            expect(cancelRecurringBillingProfile.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {

            };
            cancelRecurringBillingProfile.exchangeData(data);
            expect(cancelRecurringBillingProfile.validateData).to.throw('ORIGPROFILEID: Required parameter for this transaction is undefined');
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
                    ORIGPROFILEID: res.response.decoded.PROFILEID
                };
                cancelRecurringBillingProfile.exchangeData(data);
                cancelRecurringBillingProfile.validateData();
                payflow_api.execute(cancelRecurringBillingProfile.getParameters(), function (err, res) {
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
