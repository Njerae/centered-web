const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");

const studentModel = require("../models/student.js");
const mentorModel = require("../models/mentor.js");
const opportunityModel = require("../models/opportunity.js");
const adminModel = require("../models/admin.js");
const { all } = require("../routes/publicRoutes.js");

exports.login_page = (req, res) => {
  // Render the admin login page view
  res.render("admin/login", { title: "Admin Login" });
};

exports.process_login = async (req, res) => {
  const { email, password } = req.body;

  try {


    const admin = await adminModel.findAdminByEmail(email);
    if (!admin) {
      return res.status(401).send("Authentication failed");
    }
    const isMatch = await bcrypt.compare(password, admin.password);

    if (isMatch) {
      // Create token, set cookie, and redirect to dashboard
      const accessToken = jwt.sign(
        { id: admin._id, email: admin.email },
          process.env.ADMIN_JWT_SECRET,
          { expiresIn: "1h" } 
      );
      res.cookie("admin_jwt", accessToken).redirect("/admin/dashboard");
    } else {
      res.status(401).send("Password incorrect");
    }

        
    // await adminModel.findAdminByEmail(email, (err, admin) => {
    //   // If an error occurs, or admin not found, return an error
    //   if (err || !admin) {
    //     console.log("Error finding admin's email", email)
    //     res
    //       .status(401)
    //       .render("admin/login", { message: "Invalid email or password" });
    //     return;
    //   }

    //   // Use bcrypt to compare the submitted password with the stored hash
    //   bcrypt.compare(password, admin.password, (err, result) => {
    //     if (err || !result) {
    //       console.log("Error finding admin's password")

    //       res
    //         .status(401)
    //         .render("admin/login", { message: "Invalid email or password" });
    //       return;
    //     }

    //     // If password is correct, create a JWT token
    //     const token = jwt.sign(
    //       { id: admin._id, email: admin.email },
    //       process.env.ADMIN_JWT_SECRET,
    //       { expiresIn: "1h" } // Token expires in 1 hour
    //     );

    //     // Store the token in a cookie and redirect to the dashboard
    //     res.cookie("admin_jwt", token, { httpOnly: true, maxAge: 3600000 });
    //     res.redirect("/admin/dashboard");
    //   });
    // });
  
  
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

// Add a new student
exports.new_student_page = (req, res) => {
  res.render("admin/new_student.mustache", { title: "Add New Student" });
};

exports.create_student = async (req, res) => {
  try {
    await studentModel.addStudent(req.body);
    res.redirect("/admin/students");
  } catch (error) {
    res.status(500).render("error", { message: "Error adding student" });
  }
};

// Edit a student record
exports.edit_student_page = async (req, res) => {
  try {
    const student = await studentModel.getStudentById(req.params.id);
    // console.log("Fetched Student:", student);
    res.render("admin/edit_student", { title: "Edit Student", student });
  } catch (error) {
    // console.error("Error fetching student:", error);
    res.status(500).render("error", {
      message: "Error retrieving student information",
    });
  }
};

exports.update_student = async (req, res) => {
  try {
    await studentModel.updateStudent(req.params.id, req.body);
    // console.log(req.body);
    res.redirect("/admin/students");
  } catch (error) {
    res.status(500).render("error", { message: "Error updating student" });
  }
};

// Delete a student record
exports.delete_student = async (req, res) => {
  try {
    const studentId = req.params.id; // Assuming you use _id as the parameter
    await studentModel.deleteStudent(studentId);
    res.redirect("/admin/students");
  } catch (error) {
    res.status(500).render("error", { message: "Error deleting student" });
  }
};

// List all opportunities with sorting
exports.list_opportunities = async (req, res) => {
  try {
    // console.log("Before getting opportunities");
    let opportunities = await opportunityModel.getAllOpportunities();
    // console.log("After getting opportunities");
    opportunities.sort((a, b) => a.title.localeCompare(b.title));
    // console.log("Opportunities", opportunities);
    res.render("admin/manage_opportunities", {
      title: "Manage Opportunities",
      opportunities,
    });
  } catch (error) {
    // console.error("Error retrieving opportunities", error);
    res
      .status(500)
      .render("error", { message: "Error retrieving opportunities" });
  }
};

// Assuming opportunityModel is already created and has the necessary methods

// Display the form for adding a new opportunity
exports.new_opportunity_page = async (req, res) => {
  try {
    const mentors = await mentorModel.getAllMentors();
    res.render("admin/new_opportunity", {
      title: "Add New Opportunity",
      mentors,
    });
  } catch (error) {
    res.status(500).render("error", { message: "Error retrieving mentors" });
  }
};

// Process the form data and add a new opportunity
exports.create_opportunity = async (req, res) => {
  try {
    const { title, description, category, mentorId } = req.body;
    await opportunityModel.addOpportunity(
      title,
      description,
      category,
      mentorId
    );
    res.redirect("/admin/opportunities");
  } catch (error) {
    res.status(500).render("error", { message: "Error creating opportunity" });
  }
};

// Display the form for editing an existing opportunity
exports.edit_opportunity_page = async (req, res) => {
  try {
    const opportunity = await opportunityModel.getOpportunityById(req.params.id);
    const mentors = await mentorModel.getAllMentors();

    // Map mentors to include isSelected property
    const mentorOptions = mentors.map((mentor) => ({
      _id: mentor._id,
      name: mentor.name,
      isSelected: mentor._id === opportunity.mentorId,
    }));

    // Prepare data for the template
    const templateData = {
      title: "Edit Opportunity",
      opportunity,
      mentorOptions,
      categories: [
        {
          value: "Career advice",
          selected: opportunity.category === "Career advice",
        },
        {
          value: "Resume review",
          selected: opportunity.category === "Resume review",
        },
        {
          value: "Mock interview",
          selected: opportunity.category === "Mock interview",
        },
      ],
    };

    res.render("admin/edit_opportunity", templateData);
  } catch (error) {
    res.status(500).render("error", { message: "Error retrieving opportunity" });
  }
};



// Process the form data and update an existing opportunity
exports.update_opportunity = async (req, res) => {
  try {
    await opportunityModel.updateOpportunity(req.params.id, req.body);
    res.redirect("/admin/opportunities");
  } catch (error) {
    res.status(500).render("error", { message: "Error updating opportunity" });
  }
};

// Process the request to delete an opportunity
exports.delete_opportunity = async (req, res) => {
  try {
    await opportunityModel.deleteOpportunity(req.params.id);
    res.redirect("/admin/opportunities");
  } catch (error) {
    res.status(500).render("error", { message: "Error deleting opportunity" });
  }
};

// List all mentors
exports.list_mentors = async (req, res) => {
  try {
    const mentors = await mentorModel.getAllMentors();
    // console.log("Mentors:", mentors);
    res.render("admin/manage_mentors", { title: "Manage Mentors", mentors });
  } catch (error) {
    // console.error("Error retrieving mentor records:", error);
    res
      .status(500)
      .render("error", { message: "Error retrieving mentor records" });
  }
};

// Add a new mentor
// Add a new student
exports.new_mentor_page = (req, res) => {
  res.render("admin/new_mentor", { title: "Add New Mentor" });
};

exports.create_mentor = async (req, res) => {
  try {
    const { name, expertise, email, password } = req.body; // Destructure email and password from req.body
    await mentorModel.addMentor(name, expertise, email, password); // Pass email and password to addMentor
    res.redirect("/admin/mentors");
  } catch (error) {
    console.error("Error creating mentor:", error);
    res.status(500).render("error", { message: "Error adding mentor" });
  }
};

// Display the form for editing an existing mentor
exports.edit_mentor_page = async (req, res) => {
  try {
    const mentor = await mentorModel.getMentorById(req.params.id);

    // Prepare data for the template
    const templateData = {
      title: "Edit Mentor",
      mentor,
      expertiseOptions: [
        {
          value: "Career advice",
          label: "Career Advice",
          selected: mentor.expertise === "Career advice",
        },
        {
          value: "Resume review",
          label: "Resume Review",
          selected: mentor.expertise === "Resume review",
        },
        {
          value: "Mock interview",
          label: "Mock Interview",
          selected: mentor.expertise === "Mock interview",
        },
      ],
    };

    res.render("admin/edit_mentor", templateData);
  } catch (error) {
    res.status(500).render("error", {
      message: "Error retrieving mentor information",
    });
  }
};


// Update a mentor record
exports.update_mentor = async (req, res) => {
  try {
    const { name, expertise, email, password } = req.body;
    const mentorId = req.params.id;

    // Check if the password is provided and hash it
    let hashedPassword;
    if (password) {
      hashedPassword = await bcrypt.hash(password, 10);
    }

    // Update mentor information
    const update = {
      name,
      email,
      expertise: expertise,
      ...(hashedPassword && { password: hashedPassword }), // Update password only if provided
    };

    // console.log(update);
    await mentorModel.updateMentor(mentorId, update);
    res.redirect("/admin/mentors");
  } catch (error) {
    console.error("Error updating mentor:", error);
    res.status(500).render("error", { message: "Error updating mentor" });
  }
};

// Delete a mentor record
exports.delete_mentor = async (req, res) => {
  try {
    await mentorModel.deleteMentor(req.params.id);
    res.redirect("/admin/mentors");
  } catch (error) {
    res.status(500).render("error", { message: "Error deleting mentor" });
  }
};
