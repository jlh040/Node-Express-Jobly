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
  test('works', async () => {
    expect(1).toBe(1);
  })
})
