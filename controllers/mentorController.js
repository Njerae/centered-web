
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const studentModel = require("../models/student.js");
const mentorModel = require("../models/mentor.js");
const opportunityModel = require("../models/opportunity.js");
const adminModel = require("../models/admin.js");

exports.process_login = async (req, res) => {
  const { email, password } = req.body;

  try {
    // Use the AdminModel to find the admin by email
    mentorModel.findMentorByEmail(email, (err, mentor) => {
      // If an error occurs, or admin not found, return an error
      if (err || !mentor) {
        res
          .status(401)
          .render("admin/login", { message: "Invalid email or password" });
        return;
      }

      // Use bcrypt to compare the submitted password with the stored hash
      bcrypt.compare(password, admin.password, (err, result) => {
        if (err || !result) {
          res
            .status(401)
            .render("admin/login", { message: "Invalid email or password" });
          return;
        }

        // If password is correct, create a JWT token
        const token = jwt.sign(
          { id: admin._id, email: admin.email },
          process.env.ADMIN_JWT_SECRET,
          { expiresIn: "1h" } // Token expires in 1 hour
        );

        // Store the token in a cookie and redirect to the dashboard
        res.cookie("mentor_jwt", token, { httpOnly: true, maxAge: 3600000 });
        res.redirect("/admin/dashboard");
      });
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "An error occurred during login" });
  }
};

exports.dashboard_page = (req, res) => {
  // Render the admin dashboard page view after successful login
  res.render("admin/dashboard", { title: "Admin Dashboard" });
};

// List all students
exports.list_students = async (req, res) => {
  try {
    const students = await studentModel.getAllStudents();
    res.render("admin/manage_students.mustache", {
      title: "Manage Students",
      students,
    });
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving student records" });
  }
};