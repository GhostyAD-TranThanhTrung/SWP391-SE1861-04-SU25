const { DataSource } = require("typeorm");
const ormConfig = require("../ormconfig");

// Import all entities with error handling
let User,
  Profile,
  Blog,
  Consultation,
  BookConsultationSession,
  ConsoleLog,
  Action,
  Assessment,
  Category,
  Program,
  Enroll,
  Content,
  Survey,
  SurveyResponse,
  TicketSupport,
  Flag;

try {
  // Import required entities
  User = require("./entities/User");
  Profile = require("./entities/Profile");

  // Optional entities - these will be undefined if files don't exist
  // and will be filtered out in the entities array
  try {
    Blog = require("./entities/Blog");
  } catch (e) {
    console.log("Blog entity not found, skipping");
  }
  try {
    Consultation = require("./entities/Consultation");
  } catch (e) {
    console.log("Consultation entity not found, skipping");
  }
  try {
    BookConsultationSession = require("./entities/BookConsultationSession");
  } catch (e) {
    console.log("BookConsultationSession entity not found, skipping");
  }
  try {
    ConsoleLog = require("./entities/ConsoleLog");
  } catch (e) {
    console.log("ConsoleLog entity not found, skipping");
  }
  try {
    Action = require("./entities/Action");
  } catch (e) {
    console.log("Action entity not found, skipping");
  }
  try {
    Assessment = require("./entities/Assessment");
  } catch (e) {
    console.log("Assessment entity not found, skipping");
  }
  try {
    Category = require("./entities/Category");
  } catch (e) {
    console.log("Category entity not found, skipping");
  }
  try {
    Program = require("./entities/Program");
  } catch (e) {
    console.log("Program entity not found, skipping");
  }
  try {
    Enroll = require("./entities/Enroll");
  } catch (e) {
    console.log("Enroll entity not found, skipping");
  }
  try {
    Content = require("./entities/Content");
  } catch (e) {
    console.log("Content entity not found, skipping");
  }
  try {
    Survey = require("./entities/Survey");
  } catch (e) {
    console.log("Survey entity not found, skipping");
  }
  try {
    SurveyResponse = require("./entities/SurveyResponse");
  } catch (e) {
    console.log("SurveyResponse entity not found, skipping");
  }
  // try {
  //   TicketSupport = require("./entities/TicketSupport");
  // } catch (e) {
  //   console.log("TicketSupport entity not found, skipping");
  // }
  try {
    Flag = require("./entities/Flag");
  } catch (e) {
    console.log("Flag entity not found, skipping");
  }
} catch (err) {
  console.error("Error importing required entities:", err);
  process.exit(1); // Exit if required entities can't be loaded
}

// Create the data source with all available entities
const AppDataSource = new DataSource({
  ...ormConfig,
  entities: [
    User,
    Profile,
    Blog,
    Consultation,
    BookConsultationSession,
    ConsoleLog,
    Action,
    Assessment,
    Category,
    Program,
    Enroll,
    Content,
    Survey,
    SurveyResponse,
    TicketSupport,
    Flag,
  ].filter((entity) => entity !== undefined), // Filter out any undefined entities
});

// Add initialization function with retry logic
AppDataSource.initializeWithRetry = async (retries = 5, interval = 5000) => {
  let currentTry = 0;

  while (currentTry < retries) {
    try {
      await AppDataSource.initialize();
      console.log("✅ Data Source has been initialized successfully!");
      console.log(
        `📊 Connected to database: ${ormConfig.database} on ${ormConfig.host}:${ormConfig.port}`
      );
      console.log(`🔗 Connection type: ${ormConfig.type}`);
      console.log(
        `📝 Entities loaded: ${AppDataSource.options.entities.length}`
      );
      return AppDataSource;
    } catch (err) {
      currentTry++;
      console.error(
        `❌ Data Source initialization failed (attempt ${currentTry}/${retries}):`
      );
      console.error(`🔴 Error: ${err.message}`);

      if (currentTry >= retries) {
        console.error("🚫 Maximum connection retries reached!");
        throw new Error(
          "Max connection retries reached. Could not connect to database."
        );
      }

      console.log(`⏳ Retrying in ${interval / 1000} seconds...`);
      await new Promise((resolve) => setTimeout(resolve, interval));
    }
  }
};

// Add utility method to check if connection is active
AppDataSource.isConnected = function () {
  return this.isInitialized;
};

module.exports = AppDataSource;
