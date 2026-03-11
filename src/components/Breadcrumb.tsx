
import { ChevronRight, Home } from 'lucide-react';

interface BreadcrumbItem {
    name: string;
    url: string;
}

interface BreadcrumbProps {
    items: BreadcrumbItem[];
}

export function Breadcrumb({ items }: BreadcrumbProps) {
    return (
        <nav
            aria-label="Breadcrumb"
            className="mb-6"
        >
            <ol className="flex items-center gap-2 text-sm text-muted-foreground flex-wrap">
                {/* Home icon as first item */}
                <li className="flex items-center">
                    <a
                        href="/"
                        className="hover:text-foreground transition-colors flex items-center gap-1"
                        aria-label="Home"
                    >
                        <Home className="w-4 h-4" />
                        <span className="sr-only">Home</span>
                    </a>
                </li>

                {items.map((item, index) => {
                    const isLast = index === items.length - 1;

                    return (
                        <li key={item.url} className="flex items-center gap-2">
                            <ChevronRight className="w-4 h-4 text-muted-foreground/50" />
                            {isLast ? (
                                <span
                                    className="font-medium text-foreground line-clamp-1"
                                    aria-current="page"
                                >
                                    {item.name}
                                </span>
                            ) : (
                                <a
                                    href={item.url}
                                    className="hover:text-foreground transition-colors line-clamp-1"
                                >
                                    {item.name}
                                </a>
                            )}
                        </li>
                    );
                })}
            </ol>
        </nav>
    );
}
