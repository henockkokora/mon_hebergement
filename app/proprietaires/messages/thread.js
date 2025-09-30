import { useEffect, useState } from 'react';
import ChatThread from '@/components/ChatThread';

export default function OwnerChatThread({ threadId }) {
  const [currentUserId, setCurrentUserId] = useState(null);
  const [otherUser, setOtherUser] = useState(null);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem('user'));
    setCurrentUserId(user?._id);
  }, []);

  useEffect(() => {
    async function fetchOtherUser() {
      if (!threadId) return;
      const res = await fetch(`/api/threads/${threadId}`);
      const data = await res.json();
      if (data.success) {
        setOtherUser(data.thread.client);
      }
    }
    fetchOtherUser();
  }, [threadId]);

  if (!currentUserId || !otherUser) return <div>Chargement...</div>;

  return (
    <div className="h-[80vh] max-w-2xl mx-auto p-4">
      <ChatThread
        threadId={threadId}
        currentUserId={currentUserId}
        otherUser={otherUser}
      />
    </div>
  );
}
