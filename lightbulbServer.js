// Hunter Rundhaug - Theodore Reyes
//
// Base js node file for final project

// Import statements
const express = require('express');
const mongoose = require('mongoose');

// Sets up express app, port number
const app = express();
const port = 3000;

app.use(express.json());

// TODO: make routes
app.get('/', (req, res) => {
    res.send('Hello, World!');
});

// Route for adding new user to database
// TODO: Implement
app.post('/makeNewUser/:userName/:displayName', async (req, res) => {

    let userNameInput = req.params.userName;
    let displayName = req.params.displayName;
    console.log("userName");
    // Check if userName already exists.
    const User = mongoose.model("User", userSchema);

    const user = await User.findOne({ userName: userNameInput });
    if (user) {
       res.send("User name already exists");
    } else {
       res.send("User name available");
    }

});


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
    timestamp: Date
});
const Post = mongoose.model("Post", postSchema);

// Schema for Comment
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