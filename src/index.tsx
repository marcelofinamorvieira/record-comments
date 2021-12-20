import {
  connect,
  IntentCtx,
  ModelBlock,
  RenderItemFormSidebarPanelCtx,
  RenderModalCtx,
} from "datocms-plugin-sdk";
import { render } from "./utils/render";
import "datocms-react-ui/styles.css";
import React from "react";
import ReactDOM from "react-dom";
import Notes from "./entrypoints/CommentsBar";
import NoLogModal from "./entrypoints/NoLogModal";
import TimeAgo from "javascript-time-ago";
import en from "javascript-time-ago/locale/en.json";

TimeAgo.addDefaultLocale(en);
connect({
  renderModal(modalId: string, ctx: RenderModalCtx) {
    switch (modalId) {
      case "NoLogModal":
        return render(<NoLogModal ctx={ctx} />);
    }
  },
  itemFormSidebarPanels(model: ModelBlock, ctx: IntentCtx) {
    return [
      {
        id: "comments",
        label: "Comments",
        startOpen: false,
      },
    ];
  },
  renderItemFormSidebarPanel(
    sidebarPanelId,
    ctx: RenderItemFormSidebarPanelCtx
  ) {
    ReactDOM.render(
      <React.StrictMode>
        <Notes ctx={ctx} />
      </React.StrictMode>,
      document.getElementById("root")
    );
  },
});
