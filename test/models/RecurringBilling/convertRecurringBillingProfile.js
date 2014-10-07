"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var convertRecurringBillingProfile = payflow_api.getModel("convertrecurringbillingprofile");
var ecconvertRecurringBillingProfile = payflow_api.getModel("ecconvertrecurringbillingprofile");
var auth = payflow_api.getModel("authorization");

describe('convertRecurringBillingProfile Model', function () {
    describe('DCC Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            convertRecurringBillingProfile.getParameters().should.be.a('object');

            //Check default parameters
            convertRecurringBillingProfile.getDefaultParameters().should.be.a('object');
            convertRecurringBillingProfile.getDefaultParameters().should.have.property('TRXTYPE');
            convertRecurringBillingProfile.getDefaultParameters().TRXTYPE.should.equal("R");
            convertRecurringBillingProfile.getDefaultParameters().should.have.property('ACTION');
            convertRecurringBillingProfile.getDefaultParameters().ACTION.should.equal("A");

            //Check validation parameters
            convertRecurringBillingProfile.getValidationParameters().should.be.a('array');
            convertRecurringBillingProfile.getValidationParameters().should.have.length(8);

        });
    });
    describe('EC Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            ecconvertRecurringBillingProfile.getParameters().should.be.a('object');

            //Check default parameters
            ecconvertRecurringBillingProfile.getDefaultParameters().should.be.a('object');
            ecconvertRecurringBillingProfile.getDefaultParameters().should.have.property('TRXTYPE');
            ecconvertRecurringBillingProfile.getDefaultParameters().TRXTYPE.should.equal("R");
            ecconvertRecurringBillingProfile.getDefaultParameters().should.have.property('ACTION');
            ecconvertRecurringBillingProfile.getDefaultParameters().ACTION.should.equal("A");
            ecconvertRecurringBillingProfile.getDefaultParameters().should.have.property('TENDER');
            ecconvertRecurringBillingProfile.getDefaultParameters().TENDER.should.equal("P");

            //Check validation parameters
            ecconvertRecurringBillingProfile.getValidationParameters().should.be.a('array');
            ecconvertRecurringBillingProfile.getValidationParameters().should.have.length(8);

        });
    });
    describe('exchangeData', function () {
        it('should populate the object parameters variable', function () {

            var data = {
                TRXTYPE: "R",
                TENDER: "C",
                ACTION: "C",
                AMT: "100"

            };


            convertRecurringBillingProfile.exchangeData(data);
            var params = convertRecurringBillingProfile.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('ACTION');
            params.should.have.property('AMT');

            //TRXTYPE AND ACTION should be overridden by the model defaults
            params.TRXTYPE.should.equal("R");
            params.TENDER.should.equal("C");
            params.ACTION.should.equal("A");
            params.AMT.should.equal("100");



        });
    });

    describe('validateData', function () {
        it('Should not throw', function () {
            var data = {

                AMT: "100",
                TENDER: "C",
                START: "02272014",
                TERM: "0",
                PAYPERIOD: "MONT",
                PROFILENAME: "TEST",
                ORIGID: "BOJDIOD"
            };
            convertRecurringBillingProfile.exchangeData(data);
            expect(convertRecurringBillingProfile.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {

                AMT: "100",
                START: "02271983",
                TERM: "0",
                PAYPERIOD: "MONT",
                PROFILENAME: "TEST",
                TENDER: "C"
            };
            convertRecurringBillingProfile.exchangeData(data);
            expect(convertRecurringBillingProfile.validateData).to.throw('ORIGID: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteCreateRecurringProfile', function () {
    it('Should Return Result 0', function (done) {
        //Do an authorization and get the PNREF
        var data = {
            ACCT: "4716792779006088",
            EXPDATE: "1118",
            CVV2: "111",
            AMT: "100",
            TENDER: "C"
        };

        try {
            auth.exchangeData(data);
            auth.validateData();

            payflow_api.execute(auth.getParameters(), function (err, res) {
                if (err) { throw err; }

                //Execute convert transaction to rb profile
                //Create datestring for START
                var date = new Date();
                var month = date.getMonth() + 2;
                if (month < 10) {
                    month = '0' + month;
                }
                else if (month > 12) {
                    month = '01';
                }
                var day = date.getDate();
                var year = date.getFullYear();
                var datestring = '' + month + day + year;

                var data = {
                    ORIGID: res.response.decoded.PNREF,
                    AMT: "100",
                    PROFILENAME: "MyTestProfile",
                    START: datestring,
                    TERM: "0",
                    PAYPERIOD: "MONT",
                    TENDER: "C"
                };

                try {
                    convertRecurringBillingProfile.exchangeData(data);
                    convertRecurringBillingProfile.validateData();

                    payflow_api.execute(convertRecurringBillingProfile.getParameters(), function (err, res) {
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
        }
        catch (err)
        {
            console.log(err);
        }
    });
});
