export default function Footer() {
  return (
    <footer className="mt-24 flex w-full flex-col gap-6 px-12 text-center text-sm font-medium text-light/70 opacity-50">
      &copy; {new Date().getFullYear()} 9rotama
    </footer>
  );
}
