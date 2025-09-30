import ConversationClient from './ConversationClient';

export default async function ConversationPage({ params }) {
  const { id } = await params;
  return <ConversationClient roomId={id} />;
}

