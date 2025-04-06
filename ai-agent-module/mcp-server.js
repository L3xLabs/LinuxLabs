const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const multer = require("multer");
const path = require("path");

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 5000;
const JWT_SECRET = process.env.JWT_SECRET || "flowwbook-secret-key";

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(express.static("public"));

// MongoDB Connection
mongoose
  .connect(process.env.MONGODB_URI || "mongodb://localhost:27017/flowwbook", {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB Connected"))
  .catch((err) => console.error("MongoDB Connection Error:", err));

// File Upload Configuration
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "public/uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 10000000 }, // 10MB limit
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// Check File Type
function checkFileType(file, cb) {
  // Allowed file extensions
  const filetypes = /jpeg|jpg|png|gif|mp4|mov/;
  // Check extension
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  // Check mime
  const mimetype = filetypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb("Error: Images and Videos Only!");
  }
}

// Models
// User Model
const UserSchema = new mongoose.Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  profilePicture: { type: String, default: "default-profile.png" },
  coverPhoto: { type: String, default: "default-cover.png" },
  bio: { type: String },
  location: { type: String },
  birthday: { type: Date },
  friends: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  friendRequests: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  createdAt: { type: Date, default: Date.now },
});

// Post Model
const PostSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  text: { type: String },
  media: [{ type: String }],
  likes: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  comments: [
    {
      user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
      },
      text: { type: String, required: true },
      createdAt: { type: Date, default: Date.now },
    },
  ],
  privacy: {
    type: String,
    enum: ["public", "friends", "private"],
    default: "public",
  },
  createdAt: { type: Date, default: Date.now },
});

