import mongoose from "mongoose";

const commentSchema = new mongoose.Schema(
  {
    creator: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    comment: [
      {
        content: {
          type: String,
        },
        reply: [
          {
            creator: {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
              },
              username: {
                type: String,
              },
              avatar: {
                type: String,
              },
            },
            replyComment: [
              {
                replyContent: "",
                like: [
                  {
                    creator: {
                      _id: {
                        type: mongoose.Schema.Types.ObjectId,
                        ref: "user",
                      },
                      username: {
                        type: String,
                      },
                      avatar: {
                        type: String,
                      },
                    },
                    likeType: {
                      type: String,
                      enum: ["like", "dislike", "none"],
                      default: "none",
                    },
                  },
                ],
              },
            ],
          },
        ],
        like: [
          {
            creator: {
              _id: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "user",
              },
              username: {
                type: String,
              },
              avatar: {
                type: String,
              },
            },
            likeType: {
              type: String,
              enum: ["like", "dislike", "none"],
              default: "none",
            },
          },
        ],
      },
    ],
    postId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Posts",
    },
  },
  { timestamps: true }
);

export const Comments = mongoose.model("Comment", commentSchema);
