import mongoose from "mongoose"

const groupSchema = mongoose.Schema(
  {
    name: {
      required: true,
    },
    members: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true },
);

export const Group = mongoose.model("Group", groupSchema)