// Message Model
const MessageSchema = new mongoose.Schema({
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  text: { type: String },
  media: { type: String },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Notification Model
const NotificationSchema = new mongoose.Schema({
  recipient: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
  sender: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: {
    type: String,
    enum: ["like", "comment", "friendRequest", "acceptedRequest"],
    required: true,
  },
  post: { type: mongoose.Schema.Types.ObjectId, ref: "Post" },
  read: { type: Boolean, default: false },
  createdAt: { type: Date, default: Date.now },
});

// Create models
const User = mongoose.model("User", UserSchema);
const Post = mongoose.model("Post", PostSchema);
const Message = mongoose.model("Message", MessageSchema);
const Notification = mongoose.model("Notification", NotificationSchema);

// Auth Middleware
const auth = async (req, res, next) => {
  try {
    const token = req.header("Authorization").replace("Bearer ", "");
    const decoded = jwt.verify(token, JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      throw new Error();
    }

    req.token = token;
    req.user = user;
    next();
  } catch (error) {
    res.status(401).json({ message: "Authentication required" });
  }
};

// Routes

// Auth Routes
app.post("/api/register", async (req, res) => {
  try {
    const { firstName, lastName, email, password } = req.body;

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user
    user = new User({
      firstName,
      lastName,
      email,
      password: hashedPassword,
    });

    await user.save();

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Create token
    const token = jwt.sign({ id: user._id }, JWT_SECRET, { expiresIn: "1d" });

    res.json({
      token,
      user: {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        profilePicture: user.profilePicture,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// User Routes
app.get("/api/user", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user._id)
      .select("-password")
      .populate("friends", "firstName lastName profilePicture");

    res.json(user);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/user/:id", auth, async (req, res) => {
  try {
    const user = await User.findById(req.params.id)
      .select("-password")
      .populate("friends", "firstName lastName profilePicture");

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

app.put(
  "/api/user",
  auth,
  upload.single("profilePicture"),
  async (req, res) => {
    try {
      const updates = req.body;

      // If profile picture is uploaded
      if (req.file) {
        updates.profilePicture = `/uploads/${req.file.filename}`;
      }

      // Remove sensitive fields from updates
      delete updates.password;
      delete updates.email;

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: updates },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.put(
  "/api/user/cover",
  auth,
  upload.single("coverPhoto"),
  async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ message: "No file uploaded" });
      }

      const user = await User.findByIdAndUpdate(
        req.user._id,
        { $set: { coverPhoto: `/uploads/${req.file.filename}` } },
        { new: true }
      ).select("-password");

      res.json(user);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Server error" });
    }
  }
);

// Friend Request Routes
app.post("/api/friend-request/:id", auth, async (req, res) => {
  try {
    const recipient = await User.findById(req.params.id);

    if (!recipient) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request already sent
    if (recipient.friendRequests.includes(req.user._id)) {
      return res.status(400).json({ message: "Friend request already sent" });
    }

    // Check if already friends
    if (recipient.friends.includes(req.user._id)) {
      return res.status(400).json({ message: "Already friends" });
    }

    // Add to friend requests
    recipient.friendRequests.push(req.user._id);
    await recipient.save();

    // Create notification
    const notification = new Notification({
      recipient: recipient._id,
      sender: req.user._id,
      type: "friendRequest",
    });

    await notification.save();

    res.json({ message: "Friend request sent" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/friend-request/:id/accept", auth, async (req, res) => {
  try {
    const sender = await User.findById(req.params.id);

    if (!sender) {
      return res.status(404).json({ message: "User not found" });
    }

    // Check if request exists
    if (!req.user.friendRequests.includes(sender._id)) {
      return res
        .status(400)
        .json({ message: "No friend request from this user" });
    }

    // Remove from friend requests
    req.user.friendRequests = req.user.friendRequests.filter(
      (id) => id.toString() !== sender._id.toString()
    );

    // Add to friends for both users
    req.user.friends.push(sender._id);
    sender.friends.push(req.user._id);

    await req.user.save();
    await sender.save();

    // Create notification
    const notification = new Notification({
      recipient: sender._id,
      sender: req.user._id,
      type: "acceptedRequest",
    });

    await notification.save();

    res.json({ message: "Friend request accepted" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

app.post("/api/friend-request/:id/reject", auth, async (req, res) => {
  try {
    // Remove from friend requests
    req.user.friendRequests = req.user.friendRequests.filter(
      (id) => id.toString() !== req.params.id
    );

    await req.user.save();

    res.json({ message: "Friend request rejected" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Post Routes
app.post("/api/posts", auth, upload.array("media", 5), async (req, res) => {
  try {
    const { text, privacy } = req.body;

    // Create post object
    const postData = {
      user: req.user._id,
      text,
      privacy: privacy || "public",
    };

    // If media files are uploaded
    if (req.files && req.files.length > 0) {
      postData.media = req.files.map((file) => `/uploads/${file.filename}`);
    }

    const post = new Post(postData);
    await post.save();

    // Populate user info
    const populatedPost = await Post.findById(post._id)
      .populate("user", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture");

    res.status(201).json(populatedPost);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/posts", auth, async (req, res) => {
  try {
    // Get posts from user and their friends
    const posts = await Post.find({
      $or: [
        { user: req.user._id }, // User's own posts
        { user: { $in: req.user.friends }, privacy: { $ne: "private" } }, // Friends' posts that aren't private
        { privacy: "public" }, // All public posts
      ],
    })
      .sort({ createdAt: -1 }) // Most recent first
      .populate("user", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture")
      .limit(20);

    res.json(posts);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id)
      .populate("user", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture");

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user has permission to view this post
    const isOwner = post.user._id.toString() === req.user._id.toString();
    const isFriend = req.user.friends.includes(post.user._id);

    if (post.privacy === "private" && !isOwner) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this post" });
    }

    if (post.privacy === "friends" && !isOwner && !isFriend) {
      return res
        .status(403)
        .json({ message: "Not authorized to view this post" });
    }

    res.json(post);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

app.delete("/api/posts/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if user owns the post
    if (post.user.toString() !== req.user._id.toString()) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this post" });
    }

    await post.remove();

    res.json({ message: "Post removed" });
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Like/Unlike Post
app.put("/api/posts/:id/like", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Check if post has already been liked by user
    if (post.likes.includes(req.user._id)) {
      // Unlike
      post.likes = post.likes.filter(
        (like) => like.toString() !== req.user._id.toString()
      );
    } else {
      // Like
      post.likes.push(req.user._id);

      // Create notification if not the post owner
      if (post.user.toString() !== req.user._id.toString()) {
        const notification = new Notification({
          recipient: post.user,
          sender: req.user._id,
          type: "like",
          post: post._id,
        });

        await notification.save();
      }
    }

    await post.save();

    res.json(post.likes);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Comment on Post
app.post("/api/posts/:id/comment", auth, async (req, res) => {
  try {
    const { text } = req.body;

    if (!text) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    const post = await Post.findById(req.params.id);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Add comment
    const newComment = {
      user: req.user._id,
      text,
    };

    post.comments.push(newComment);
    await post.save();

    // Populate the new comment
    const populatedPost = await Post.findById(post._id)
      .populate("user", "firstName lastName profilePicture")
      .populate("comments.user", "firstName lastName profilePicture");

    // Create notification if not the post owner
    if (post.user.toString() !== req.user._id.toString()) {
      const notification = new Notification({
        recipient: post.user,
        sender: req.user._id,
        type: "comment",
        post: post._id,
      });

      await notification.save();
    }

    res.json(populatedPost.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Delete Comment
app.delete("/api/posts/:postId/comment/:commentId", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.postId);

    if (!post) {
      return res.status(404).json({ message: "Post not found" });
    }

    // Find the comment
    const comment = post.comments.find(
      (comment) => comment._id.toString() === req.params.commentId
    );

    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    // Check if user is authorized to delete comment
    if (
      comment.user.toString() !== req.user._id.toString() &&
      post.user.toString() !== req.user._id.toString()
    ) {
      return res
        .status(403)
        .json({ message: "Not authorized to delete this comment" });
    }

    // Remove comment
    post.comments = post.comments.filter(
      (comment) => comment._id.toString() !== req.params.commentId
    );

    await post.save();

    res.json(post.comments);
  } catch (error) {
    console.error(error);
    if (error.kind === "ObjectId") {
      return res.status(404).json({ message: "Post or comment not found" });
    }
    res.status(500).json({ message: "Server error" });
  }
});

// Message Routes
app.post(
  "/api/messages/:userId",
  auth,
  upload.single("media"),
  async (req, res) => {
    try {
      const { text } = req.body;
      const recipient = await User.findById(req.params.userId);

      if (!recipient) {
        return res.status(404).json({ message: "User not found" });
      }

      // Create message
      const messageData = {
        sender: req.user._id,
        recipient: recipient._id,
        text,
      };

      // If media is uploaded
      if (req.file) {
        messageData.media = `/uploads/${req.file.filename}`;
      }

      const message = new Message(messageData);
      await message.save();

      // Populate sender info
      const populatedMessage = await Message.findById(message._id).populate(
        "sender",
        "firstName lastName profilePicture"
      );

      res.status(201).json(populatedMessage);
    } catch (error) {
      console.error(error);
      if (error.kind === "ObjectId") {
        return res.status(404).json({ message: "User not found" });
      }
      res.status(500).json({ message: "Server error" });
    }
  }
);

app.get("/api/messages/:userId", auth, async (req, res) => {
  try {
    const messages = await Message.find({
      $or: [
        { sender: req.user._id, recipient: req.params.userId },
        { sender: req.params.userId, recipient: req.user._id },
      ],
    })
      .sort({ createdAt: 1 })
      .populate("sender", "firstName lastName profilePicture");

    res.json(messages);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.get("/api/conversations", auth, async (req, res) => {
  try {
    // Find all messages where user is either sender or recipient
    const messages = await Message.find({
      $or: [{ sender: req.user._id }, { recipient: req.user._id }],
    })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName profilePicture")
      .populate("recipient", "firstName lastName profilePicture");

    // Create a map of conversations
    const conversationsMap = new Map();

    messages.forEach((message) => {
      const otherUserId =
        message.sender._id.toString() === req.user._id.toString()
          ? message.recipient._id.toString()
          : message.sender._id.toString();

      if (!conversationsMap.has(otherUserId)) {
        const otherUser =
          message.sender._id.toString() === req.user._id.toString()
            ? message.recipient
            : message.sender;

        conversationsMap.set(otherUserId, {
          user: otherUser,
          lastMessage: message,
          unreadCount:
            message.sender._id.toString() !== req.user._id.toString() &&
            !message.read
              ? 1
              : 0,
        });
      } else if (
        !message.read &&
        message.sender._id.toString() !== req.user._id.toString()
      ) {
        // Increment unread count
        const conversation = conversationsMap.get(otherUserId);
        conversation.unreadCount += 1;
      }
    });

    // Convert map to array
    const conversations = Array.from(conversationsMap.values());

    res.json(conversations);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/messages/:userId/read", auth, async (req, res) => {
  try {
    // Mark all messages from userId to current user as read
    await Message.updateMany(
      { sender: req.params.userId, recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Messages marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Notification Routes
app.get("/api/notifications", auth, async (req, res) => {
  try {
    const notifications = await Notification.find({ recipient: req.user._id })
      .sort({ createdAt: -1 })
      .populate("sender", "firstName lastName profilePicture")
      .populate("post");

    res.json(notifications);
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

app.put("/api/notifications/read", auth, async (req, res) => {
  try {
    await Notification.updateMany(
      { recipient: req.user._id, read: false },
      { $set: { read: true } }
    );

    res.json({ message: "Notifications marked as read" });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Search Route
app.get("/api/search", auth, async (req, res) => {
  try {
    const { query } = req.query;

    if (!query) {
      return res.status(400).json({ message: "Search query is required" });
    }

    // Search for users
    const users = await User.find({
      $or: [
        { firstName: { $regex: query, $options: "i" } },
        { lastName: { $regex: query, $options: "i" } },
        { email: { $regex: query, $options: "i" } },
      ],
    })
      .select("firstName lastName profilePicture")
      .limit(10);

    // Search for posts (only public or from friends)
    const posts = await Post.find({
      $and: [
        { text: { $regex: query, $options: "i" } },
        {
          $or: [
            { user: req.user._id }, // User's own posts
            { user: { $in: req.user.friends }, privacy: { $ne: "private" } }, // Friends' posts that aren't private
            { privacy: "public" }, // All public posts
          ],
        },
      ],
    })
      .populate("user", "firstName lastName profilePicture")
      .limit(10);

    res.json({ users, posts });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Server error" });
  }
});

// Start Server
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
