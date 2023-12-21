const Datastore = require('nedb');
const bcrypt = require('bcrypt');
const path = require('path');
const dbDir = path.join(__dirname, 'database');

class Admin {
  constructor(dbFilePath) {
    console.log("Admin constructor", dbFilePath)
    if (dbFilePath) {
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      this.db = new Datastore();
    }
  }

  // Add an admin
  async addAdmin(name, email, password) {
    const hash = bcrypt.hashSync(password, 10);
    var admin = {
      name: name,
      email: email,
      password: hash,
    };
    this.db.insert(admin, function(err, newDoc) {
      if (err) {
        console.log('Cannot insert admin:', email);
      }
    });
  }

  async findAdminByEmail(email) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ email: email }, function (err, doc) {
        if (err) {
          // console.log("Error", err);
          reject(err);
        } else {
          // console.log("No error", doc);
          resolve(doc);
        }
      });
    });
  }

  // Update an admin's information
  async updateAdmin(email, update, callback) {
    this.db.update({ email: email }, { $set: update }, {}, function(err, numAffected) {
      callback(err, numAffected);
    });
  }

  // Delete an admin
  async deleteAdmin(email, callback) {
    this.db.remove({ email: email }, {}, function(err, numRemoved) {
      callback(err, numRemoved);
    });
  }

  // Find all admins
  async findAllAdmins() {
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

  // ... additional methods as needed for admin management
}

module.exports = new Admin(`database/admin.db`);
