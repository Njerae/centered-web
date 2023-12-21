const jwt = require("jsonwebtoken");
require("dotenv").config();

const studentModel = require("../models/student.js");
const mentorModel = require("../models/mentor.js");
const opportunityModel = require("../models/opportunity.js");


exports.login_page = (req, res) => {
  // Render the login page view
  res.render("students/login", { title: "Student Login" });
};

exports.dashboard_page = async (req, res) => {
  try {
    // Ensure req.student is populated by your auth middleware
    const email = req.student.email;
    const studentData = await studentModel.findStudentByEmail(email);

    // Transform goals into the expected format for the template
    const goalsForTemplate = studentData.goals.map((goal) => {
      return {
        goalDescription: goal.description, // Make sure to use goal.description
        id: goal.id, // Use the unique identifier assigned to each goal
        completed: goal.completed, // Pass the completion status as well
      };
    });

    // Render the student dashboard page view after successful login
    res.render("students/dashboard", {
      title: "Dashboard",
      studentEmail: studentData.email, // Pass the email to use as the identifier
      goals: goalsForTemplate, // Pass the transformed goals
      // Pass any other required data for opportunities or other dashboard elements
    });
  } catch (error) {
    console.error("Dashboard loading error:", error);
    res.status(500).send("Error loading dashboard");
  }
};

// ... Other methods like handling login submission, registration, viewing and managing opportunities ...
exports.register_page = (req, res) => {
  res.render("students/registration", { title: "Student Registration" });
};

exports.process_registration = async (req, res) => {
  const { name, email, password } = req.body;
  try {
    const student = await studentModel.addStudent(name, email, password);
    // If successful, redirect to the login page
    res.redirect("/student/login");
  } catch (error) {
    // If an error occurs, send a response with the error message
    res.status(500).send(error);
  }
};

// Assume studentModel.findStudentByEmail and a comparePassword method exists
exports.process_login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const student = await studentModel.findStudentByEmail(email);
    if (!student) {
      return res.status(401).send("Authentication failed");
    }
    const isMatch = await studentModel.comparePassword(
      password,
      student.password
    );
    if (isMatch) {
      // Create token, set cookie, and redirect to dashboard
      const accessToken = jwt.sign(
        { email: student.email },
        process.env.ACCESS_TOKEN_SECRET
      );
      res.cookie("jwt", accessToken).redirect("/student/dashboard");
    } else {
      res.status(401).send("Password incorrect");
    }
  } catch (error) {
    res.status(500).send("An error occurred during login");
  }
};

// Rendering opportunities for students
exports.view_opportunities = async (req, res) => {
  try {
    // console.log("Before getting opportunities");
    let opportunities = await opportunityModel.getAllOpportunities();
    // console.log("After getting opportunities");
    opportunities.sort((a, b) => a.title.localeCompare(b.title));
    // console.log("Opportunities", opportunities);
    res.render("students/opportunities", {
      title: "Check out Opportunities",
      opportunities,
    });
  } catch (error) {
    // console.error("Error retrieving opportunities", error);
    res
      .status(500)
      .render("error", { message: "Error retrieving opportunities" });
  }
};

// Display the form for editing an existing opportunity
exports.view_opportunity_page = async (req, res) => {
  try {
    const opportunity = await opportunityModel.getOpportunityById(
      req.params.id
    );
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
    };

    res.render("students/view_opportunity", templateData);
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving opportunity" });
  }
};

// Register opportunity for students
exports.register_interest = async (req, res) => {
  try {
    const studentEmail = req.student.email; // Assuming the student's ID is stored in req.student
    const opportunityId = req.params.id; // The ID of the opportunity
    // console.log(req.params);
    await studentModel.addOpportunityToStudent(studentEmail, opportunityId);
    res.redirect("/student/registered-opportunities"); // Redirect to the dashboard after adding the opportunity
  } catch (error) {
    console.log(error);
    res.status(500).send(error.message);
  }
};

