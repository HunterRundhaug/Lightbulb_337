// Hunter Rundhaug - Theodore Reyes
//
// Base js node file for final project

// Import statements
const express = require('express');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const mongoConnectStore = require('connect-mongo');
const path = require('path');

// Sets up express app, port number
const app = express();
const port = 3000;

// MIDDLE-WARE
app.use(express.json());
app.use(cookieParser());
app.use(express.static("public_html/signIn/"));
// Serve static files for main page (CSS, JS, etc.)
app.use('/main', express.static(path.join(__dirname, 'public_html', 'main')));
app.use('/loginPage', express.static(path.join(__dirname, 'public_html', 'signIn')));

app.use(
    session({
        secret: '12345',
        resave: false,
        saveUninitialized: false,
        store: mongoConnectStore.create({
            mongoUrl: 'mongodb://127.0.0.1/lightbulbDB',
            collectionName: 'Sessions', // collection name
        }),
        cookie: { secure: false },
    })
);

// Returns if the user has an active session with a valid username.
function isAuthenticated(req) {
    if (req.session.username) {
        return true;
    }
    else {
        return false;
    }
}

// ROUTES

// Get list of user accounts from search
app.post('/searchForUsers', async (req, res) => {


    try {
        // Make sure a user is signed in.
        if (!isAuthenticated(req)) {
            return res.status(403).send("not signed in");
        }

        const query = req.body.query;

        const accounts = await User.find({ dispName: new RegExp(query, 'i') }).limit(10);

        const clientDocument = await User.findOne({ userName: req.session.username });



        let clientFollowList = [];
        if (clientDocument) {
            clientFollowList = clientDocument.followList;
        }

        let usersPackaged = accounts.map(account => {
            const isFollowed = clientFollowList.includes(account.userName);
            const isClientsAccount = req.session.username === account.userName;
            return {
                isMe: isClientsAccount,
                isFollowing: isFollowed,
                userName: account.userName,
                dispName: account.dispName,
                status: account.status,
            }
        });



        res.json(usersPackaged);

    }
    catch (error) {
        console.log(error);
        res.status(500).send("internal server malfunction");
    }

});

// Get current user Route from session data
// Used for retrieving the currently signed in user on the main page.
app.get('/getCurrentUser', async (req, res) => {
    if (req.session.username) {
        try {
            const username = req.session.username;
            const currentUser = await User.findOne({ userName: username }); // get the current user document
            if (currentUser) {
                res.json({
                    dispName: currentUser.dispName,
                    userName: currentUser.userName,           // < -- used as unique ID within database
                    followList: currentUser.followList,
                    bio: currentUser.bio,
                    status: currentUser.status
                }); // Send the users display Name Back
            }
            else {
                res.status(404).json({ message: 'User not found' });
            }
        }
        catch (error) {
            res.status(500).json({ message: 'Server error' });
        }

    } else {
        res.status(401).json({ message: 'Not authenticated' });
    }
});

// Login Route
app.post('/login', async (req, res) => {
    const username = req.body.username; // Extract username from the request
    console.log("Username received:", username);

    try {
        const user = await User.findOne({ userName: username }); // Query database

        if (user) {
            req.session.username = username; // Save username in the session
            console.log("User authenticated. Redirecting to /main...");
            res.redirect('/main'); // Redirect to main page Route
        } else {
            res.status(404).send('User not found');
        }
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal server error');
    }
});

// Main Page Route
app.get('/main', (req, res) => {
    if (req.session.username) {
        // User is has a valid session, serve main page
        res.sendFile(path.join(__dirname, 'public_html', 'main'));
    } else {
        // User not authenticated, redirect to login page
        res.redirect(''); //to be determined.
    }
});

// Logout Route
app.post('/logout', (req, res) => {
    if (req.session.username) {
        // if the user has a valid session
        req.session.destroy(error => {
            if (error) {
                console.error("Error destroying session:", error);
                res.status(500).send('Internal server error');
                console.log("logoutError");
            } else {
                res.redirect('/loginPage'); // Redirect to login or home page
            }
        });
    }
    else {
        res.status(403).send("not logged in");
    }
});

app.get('/loginPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'signIn'));
});

