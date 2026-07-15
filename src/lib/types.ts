export interface Project {
  id: number
  title: string
  slug: string
  description: string
  fullDescription: string
  techStack: string[]
  image: string
  category: string
  liveUrl: string | null
  sourceUrl: string | null
  featured: boolean
  createdAt: string
}

export interface BlogPost {
  id: number
  title: string
  slug: string
  category: string
  excerpt: string
  content: string
  tags: string[]
  coverImage: string
  createdAt: string
  updatedAt: string
}

export interface Admin {
  username: string
  password: string
}

export interface LoginResponse {
  token: string
  username: string
}
