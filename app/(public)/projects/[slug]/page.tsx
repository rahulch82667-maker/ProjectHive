import { Metadata } from 'next';
import { connectDB } from '@/backend/config/db';
import Project from '@/backend/models/Project';
import { ProjectDetailsClient } from '@/components/projects';

interface Props {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  
  try {
    await connectDB();
    const project = await Project.findOne({ slug, status: 'published' });
    
    if (!project) {
      return {
        title: 'Project Not Found | ProjectHive',
        description: 'The requested template could not be found on ProjectHive.',
      };
    }

    return {
      title: `${project.title} - Marketplace Template | ProjectHive`,
      description: project.shortDescription,
      openGraph: {
        title: `${project.title} - Marketplace Template | ProjectHive`,
        description: project.shortDescription,
        images: [{ url: project.thumbnail }],
        type: 'website',
      },
    };
  } catch (error) {
    return {
      title: 'Project Details | ProjectHive',
      description: 'View full theme and template details on ProjectHive.',
    };
  }
}

export default async function ProjectPage({ params }: Props) {
  const { slug } = await params;
  return <ProjectDetailsClient slug={slug} />;
}
