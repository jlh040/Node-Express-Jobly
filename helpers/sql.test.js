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
    });

    test('returns an object with keys of "setCol" and "values"', () => {
        const updateData = {numEmployees: 54};
        const sqlToJs = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };

        expect(sqlForPartialUpdate(updateData, sqlToJs).setCols).toBeTruthy();
        expect(sqlForPartialUpdate(updateData, sqlToJs).values).toBeTruthy();
    });

    test('throws BadRequestError if no data passed in', () => {
        const updateData = {};
        const sqlToJs = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };

        expect(() => {sqlForPartialUpdate(updateData, sqlToJs)}).toThrow(BadRequestError);
    })
})