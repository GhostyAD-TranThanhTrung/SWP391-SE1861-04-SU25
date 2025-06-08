const { DataSource } = require('typeorm');
const ormConfig = require('../ormconfig');

// Import entities
const User = require('./entities/User.js');
const Profile = require('./entities/Profile.js');
const Consultant = require('./entities/Consultant.js');
const Slot = require('./entities/Slot.js');
const ConsultantSlot = require('./entities/ConsultantSlot.js');
const BookingSession = require('./entities/BookingSession.js');
const Blog = require('./entities/Blog.js');
const Flag = require('./entities/Flag.js');
const TicketSupport = require('./entities/TicketSupport.js');
const ConsoleLog = require('./entities/ConsoleLog.js');
const Action = require('./entities/Action.js');
const Assessment = require('./entities/Assessment.js');
const Category = require('./entities/Category.js');
const Program = require('./entities/Program.js');
const Enroll = require('./entities/Enroll.js');
const Content = require('./entities/Content.js');
const Survey = require('./entities/Survey.js');
const SurveyResponse = require('./entities/SurveyResponse.js');

const AppDataSource = new DataSource({
    ...ormConfig,
    entities: [
        User,
        Profile,
        Consultant,
        Slot,
        ConsultantSlot,
        BookingSession,
        Blog,
        Flag,
        TicketSupport,
        ConsoleLog,
        Action,
        Assessment,
        Category,
        Program,
        Enroll,
        Content,
        Survey,
        SurveyResponse
    ]
});

module.exports = AppDataSource;
