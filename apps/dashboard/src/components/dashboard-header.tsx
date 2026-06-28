import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@heho/ui/components/breadcrumb";
import { SidebarTrigger } from "@heho/ui/components/sidebar";
import { Link, useMatches } from "@tanstack/react-router";

export const DashboardHeader = () => {
  const matches = useMatches();
  const currentBreadcrumb = matches
    .map((match) => match.staticData.breadcrumb)
    .filter((breadcrumb): breadcrumb is string => Boolean(breadcrumb))
    .at(-1);

  return (
    <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
      <div className="flex w-full min-w-0 items-center gap-2 px-4 lg:px-6">
        <SidebarTrigger className="-ml-1" />
        <Breadcrumb className="min-w-0">
          <BreadcrumbList className="flex-nowrap font-medium text-base">
            <BreadcrumbItem className="hidden md:block">
              <BreadcrumbLink render={<Link to="/">Workspace</Link>} />
            </BreadcrumbItem>
            <BreadcrumbSeparator className="hidden md:block" />
            <BreadcrumbItem className="min-w-0">
              <BreadcrumbPage className="truncate">
                {currentBreadcrumb ?? "Workspace"}
              </BreadcrumbPage>
            </BreadcrumbItem>
          </BreadcrumbList>
        </Breadcrumb>
      </div>
    </header>
  );
};
