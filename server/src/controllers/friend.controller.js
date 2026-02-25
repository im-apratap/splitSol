import { FriendRequest } from "../models/friendRequest.model.js";
import { User } from "../models/user.model.js";

export const sendFriendRequest = async (req, res) => {
  try {
    const { username } = req.body;
    const senderId = req.user._id;

    // Find the receiver
    const receiver = await User.findOne({ username });
    if (!receiver) {
      return res.status(404).json({ message: "User not found" });
    }

    if (senderId === receiver._id.toString()) {
      return res
        .status(400)
        .json({ message: "You cannot send a friend request to yourself" });
    }

    // Check if already friends
    const sender = await User.findById(senderId);
    if (sender.friends.includes(receiver._id)) {
      return res
        .status(400)
        .json({ message: "You are already friends with this user" });
    }

    // Check if a request already exists between these two users (in either direction)
    const existingRequest = await FriendRequest.findOne({
      $or: [
        { sender: senderId, receiver: receiver._id },
        { sender: receiver._id, receiver: senderId },
      ],
      status: "pending",
    });

    if (existingRequest) {
      if (existingRequest.sender.toString() === senderId) {
        return res.status(400).json({ message: "Friend request already sent" });
      } else {
        return res.status(400).json({
          message:
            "This user has already sent you a request. Please check your pending requests.",
        });
      }
    }

    // Create new request
    const newRequest = new FriendRequest({
      sender: senderId,
      receiver: receiver._id,
    });

    await newRequest.save();

    res.status(201).json({
      message: "Friend request sent successfully",
      request: newRequest,
    });
  } catch (error) {
    console.error("Error sending friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const acceptFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const receiverId = req.user._id;

    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: receiverId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    // Update request status
    request.status = "accepted";
    await request.save();

    // Add friends to each other's lists
    await User.findByIdAndUpdate(request.sender, {
      $addToSet: { friends: receiverId },
    });
    await User.findByIdAndUpdate(receiverId, {
      $addToSet: { friends: request.sender },
    });

    res.status(200).json({ message: "Friend request accepted" });
  } catch (error) {
    console.error("Error accepting friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const declineFriendRequest = async (req, res) => {
  try {
    const { requestId } = req.body;
    const receiverId = req.user._id;

    const request = await FriendRequest.findOne({
      _id: requestId,
      receiver: receiverId,
      status: "pending",
    });

    if (!request) {
      return res
        .status(404)
        .json({ message: "Friend request not found or already processed" });
    }

    request.status = "declined";
    await request.save();

    res.status(200).json({ message: "Friend request declined" });
  } catch (error) {
    console.error("Error declining friend request:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getFriends = async (req, res) => {
  try {
    const userId = req.user._id;

    const user = await User.findById(userId).populate(
      "friends",
      "name username email pubKey",
    );

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(user.friends);
  } catch (error) {
    console.error("Error fetching friends:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};

export const getPendingRequests = async (req, res) => {
  try {
    const userId = req.user._id;

    // We mainly care about requests sent TO this user
    const requests = await FriendRequest.find({
      receiver: userId,
      status: "pending",
    })
      .populate("sender", "name username pubKey")
      .sort({ createdAt: -1 });

    res.status(200).json(requests);
  } catch (error) {
    console.error("Error fetching pending requests:", error);
    res.status(500).json({ message: "Internal server error" });
  }
};
