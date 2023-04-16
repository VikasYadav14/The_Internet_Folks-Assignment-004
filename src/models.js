const mongoose = require("mongoose");
const ID = mongoose.Schema.Types.ObjectId;
const { Snowflake } =require("@theinternetfolks/snowflake");

// --------- User Schema----------//

const userSchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: Snowflake.generate()
    },
    name: {
        type: String,
        lowercase: true,
        trim: true,
        minLength:2,
        required: true
    },
    email: {
        type: String,
        unique: true,
        required: true
    },
    password: {
        type: String,
        required: true
    }
}, { timestamps: true });

const userModel = mongoose.model('user', userSchema);


// --------- Community Schema----------//

const communitySchema = new mongoose.Schema({
    _id: {
        type: String,
        required: true,
        default: Snowflake.generate()
    },
    name: {
        type: String,
        trim: true,
        minLength:2,
        required: true
    },
    slug: {
        type: String,
        unique: true,
        lowercase: true,
        required: true
    },
    owner: {
        type: String,
        ref: 'user',
        required: true
    }
}, { timestamps: true });

const communityModel = mongoose.model('community', communitySchema);

// --------- Role Schema----------//

const roleSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        default:Snowflake.generate()
    },
    name: {
        type: String,
        enum:["Community Admin","Community Member","Community Moderator"],
        unique:true,
        required: true
    },
    scopes: {
        type: Array,
        required: true
    }
}, { timestamps: true})

const roleModel = mongoose.model('role', roleSchema)


// --------- Member Schema----------//

const memberSchema = new mongoose.Schema({
    _id:{
        type: String,
        required:true,
        default:Snowflake.generate()
    },
    community: {
        type: String,
        ref: 'community',
        required: true
    },
    user: {
        type: String,
        ref: 'user',
        required: true
    },
    role: {
        type: String,
        ref: 'role',
        required: true
    }
}, { timestamps: true })

const memberModel = mongoose.model('member', memberSchema)




module.exports = { userModel, communityModel, roleModel, memberModel }