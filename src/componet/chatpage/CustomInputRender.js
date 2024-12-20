import React from "react";
import styles from "./css/ChatPage.module.css";
import {Button, Progress} from "@douyinfe/semi-ui";
import {IconCamera} from "@douyinfe/semi-icons";


export default function CustomInputRender({onOpenVideo,percent, ...props}) {
  const {defaultNode} = props;
  return (
    <div className={styles.inputContainer}>
      <div
        style={{
          border: "1px solid var(--semi-color-border)",
          borderRadius: "15px",
          margin: "0px  -5px 0px -5px",
          padding: "10px",
        }}
      >
        <Button
          icon={<IconCamera size="large" style={{color: "#1f1f1f", margin: '5px'}}/>}
          theme="borderless"
          onClick={onOpenVideo}
        />
      </div>
      <div style={{
        width: "600px",
      }}>
        {defaultNode}
      </div>
      <Progress percent={percent} type="circle" size="small" style={{ margin: 5 }} aria-label="file uploaded percent" />
    </div>
  );
}