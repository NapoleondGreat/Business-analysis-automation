const mongoose = require("mongoose");

const connect = mongoose.connect("mongodb://localhost:27017/Login-tut", {
  useUnifiedTopology: true, // Retain useUnifiedTopology for modern connection management
});

// Check database connection
connect
  .then(() => {
    console.log("Database Connected Successfully");
  })
  .catch((error) => {
    console.error("Database connection error:", error);
  });

// Create user schema
const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  password: {
    type: String,
    required: true,
  },
});

// Create business analysis schema
const businessAnalysisSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  market: String,
  organization: String,
  businessEnvironment: String,
  productsServices: String,
  coreBusiness: String,
  competition: String,
  resources: String,
  businessClimate: String,
  mission: String,
  internalStructure: String,
  geographicalStructure: String,
  processes: String,
  organisationalCulture: String,
  history: String,
  portfolio: String,
  services: String,
  purpose: String,
  strategy: String,
  coreCompetencies: String,
  finance: String,
  people: String,
  technology: String,
  skills: String,
  rawMaterial: String,
  assets: String,
  competitors: String,
  directSubstitutes: String,
  indirectSubstitutes: String,
  customers: String,
  consumers: String,
  channels: String,
  industries: String,
  suppliers: String,
  strategicAlliances: String,
  parentCompany: String,
  tradeUnions: String,
  professionalInstitutions: String,
  legislation: String,
  economy: String,
  culture: String,
});

// Create models
const User = mongoose.model("User", userSchema);
const BusinessAnalysis = mongoose.model(
  "BusinessAnalysis",
  businessAnalysisSchema
);

module.exports = { User, BusinessAnalysis };
