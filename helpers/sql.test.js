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
    });

    test('it changes JS keywords to their SQL analog', () => {
        const updateData = {numEmployees: 401, logoUrl: 'http://logo.com/1'};
        const sqlToJs = {
            numEmployees: "num_employees",
            logoUrl: "logo_url",
        };

        expect(sqlForPartialUpdate(updateData, sqlToJs).setCols.includes('num_employees')).toBeTruthy();
        expect(sqlForPartialUpdate(updateData, sqlToJs).setCols.includes('logo_url')).toBeTruthy();
    });

    test('only changes JS keywords that are contained in sqlToJs', () => {
        const updateData = {should_not_change: 1, shouldChange: 2};
        const sqlToJs = {shouldChange: 'should_change'};

        expect(sqlForPartialUpdate(updateData, sqlToJs).setCols).toContain('should_change');
        expect(sqlForPartialUpdate(updateData, sqlToJs).setCols).toContain('should_not_change');
    });
});