import SimulatedInbox from '@/components/inbox/SimulatedInbox';
import TopHeader from '@/components/shared/TopHeader';

export default function InboxPage() {
  return (
    <>
      <TopHeader title="Inbox" />
      <SimulatedInbox />
    </>
  );
}
