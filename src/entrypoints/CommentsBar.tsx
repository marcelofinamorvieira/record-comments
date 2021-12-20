import { RenderItemFormSidebarPanelCtx } from "datocms-plugin-sdk";
import {
  AccountAttributes,
  UserAttributes,
} from "datocms-plugin-sdk/dist/types/SiteApiSchema";
import { Button, Canvas } from "datocms-react-ui";
import { useEffect, useState } from "react";
import Comment from "./components/Comment";
import styles from "./styles/commentbar.module.css";

type PropTypes = {
  ctx: RenderItemFormSidebarPanelCtx;
};

export type CommentType = {
  dateISO: string;
  comment: string;
  author: {
    name: string;
    email: string;
  };
  usersWhoUpvoted: string[];
  replies?: CommentType[];
  parentCommentISO?: string;
};

const CommentsBar = ({ ctx }: PropTypes) => {
  //this component is way too big, i should split it into smaller ones
  const userEmail = (ctx.currentUser.attributes as UserAttributes)
    .email as string;
  const userName =
    (ctx.currentUser.attributes as UserAttributes).full_name ||
    `${(ctx.currentUser.attributes! as AccountAttributes).first_name} ${
      (ctx.currentUser.attributes as AccountAttributes).last_name
    }`;
  let foundLog = false;

  for (const field in ctx.fields) {
    if (
      ctx.fields[field]?.attributes.field_type === "json" &&
      "comment_log" === ctx.fields[field]?.attributes.api_key
    ) {
      foundLog = true;
      break;
    }
  }

  if (foundLog) {
    ctx.disableField("comment_log", true);
  }

  const initialState =
    foundLog && ctx.formValues.comment_log
      ? (JSON.parse(ctx.formValues.comment_log as string) as CommentType[])
      : [];

  const [savedComments, setSavedComments] =
    useState<CommentType[]>(initialState);

  const handleOpenLogModal = async () => {
    const result = await ctx.openModal({
      id: "NoLogModal",
      title: "Didn't find a log",
      width: "l",
    });
    if (result === "goToModelEdit") {
      ctx.navigateTo(`/admin/item_types/${ctx.itemType.id}`);
    }
  };

  const saveCommentHandler = () => {
    if (!foundLog) {
      handleOpenLogModal();
      return;
    }

    const newComment: CommentType = {
      dateISO: new Date().toISOString(),
      comment: "",
      author: {
        name: userName,
        email: userEmail,
      },
      usersWhoUpvoted: [],
      replies: [],
    };

    setSavedComments((oldComments: CommentType[]) => {
      const newComments = [...oldComments];
      newComments.unshift(newComment);
      return newComments;
    });
  };

  const deleteCommentHandler = (
    dateISO: string,
    parentCommentISO: string = ""
  ) => {
    if (parentCommentISO) {
      setSavedComments((oldComments: CommentType[]) => {
        const newCommentsIntermediary = [...oldComments];
        const parentComment = newCommentsIntermediary.find(
          (comment) => comment.dateISO === parentCommentISO
        );
        parentComment!.replies = parentComment!.replies!.filter(
          (comment) => comment.dateISO !== dateISO
        );
        const newComments = newCommentsIntermediary;
        return newComments;
      });
    } else {
      setSavedComments((oldComments: CommentType[]) => {
        const newCommentsIntermediary = [...oldComments];
        const newComments = newCommentsIntermediary.filter(
          (comment) => comment.dateISO !== dateISO
        );
        return newComments;
      });
    }
  };

  const editCommentHandler = (
    dateISO: string,
    newValue: string,
    parentCommentISO: string = ""
  ) => {
    if (parentCommentISO) {
      setSavedComments((oldComments: CommentType[]) => {
        const newComments = [...oldComments];
        const parentComment = newComments.find(
          (comment) => comment.dateISO === parentCommentISO
        );
        const reply = parentComment!.replies!.find(
          (comment: CommentType) => comment.dateISO === dateISO
        );
        reply!.comment = newValue;
        return newComments;
      });
    } else {
      setSavedComments((oldComments: CommentType[]) => {
        const newComments = [...oldComments];
        newComments.find((comment) => comment.dateISO === dateISO)!.comment =
          newValue;
        return newComments;
      });
    }
  };

  const upvoteCommentHandler = (
    dateISO: string,
    userUpvotedThisComment: boolean,
    parentCommentISO: string = ""
  ) => {
    if (parentCommentISO) {
      setSavedComments((oldComments: CommentType[]) => {
        const newComments = [...oldComments];
        const parentComment = newComments.find(
          (comment) => comment.dateISO === parentCommentISO
        );
        const reply = parentComment!.replies!.find(
          (comment: CommentType) => comment.dateISO === dateISO
        );
        if (userUpvotedThisComment) {
          reply!.usersWhoUpvoted = reply!.usersWhoUpvoted.filter(
            (userWhoUpvotedThisComment) =>
              userWhoUpvotedThisComment !== userEmail
          );
        } else {
          reply!.usersWhoUpvoted.push(userEmail);
        }
        return newComments;
      });
    } else {
      setSavedComments((oldComments: CommentType[]) => {
        const newComments = [...oldComments];
        const upvotedComment = newComments.find(
          (comment) => comment.dateISO === dateISO
        );
        if (userUpvotedThisComment) {
          upvotedComment!.usersWhoUpvoted =
            upvotedComment!.usersWhoUpvoted.filter(
              (userWhoUpvotedThisComment) =>
                userWhoUpvotedThisComment !== userEmail
            );
        } else {
          upvotedComment!.usersWhoUpvoted.push(userEmail);
        }
        return newComments;
      });
    }
  };

  const replyCommentHandler = (parentCommentISO: string) => {
    const newComment: CommentType = {
      dateISO: new Date().toISOString(),
      comment: "",
      author: {
        name: userName,
        email: userEmail,
      },
      usersWhoUpvoted: [],
      parentCommentISO,
    };
    setSavedComments((oldComments: CommentType[]) => {
      const newComments = [...oldComments];
      newComments
        .find((comment) => comment.dateISO === parentCommentISO)
        ?.replies?.unshift(newComment);
      return newComments;
    });
  };

  useEffect(() => {
    const objectIsEmpty = !Object.keys(savedComments).length;
    if (foundLog && objectIsEmpty) {
      ctx.setFieldValue("comment_log", null);
    } else if (foundLog) {
      const formatedComments = JSON.stringify(savedComments, null, 2);
      const stateIsEqualToLog =
        formatedComments === (ctx.formValues.comment_log as string);
      if (!stateIsEqualToLog) {
        ctx.setFieldValue("comment_log", formatedComments);
      }
    }
  }, [savedComments, ctx, foundLog]);

  return (
    <Canvas ctx={ctx}>
      <Button
        fullWidth
        className={styles["add-comment-button"]}
        onClick={saveCommentHandler}
      >
        Add a new comment...
      </Button>
      {foundLog &&
        savedComments.map((comment) => {
          return (
            <Comment
              key={comment.dateISO}
              deleteComment={deleteCommentHandler}
              editComment={editCommentHandler}
              upvoteComment={upvoteCommentHandler}
              replyComment={replyCommentHandler}
              commentObject={comment}
              currentUserEmail={userEmail}
            />
          );
        })}
    </Canvas>
  );
};

export default CommentsBar;
