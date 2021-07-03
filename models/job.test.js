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

/************************************** create method */

describe('create', () => {
  const newJob = {
    title: 'somejob',
    salary: 450000,
    equity: '0.8',
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
        equity: '0.8',
        company_handle: "c1",
      },
    ]);
  });

  test("bad request with dupe", async function () {
    try {
      await Job.create(newJob);
      await Job.create(newJob);
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** findAll method */

describe('findAll', () => {
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

  test('returns error if no results found', async () => {
    try {
      await Job.findAll({minSalary: 900000, hasEquity: true});
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** get method */

describe('get', () => {
  test('works', async () => {
    const resp = await db.query(`SELECT id FROM jobs where title = 'c1Job'`);
    const job = await Job.get(resp.rows[0].id);
    expect(job).toEqual({
      id: resp.rows[0].id,
      title: "c1Job",
      salary: 30000,
      equity: 0,
      companyHandle: 'c1'
    });
  });

  test('not found if no such job', async () => {
    expect.assertions(1);
    try {
      await Job.get(-54);
      fail();
    }
    catch(err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});

/************************************** update */

describe('update', () => {
  test("works", async function () {
    const resp = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
    const id = resp.rows[0].id;
    const updateData = {
      title: 'newTitle',
      salary: 55245,
      equity: 0.391
    };

    let job = await Job.update(id, updateData);
    expect(job).toEqual({
      id,
      companyHandle: 'c1',
      ...updateData,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, [id]);
    expect(result.rows).toEqual([{
      id,
      title: "newTitle",
      salary: 55245,
      equity: 0.391,
      company_handle: "c1",
    }]);
  });

  test("works if we have null fields", async () => {
    const resp = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
    const id = resp.rows[0].id;
    const updateData2 = {
      title: 'newTitle',
      salary: null,
      equity: null
    };

    let job = await Job.update(id, updateData2);
    expect(job).toEqual({
      id,
      companyHandle: 'c1',
      ...updateData2,
    });

    const result = await db.query(
          `SELECT id, title, salary, equity, company_handle
           FROM jobs
           WHERE id = $1`, [id]);
    expect(result.rows).toEqual([{
      id,
      title: "newTitle",
      salary: null,
      equity: null,
      company_handle: "c1",
    }]);
  });

  test("not found if no such job", async function () {
    const updateData = {
      title: 'newTitle',
      salary: 55245,
      equity: 0.391
    };

    try {
      await Job.update("nothing", updateData);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });

  test("bad request with no data", async function () {
    const resp = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
    const id = resp.rows[0].id;

    try {
      await Job.update(id, {});
      fail();
    } catch (err) {
      expect(err instanceof BadRequestError).toBeTruthy();
    }
  });
});

/************************************** remove */

describe('remove', () => {
  test('works', async () => {
    const resp = await db.query(`SELECT id FROM jobs WHERE title = 'c1Job'`)
    const id = resp.rows[0].id;

    await Job.remove(id);
    const res = await db.query(
        `SELECT title FROM jobs WHERE id = $1`, [id]);
    expect(res.rows.length).toBe(0)
  });

  test("not found if no such job", async function () {
    try {
      await Job.remove(-1);
      fail();
    } catch (err) {
      expect(err instanceof NotFoundError).toBeTruthy();
    }
  });
});