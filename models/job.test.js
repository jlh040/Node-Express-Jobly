"use strict";

const db = require('../db');
const { BadRequestError, NotFoundError } = require("../expressError");
const Job = require('./job.js');
const {
  commonBeforeAll,
  commonBeforeEach,
  commonAfterEach,
  commonAfterAll,
} = require("./_testCommon");

beforeAll(commonBeforeAll);
beforeEach(commonBeforeEach);
afterEach(commonAfterEach);
afterAll(commonAfterAll);

/************************************** create */

describe('create a new job', () => {
  const newJob = {
    title: 'somejob',
    salary: 450000,
    equity: 0.8,
    companyHandle: 'c1'
  }

  test('works', async () => {
    let job = await Job.create(newJob);
    expect(job).toEqual(newJob);

    const result = await db.query(
      `SELECT id, title, salary, equity, company_handle
       FROM jobs
       WHERE title = 'somejob'`);
    expect(result.rows).toEqual([
      {
        id: expect.any(Number),
        title: "somejob",
        salary: 450000,
        equity: 0.8,
        companyHandle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Company.create(newCompany);
      await Company.create(newCompany);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll */

describe('find all jobs', () => {
  test("works: no filter", async function () {
    let jobs = await Job.findAll({});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c1Job",
        salary: 30000,
        equity: 0,
        companyHandle: 'c1'
      },
      {
        id: expect.any(Number),
        title: "c2Job",
        salary: 50000,
        equity: 0.765,
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: "c3Job",
        salary: 140000,
        equity: 0.985,
        companyHandle: 'c3'
      }
    ]);
  });

  test('filters based off of job title only', async () => {
    let jobs = await Job.findAll({title: 'c2Job'});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c2Job",
        salary: 50000,
        equity: 0.765,
        companyHandle: 'c2'
      }
    ])
  });

  test('filters based off of minSalary only', async () => {
    let jobs = await Job.findAll({minSalary: 140000});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c3Job",
        salary: 140000,
        equity: 0.985,
        companyHandle: 'c3'
      }
    ])
  });

  test('filters based off of hasEquity only', async () => {
    let jobs = await Job.findAll({hasEquity: true});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c2Job",
        salary: 50000,
        equity: 0.765,
        companyHandle: 'c2'
      },
      {
        id: expect.any(Number),
        title: "c3Job",
        salary: 140000,
        equity: 0.985,
        companyHandle: 'c3'
      }
    ])
  });

  test('filters based off title and minSalary', async () => {
    let jobs = await Job.findAll({title: 'c2Job', minSalary: 20000});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c2Job",
        salary: 50000,
        equity: 0.765,
        companyHandle: 'c2'
      }
    ])
  });

  test('filters based off minSalary and hasEquity', async () => {
    let jobs = await Job.findAll({hasEquity: true , minSalary: 130000});
    expect(jobs).toEqual([
      {
        id: expect.any(Number),
        title: "c3Job",
        salary: 140000,
        equity: 0.985,
        companyHandle: 'c3'
      }
    ])
  });


});
