# Jobly Backend

This is the Express backend for Jobly.

To download this code, run `git clone https://github.com/jlh040/Node-Express-Jobly.git`

Next, make sure you have [PostgreSQL](https://www.postgresql.org/) and [Node](https://nodejs.org/en/) installed, and then run `psql < jobly.sql`to get the database setup.

Run `npm install` to download all of the Node packages. 

To run this:

    node server.js

To run the tests:

    jest -i



## Important Note:

Most of these routes require admin privileges. To get yourself admin privileges, first register using the **/auth/register** route, then run `psql jobly` to open postgres. Find yourself in the **Users** table and set **is_admin** to be true. Next request the **/auth/token** route using your information. The JWT that you receive back will give you admin privileges.

# Routes

## <u>Authentication</u>

### POST /auth/token

- Requires { username, password }
- Returns a JWT which can be used to authenticate yourself in other requests

### POST /auth/register

- Requires { username, password, firstName, lastName, email }
- Returns a JWT which can be used to authenticate yourself in other requests

## <u>Users</u>

### POST /users

- Requires { username, password, firstName, lastName, email, [ isAdmin ] }
- Returns {user: { username, firstName, lastName, email, isAdmin }, token }
- This route is for admins to sign a user up, with this route an admin can sign a user up as an admin.
- ***Route is for admins only***

### POST /users/:username/jobs/:id

- Returns { applied: jobId }
- This route is for a user with a username of **:username** to sign up for the job with an id of **:id**.
- ***Route is for admins only***

### GET /users

- Returns list of all users
- ***Route is for admins only***

### GET /users/:username

- Returns { username, firstName, lastName, email, isAdmin, **jobs** }
- **jobs** will be an array containing the ids of all jobs that the user applied for
- ***Route is for admins only, but any user can get info on themselves***

### PATCH /users/:username

- Data can include { firstName, lastName, password, email }
- Returns { username, firstName, lastName, email, isAdmin }
- This route is for updating a user
- ***Route is for admins only, but any user can update themselves***

### DELETE /users/:username

- Returns { deleted: username }
- This route is for deleting a user
- ***Route is for admins only, but any user can delete themselves***

## <u>Companies</u>

### POST /companies

- Requires { handle, name, description, numEmployees, logoUrl }
- Returns { handle, name, description, numEmployees, logoUrl }
- This route is for creating a company
- ***Route is for admins only***

### GET /companies

- Returns a list of all companies
- ***Anyone can use this route***

### GET /companies/:handle

- Returns { handle, name, description, numEmployees, logoUrl, jobs } where jobs is [ { id, title, salary, equity }, ...]
- This route is for getting info on a specific company
- ***Anyone can use this route***

### PATCH /companies/:handle

- Data can include { name, description, numEmployees, logoUrl }
- Returns { handle, name, description, numEmployees, logoUrl }
- This route is for updating a company
- ***Route is for admins only***

### DELETE /companies/:handle

- Returns { deleted: handle } if the deletion was successful
- ***Route is for admins only***

## <u>Jobs</u>

### POST /jobs

- Requires { title, salary, equity, companyHandle }
- Returns { id, title, salary, equity, companyHandle }
- This route is for creating a job
- ***Route is for admins only***

### GET /jobs

- Returns list of all jobs in the db
- You are able to pass in optional filters in the query string
  - These can be:
    - title (case-insensitive search for jobs that include this title)
    - minSalary (show jobs that have atleast this salary)
    - hasEquity (a boolean which represents if you want to see jobs with non-zero equity)
- ***Anyone can use this route***

### GET /jobs/:id

- Returns { id, title, salary, equity, companyHandle } for the job with the specified id
- ***Anyone can use this route***

### PATCH /jobs/:id

- Data can include { title, salary, equity }
- Returns { id, title, salary, equity, companyHandle }
- This route is for updating a job
- ***Route is for admins only***
