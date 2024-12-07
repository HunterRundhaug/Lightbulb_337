// Hunter Rundhaug - Theodore Reyes
//
// Base js node file for final project

// Import statements
const express = require('express');
const mongoose = require('mongoose');


// Sets up express app, port number
const app = express();
const port = 3000;

// MIDDLE-WARE
app.use(express.json());
app.use(express.static("public_html/signIn/"));

// TODO: make routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Route for recieving account data...
app.get('/getUserData/:userName', async (req, res) => {
    let inputUserName = req.params.userName;
    const userData = await User.findOne({ userName: inputUserName });
    if(userData != null){
        res.status(200).json(userData);
    }
});

// Route for adding new user to database
// TODO: change back to post once ready for testing
app.get('/makeNewUser/:userName/:displayName', async (req, res) => {

    let inputUserName = req.params.userName;
    let inputDisplayName = req.params.displayName;

    // Checks if user already exists, and responds by either creating a new user or letting
    // the user know that one with the given userName already exists
    const userAlreadyExists = await User.findOne({ userName: inputUserName });
    if (userAlreadyExists) {
       res.send("User name already exists");
    } else {
        let newUser = new User({
            userName: inputUserName,
            dispName: inputDisplayName,
            followList: [],
            bio: "",
            status: ""
        });
        await newUser.save();
        res.send("User added successfully");
    }

});

// Route for creating a new post
// TODO: Check if content is empty
// TODO: Check if no such author exists
// TODO: Check if too long (?)
// TODO: Change to post
app.get("/makeNewPost/:userName/:content", async (req, res) => {

    let inputUserName = req.params.userName;
    let inputContent = req.params.content;

    // Finds db ID of the user who created the post
    let userID = await User.findOne({ userName: inputUserName });

    // Creates new post in database
    let newPost = new Post({
        authorUser: userID._id,
        content: inputContent,
        thumbsUpCount: 0,
        thumbsDownCount: 0,
        timestamp: Date.now()
    });
    await newPost.save();
    res.send("Post added successfully");
});

app.get("/makeNewComment/:postID/:content", async (req, res) => {

    let inputUserName = req.params.userName;
    let inputContent = req.params.content;

    let 

})

// Starts up express server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});

// Sets up connection to database
const mongoURL = "mongodb://127.0.0.1/lightbulbDB";
mongoose.connect(mongoURL)
    .then(() => console.log("Connected to MongoDB"))
    .catch((err) => console.error("MongoDB connection error:", err));

// Schema for User
const userSchema = new mongoose.Schema({
    dispName: String,
    userName: String,           // < -- used as unique ID within database
    followList: [{ type: mongoose.Types.ObjectId, ref: "User" }],
    bio: String,
    status: String
});
const User = mongoose.model("User", userSchema);

// Schema for Post
const postSchema = new mongoose.Schema({
    authorUser: { type: mongoose.Schema.Types.ObjectId, ref: "User"},
    content: String,
    thumbsUpCount: Number,
    thumbsDownCount: Number,
    timestamp: Date,
    postId: String
});

const Post = mongoose.model("Post", postSchema);

// Schema for Comment
// TODO: add author ID
const commentSchema = new mongoose.Schema({
    associatedPost: { type: mongoose.Schema.Types.ObjectId, ref: "Post"},
    content: String,
    timestamp: Date
});
const Comment = mongoose.model("Comment", commentSchema);

// ******* delete everything below lol

async function main() {

    // Dummy user create test
    let newUser = new User({
        userName: "Hunter",
        dispName: "hunter d",
        followList: [],
        bio: "1234",
        status: "abcd"
    });
    await newUser.save();

    // Dummy post create test
    let newPost = new Post ({
        authorUser: newUser._id,
        content: "Who up getting they triple collateral?",
        thumbsUpCount: 111,
        thumbsDownCount: 222,
        timestamp: Date.now()
    })
    await newPost.save();

    // Dummy comment create test
    let newComment = new Post ({
        associatedPost: newPost._id,
        content: "Hunter: me",
        timestamp: Date.now()
    });


}

main();