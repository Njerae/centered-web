const Datastore = require("nedb");
const bcrypt = require("bcrypt");

class Mentor {
  constructor(dbFilePath) {
    // Constructor to initialize the database
    if (dbFilePath) {
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      this.db = new Datastore();
    }
  }


  // Method to get all mentors
  async getAllMentors() {
    return new Promise((resolve, reject) => {
      this.db.find({}, (err, docs) => {
        if (err) {
          reject(err);
        } else {
          resolve(docs);
        }
      });
    });
  }

// Method to add a new mentor
async addMentor(name, expertise, email, password) {
  try {
    const hash = await bcrypt.hash(password, 10);
    let mentor = {
      name: name,
      email: email,
      password: hash,
      expertise: expertise
    };

    return new Promise((resolve, reject) => {
      this.db.insert(mentor, function (err, newDoc) {
        if (err) {
          reject("Cannot insert mentor: " + email);
        } else {
          resolve(newDoc);
        }
      });
    });
  } catch (error) {
    console.error("Error hashing password:", error);
    throw error; // Re-throw the error to be caught by the calling code
  }
}

  // Method to find a mentor by ID
  async getMentorById(mentorId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: mentorId }, function (err, doc) {
        if (err) {
          reject(err);
        } else {
          resolve(doc);
        }
      });
    });
  }

  // Method to update mentor information
  async updateMentor(mentorId, update) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { _id: mentorId },
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

  // Method to delete a mentor by ID
  async deleteMentor(mentorId) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: mentorId }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

   // Find an admin by email
   findMentorByEmail(email, callback) {
    this.db.findOne({ email: email }, function(err, doc) {
      callback(err, doc);
    });
  }

  // Additional methods to interact with mentor data as required...
}

module.exports = new Mentor("database/mentor.db");
