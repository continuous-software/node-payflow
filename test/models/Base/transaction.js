"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_sdk = require('../../../');
require('../../configure');

var trx = require('../../../models/Base/transaction')();

describe('TransactionModel', function () {

    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            trx.should.have.property('getParameters');
            trx.should.have.property('getDefaultParameters');
            trx.should.have.property('getValidationParameters');
            trx.should.have.property('setDefaultParameters');
            trx.should.have.property('setValidationParameters');
            trx.should.have.property('exchangeData');
            trx.should.have.property('validateData');


            //Check parameters
            trx.getParameters().should.be.a('object');

            //Check default parameters
            trx.getDefaultParameters().should.be.a('object');

            //Check validation parameters
            trx.getValidationParameters().should.be.a('array');

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

            trx.exchangeData(data);

            var params = trx.getParameters();
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
    describe('getParameters', function () {
        it('should return an object', function () {
            trx.getParameters().should.be.a('object');
        });
    });
    describe('getDefaultParameters', function () {
        it('should return an object', function () {
            trx.getDefaultParameters().should.be.a('object');
        });
    });

    describe('setDefaultParameters', function () {
        it('should set default parameters', function () {
            trx.setDefaultParameters({TRXTYPE: "S", TENDER: "C"});
            trx.getDefaultParameters().should.be.a('object');
            trx.getDefaultParameters().should.have.property('TRXTYPE');
            trx.getDefaultParameters().TRXTYPE.should.equal("S");
            trx.getDefaultParameters().should.have.property('TENDER');
            trx.getDefaultParameters().TENDER.should.equal("C");

        });
    });

    describe('appendDefaultParameters', function () {
        it('should append default parameters', function () {
            trx.setDefaultParameters({TRXTYPE: "S", TENDER: "C"});
            trx.appendDefaultParameters({AMT: "10", EXPDATE: "0210"});
            trx.getDefaultParameters().should.be.a('object');
            trx.getDefaultParameters().should.have.property('TRXTYPE');
            trx.getDefaultParameters().TRXTYPE.should.equal("S");
            trx.getDefaultParameters().should.have.property('TENDER');
            trx.getDefaultParameters().TENDER.should.equal("C");
            trx.getDefaultParameters().should.have.property('AMT');
            trx.getDefaultParameters().AMT.should.equal("10");
            trx.getDefaultParameters().should.have.property('EXPDATE');
            trx.getDefaultParameters().EXPDATE.should.equal("0210");

        });
    });



    describe('getValidationParameters', function () {
        it('should return an array', function () {
            trx.getValidationParameters().should.be.a('array');
        });
    });

    describe('setValidationParameters', function () {
        it('should set validation parameters', function () {
            trx.setValidationParameters(['TRXTYPE', 'TENDER']);
            trx.getValidationParameters().should.be.a('array');
            trx.getValidationParameters().should.include('TRXTYPE');
            trx.getValidationParameters().should.include('TENDER');

        });
    });

    describe('appendValidationParameters', function () {
        it('should append validation parameters', function () {
            trx.setValidationParameters(['TRXTYPE', 'TENDER']);
            trx.getValidationParameters().should.be.a('array');
            trx.getValidationParameters().should.include('TRXTYPE');
            trx.getValidationParameters().should.include('TENDER');

            trx.appendValidationParameters(['AMT', 'EXPDATE']);
            trx.getValidationParameters().should.include('TRXTYPE');
            trx.getValidationParameters().should.include('TENDER');
            trx.getValidationParameters().should.include('AMT');
            trx.getValidationParameters().should.include('EXPDATE');
        });
    });

});