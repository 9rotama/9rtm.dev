type Props = {
  children: React.ReactNode;
};

export default function WidthContainer({ children }: Props) {
  return <div className="w-full px-4 md:w-[640px]">{children}</div>;
}
