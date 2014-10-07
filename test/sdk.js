"use strict";

var chai = require('chai'),
    expect = chai.expect,
    should = chai.should();

var payflow_api = require('../');
require('./configure');


describe('SDK', function () {
    describe('Execute', function () {
        it('should return 0', function (done) {
            var data = {
                TRXTYPE: "S",
                TENDER: "C",
                ACCT: "4556209654007209",
                EXPDATE: "1118",
                CVV2: "111",
                AMT: "100"
            };

            payflow_api.execute(data, function (err, res) {
                if (err) { done(err); }
                expect(err).equal(null);
                expect(res.response.decoded.RESULT).equal("0");
                done();
            });
        });
        it('Should return objects', function () {

            payflow_api.getModel("sale").should.be.a('object');
            payflow_api.getModel("authorization").should.be.a('object');
            payflow_api.getModel("capture").should.be.a('object');
            payflow_api.getModel("refund").should.be.a('object');
            payflow_api.getModel("reference").should.be.a('object');
            payflow_api.getModel("void").should.be.a('object');
            payflow_api.getModel("setexpresscheckout").should.be.a('object');
            payflow_api.getModel("getexpresscheckout").should.be.a('object');
            payflow_api.getModel("doexpresscheckout").should.be.a('object');
        });
    });
});