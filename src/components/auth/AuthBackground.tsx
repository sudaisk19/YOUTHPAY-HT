export default function AuthBackground() {
  return (
    <div
      aria-hidden
      className="fixed top-0 left-0 z-0 h-[100dvh] min-h-screen w-screen overflow-hidden bg-surface-bg pointer-events-none"
    >
      <div className="absolute -top-32 -left-32 h-[min(640px,80vw)] w-[min(640px,80vw)] rounded-full bg-primary opacity-[0.18] blur-3xl" />
      <div className="absolute -bottom-32 -right-32 h-[min(520px,70vw)] w-[min(520px,70vw)] rounded-full bg-accent opacity-[0.14] blur-3xl" />
      <div className="absolute top-1/4 right-0 h-[min(480px,65vw)] w-[min(480px,65vw)] rounded-full bg-primary-light opacity-[0.12] blur-3xl" />
    </div>
  );
}
