const express = require('express');
const path = require("path");
const bcrypt = require("bcrypt");
const session = require('express-session');
const { User, BusinessAnalysis } = require("./config");
const PDFDocument = require('pdfkit');
const fs = require('fs');

const app = express();

// Middleware setup
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.set('view engine', 'ejs');
app.use(express.static("public"));

// Session handling
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Middleware to check session persistence
function ensureAuthenticated(req, res, next) {
    if (req.session.userId) {
        return next();
    } else {
        res.redirect('/');
    }
}

// Helper function to check if any field is empty
function isEmpty(value) {
    return !value || value.trim() === '';
}

// Function to validate form data
function validateForm(data, requiredFields) {
    for (const field of requiredFields) {
        if (isEmpty(data[field])) {
            return false;
        }
    }
    return true;
}

// Route to render the login page
app.get('/', (req, res) => {
    res.render("login");
});

// Route to render the signup page
app.get('/signup', (req, res) => {
    res.render('signup');
});

// Route to render the home page with Venn diagram input
app.get('/home', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });
        res.render('home', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business data:", error);
        res.status(500).send("Error loading page.");
    }
});

// Route to render the organisation set page
app.get('/organisation-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        res.render('organisation-set', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to render the product set page
app.get('/product-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        res.render('product-set', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to render the resource set page
app.get('/resource-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        res.render('resource-set', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to render the competitors set page
app.get('/competitors-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId }) || {};
        res.render('competitors-set', { businessData: businessData, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to render the environment set page
app.get('/environment-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        res.render('environment-set', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to render the climate set page
app.get('/climate-set', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        res.render('climate-set', { businessData: businessData || {}, error: null });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error fetching data");
    }
});

// Route to handle Venn diagram data submission
app.post("/submit-venn-data", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['market', 'organization', 'businessEnvironment', 'productsServices', 'coreBusiness', 'competition', 'resources', 'businessClimate'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('home', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        res.redirect('/organisation-set');
    } catch (error) {
        console.error("Error submitting Venn diagram data:", error);
        res.status(500).send("Error submitting Venn diagram data");
    }
});

// Route to handle signup
app.post("/signup", async (req, res) => {
    const data = {
        name: req.body.username,
        password: req.body.password
    };

    const existingUser = await User.findOne({ name: data.name });
    if (existingUser) {
        res.send(`
            <html>
                <head>
                    <title>Signup Error</title>
                </head>
                <body>
                    <h1>Username already exists!</h1>
                    <p>You will be redirected to the login page shortly.</p>
                    <script>
                        setTimeout(function() {
                            window.location.href = "/";
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    } else {
        const saltRounds = 10;
        const hashedPassword = await bcrypt.hash(data.password, saltRounds);
        data.password = hashedPassword;

        const userdata = await User.create(data);
        console.log(userdata);

        res.send(`
            <html>
                <head>
                    <title>Signup Successful</title>
                </head>
                <body>
                    <h1>User registered successfully!</h1>
                    <p>You will be redirected to the login page shortly.</p>
                    <script>
                        setTimeout(function() {
                            window.location.href = "/";
                        }, 3000);
                    </script>
                </body>
            </html>
        `);
    }
});

// Route to handle login
app.post("/login", async (req, res) => {
    try {
        const check = await User.findOne({ name: req.body.username });
        if (!check) {
            console.log("Login failed: Username not found.");
            return res.send("Username cannot be found.");
        }

        const isPasswordMatch = await bcrypt.compare(req.body.password, check.password);
        if (isPasswordMatch) {
            req.session.userId = check._id;
            console.log("Login successful. User ID set in session:", req.session.userId);
            return res.redirect('/home');
        } else {
            console.log("Login failed: Incorrect password.");
            return res.send("Wrong password");
        }
    } catch (error) {
        console.error("Login error:", error);
        return res.send("Wrong details");
    }
});

// Route to handle organisation set data submission
app.post("/submit-organisation-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['mission', 'internalStructure', 'geographicalStructure', 'processes', 'organisationalCulture', 'history'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('organisation-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to product set after successful submission.");
        res.redirect('/product-set');
    } catch (error) {
        console.error("Error submitting organisation set data:", error);
        res.status(500).send("Error submitting organisation set data");
    }
});

// Route to handle product set data submission
app.post("/submit-product-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['portfolio', 'services', 'purpose', 'strategy', 'coreCompetencies'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('product-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to resource set after successful submission.");
        res.redirect('/resource-set');
    } catch (error) {
        console.error("Error submitting product set data:", error);
        res.status(500).send("Error submitting product set data");
    }
});

// Route to handle resource set data submission
app.post("/submit-resource-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['finance', 'people', 'technology', 'skills', 'rawMaterial', 'assets'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('resource-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to competitors set after successful submission.");
        res.redirect('/competitors-set');
    } catch (error) {
        console.error("Error submitting resource set data:", error);
        res.status(500).send("Error submitting resource set data");
    }
});

// Route to handle competitors set data submission
app.post("/submit-competitors-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['competitors', 'substitutes', 'indirectSubstitutes', 'customers', 'consumers', 'channels'];
        
        if (!validateForm(data, requiredFields)) {
            console.log("Validation failed, returning to form with data.");
            return res.render('competitors-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to environment set after successful submission.");
        res.redirect('/environment-set');
    } catch (error) {
        console.error("Error submitting competitors set data:", error);
        res.status(500).send("Error submitting competitors set data");
    }
});

// Route to handle environment set data submission
app.post("/submit-environment-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['industries', 'suppliers', 'strategicAlliances', 'parentCompany', 'tradeUnions', 'institutions'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('environment-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to climate set after successful submission.");
        res.redirect('/climate-set');
    } catch (error) {
        console.error("Error submitting environment set data:", error);
        res.status(500).send("Error submitting environment set data");
    }
});

// Route to handle climate set data submission
app.post("/submit-climate-set", ensureAuthenticated, async (req, res) => {
    try {
        const data = req.body;
        const userId = req.session.userId;

        const requiredFields = ['legislation', 'economy', 'culture'];
        
        if (!validateForm(data, requiredFields)) {
            return res.render('climate-set', { 
                businessData: data, 
                error: "All fields are required." 
            });
        }

        let businessData = await BusinessAnalysis.findOne({ userId }) || new BusinessAnalysis({ userId });
        Object.assign(businessData, data);

        await businessData.save();
        console.log("Redirecting to final write-up after successful submission.");
        res.redirect('/final-write-up');
    } catch (error) {
        console.error("Error submitting climate set data:", error);
        res.status(500).send("Error submitting climate set data");
    }
});

// Route to render the final write-up page
app.get('/final-write-up', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        if (!businessData) {
            return res.status(404).send("Business analysis data not found.");
        }

        // Construct the final write-up
        const writeUp = `
        ${businessData.organization} ${businessData.coreBusiness} based in ${businessData.geographicalStructure} offering ${businessData.productsServices} to the ${businessData.market} market. 
        It is based in the ${businessData.industries} industry and its main competitors include ${businessData.competitors}. 
        The main resources of ${businessData.organization} include ${businessData.resources}. 
        The main external factors impacting ${businessData.organization} are ${businessData.businessClimate}.
        The company was founded in ${businessData.history} and has evolved by ${businessData.history}. 
        The company has a ${businessData.internalStructure} structure and a ${businessData.organisationalCulture} culture. 
        The main processes include ${businessData.processes}. 
        The mission of the company is to ${businessData.mission} and it achieves this by a strategy of ${businessData.strategy}. 
        The main source of income is ${businessData.finance}.
        The company employs ${businessData.people}, with key skills of ${businessData.skills}. 
        The main assets are ${businessData.assets}. 
        The company purchases raw materials such as ${businessData.rawMaterial} and uses ${businessData.technology}. 
        Resources are mainly purchased from ${businessData.suppliers}.
        The customers of ${businessData.organization} are ${businessData.customers} and consumers include ${businessData.consumers}. 
        Competition includes direct competitors ${businessData.competitors}, direct substitutes ${businessData.substitutes} and indirect substitutes ${businessData.indirectSubstitutes}. 
        The main channels are ${businessData.channels}.
        ${businessData.organization} has a parent company called ${businessData.parentCompany || "does not have a parent company"}.
        ${businessData.organization} has a strategic alliance with ${businessData.strategicAlliances || "does not have any strategic alliances"}.
        Staff in the company belong to ${businessData.tradeUnions} and ${businessData.professionalInstitutions}.
        `;

        // Render the final write-up page with the constructed write-up
        res.render('final-write-up', { writeUp });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error generating final write-up.");
    }
});

// Route to download the final write-up as a PDF
app.get('/download-write-up', ensureAuthenticated, async (req, res) => {
    try {
        const userId = req.session.userId;
        let businessData = await BusinessAnalysis.findOne({ userId });

        if (!businessData) {
            return res.status(404).send("Business analysis data not found.");
        }

        // Construct the final write-up
        const writeUp = `
        ${businessData.organization} ${businessData.coreBusiness} based in ${businessData.geographicalStructure} offering ${businessData.productsServices} to the ${businessData.market} market. 
        It is based in the ${businessData.industries} industry and its main competitors include ${businessData.competitors}. 
        The main resources of ${businessData.organization} include ${businessData.resources}. 
        The main external factors impacting ${businessData.organization} are ${businessData.businessClimate}.
        The company was founded in ${businessData.history} and has evolved by ${businessData.history}. 
        The company has a ${businessData.internalStructure} structure and a ${businessData.organisationalCulture} culture. 
        The main processes include ${businessData.processes}. 
        The mission of the company is to ${businessData.mission} and it achieves this by a strategy of ${businessData.strategy}. 
        The main source of income is ${businessData.finance}.
        The company employs ${businessData.people}, with key skills of ${businessData.skills}. 
        The main assets are ${businessData.assets}. 
        The company purchases raw materials such as ${businessData.rawMaterial} and uses ${businessData.technology}. 
        Resources are mainly purchased from ${businessData.suppliers}.
        The customers of ${businessData.organization} are ${businessData.customers} and consumers include ${businessData.consumers}. 
        Competition includes direct competitors ${businessData.competitors}, direct substitutes ${businessData.substitutes} and indirect substitutes ${businessData.indirectSubstitutes}. 
        The main channels are ${businessData.channels}.
        ${businessData.organization} has a parent company called ${businessData.parentCompany || "does not have a parent company"}.
        ${businessData.organization} has a strategic alliance with ${businessData.strategicAlliances || "does not have any strategic alliances"}.
        Staff in the company belong to ${businessData.tradeUnions} and ${businessData.professionalInstitutions}.
        `;

        // Create a new PDF document
        const doc = new PDFDocument();
        const pdfPath = path.join(__dirname, 'public', 'write-up.pdf');
        
        // Ensure the 'public' directory exists
        if (!fs.existsSync(path.join(__dirname, 'public'))) {
            fs.mkdirSync(path.join(__dirname, 'public'));
        }

        // Pipe the document to a writable stream
        const writeStream = fs.createWriteStream(pdfPath);
        doc.pipe(writeStream);

        // Add content to the PDF
        doc.fontSize(12).text(writeUp, {
            align: 'left'
        });

        // Finalize the PDF and end the stream
        doc.end();

        writeStream.on('finish', () => {
            // Send the PDF as a response to the client for download
            res.download(pdfPath, 'write-up.pdf', (err) => {
                if (err) {
                    console.error("Error sending PDF:", err);
                } else {
                    console.log("PDF downloaded successfully.");
                    // Optional: Delete the file after sending it
                    fs.unlinkSync(pdfPath);
                }
            });
        });
    } catch (error) {
        console.error("Error fetching business analysis data:", error);
        res.status(500).send("Error generating PDF.");
    }
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server running on Port: ${port}`);
});
