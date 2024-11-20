export default function SlideUp({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <div className="animate-slideUp" style={{ animationDelay: `${delay}ms` }}>
      {children}
    </div>
  );
}
