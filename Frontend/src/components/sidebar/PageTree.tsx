import type { Page } from "../../types";
import PageItem from "./PageItem";

interface Props {
  pages: Page[];
  allPages: Page[];
  depth?: number;
}

export default function PageTree({ pages, allPages, depth = 0 }: Props) {
  if (pages.length === 0 && depth === 0) {
    return (
      <div className="page-tree-empty">
        No pages yet. Click + to create one.
      </div>
    );
  }

  return (
    <div className="page-tree">
      {pages.map((page) => {
        const childPages = allPages.filter(
          (p) => p.parentId === page.id && !p.isDeleted
        );

        return (
          <PageItem
            key={page.id}
            page={page}
            depth={depth}
            childPages={childPages}   
            allPages={allPages}
          />
        );
      })}
    </div>
  );
}