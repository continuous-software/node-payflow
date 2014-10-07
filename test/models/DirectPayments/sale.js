"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../../../');
require('../../configure');

var sale = payflow_api.getModel("sale");

describe('SaleModel', function () {
    describe('Construction', function () {
        it('should return an object with the correct properties', function () {

            //Check parameters
            sale.getParameters().should.be.a('object');

            //Check default parameters
            sale.getDefaultParameters().should.be.a('object');
            sale.getDefaultParameters().should.have.property('TRXTYPE');
            sale.getDefaultParameters().TRXTYPE.should.equal("S");
            sale.getDefaultParameters().should.have.property('TENDER');
            sale.getDefaultParameters().TENDER.should.equal("C");

            //Check validation parameters
            sale.getValidationParameters().should.be.a('array');
            sale.getValidationParameters().should.have.length(5);

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


            sale.exchangeData(data);
            var params = sale.getParameters();
            params.should.have.property('TRXTYPE');
            params.should.have.property('TENDER');
            params.should.have.property('AMT');
            params.should.have.property('EXPDATE');
            //TRXTYPE and TENDER should be overridden by the model defaults
            params.TRXTYPE.should.equal("S");
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
            sale.exchangeData(data);
            expect(sale.validateData).to.not.throw();
        });
        it('Should throw', function () {
            var data = {
                ACCT: "4716792779006088",
                EXPDATE: "1118",
                CVV2: "111"
            };
            sale.exchangeData(data);
            expect(sale.validateData).to.throw('AMT: Required parameter for this transaction is undefined');
        });
    });
});

describe('ExecuteSale', function () {
    it('Should Return Result 0', function (done) {
        var data = {
            ACCT: "4716792779006088",
            EXPDATE: "1118",
            CVV2: "111",
            AMT: "100"
        };

        try {
            sale.exchangeData(data);
            sale.validateData();

            payflow_api.execute(sale.getParameters(), function (err, res) {
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
