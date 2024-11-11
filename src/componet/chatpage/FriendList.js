import styles from './css/FriendList.module.css';
import FriendItem from './FriendItem';

export default function FriendList({ friendList, onSelectFriend }) {

  return (
    <div className={styles.listContainer}>
      {friendList.map((friend) => (
        <FriendItem
          key={friend.userid}
          username={friend.username}
          lastMessage="Last message"
          onSelect={() => onSelectFriend(friend.userid)}
        />
      ))}
    </div>
  );
}
