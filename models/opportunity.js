const Datastore = require("nedb");
const path = require("path");
const fs = require("fs");

class Opportunity {
  constructor(dbFilePath) {
    // Check if the database file path is provided.
    if (dbFilePath) {
      // Make sure the directory exists, if not, create it.
      const dir = path.dirname(dbFilePath);
      if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir, { recursive: true });
      }

      // Check if the file exists. If not, create an empty file.
      if (!fs.existsSync(dbFilePath)) {
        fs.closeSync(fs.openSync(dbFilePath, "w"));
      }

      // Now that we've ensured the file exists, load the database.
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      // If no path is provided, create an in-memory database.
      this.db = new Datastore();
    }
  }

  // Add a new opportunity
  async addOpportunity(title, description, category, mentorId) {
    let opportunity = {
      title: title,
      description: description,
      category: category,
      mentorId: mentorId,
    };
    // console.log(opportunity);
    return new Promise((resolve, reject) => {
      // console.log("Test");
      this.db.insert(opportunity, function (err, newDoc) {
        if (err) {
          // console.log("Test", err);
          reject("Cannot insert opportunity: " + title);
        } else {
          // console.log("Test", newDoc);
          resolve(newDoc);
        }
      });
    });
  }

  async getOpportunityById(opportunityId) {
    // console.log(opportunityId);
    return new Promise((resolve, reject) => {
      // console.log(opportunityId);
      this.db.findOne({ _id: opportunityId }, function (err, doc) {
        if (err) {
          // console.log("This is an error", err)
          reject(err);
        } else {
          // console.log("this is a doc", doc)
          resolve(doc);
        }
      });
    });
  }

  async getOpportunitiesByCategory(category) {
    return new Promise((resolve, reject) => {
      this.db.find({ category: category }, function (err, docs) {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

  async updateOpportunity(opportunityId, update) {
    return new Promise((resolve, reject) => {
      // console.log(opportunityId);
      this.db.update(
        { _id: opportunityId },
        { $set: update },
        {},
        function (err, numAffected) {
          if (err) {
            reject(err);
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }

  async deleteOpportunity(opportunityId) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: opportunityId }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

  async getAllOpportunities() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          // console.log("This is an error",err);
          reject(err);
        } else {
          // console.log("This is docs",docs);
          resolve(docs);
        }
      });
    });
  }

  async getAllOpportunitiesWithMentors() {
    return new Promise((resolve, reject) => {
      this.db.find({}).populate('mentorId').exec((err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }
  

  // Additional methods to interact with opportunity data as required...
}

module.exports = new Opportunity("database/opportunity.db");
