export interface Experience {
  id: number;
  role: string;
  company: string;
  period: string;
  description: string;
  tech: string[];
  link?: string;
}

export interface Organization {
  id: number;
  role: string;
  org: string;
  period: string;
  description: string;
  category: string;
  link?: string;
}

export interface Achievement {
  id: number;
  title: string;
  description: string;
  icon: string;
}

export interface ProjectLink {
  type: 'github' | 'url' | 'playstore' | 'appstore' | 'postman' | 'docs' | 'youtube' | 'figma';
  url: string;
}

export interface Project {
  id: number;
  title: string;
  description: string;
  image: string;
  images: string[]; /* Added for gallery modal */
  embed?: string; /* Added for Canva/Youtube embeds */
  category: 'Web' | 'Mobile' | 'AI/Data' | 'Smart City';
  techStack: string[];
  links: ProjectLink[];
}

export type SectionId = 'home' | 'experience' | 'projects' | 'tech' | 'contact';