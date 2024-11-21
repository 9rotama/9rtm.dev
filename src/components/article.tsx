type Props = {
  children: React.ReactNode;
};

export function ArticleH1({ children }: Props) {
  return <h1 className="text-4xl font-extrabold">{children}</h1>;
}

export function ArticleH2({ children }: Props) {
  return <h2 className="mb-5 mt-10 text-2xl font-bold">{children}</h2>;
}
