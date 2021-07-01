process.env.NODE_ENV = 'test';

const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql.js');

/*******************************  Tests for sqlForPartialUpdate */

describe('sqlForPartialUpdate', () => {
    test('returns an object', () => {
        const updateData = {"name": "Baker-Santos"};
        const sqlToJs = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };
        expect(sqlForPartialUpdate(updateData, sqlToJs)).toBeInstanceOf(Object);
    })
})