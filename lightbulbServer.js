/**
 *  Authors: Theodore Reyes, Hunter Rundhaug
 *  File: lightbulbServer.js
 *  Purpose: This file is the main node web server that serves the lightbulb website. This
 *           file defines routes for GET/POST data, communicates with a mongodb database, and
 *           defines Schema for documents for said database server.
 */

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

// session middleware is used to manage user sessions
app.use(
    session({
        secret: '12345',
        resave: false,
        saveUninitialized: false,
        store: mongoConnectStore.create({
            mongoUrl: 'mongodb://127.0.0.1/lightbulbDB',
            collectionName: 'Sessions',
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

// ********** ROUTES 

// Route for handling search for users
app.post('/searchForUsers', async (req, res) => {
    try {
        if (!isAuthenticated(req))      // Verifies that the user is signed in
            return res.status(403).send("not signed in");
        const query = req.body.query;   // Gets the search query

        // Queries the database for users matching the search query & creates array for followlist
        const accounts = await User.find({ dispName: new RegExp(query, 'i') }).limit(10);
        const clientDocument = await User.findOne({ userName: req.session.username });
        let clientFollowList = [];
        if (clientDocument)
            clientFollowList = clientDocument.followList;

        // Assembles JSON of result
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
        res.json(usersPackaged);    // Sends response to user
    } catch (error) {
        console.log(error);
        res.status(500).send("Internal server error handling search request");
    }
});

// Get current user Route from session data
// Used for retrieving the currently signed in user on the main page
app.get('/getCurrentUser', async (req, res) => {

    // If user session exists, gets current user info
    if (req.session.username) {
        try {
            const username = req.session.username;

            // get the current user document
            const currentUser = await User.findOne({ userName: username });

            if (currentUser) {
                // Send the users info back to client
                res.json({
                    dispName: currentUser.dispName,
                    userName: currentUser.userName,
                    followList: currentUser.followList,
                    bio: currentUser.bio,
                    status: currentUser.status
                });
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

// Route for logging in a user
app.post('/login', async (req, res) => {

    // Gets username from request
    const username = req.body.username;

    try {
        // Queries database for user
        const user = await User.findOne({ userName: username });

        // If user exists, logs the user in
        if (user) {
            req.session.username = username; // Save username in the session
            console.log("User authenticated. Redirecting to /main...");
            res.redirect('/main'); // Redirect to main page Route
        }
        else {
            res.status(404).send('User not found'); // If no user found, sends 404
        }
    }
    catch (error) {
        res.status(500).send('Internal server error logging in');
    }
});

// Route for directing user to main page
app.get('/main', (req, res) => {

    // If user session is active (i.e they are logged in), then the user is routed to home page
    if (req.session.username) {
        // User is has a valid session, serve main page
        res.sendFile(path.join(__dirname, 'public_html', 'main'));
    }
    else {
        // User not authenticated, sends 403
        res.status(403).send("Session not authorized");
    }
});

// Route for logging out user
app.post('/logout', (req, res) => {

    // If user session is active (i.e they are logged in), then the user is logged out
    if (req.session.username) {

        // Session.destroy is used to end the session
        req.session.destroy(error => {
            if (error) {
                console.error("Error destroying session:", error);
                res.status(500).send('Internal server error');
                console.log("logoutError");
            } else {
                res.redirect('/loginPage'); // Redirects user to login or home page
            }
        });
    }
    else {
        res.status(403).send("not logged in");
    }
});

// Route for directing user to login page
app.get('/loginPage', (req, res) => {
    res.sendFile(path.join(__dirname, 'public_html', 'signIn'));
});

// Route for adding new user to database
app.post('/makeNewUser', async (req, res) => {

    // Gets username & displayname from request body
    const inputUserName = req.body.username;
    const inputDisplayName = req.body.displayName;

    try {
        // Checks if user already exists, and responds by either creating a new user or letting
        // the user know that one with the given userName already exists
        const userAlreadyExists = await User.findOne({ userName: inputUserName });
        if (userAlreadyExists) {
            res.status(409).send("User name taken");
        } else {
            let newUser = new User({        // Creates new user with default values,
                userName: inputUserName,    // and client supplied user & display name
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
        // If not authorized, returns and doesnt make new post
        if (!isAuthenticated(req)) {
            res.status(403).send("not logged in");
            return;
        }

        // Finds db ID of the user who created the post, and 
        const numberOfPost = await Post.countDocuments();
        postid = numberOfPost + 1;
        const inputContent = req.body.content;

        // Creates new post in database
        let newPost = new Post({
            authorUser: req.session.username, content: inputContent,
            thumbsUpCount: 0, thumbsDownCount: 0,
            timestamp: Date.now(), postId: postid
        });
        await newPost.save();                   // Updates DB
        res.send("Post added successfully");    // Sends user a success message
    }
    catch (error) {
        console.log("error making new post " + error);
        res.status(error).send("Internal Server Error");
    }
});

// Route for updating user info for existing user
app.post("/updateUserInfo", async (req, res) => {

    // Gets updated user info from request
    const inputStatus = req.body.status;
    const inputDispName = req.body.dispname;
    const inputBio = req.body.bio;

    try {
        // Updates info if session is valid
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
        } else { // If no session found, returns error
            res.status(404).send("Not signed in");
        }
    } catch (err) {
        res.status(500).send('Internal server error');
    }
});

// Route for getting a user's info, for example populating a page with basic info on req user
app.get('/getRequestedUsersInfo/:user', async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req))
            return;

        // Finds requested user in DB
        const targetUserInfo = await User.findOne({ userName: req.params.user });
        if (!targetUserInfo) {
            res.status(500).send("invalid User");
            return;
        }
        // Finds user in DB and retrieves some necessary information from this document
        const clientDocument = await User.findOne({ userName: req.session.username });
        const clientFollowing = clientDocument.followList;
        const isMe = targetUserInfo.userName === req.session.username;
        const isFollowing = clientFollowing.includes(targetUserInfo.userName);

        // Makes JSON with only the necessary info from user
        const targetUserInfoJSON = {
            dispName: targetUserInfo.dispName, userName: targetUserInfo.userName,
            bio: targetUserInfo.bio, status: targetUserInfo.status,
            numFollowing: targetUserInfo.followList.length, isMe: isMe, isFollowing: isFollowing
        };

        // Sends JSON of user info back to client
        res.send(targetUserInfoJSON);
    } catch (error) {
        res.status(500).send('Internal server error getting user info');
    }
});

// Route for adding someone to a follow list
app.post('/toggleFollowUser', async (req, res) => {
    // Checks to ensure if user is authenticated, returns if not
    if (!isAuthenticated(req))
        return;

    // String of user to either add or remove
    const userToToggle = req.body.userToToggle;

    const username = req.session.username; // Gets current sessions username
    const currentUser = await User.findOne({ userName: username }); // Accesses their DB User doc

    // Removes user if present
    if (currentUser.followList.includes(userToToggle)) {
        currentUser.followList.pull(userToToggle)
    } else {    // Else, adds user to follow list
        currentUser.followList.addToSet(userToToggle);
    }
    await currentUser.save(); // Updates DB

    res.send("Handled request successfully");
})

// Route for getting main feed...
app.get("/getFeed", async (req, res) => {
    try {
        if (!isAuthenticated(req)) {
            res.status(403).send("not Signed in");
            return;
        }
        // Gets user document from DB, and if doesn't find, sends error
        const userDocument = await User.findOne({ userName: req.session.username });
        if (!userDocument) { // Checks for null value
            return res.status(404).send("current user not found");
        }
        
        // Queries for all posts authored by users this user is following
        const followingList = userDocument.followList;
        const postList = await Post.find({ authorUser: { $in: followingList } })
            .sort({ timestamp: -1 });

        // Creates JSON of posts for feed, and sends back to client
        let postsPackaged = postList.map(post => {
            return {
                username: post.authorUser, content: post.content, likes: post.thumbsUpCount,
                dislikes: post.thumbsDownCount, timestamp: post.timestamp, postId: post.postId,
            }
        });
        res.json(postsPackaged);
    }
    catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route for getting a single users Posts...
app.get("/getUserPosts/:username", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }

        // Gets user info from request and queries the DB for posts from this user
        const usernameToQuery = req.params.username;
        const profilePostDocuments = await Post.find({ authorUser: usernameToQuery });

        // Creates JSON of posts authored by user, and sends to client
        let postsPackaged = profilePostDocuments.map(post => {
            return {
                username: post.authorUser, content: post.content, likes: post.thumbsUpCount,
                dislikes: post.thumbsDownCount, timestamp: post.timestamp, postId: post.postId
            }
        });
        res.json(postsPackaged);
    }
    catch (error) {
        console.log("error in getUserPosts: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// Route for a post queried by its ID
app.get("/getUserPostByID/:paramPostID", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }

        // Gets requested post by ID from url, and queries the DB for it
        const queryPostID = req.params.paramPostID;
        const queriedPost = await Post.findOne({ postId: queryPostID });

        // Creates JSON for requested post info, sends post info back to client
        let postPackaged = {
            username: queriedPost.authorUser,
            content: queriedPost.content,
            likes: queriedPost.thumbsUpCount,
            dislikes: queriedPost.thumbsDownCount,
            timestamp: queriedPost.timestamp,
            postId: queriedPost.postId
        }
        res.json(postPackaged);

    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route for receiving a list of comments associated with a post's ID
app.get("/getCommentsAssociatedWithPostID/:paramPostID", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }

        // Gets post ID from request and queries comments associated with this ID
        const queryPostID = req.params.paramPostID;
        const comments = await Comment.find({ associatedPost: queryPostID });

        // Builds JSON array of comments to return to client, strips out DB info
        let commentsArray = comments.map(comment => {
            return {
                associatedPost: comment.associatedPost, content: comment.content,
                timestamp: comment.timestamp, associatedUser: comment.associatedUser
            }
        });
        res.json(commentsArray);
    } catch (error) {
        res.status(500).send("Internal Server Error");
    }
});

// Route for creating a comment
app.post("/createComment", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in, cant see posts...");
            return;
        }
        // Gets necessary info from request
        const postID = req.body.postId;
        const assocUser = req.session.username;
        const postContent = req.body.postContent;

        // Avoids empty comments from being made
        if (postContent.length === 0) {
            res.status(400);
            return;
        }
        // Creates a comment in DB with info from the request, and saves to DB
        const newPost = await Comment.create({
            associatedPost: postID, content: postContent, timestamp: Date.now(),
            associatedUser: assocUser,
        });
        await newPost.save();   // Saves to DB

        // Sends user a success message
        res.send("new Comment Posted!");
    } catch (error) {
        console.log("error in createComment: " + error);
        res.status(500).send("Internal Server Error");
    }
});

// Route for liking a post
app.post("/like", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req))
            res.status(403).send("not signed in");

        // Gets post ID of post to like, updates it by adding 1 to thumbs up count
        const reqPostId = req.body.postId;
        const postToLike = await Post.findOneAndUpdate(  //increment post like count
            { postId: reqPostId },
            { $inc: { thumbsUpCount: 1 } },
            { new: true }
        );
        
        // Returns an updated count of the like number
        res.send(JSON.stringify(postToLike.thumbsUpCount));
    }
    catch (error) {
        console.log("Error liking post " + error);
        res.status(500).send("internal server error liking post");
    }
});

// Route for disliking a post
app.post("/dislike", async (req, res) => {
    try {
        // Checks if user is authenticated, returns if not
        if (!isAuthenticated(req)) {
            res.status(403).send("not signed in");
        }

        // Gets post ID of post to dislike, updates it by adding 1 to thumbs down count
        const reqPostId = req.body.postId;
        const postToDislike = await Post.findOneAndUpdate(  //increment post dislike count
            { postId: reqPostId },
            { $inc: { thumbsDownCount: 1 } },
            { new: true }
        );

        // Returns an updated count of the dislike number
        res.send(JSON.stringify(postToDislike.thumbsDownCount));
    }
    catch (error) {
        console.log("Error liking post " + error);
        res.status(500).send("internal server error liking post");
    }
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
const commentSchema = new mongoose.Schema({
    associatedPost: String,
    associatedUser: String,
    content: String,
    timestamp: Date
});
const Comment = mongoose.model("Comment", commentSchema);