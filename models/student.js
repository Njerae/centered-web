const Datastore = require("nedb");
const bcrypt = require("bcrypt");
const { v4: uuidv4 } = require("uuid");

class Student {
  constructor(dbFilePath) {
    console.log("STUDENT MODEL", dbFilePath)
    if (dbFilePath) {
      // Persistent datastore with automatic loading
      this.db = new Datastore({ filename: dbFilePath, autoload: true });
    } else {
      // In-memory datastore
      this.db = new Datastore();
    }

    
  }

  // Method to initialize our dataset
  init() {
    const hash = bcrypt.hashSync("password", 10);
    
  }

  // Add a student with an initial goal structure as objects
  async addStudent(name, email, password) {
    const hash = await bcrypt.hash(password, 10);
    const entry = {
      name: name,
      email: email,
      password: hash,
      opportunities: [],
      goals: [], // Each goal will now be an object
    };
    return new Promise((resolve, reject) => {
      this.db.insert(entry, function (err, newDoc) {
        if (err) {
          reject("Cannot insert student: " + email);
        } else {
          resolve(newDoc);
        }
      });
    });
  }

  // Find a student by email
  async findStudentByEmail(email) {
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

  // Find a student by ID
  async getStudentById(studentId) {
    return new Promise((resolve, reject) => {
      this.db.findOne({ _id: studentId }, (err, student) => {
        if (err) {
          reject(err);
        } else {
          resolve(student);
        }
      });
    });
  }

  // Update a student's information, including password
  async updateStudent(studentId, updatedData) {
    return new Promise(async (resolve, reject) => {
      // If the update includes a new password, hash it
      if (updatedData.password) {
        try {
          updatedData.password = await bcrypt.hash(updatedData.password, 10);
        } catch (hashError) {
          reject(hashError);
          return;
        }
      }

      // Update the student's information in the database
      this.db.update(
        { _id: studentId },
        { $set: updatedData },
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

  // Delete a student by ID
  async deleteStudent(studentId) {
    return new Promise((resolve, reject) => {
      this.db.remove({ _id: studentId }, {}, function (err, numRemoved) {
        if (err) {
          reject(err);
        } else {
          resolve(numRemoved);
        }
      });
    });
  }

  // Add an opportunity to a student's plan
  async addOpportunityToStudent(email, opportunityId) {
    // console.log("These are the arguments", email, opportunityId);
    const opportunity = {
      opportunityId: opportunityId,
      registered: true,
    };
    return new Promise((resolve, reject) => {
      this.db.update(
        { email: email },
        { $push: { opportunities: opportunity } },
        {},
        function (err, numAffected) {
          if (err) {
            // console.log("This is an error", err);
            reject(err);
          } else {
            // console.log("This is the doc", numAffected);
            resolve(numAffected);
          }
        }
      );
    });
  }

  // Remove an opportunity from a student's plan
  async removeOpportunityFromStudent(studentEmail, opportunityId) {
    console.log(studentEmail, opportunityId);
    return new Promise((resolve, reject) => {
      this.findStudentByEmail(studentEmail)
        .then((student) => {
          const opportunityIndex = student.opportunities.findIndex(
            (p) => p.opportunityId === opportunityId
          );
          if (opportunityIndex === -1) {
            reject(new Error("Opportunity does not exist"));
          } else {
            const opportunity = student.opportunities[opportunityIndex];
            opportunity.registered = !opportunity.registered; // Toggle the completion status
            this.db.update(
              { email: studentEmail },
              { $set: { opportunities: student.opportunities } }, // Update the entire goals array
              {},
              function (err, numAffected) {
                if (err) {
                  console.log("This is an error", err);
                  reject(
                    new Error(
                      "Cannot cancel opportunity for student: " + studentEmail
                    )
                  );
                } else {
                  console.log("This is an affected", numAffected);
                  resolve({
                    numAffected: numAffected,
                    registered: opportunity.registered,
                  });
                }
              }
            );
          }
        })
        .catch((err) => {
          console.log("Houston we have a problem ", err);
          reject(new Error("Cannot find student: " + studentEmail));
        });
    });
  }

  // Get all students
  async getAllStudents() {
    console.log("=========================================")
    console.log(this.db)
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

  // Compare password
  async comparePassword(candidatePassword, hash) {
    return new Promise((resolve, reject) => {
      bcrypt.compare(candidatePassword, hash, function (err, isMatch) {
        if (err) {
          reject(err);
        } else {
          resolve(isMatch);
        }
      });
    });
  }

  // Add a goal to a student's plan
  async addGoalToStudent(email, goalDescription) {
    const goal = {
      id: uuidv4(), // Assign a unique identifier to the goal
      description: goalDescription,
      completed: false,
    };
    return new Promise((resolve, reject) => {
      this.db.update(
        { email: email },
        { $push: { goals: goal } },
        { multi: false },
        function (err, numAffected) {
          if (err) {
            reject("Cannot add goal to student: " + email);
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }

  // Update a goal for a student
  async updateGoalOfStudent(email, goalId, newGoalDescription) {
    return new Promise((resolve, reject) => {
      // First find the student to ensure they exist and get their goals
      this.findStudentByEmail(email)
        .then((student) => {
          // Find the goal with the matching id
          const goalIndex = student.goals.findIndex((g) => g.id === goalId);
          if (goalIndex === -1) {
            reject(new Error("Goal not found"));
          } else {
            // Update the goal description at the found index
            student.goals[goalIndex].description = newGoalDescription;
            // Now update the student record with the new goals array
            this.db.update(
              { email: email },
              { $set: { goals: student.goals } },
              {},
              function (err, numAffected) {
                if (err) {
                  reject(new Error("Cannot update goal for student: " + email));
                } else {
                  resolve(numAffected);
                }
              }
            );
          }
        })
        .catch((err) => {
          reject(new Error("Cannot find student: " + email));
        });
    });
  }

  async removeGoalFromStudent(email, goalId) {
    return new Promise((resolve, reject) => {
      this.db.update(
        { email: email },
        { $pull: { goals: { id: goalId } } }, // Match the goal by its unique `id` to remove it
        {},
        function (err, numAffected) {
          if (err) {
            reject("Error removing goal for student: " + email);
          } else if (numAffected === 0) {
            reject("No goal found with the provided ID");
          } else {
            resolve(numAffected);
          }
        }
      );
    });
  }

  async updateGoalCompletion(email, goalId, completed) {
    return new Promise((resolve, reject) => {
      this.findStudentByEmail(email)
        .then((student) => {
          const goal = student.goals.find((g) => g.id === goalId);
          if (!goal) {
            reject(new Error("Goal not found"));
          } else {
            goal.completed = completed; // Update the completion status of the goal
            this.db.update(
              { email: email },
              { $set: { goals: student.goals } }, // Update the entire goals array
              {},
              function (err, numAffected) {
                if (err) {
                  reject(
                    new Error(
                      "Cannot update goal completion for student: " + email
                    )
                  );
                } else {
                  resolve(numAffected);
                }
              }
            );
          }
        })
        .catch((err) => {
          reject(new Error("Cannot find student: " + email));
        });
    });
  }
  async toggleGoalCompletion(email, goalId) {
    return new Promise((resolve, reject) => {
      this.findStudentByEmail(email)
        .then((student) => {
          const goalIndex = student.goals.findIndex((g) => g.id === goalId);
          if (goalIndex === -1) {
            reject(new Error("Goal does not exist"));
          } else {
            const goal = student.goals[goalIndex];
            goal.completed = !goal.completed; // Toggle the completion status
            this.db.update(
              { email: email },
              { $set: { goals: student.goals } }, // Update the entire goals array
              {},
              function (err, numAffected) {
                if (err) {
                  reject(
                    new Error(
                      "Cannot toggle goal completion for student: " + email
                    )
                  );
                } else {
                  resolve({
                    numAffected: numAffected,
                    completed: goal.completed,
                  });
                }
              }
            );
          }
        })
        .catch((err) => {
          reject(new Error("Cannot find student: " + email));
        });
    });
  }
}

module.exports = new Student("database/student.db");
