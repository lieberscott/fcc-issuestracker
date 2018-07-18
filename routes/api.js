/*
*
*
*       Complete the API routing below
*
*
*/

'use strict';

let expect = require('chai').expect;
let MongoClient = require('mongodb');
let ObjectId = require('mongodb').ObjectID;
const express = require('express');  
const bodyParser = require('body-parser');  

let mongoose = require("mongoose");
let Schema = mongoose.Schema;
let dns = require('dns');

// mongoose.connect(process.env.DB);

let IssueSchema = new Schema({
  issue_title: { type: String, required: true },
  issue_text: { type: String, requied: true },
  created_by: { type: String, required: true },
  assigned_to: { type: String, required: false },
  status_text: { type: String, required: false },
  created_on: { type: Date, default: new Date() },
  updated_on: { type: Date, default: new Date() },
  open: { type: Boolean, default: true }
});

let Issue = mongoose.model("Issue", IssueSchema);


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(function (req, res){
      let project = req.params.project;
      let query = req.query;
      console.log(query);
    
      // res.json("hey");
      Issue.find(query, (err, data) => {
        if (err) { res.send(err); }
        else { res.json(data); }
      });
      
    })
    
    .post(function (req, res){
      let project = req.params.project;
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;
    
      let newentry = new Issue({
        issue_title,
        issue_text,
        created_by,
        assigned_to,
        status_text
      });

      newentry.save((err, data) => {
        if (err) { console.log(err) }
        else { console.log(data) }
      });

      res.json(newentry);
      
    })
    
    .put(function (req, res){
      let project = req.params.project;
      let id = req.body._id;
      let issue_title = req.body.issue_title;
      let issue_text = req.body.issue_text;
      let created_by = req.body.created_by;
      let assigned_to = req.body.assigned_to;
      let status_text = req.body.status_text;
      let open = req.body.open; // checkbox from form: false if checked, undefined if unchecked
    
      let arr = [ // create array of form results to filter empty responses (in next step)
        { _id: id },
        { issue_title },
        { issue_text },
        { created_by },
        { assigned_to },
        { status_text },
        { open },
        { updated_on: new Date() }
      ];
    
      // filter out empty form field responses
      // see roland's answer for explanation: https://stackoverflow.com/questions/4215737/convert-array-to-object
      let obj = arr.reduce((result, item, index) => {
        let key = Object.keys(item)[0]; // key
        if (item[key] !== "" && item[key] !== undefined) {
          result[key] = item[key];
        }
        return result;
      }, {});
    
      // console.log(obj);
    
      if (Object.keys(obj).length < 3) { // user only entered info for _id field
        res.send("no updated field sent");
      }

      else {
        Issue.findOneAndUpdate({ _id: id }, { $set: obj }, { new: true, upsert: true }, (err, doc) => {
          if (err) {
            return res.send("could not update " + id);
          }
          else {
            return res.send("succesfully updated");
          }
        });

      }
    })
    
    .delete(function (req, res){
      let project = req.params.project;
      let id = req.body._id;
    console.log(id);
    
      if (id == "") {
        res.send("_id error");
      }
      else {
        Issue.deleteOne({ _id: id }, (err, doc) => {
          if (err) { return res.send("could not delete " + id); }
          else { return res.send("deleted " + id); };
        });
      }
      
    });
    
};
