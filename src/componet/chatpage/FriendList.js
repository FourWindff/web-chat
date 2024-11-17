import styles from './css/FriendList.module.css';
import FriendItem from './FriendItem';
import {AddFriend} from "./AddFriend";

export default function FriendList({ friendList, onSelectFriend ,onAddRequest}) {

  return (
    <div className={styles.listContainer}>
      {friendList.map((friend) => (
        <FriendItem
          key={friend.userId}
          username={friend.username}
          lastMessage="Last message"
          onSelect={() => onSelectFriend(friend.userId)}
        />
      ))}
      <AddFriend onAddRequest={onAddRequest} />
    </div>
  );
}
