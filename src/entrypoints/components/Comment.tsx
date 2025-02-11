import React, { useEffect, useRef, useState } from "react";
import styles from "../styles/comment.module.css";
import Textarea from "react-textarea-autosize";
import ReactTimeAgo from "react-time-ago";
import { CommentType } from "../CommentsBar";
import md5 from "md5";
import {
  faChevronUp,
  faPen,
  faReply,
  faSave,
  faTrashAlt,
} from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

type commentProps = {
  deleteComment: (dateISO: string, parentCommentISO?: string) => void;
  editComment: (
    dateISO: string,
    newValue: string,
    parentCommentISO?: string
  ) => void;
  upvoteComment: (
    dateISO: string,
    userUpvotedThisComment: boolean,
    parentCommentISO?: string
  ) => void;
  replyComment: (parentCommentISO: string) => void;
  commentObject: CommentType;
  currentUserEmail: string;
};

const Comment: React.FC<commentProps> = (props) => {
  const userUpvotedThisComment = !!props.commentObject.usersWhoUpvoted.find(
    (userWhoUpvoted) => userWhoUpvoted === props.currentUserEmail
  );
  const commentSpan = useRef<HTMLDivElement>(null);
  const [textAreaHeight, setTextAreaHeight] = useState(21);
  const [isEditing, setIsEditing] = useState(!props.commentObject.comment);
  const isNotAReply = "replies" in props.commentObject;
  const userIsAuthor =
    props.commentObject.author.email === props.currentUserEmail;
  const authorProfilePictureUrl =
    "https://www.gravatar.com/avatar/" +
    md5(props.commentObject.author.email || '') +
    "?d=mp";

  const replyClasses = isNotAReply ? "" : " " + styles.reply;
  const commentClasses = styles.comment + replyClasses;

  const [textAreaValue, setTextAreaValue] = useState(
    props.commentObject.comment
  );

  const toggleEdit = () => {
    setIsEditing(true);
  };

  const editCommentHandler = () => {
    if (!textAreaValue.trim()) {
      return;
    }
    setIsEditing(false);
    if (isNotAReply) {
      props.editComment(props.commentObject.dateISO, textAreaValue);
    } else {
      props.editComment(
        props.commentObject.dateISO,
        textAreaValue,
        props.commentObject.parentCommentISO
      );
    }
  };

  const deleteCommentHanlder = () => {
    if (isNotAReply) {
      props.deleteComment(props.commentObject.dateISO);
    } else {
      props.deleteComment(
        props.commentObject.dateISO,
        props.commentObject.parentCommentISO
      );
    }
  };

  const upvoteCommentHandler = () => {
    if (isNotAReply) {
      props.upvoteComment(props.commentObject.dateISO, userUpvotedThisComment);
    } else {
      props.upvoteComment(
        props.commentObject.dateISO,
        userUpvotedThisComment,
        props.commentObject.parentCommentISO
      );
    }
  };

  const replyCommentHandler = () => {
    props.replyComment(props.commentObject.dateISO);
  };

  const enterKeyHandler = (event: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === "Enter") {
      editCommentHandler();
    }
  };

  const heightChangeHandler = (height: number) => {
    setTextAreaHeight(height);
  };

  useEffect(() => {
    const spanHeight = commentSpan.current?.clientHeight;
    setTextAreaHeight(spanHeight!);
  }, [commentSpan]);

  const focousHandler = (event: React.FocusEvent<HTMLTextAreaElement>) => {
    event.currentTarget.setSelectionRange(
      event.currentTarget.value.length,
      event.currentTarget.value.length
    );
  };

  return (
    <div className={commentClasses}>
      {!isNotAReply && (
        <div
          style={{ height: 100 + textAreaHeight }}
          className={styles["reply-line"]}
        ></div>
      )}
      <div className={styles["comment-main"]}>
        <div className={styles["comment-body"]}>
          {isEditing && (
            <div className={styles["dialogbox"]}>
              <div className={styles["body"]}>
                <span
                  className={styles["tip"] + " " + styles["tip-down"]}
                ></span>
                <div className={styles["message"]}>
                  <Textarea
                    autoFocus
                    onFocus={focousHandler}
                    onHeightChange={heightChangeHandler}
                    onKeyPress={enterKeyHandler}
                    onChange={(event) => setTextAreaValue(event.target.value)}
                    value={textAreaValue}
                    className={styles["comment-textarea"]}
                  />
                </div>
              </div>
            </div>
          )}
          {!isEditing && (
            <div ref={commentSpan} className={styles["dialogbox"]}>
              <div className={styles["body"]}>
                <span
                  className={styles["tip"] + " " + styles["tip-down"]}
                ></span>
                <div className={styles["message"]}>
                  <span>{textAreaValue}</span>
                </div>
              </div>
            </div>
          )}
          <div
            className={`${styles["comment__footer"]} ${styles["comments__item__timestamp"]}`}
          >
            <div className={styles["comment-footer"]}>
              <div className={styles["author-info"]}>
                <img
                  className={styles["author-profile-picture"]}
                  src={authorProfilePictureUrl}
                  alt={props.commentObject.author.name}
                />
              </div>
              {!isNotAReply && (
                <div className={styles["reply-profile-picture-line"]}></div>
              )}
              <div className={styles["comment__buttons"]}>
                <div>
                  <span>{props.commentObject.author.name}</span>
                </div>
                <div className={styles["comment__timestamps"]}>
                  <ReactTimeAgo date={new Date(props.commentObject.dateISO)} />
                </div>
                <div className={styles["comment__interface"]}>
                  <span
                    className={userUpvotedThisComment ? styles["upvoted"] : ""}
                  >
                    {props.commentObject.usersWhoUpvoted.length}
                  </span>
                  <button
                    className={`${styles["comment__button"]} ${
                      styles["upvotes"]
                    } ${userUpvotedThisComment ? styles["upvoted"] : ""}`}
                    onClick={upvoteCommentHandler}
                  >
                    <FontAwesomeIcon icon={faChevronUp} />
                  </button>
                  {userIsAuthor && props.commentObject.comment && !isEditing ? (
                    <button
                      className={styles["comment__button"]}
                      onClick={toggleEdit}
                    >
                      <FontAwesomeIcon icon={faPen} />
                    </button>
                  ) : userIsAuthor ? (
                    <button
                      className={styles["comment__button"]}
                      onClick={editCommentHandler}
                    >
                      <FontAwesomeIcon icon={faSave} />
                    </button>
                  ) : null}
                  {userIsAuthor && (
                    <button
                      className={styles["comment__button"]}
                      onClick={deleteCommentHanlder}
                    >
                      <FontAwesomeIcon icon={faTrashAlt} />
                    </button>
                  )}
                  {isNotAReply && (
                    <button
                      className={styles["comment__button"]}
                      onClick={replyCommentHandler}
                    >
                      <FontAwesomeIcon icon={faReply} />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {isNotAReply && (
        <div className={styles["comments__replies__item"]}>
          {props.commentObject.replies?.map((reply) => {
            return (
              <Comment
                key={reply.dateISO}
                deleteComment={props.deleteComment}
                editComment={props.editComment}
                upvoteComment={props.upvoteComment}
                replyComment={props.replyComment}
                commentObject={reply}
                currentUserEmail={props.currentUserEmail}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Comment;
