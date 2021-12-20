import { RenderModalCtx } from "datocms-plugin-sdk";
import { Button, Canvas } from "datocms-react-ui";
import styles from "./styles/modal.module.css";

type PropTypes = {
  ctx: RenderModalCtx;
};

const NoLogModal = ({ ctx }: PropTypes) => {
  const handleCancel = () => {
    ctx.resolve("cancel");
  };

  const handleGoToModel = () => {
    ctx.resolve("goToModelEdit");
  };

  return (
    <Canvas ctx={ctx}>
      <div className={styles["error-explanation"]}>
        <h2>A field is missing from your model!</h2>
        <p>
          You need to create a "comment log" JSON field on this model to save
          comments.
        </p>
        <p className={styles["note"]}>
          Note that the field must be of type "JSON" and its API key must be
          "comment_log"
        </p>
      </div>
      <div className={styles["buttons"]}>
        <Button buttonType="negative" buttonSize="l" onClick={handleCancel}>
          Cancel
        </Button>
        <Button buttonType="primary" buttonSize="l" onClick={handleGoToModel}>
          Go to model editing
        </Button>
      </div>
    </Canvas>
  );
};

export default NoLogModal;
