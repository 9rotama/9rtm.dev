export default function SlideUp({
  delay,
  children,
}: {
  delay: 0 | 100;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-slide-up" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
