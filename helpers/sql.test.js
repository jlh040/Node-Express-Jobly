"use strict";

process.env.NODE_ENV = 'test';

const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql.js');
const { sqlForFilteredCompanies } = require('./sql.js');

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

/*******************************  Tests for sqlForFilteredCompanies */

describe('sqlForFilteredCompanies', () => {
    test('should return a string', () => {
        expect(sqlForFilteredCompanies({name: 'bob', minEmployees: 20, maxEmployees: 50})).toEqual(expect.any(String));
    });

    test('returns correct query for only one argument', () => {
        expect(sqlForFilteredCompanies({name: 'bob'})).toEqual(`SELECT * FROM companies WHERE name ILIKE '%bob%'`);
        expect(sqlForFilteredCompanies({minEmployees: 30})).toEqual(`SELECT * FROM companies WHERE num_employees >= 30`);
        expect(sqlForFilteredCompanies({maxEmployees: 600})).toEqual(`SELECT * FROM companies WHERE num_employees <= 600`);
    });

    test('returns correct query for only two arguments', () => {
        expect(sqlForFilteredCompanies({name: 'twitter', minEmployees: 350})).toEqual(`SELECT * FROM companies WHERE name ILIKE '%twitter%' AND num_employees >= 350`);

        expect(sqlForFilteredCompanies({minEmployees: 60, maxEmployees: 900})).toEqual(`SELECT * FROM companies WHERE num_employees >= 60 AND num_employees <= 900`);

    });

    test('returns correct query for all three arguments', () => {
        expect(sqlForFilteredCompanies({name: 'facebook', minEmployees: 240, maxEmployees: 910})).toEqual(`SELECT * FROM companies WHERE name ILIKE '%facebook%' AND num_employees >= 240 AND num_employees <= 910`);
    })
});