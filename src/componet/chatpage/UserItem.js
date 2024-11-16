import { Avatar } from "@douyinfe/semi-ui";
import styles from "./css/UserItem.module.css";

export default function UserItem({ username, userid, isConnected }) {
  return (
    <div className={styles.userItemContainer}>
      <Avatar
        size="large"
        style={{
          margin: 4,
          backgroundColor: isConnected ? "#0066cc" : "#c77131" ,
          }}
        alt={username}
        gap={4}
      >
        {username}
      </Avatar>
      <div className={styles.userInfoContainer}>
        <span className={styles.userItemInfo}>{username}</span>
        <span className={styles.userItemInfo}>{userid}</span>
      </div>
    </div>
  );
}
