exports.home_page = (req, res) => {
    // Render a view for the home page
    res.render('home', { title: 'Home' });
};
  
exports.about_page = (req, res) => {
    // Render a view for the About Us page
    res.render('about', { title: 'About Us' });
};
  