"use strict";

const db = require("../db");
const { BadRequestError, NotFoundError } = require("../expressError");
const { sqlForPartialUpdate } = require("../helpers/sql");

/** Related functions for jobs. */

class Job {
    /** Create a job (from data), update db, return new job data.
   *
   * data should be { title, salary, equity, companyHandle }
   *
   * Returns { title, salary, equity, companyHandle }
   *
   * */

  static async create({ title, salary, equity, companyHandle }) {
    const duplicateCheck = await db.query(
        `SELECT title, company_handle FROM jobs WHERE title = $1 AND company_handle = $2`,
      [title, companyHandle]);
    
    if (duplicateCheck.rows[0]) throw new BadRequestError(`${title} already exists at ${companyHandle}`);

    const result = await db.query(
      `INSERT INTO jobs
       (title, salary, equity, company_handle)
       VALUES ($1, $2, $3, $4)
       RETURNING title, salary, equity, company_handle AS "companyHandle"`,
      [
        title,
        salary,
        equity,
        companyHandle,
      ],
    );
    const job = result.rows[0];

    return job;
  };

  /** Find all jobs.
   * Accepts optional paramaters which will filter our results.
   * 
   * 
   * Returns [{ id, title, salary, equity, companyHandle }, ...]
   * */

  static async findAll({name, minEmployees, maxEmployees}) {
    let query;
    if (name === undefined && minEmployees === undefined && maxEmployees === undefined) {
      query = `SELECT id,
                      title,
                      salary,
                      equity,
                      company_handle AS "companyHandle"
              FROM jobs
              ORDER BY title`
    } else {
      query = sqlForFilteredCompanies({name, minEmployees, maxEmployees});
    }

    const jobsRes = await db.query(query);
    if (!jobsRes.rows[0]) throw new NotFoundError('No jobs found');

    return jobsRes.rows;
  };

  /** Given a job id, return data about job.
   *
   * Returns { id, title, salary, equity, companyHandle }
   *
   * Throws NotFoundError if not found.
   **/

  static async get(id) {
    const jobRes = await db.query(
      `SELECT id,
              title,
              salary,
              equity,
              company_handle AS "companyHandle"
       FROM jobs
       WHERE id = $1`,
    [id]);

    const job = jobRes.rows[0];

    if (!job) throw new NotFoundError(`No job with id: ${id}`);

    return job;
  }



}







module.exports = Job