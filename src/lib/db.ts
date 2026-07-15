import { supabaseAdmin } from './supabase'
import type { Project, BlogPost, Admin } from './types'

export function generateSlug(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

// ──────────────── Projects ────────────────

export async function getProjects(): Promise<Project[]> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data as Project[]
}

export async function getProjectById(id: number): Promise<Project | null> {
  const { data, error } = await supabaseAdmin
    .from('projects')
    .select('*')
    .eq('id', id)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null // no rows
    throw new Error(error.message)
  }
  return data as Project
}

export async function createProject(data: Omit<Project, 'id' | 'slug' | 'createdAt'>): Promise<Project> {
  const slug = generateSlug(data.title)
  const { data: inserted, error } = await supabaseAdmin
    .from('projects')
    .insert({
      ...data,
      slug,
      techStack: data.techStack ?? [],
      createdAt: new Date().toISOString(),
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return inserted as Project
}

export async function updateProject(id: number, data: Partial<Project>): Promise<Project | null> {
  const patch: Record<string, unknown> = { ...data }
  if (data.title) {
    patch.slug = generateSlug(data.title)
  }
  const { data: updated, error } = await supabaseAdmin
    .from('projects')
    .update(patch)
    .eq('id', id)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return updated as Project
}

export async function deleteProject(id: number): Promise<Project | null> {
  // Fetch before deleting so we can return the deleted record
  const existing = await getProjectById(id)
  if (!existing) return null

  const { error } = await supabaseAdmin
    .from('projects')
    .delete()
    .eq('id', id)
  if (error) throw new Error(error.message)

  return existing as Project
}

// ──────────────── Blogs ────────────────

export async function getBlogs(): Promise<BlogPost[]> {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .order('id', { ascending: true })
  if (error) throw new Error(error.message)
  return data as BlogPost[]
}

export async function getBlogBySlug(slug: string): Promise<BlogPost | null> {
  const { data, error } = await supabaseAdmin
    .from('blogs')
    .select('*')
    .eq('slug', slug)
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return data as BlogPost
}

export async function createBlog(data: Omit<BlogPost, 'id' | 'slug' | 'createdAt' | 'updatedAt'>): Promise<BlogPost> {
  const slug = generateSlug(data.title)
  const now = new Date().toISOString()

  // Append a suffix if the slug already exists
  const existing = await getBlogBySlug(slug)
  const finalSlug = existing ? `${slug}-${Date.now()}` : slug

  const { data: inserted, error } = await supabaseAdmin
    .from('blogs')
    .insert({
      ...data,
      slug: finalSlug,
      tags: data.tags ?? [],
      createdAt: now,
      updatedAt: now,
    })
    .select()
    .single()
  if (error) throw new Error(error.message)
  return inserted as BlogPost
}

export async function updateBlog(slug: string, data: Partial<BlogPost>): Promise<BlogPost | null> {
  const patch: Record<string, unknown> = { ...data, updatedAt: new Date().toISOString() }
  if (data.title) {
    patch.slug = generateSlug(data.title)
  }

  const { data: updated, error } = await supabaseAdmin
    .from('blogs')
    .update(patch)
    .eq('slug', slug)
    .select()
    .single()
  if (error) {
    if (error.code === 'PGRST116') return null
    throw new Error(error.message)
  }
  return updated as BlogPost
}

export async function deleteBlog(slug: string): Promise<BlogPost | null> {
  const existing = await getBlogBySlug(slug)
  if (!existing) return null

  const { error } = await supabaseAdmin
    .from('blogs')
    .delete()
    .eq('slug', slug)
  if (error) throw new Error(error.message)

  return existing as BlogPost
}

// ──────────────── Admin ────────────────

export async function getAdmin(): Promise<Admin | null> {
  const { data, error } = await supabaseAdmin
    .from('admins')
    .select('*')
    .limit(1)
  if (error) throw new Error(error.message)
  return (data?.[0] as Admin) ?? null
}
