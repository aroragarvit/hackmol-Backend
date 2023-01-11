// Middleware functions are functions that have access to request , response , next() function in application request response cycle
// Middleware functions can perform the following tasks:
// As soon as request comes and resposne is sent whatever happens in between are called middle ware functions
// All types of functions in express are middle ware only
// We can run in any sequence we want

// Types of middleware functions
//1-> app.use() // Global middle ware will run for all routes
//2-> app.get() / app.post() etc  // Route specific middle ware

//Execute any code.
//Make changes to the request and the response objects.
//End the request-response cycle.
//Call the next middleware in the stack.

// USES
// 1-> Authentication
// 2-> Logging
// 3-> Body parsing    (app.use(express.json())
// 4-> Error handling  (404 pages)
// 5-> Database connection
// 6-> Caching
// 7-> Compression
// 8-> CORS
// 9-> Session management

// How to implement middleware function
// function middleware(req,res,next){ // this is a middleware function
//   console.log("middleware function")
//   next() // this is how we call next middleware function}
// app.use(middleware) // this is how we use middleware function for any  route this is true

import { AnyZodObject } from "zod";
import { Request, Response, NextFunction } from "express";
import res from "express/lib/response";
// validate resource is a function and schema is parameter passed to it here we are doing server side schema matching
// its then returning a function with req,res,next as parameters
const validateResource = (schema) => (Request, Response, NextFunction) => {
  try {
    schema.parse({
      body: Request.body,
      query: Request.query,
      params: Request.params,
    });
  } catch (err) {
    return Response.send(e.errors);
  }
};

module.exports = validateResource;
