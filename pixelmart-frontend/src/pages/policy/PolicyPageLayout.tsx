import { Link } from 'react-router-dom';

interface PolicyPageLayoutProps {
  title: string;
  children: React.ReactNode;
}

export function PolicyPageLayout({ title, children }: PolicyPageLayoutProps) {
  return (
    <article className="mx-auto max-w-3xl">
      <nav className="mb-4 text-sm text-muted-foreground" aria-label="Breadcrumb">
        <Link to="/" className="no-underline hover:text-primary hover:no-underline">
          Home
        </Link>
        <span className="mx-2">/</span>
        <span className="text-foreground">{title}</span>
      </nav>
      <h1 className="m-0 mb-6 text-3xl font-bold text-foreground">{title}</h1>
      <div className="prose-policy flex flex-col gap-4 text-sm leading-relaxed text-muted-foreground [&_h2]:mb-2 [&_h2]:mt-6 [&_h2]:text-base [&_h2]:font-bold [&_h2]:text-foreground [&_li]:ml-4 [&_p]:m-0 [&_ul]:m-0 [&_ul]:list-disc [&_ul]:pl-4">
        {children}
      </div>
    </article>
  );
}
