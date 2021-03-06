"use strict";

process.env.NODE_ENV = 'test';

const { BadRequestError } = require('../expressError');
const { sqlForPartialUpdate } = require('./sql.js');
const { sqlForFilteredCompanies } = require('./sql.js');
const { sqlForFilteredJobs } = require('./sql.js');

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
        expect(sqlForFilteredCompanies({name: 'bob'})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE name ILIKE '%bob%'`);
        expect(sqlForFilteredCompanies({minEmployees: 30})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE num_employees >= 30`);
        expect(sqlForFilteredCompanies({maxEmployees: 600})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE num_employees <= 600`);
    });

    test('returns correct query for only two arguments', () => {
        expect(sqlForFilteredCompanies({name: 'twitter', minEmployees: 350})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE name ILIKE '%twitter%' AND num_employees >= 350`);
        expect(sqlForFilteredCompanies({minEmployees: 60, maxEmployees: 900})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE num_employees >= 60 AND num_employees <= 900`);

    });

    test('returns correct query for all three arguments', () => {
        expect(sqlForFilteredCompanies({name: 'facebook', minEmployees: 240, maxEmployees: 910})).toEqual(`SELECT handle, name, description, num_employees AS "numEmployees", logo_url AS "logoUrl" FROM companies WHERE name ILIKE '%facebook%' AND num_employees >= 240 AND num_employees <= 910`);
    })
});

/*******************************  Tests for sqlForFilteredJobs */

describe('sqlForFilteredJobs', () => {
    test('should return a string', () => {
        expect(sqlForFilteredJobs({title: 'electrician', minSalary: 20000, hasEquity: false})).toEqual(expect.any(String));
    });

    test('returns correct query for only one argument', () => {
        expect(sqlForFilteredJobs({title: 'plumber'})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title ILIKE '%plumber%'`);
        expect(sqlForFilteredJobs({minSalary: 30000})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE salary >= 30000`);
        expect(sqlForFilteredJobs({hasEquity: true})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE equity > 0`);
    });

    test('returns correct query for only two arguments', () => {
        expect(sqlForFilteredJobs({title: 'Software Developer', minSalary: 10000})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title ILIKE '%Software Developer%' AND salary >= 10000`);
        expect(sqlForFilteredJobs({minSalary: 100000, hasEquity: true})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE salary >= 100000 AND equity > 0`);

    });

    test('returns correct query for all three arguments', () => {
        expect(sqlForFilteredJobs({title: 'landscaper', minSalary: 40000, hasEquity: true})).toEqual(`SELECT id, title, salary, equity, company_handle AS "companyHandle" FROM jobs WHERE title ILIKE '%landscaper%' AND salary >= 40000 AND equity > 0`);
    });

    test('if hasEquity is not provided, do not include equity in the SQL', () => {
        expect(sqlForFilteredJobs({title: 'fireman', minSalary: 5000})).not.toContain('equity > 0');
    });

    test('if hasEquity is false, do not include equity in the SQL', () => {
        expect(sqlForFilteredJobs({title: 'fireman', minSalary: 5000, hasEquity: false})).not.toContain('equity > 0');
    });
});