// Route for adding new user to database
// TODO: change back to post once ready for testing
app.post('/makeNewUser', async (req, res) => {

    const inputUserName = req.body.username;
    const inputDisplayName = req.body.displayName;

    try {
        // Checks if user already exists, and responds by either creating a new user or letting
        // the user know that one with the given userName already exists
        const userAlreadyExists = await User.findOne({ userName: inputUserName });
        if (userAlreadyExists) {
            res.status(409).send("User name taken");
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
    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal server error');
    }

});

// Route for creating a new post
app.post("/makeNewPost", async (req, res) => {

    try {
        // If not auth then return and dont make new post.
        if (!isAuthenticated(req)) {
            res.status(403).send("not logged in");
            return
        }

        // Finds db ID of the user who created the post
        let userID = await User.findOne({ userName: req.session.username });

        const numberOfPost = await Post.countDocuments();
        postid = numberOfPost + 1;

        const inputContent = req.body.content;
        // Creates new post in database
        let newPost = new Post({
            authorUser: req.session.username,
            content: inputContent,
            thumbsUpCount: 0,
            thumbsDownCount: 0,
            timestamp: Date.now(),
            postId: postid
        });
        await newPost.save();
        res.send("Post added successfully");

    }
    catch (error) {
        console.log("error making new post " + error);
        res.status(error).send("Internal Server Error");
    }
});

// Route for updating user info for existing user
app.post("/updateUserInfo", async (req, res) => {

    const inputStatus = req.body.status;
    const inputDispName = req.body.dispname;
    const inputBio = req.body.bio;

    try {
        // Checks if session is valid
        if (req.session.username) {
            await User.updateOne(
                { userName: req.session.username },
                {
                    $set: {
                        dispName: inputDispName,
                        bio: inputBio,
                        status: inputStatus,
                    }
                }
            );
            res.send("Successfully updated profile!");
        } else { // If no session found
            res.status(404).send("Not signed in");
        }


    } catch (err) {
        console.error('Error querying the database:', err);
        res.status(500).send('Internal server error');
    }


});

// Route for getting a user's info, EX for populating a page with basic info on target user
app.get('/getRequestedUsersInfo/:user', async (req, res) => {

    if (!isAuthenticated(req)) {
        return;
    }

    // Finds requested user in DB
    const targetUserInfo = await User.findOne({ userName: req.params.user });
    if(!targetUserInfo){
        res.status(500).send("invalid User");
        return;
    }
    const clientDocument = await User.findOne({userName: req.session.username});
    const clientFollowing = clientDocument.followList;
    const isMe = targetUserInfo.userName === req.session.username;
    const isFollowing = clientFollowing.includes(targetUserInfo.userName);

    // Makes JSON with only the necessary info from user
    const targetUserInfoJSON = {
        dispName: targetUserInfo.dispName,
        userName: targetUserInfo.userName,
        bio: targetUserInfo.bio,
        status: targetUserInfo.status,
        numFollowing: targetUserInfo.followList.length,  // Stores # of users in follow lists
        isMe: isMe,
        isFollowing: isFollowing,
    };

    // Sends JSON of user info back to client
    res.send(targetUserInfoJSON);
});

// Route for adding someone to a follow list
app.post('/toggleFollowUser', async (req, res) => {
    if (!isAuthenticated(req)) {
        return;
    }

    // String of user to either add or remove
    const userToToggle = req.body.userToToggle;

    const username = req.session.username; // Gets current sessions username
    const currentUser = await User.findOne({ userName: username }); // Accesses their DB User doc

    console.log("User who made request to follow/unfollow: " + currentUser.userName);
    console.log("User to follow/unfollow: " + userToToggle);

    // Removes user if present
    if (currentUser.followList.includes(userToToggle)) {
        currentUser.followList.pull(userToToggle)
    } else {    // Else, adds user to follow list
        currentUser.followList.addToSet(userToToggle);
    }
    await currentUser.save(); // Updates DB

    res.send("Handled request successfully");
})

// get Route for getting main feed...
app.get("/getFeed", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not Signed in");
            return;
        }
        const userDocument = await User.findOne({ userName: req.session.username });
        console.log(userDocument.followList[0]);
        if (!userDocument) { // quick check for null value
            return res.status(500).send("current user not found!");
        }
        const followingList = userDocument.followList;

        const postList = await Post.find({ authorUser:  {$in: followingList} })
        .sort({ timestamp: -1 });
        
        let postsPackaged = postList.map(post => {
            return {
                username: post.authorUser,
                content: post.content,
                likes: post.thumbsUpCount,
                dislikes: post.thumbsDownCount,
                timestamp: post.timestamp,
                postId: post.postId,
            }
        });
        res.json(postsPackaged);

    }
    catch (error) {
        console.log("Error getting main feed: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// get Route for getting a single users Posts...
app.get("/getUserPosts/:username", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }
        const usernameToQuery = req.params.username;
        const profilePostDocuments = await Post.find({ authorUser: usernameToQuery });

        let postsPackaged = profilePostDocuments.map(post => {
            return {
                username: post.authorUser,
                content: post.content,
                likes: post.thumbsUpCount,
                dislikes: post.thumbsDownCount,
                timestamp: post.timestamp,
                postId: post.postId
            }
        });

        res.json(postsPackaged);

    }
    catch (error) {
        console.log("error in getUserPosts: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// get route for a post queried by its ID
app.get("/getUserPostByID/:paramPostID", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }
        const queryPostID = req.params.paramPostID;
        console.log(queryPostID);
        const queriedPost = await Post.findOne({ postId: queryPostID });
        // Sends post info back to client, strips out database info
        let postPackaged = {
            username: queriedPost.authorUser,
            content: queriedPost.content,
            likes: queriedPost.thumbsUpCount,
            dislikes: queriedPost.thumbsDownCount,
            timestamp: queriedPost.timestamp,
            postId: queriedPost.postId
        }
        // Sends json of post to client
        res.json(postPackaged);

    } catch (error) {
        console.log("error in getUserPostsByID: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// get route for receiving a list of comments associated with a post's ID
app.get("/getCommentsAssociatedWithPostID/:paramPostID", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }
        const queryPostID = req.params.paramPostID;
        const comments = await Comment.find({ associatedPost: queryPostID });

        // Builds JSON array of comments to return to client, strips out DB info
        let commentsArray = comments.map(comment => {
            return {
                associatedPost: comment.associatedPost,
                content: comment.content,
                timestamp: comment.timestamp,
                associatedUser: comment.associatedUser
            }
        });
        // Sends JSON array of comments back to client
        res.json(commentsArray);
    } catch (error) {
        console.log("error in getUserPostsByID: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// post route for creating a comment
app.post("/createComment", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }

        const postID = req.body.postId;
        const assocUser = req.session.username;
        const postContent = req.body.postContent;

        const newPost = await Comment.create({
            associatedPost: postID,
            content: postContent,
            timestamp: Date.now(),
            associatedUser: assocUser,
        });
        await newPost.save();

        res.send("new Comment Posted!");

    } catch (error) {
        console.log("error in createComment: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// Like/Dislike Routes
app.post("/like", async (req, res) => {
    try{    
        if(!isAuthenticated(req)){
            res.status(403).send("not signed in");
        }
        const reqPostId = req.body.postId;
        const postToLike = await Post.findOneAndUpdate(  //increment post like count
            { postId: reqPostId }, 
            { $inc: { thumbsUpCount: 1 } }, 
            { new: true }          
        );
        console.log("liked " + reqPostId);
        res.send(JSON.stringify(postToLike.thumbsUpCount));
    }
    catch(error){
        console.log("Error liking post " + error);
        res.status(500).send("internal server error liking post");
    }

});


// Route for disliking
app.post("/dislike", async (req, res) => {
    try{    
        if(!isAuthenticated(req)){
            res.status(403).send("not signed in");
        }
        const reqPostId = req.body.postId;
        const postToDislike = await Post.findOneAndUpdate(  //increment post dislike count
            { postId: reqPostId }, 
            { $inc: { thumbsDownCount: 1 } }, 
            { new: true }          
        );
        res.send(JSON.stringify(postToDislike.thumbsDownCount));
    }
    catch(error){
        console.log("Error liking post " + error);
        res.status(500).send("internal server error liking post");
    }
});

// TODO: implement
app.get("/makeNewComment/:postID/:content", async (req, res) => {

    let inputUserName = req.params.userName;
    let inputContent = req.params.content;
});

// Starts up express server
app.listen(port, "localhost", () => {
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
    followList: [String],
    bio: String,
    status: String
});
const User = mongoose.model("User", userSchema);

// Schema for Post
const postSchema = new mongoose.Schema({
    authorUser: String,
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
    associatedPost: String,
    associatedUser: String,
    content: String,
    timestamp: Date
});
const Comment = mongoose.model("Comment", commentSchema);
