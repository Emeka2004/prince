
export enum MaterialCategory {
  VIDEO = 'Video',
  ARTICLE = 'Article',
  BOOK = 'Book',
  PODCAST = 'Podcast',
  COURSE = 'Course'
}

export interface Material {
  id: string;
  title: string;
  author: string;
  category: MaterialCategory;
  url: string;
  description: string;
  relevanceScore: number;
  tags: string[];
}

export interface RecommendationRequest {
  courseTitle: string;
  topic: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
}

export interface AIRecommendationResponse {
  recommendations: Material[];
  summary: string;
}
