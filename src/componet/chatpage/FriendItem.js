import { Avatar } from "@douyinfe/semi-ui";
import styles from "./css/FriendItem.module.css";

export default function FriendItem({ username, lastMessage, onSelect }) {
  return (
    <div className={styles.itemContainer} onClick={onSelect}>
      <Avatar size="default"
              style={{
                margin: 4 ,
              }} alt={username}>
        {username}
      </Avatar>
      <div className={styles.itemInfo}>
        <div className={styles.itemUsername}>{username}</div>
      </div>
    </div>
  );
}
