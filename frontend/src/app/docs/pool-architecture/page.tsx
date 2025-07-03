
import fs from 'fs';
import path from 'path';
import { PageHeader } from '@/components/shared/page-header';
import { Card, CardContent } from '@/components/ui/card';

export default function PoolArchitecturePage() {
  const mdFilePath = path.join(process.cwd(), 'src', 'docs', 'pool-architecture.md');
  let markdownContent = '';
  try {
     markdownContent = fs.readFileSync(mdFilePath, 'utf8');
  } catch (error) {
    markdownContent = "Could not load the 'pool-architecture.md' document. Please ensure the file exists in the /src/docs/ directory."
    console.error(error);
  }

  return (
    <>
      <PageHeader
        title="Pool Architecture"
        description="A deep dive into our multi-pool ecosystem for liquidity and security."
      />
      <Card>
        <CardContent className="p-6">
            <pre className="whitespace-pre-wrap text-sm font-mono bg-muted/50 p-4 rounded-md overflow-x-auto font-body">
                {markdownContent}
            </pre>
        </CardContent>
      </Card>
    </>
  );
}