// Registered opportunities
exports.list_registered_opportunities = async (req, res) => {
  const email = req.student.email;

  try {
    const student = await studentModel.findStudentByEmail(email);
    // console.log("this is a student", student);

    if (!student) {
      return res.status(404).send("Student not found");
    }

    const opportunities = student.opportunities;

    const registeredOpportunities = opportunities.filter(
      (opportunity) => opportunity.registered
    );
    const unregisteredOpportunities = opportunities.filter(
      (opportunity) => !opportunity.registered
    );

    const registeredDetailsPromises = registeredOpportunities.map(
      async (opportunity) => {
        const opportunityDetails = await opportunityModel.getOpportunityById(
          opportunity.opportunityId
        );
        return {
          opportunityId: opportunity.opportunityId,
          registered: true,
          details: opportunityDetails,
        };
      }
    );

    const unregisteredDetailsPromises = unregisteredOpportunities.map(
      async (opportunity) => {
        const opportunityDetails = await opportunityModel.getOpportunityById(
          opportunity.opportunityId
        );
        return {
          opportunityId: opportunity.opportunityId,
          registered: false,
          details: opportunityDetails,
        };
      }
    );

    const registeredOpportunityDetails = await Promise.all(
      registeredDetailsPromises
    );
    const unregisteredOpportunityDetails = await Promise.all(
      unregisteredDetailsPromises
    );

    console.log("This is registered", registeredOpportunityDetails);
    console.log("This is cancelled", unregisteredOpportunityDetails);

    res.render("students/registeredOpportunities", {
      title: "My Opportunities",
      registeredOpportunityDetails,
      unregisteredOpportunityDetails,
    });
  } catch (err) {
    console.error(err);
    res.status(500).send("Error fetching registered opportunities");
  }
};

// Display the form for viewing an existing opportunity
exports.cancel_opportunity_page = async (req, res) => {
  try {
    const opportunity = await opportunityModel.getOpportunityById(
      req.params.id
    );
    // console.log("This is wild", req.params.id)
    const mentors = await mentorModel.getAllMentors();

    // Map mentors to include isSelected property
    const mentorOptions = mentors.map((mentor) => ({
      _id: mentor._id,
      name: mentor.name,
      isSelected: mentor._id === opportunity.mentorId,
    }));

    // Prepare data for the template
    const templateData = {
      title: "Cancel Opportunity",
      opportunity,
      mentorOptions,
    };

    res.render("students/cancel_opportunity", templateData);
  } catch (error) {
    res
      .status(500)
      .render("error", { message: "Error retrieving opportunity" });
  }
};

exports.cancel_interest = async (req, res) => {
  const studentEmail = req.student.email;
  const opportunityId = req.params.id;

  try {
    await studentModel.removeOpportunityFromStudent(
      studentEmail,
      opportunityId
    );
    res.redirect("/student/registered-opportunities");
  } catch (err) {
    console.log(err);
    res.status(500).send("Error canceling interest");
  }
};

// Function to serve the add goal form
exports.add_goal_page = (req, res) => {
  res.render("students/goals/addgoal", { title: "Add Goal" }); // Render the addGoal.mustache file
};
// Function to add a goal
exports.addGoal = async (req, res) => {
  try {
    const email = req.student.email; // Access the email from the verified student object
    const goal = req.body.goal; // Assuming goal data is sent in request body
    await studentModel.addGoalToStudent(email, goal);
    res.redirect("/student/dashboard"); // Redirect to the dashboard after adding the goal
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Function to update a goal's description
exports.updateGoal = async (req, res) => {
  try {
    const email = req.student.email; // Assuming there is a student object attached to req with an email
    const goalId = req.params.id; // The ID of the goal to update
    const newGoalDescription = req.body.description; // The new description from the request body

    // Update the goal's description
    await studentModel.updateGoalOfStudent(email, goalId, newGoalDescription);
    res.redirect("/student/dashboard"); // Redirect to the dashboard after updating the goal's description
  } catch (error) {
    res.status(500).send(error.message);
  }
};

// Function to remove a goal
exports.removeGoal = async (req, res) => {
  try {
    const email = req.student.email; // Replace with actual session retrieval
    const goalId = req.params.id; // The unique ID of the goal to remove
    await studentModel.removeGoalFromStudent(email, goalId);
    res.redirect("/student/dashboard"); // Redirect to the dashboard after removing the goal
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.completeGoal = async (req, res) => {
  try {
    const email = req.student.email; // Replace with actual session retrieval
    const goalId = req.params.id; // The ID of the goal to complete
    await studentModel.updateGoalCompletion(email, goalId, true);
    res.redirect("/student/dashboard"); // Redirect to the dashboard after marking the goal as complete
  } catch (error) {
    res.status(500).send(error.message);
  }
};

exports.toggleGoalCompletion = async (req, res) => {
  const email = req.student.email; // Ensure you have the student's email from the session
  const goalId = req.params.id; // The ID of the goal to toggle

  try {
    // Toggle the completion status of the goal and retrieve the updated goal
    const updatedGoal = await studentModel.toggleGoalCompletion(email, goalId);

    if (!updatedGoal) {
      return res.status(404).json({ error: "Goal not found" });
    }

    // Respond with the new completion status
    res.json({ completed: updatedGoal.completed });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};