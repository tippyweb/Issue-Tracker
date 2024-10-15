'use strict';

// adding MongoDB/mongoose
const mongoose = require('mongoose');
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true });

// setting up Schema and DB model
const Schema = mongoose.Schema;

// Issue model
const issueSchema = new Schema({
  issue_title: {
    type: String,
    required: true
  },
  issue_text: {
    type: String,
    required: true
  },
  created_by: {
    type: String,
    required: true
  },
  created_on: {
    type: Date,
    default: new Date()
  },
  updated_on: {
    type: Date,
    default: new Date()
  },
  assigned_to: {
    type: String,
    default: ""
  },
  status_text: {
    type: String,
    default: ""
  },
  open: {
    type: Boolean,
    default: true
  },
  project: {
    type: String,
    required: true
  }
});
const Issue = mongoose.model("Issue", issueSchema);


module.exports = function (app) {

  app.route('/api/issues/:project')
  
    .get(async function (req, res){
      const project = req.params.project;
      let newQuery;
      let issues;
      try {
        if (!req.query) {
          issues = await Issue.find({project: project});
          return res.json(issues);

        } else {

          // drop the last key/value pair
          delete req.query.vscodeBrowserReqId;
          newQuery = req.query;

          // if "open" key exists, update the boolean value
          Object.keys(newQuery).forEach(key => {
            if (key == "open") {
              newQuery[key] = JSON.parse(newQuery[key]);
            }
          });

          // retrieve the issue data with the requested query
          issues = await Issue.find({
            "$and": [
              {project: project},
              newQuery
            ]
          });

          return res.json(issues); 
        }

      } catch (err) {
        console.log(err);
      }

    })
    
    .post(async function (req, res){
      const project = req.params.project;

      if (req.body) {
        // if any of the required field is missing
        if (!req.body.issue_title || 
            !req.body.issue_text  ||
            !req.body.created_by) {
          return res.json({ error: 'required field(s) missing' });
        }

        try {
          let issue = {
            issue_title: req.body.issue_title,
            issue_text: req.body.issue_text,
            created_by: req.body.created_by,
          };
  
          // add optional fields if they exist
          if (req.body.assigned_to) {
            issue.assigned_to = req.body.assigned_to;
          }
          if (req.body.status_text) {
            issue.status_text = req.body.status_text;
          }
          // add project name
          issue.project = project;
  
          const newIssue = new Issue(issue);
          const savedIssue = await newIssue.save();
          const resIssueData = {
            assigned_to: savedIssue.assigned_to,
            status_text: savedIssue.status_text,
            open: savedIssue.open,
            _id: savedIssue._id,
            issue_title: savedIssue.issue_title,
            issue_text: savedIssue.issue_text,
            created_by: savedIssue.created_by,
            created_on: savedIssue.created_on,
            updated_on: savedIssue.updated_on
          };
  
          // Respond with the new user data
          return res.json(resIssueData);

        } catch (err) {
          console.log(err);
        }

      } // if (req.body) {
    
    })
    
    .put(async function (req, res){
      const project = req.params.project;

      if (req.body) {
        // if _id is missing
        if (!req.body._id) {
          return res.json({ error: 'missing _id' });
        }

        const _id = req.body._id;

        // if any of the optional field is missing
        if (!req.body.issue_title &&
          !req.body.issue_text  &&
          !req.body.created_by  && 
          !req.body.assigned_to &&
          !req.body.status_text &&
          !req.body.open) {     
          return res.json({ error: 'no update field(s) sent', '_id': _id });
        }

        let issueToUpdate;

        // find the issue to update
        try {
          issueToUpdate = await Issue.findOne({_id: _id});

        } catch (err) {
          console.log(err);
          return res.json({ error: 'could not update', '_id': _id });
        }

        if (issueToUpdate) {

          // create updateIssue object
          if (req.body.issue_title) {
            issueToUpdate.issue_title = req.body.issue_title;
          };
          if (req.body.issue_text) {
            issueToUpdate.issue_text = req.body.issue_text;
          };
          if (req.body.created_by) {
            issueToUpdate.created_by = req.body.created_by;
          }
          if (req.body.assigned_to) {
            issueToUpdate.assigned_to = req.body.assigned_to;
          }
          if (req.body.status_text) {
            issueToUpdate.status_text = req.body.status_text;
          }
          if (req.body.open) {
            issueToUpdate.open = req.body.open;
          }

          // updated_on is also updated
          issueToUpdate.updated_on = new Date();

          try {
            await Issue.updateOne({ _id: _id }, { $set: issueToUpdate });
            return res.json({ result: 'successfully updated', '_id': _id });

          } catch (err) {
            console.log(err);
            return res.json({ error: 'could not update', '_id': _id });
          }

        } else {
          return res.json({ error: 'could not update', '_id': _id });
        }

      // req.body is missing
      } else {
        return res.json({ error: 'missing _id' });
      }

    })
    
    .delete(async function (req, res){
      const project = req.params.project;

      // if _id is missing
      if (!req.body._id) {
        return res.json({ error: 'missing _id' });
      }

      const _id = req.body._id;

      // delete the issue
      try {
        const deletedIssue = await Issue.deleteOne({ _id: _id});

        if (deletedIssue.deletedCount == 1) {
          return res.json({ result: 'successfully deleted', '_id': _id });
        } else {
          return res.json({ error: 'could not delete', '_id': _id });
        }
        
      } catch (err) {
        console.log(err);
        return res.json({ error: 'could not delete', '_id': _id });

      }

    });
    
};
