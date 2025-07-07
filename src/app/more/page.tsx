
import { PageHeader } from "@/components/shared/page-header";
import { Card, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { GitFork, BookOpen, FileText, ExternalLink } from "lucide-react";
import Link from "next/link";

const resources = [
  {
    title: "Project Roadmap",
    description: "See where SolCraft is headed with our public development roadmap.",
    href: "/#roadmap-section",
    icon: GitFork,
    isExternal: false,
  },
  {
    title: "Pool Architecture Docs",
    description: "A deep dive into our multi-pool ecosystem for liquidity and security.",
    href: "/docs/pool-architecture",
    icon: BookOpen,
    isExternal: false,
  },
   {
    title: "Terms of Service",
    description: "Our terms and conditions for using the SolCraft platform.",
    href: "/terms-of-service",
    icon: FileText,
    isExternal: false,
  },
  {
    title: "Privacy Policy",
    description: "Learn how we collect, use, and protect your data.",
    href: "/privacy-policy",
    icon: FileText,
    isExternal: false,
  },
];

export default function MorePage() {
  return (
    <>
      <PageHeader
        title="More Resources"
        description="Explore documentation, legal information, and other project resources."
      />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {resources.map((resource) => (
          <Link key={resource.title} href={resource.href} target={resource.isExternal ? "_blank" : "_self"} rel={resource.isExternal ? "noopener noreferrer" : ""}>
            <Card className="h-full hover:border-primary/50 hover:bg-muted/30 transition-all">
              <CardHeader className="flex flex-row items-center gap-4">
                <div className="p-3 bg-primary/10 rounded-lg">
                  <resource.icon className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="font-headline text-lg">{resource.title}</CardTitle>
                   <CardDescription>{resource.description}</CardDescription>
                </div>
                {resource.isExternal && <ExternalLink className="w-4 h-4 text-muted-foreground ml-auto" />}
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </>
  );
}
