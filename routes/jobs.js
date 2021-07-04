"use strict";

/** Routes for jobs. */

const jsonschema = require("jsonschema");
const express = require("express");

const { BadRequestError } = require("../expressError");
const { ensureLoggedIn } = require("../middleware/auth");
const Job = require("../models/job");

const jobNewSchema = require("../schemas/jobNew.json");
const jobUpdateSchema = require("../schemas/jobUpdate.json");
const findJobSchema = require('../schemas/findJob.json');

const router = new express.Router();


/** POST / { job } => { job }
 * 
 * job should be { title, salary, equity, companyHandle }
 * 
 * returns { id, title, salary, equity, companyHandle }
 * 
 * Authorization required: admin
 */

 router.post('/', ensureLoggedIn, async (req, res ,next) => {
    try {
        const validator = jsonschema.validate(req.body, jobNewSchema);
        if (!validator.valid) {
          const errs = validator.errors.map(e => e.stack);
          throw new BadRequestError(errs);
        }
    
        const job = await Job.create(req.body);
        return res.status(201).json({ job });
      } catch (err) {
        return next(err);
      }
 });

 /** GET / => 
  *     { jobs: [ { id, title, salary, equity, companyHandle }, ...] }
  * 
  * Can filter on provided search filters:
  *     - title
  *     - minSalary
  *     - hasEquity
  * 
  * Authorization required: none
 */

router.get("/", async function (req, res, next) {
    try {      
      const validator = jsonschema.validate(req.query, findJobSchema);
      if (!validator.valid) {
        const errs = validator.errors.map(e => e.stack);
        throw new BadRequestError(errs);
      }
  
      const jobs = await Job.findAll({});
      return res.json({ jobs });
    } catch (err) {
      return next(err);
    }
  });



 


 





 module.exports = router;