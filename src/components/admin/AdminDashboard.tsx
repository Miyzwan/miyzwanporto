'use client'

import { useEffect, useState, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import { motion, AnimatePresence } from 'motion/react'
import type { Project, BlogPost } from '@/lib/types'

type Tab = 'projects' | 'blogs'
type EditorItem = Project | BlogPost | null

interface ToastItem {
  id: string
  type: 'success' | 'error'
  message: string
}

function getToken(): string {
  return localStorage.getItem('admin_token') || ''
}

function getHeaders() {
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${getToken()}`,
  }
}

let toastCounter = 0

export default function AdminDashboard() {
  const [tab, setTab] = useState<Tab>('projects')
  const [projects, setProjects] = useState<Project[]>([])
  const [blogs, setBlogs] = useState<BlogPost[]>([])
  const [editing, setEditing] = useState<EditorItem>(null)
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toasts, setToasts] = useState<ToastItem[]>([])
  const [deleteConfirm, setDeleteConfirm] = useState<{
    type: Tab
    idOrSlug: string | number
    title: string
  } | null>(null)
  const router = useRouter()

  const showToast = useCallback((type: 'success' | 'error', message: string) => {
    const id = String(++toastCounter)
    setToasts((prev) => [...prev, { id, type, message }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, 3500)
  }, [])

  const fetchData = useCallback(async () => {
    setLoading(true)
    try {
      const [pRes, bRes] = await Promise.all([
        fetch('/api/projects'),
        fetch('/api/blogs'),
      ])
      setProjects(await pRes.json())
      setBlogs(await bRes.json())
    } catch {
      console.error('Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    if (!localStorage.getItem('admin_token')) {
      router.push('/admin')
      return
    }
    Promise.resolve().then(() => fetchData())
  }, [fetchData, router])

  const handleLogout = () => {
    localStorage.removeItem('admin_token')
    localStorage.removeItem('admin_username')
    router.push('/admin')
  }

  const confirmDelete = async () => {
    if (!deleteConfirm) return
    const { type, idOrSlug } = deleteConfirm
    setDeleteConfirm(null)

    const endpoint =
      type === 'projects'
        ? `/api/projects/${idOrSlug}`
        : `/api/blogs/${idOrSlug}`

    const res = await fetch(endpoint, {
      method: 'DELETE',
      headers: getHeaders(),
    })
    if (res.ok) {
      showToast('success', 'Berhasil menghapus')
      fetchData()
    } else {
      const data = await res.json()
      showToast('error', data.error || 'Gagal menghapus')
    }
  }

  const handleDelete = (type: Tab, idOrSlug: string | number, title: string) => {
    setDeleteConfirm({ type, idOrSlug, title })
  }

  const handleSave = async (data: Record<string, unknown>) => {
    let res: Response

    if (editing && 'id' in editing) {
      res = await fetch(`/api/projects/${(editing as Project).id}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    } else if (editing && 'slug' in editing) {
      res = await fetch(`/api/blogs/${(editing as BlogPost).slug}`, {
        method: 'PUT',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    } else {
      res = await fetch(`/api/${tab}`, {
        method: 'POST',
        headers: getHeaders(),
        body: JSON.stringify(data),
      })
    }

    if (res.ok) {
      showToast('success', 'Berhasil menyimpan')
      setShowForm(false)
      setEditing(null)
      fetchData()
    } else {
      const err = await res.json()
      showToast('error', err.error || 'Gagal menyimpan')
      throw new Error(err.error || 'Gagal menyimpan')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen pt-[100px] px-5">
        <div className="max-w-6xl mx-auto">
          <div className="animate-pulse space-y-4">
            <div className="h-8 w-48 bg-bg-card rounded" />
            <div className="h-12 w-full bg-bg-card rounded" />
            <div className="h-64 w-full bg-bg-card rounded" />
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen pt-[100px] pb-[60px] px-5">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gradient">Dashboard</h1>
            <p className="text-text-muted text-sm">
              Selamat datang, {localStorage.getItem('admin_username')}
            </p>
          </div>
          <div className="flex gap-3">
            <Link
              href="/"
              className="px-4 py-2 rounded-xl border border-border text-text-secondary text-sm hover:border-accent hover:text-accent transition-all"
            >
              Lihat Site
            </Link>
            <button
              onClick={handleLogout}
              className="px-4 py-2 rounded-xl bg-danger/20 text-danger text-sm hover:bg-danger/30 transition-all cursor-pointer"
            >
              Logout
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          {(['projects', 'blogs'] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => {
                setTab(t)
                setShowForm(false)
                setEditing(null)
              }}
              className={`px-5 py-2.5 rounded-xl text-sm font-medium transition-all capitalize cursor-pointer ${
                tab === t
                  ? 'bg-gradient-accent text-white'
                  : 'bg-bg-card text-text-secondary border border-border hover:border-accent'
              }`}
            >
              {t === 'projects' ? 'Proyek' : 'Blog'}
              <span className="ml-2 text-xs opacity-70">
                ({tab === t ? projects.length : blogs.length})
              </span>
            </button>
          ))}
        </div>

        {/* Add button */}
        {!showForm && (
          <motion.button
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.99 }}
            onClick={() => {
              setEditing(null)
              setShowForm(true)
            }}
            className="mb-6 px-5 py-2.5 rounded-xl bg-accent/20 text-accent-light text-sm font-medium hover:bg-accent/30 transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <i className="fas fa-plus" />
            Tambah {tab === 'projects' ? 'Proyek' : 'Artikel'}
          </motion.button>
        )}

        {/* Form */}
        <AnimatePresence>
          {showForm && (
            <ItemForm
              key={editing ? ('id' in editing ? (editing as Project).id : (editing as BlogPost).slug) : 'new'}
              tab={tab}
              editing={editing}
              onSave={handleSave}
              onCancel={() => {
                setShowForm(false)
                setEditing(null)
              }}
            />
          )}
        </AnimatePresence>

        {/* List */}
        <AnimatePresence mode="wait">
          <motion.div
            key={tab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="space-y-3"
          >
            {(tab === 'projects' ? projects : blogs).length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 text-text-muted">
                <svg
                  className="w-16 h-16 mb-4 text-text-muted/40"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                  strokeWidth={1}
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"
                  />
                </svg>
                <p className="text-lg font-medium">Belum ada data</p>
                <p className="text-sm mt-1">
                  Klik tombol &ldquo;Tambah&rdquo; di atas untuk memulai
                </p>
              </div>
            )}

            {(tab === 'projects' ? projects : blogs).map(
              (item: Project | BlogPost, i) => {
                const itemKey =
                  'id' in item
                    ? String((item as Project).id)
                    : (item as BlogPost).slug
                const imageUrl =
                  'image' in item
                    ? (item as Project).image
                    : (item as BlogPost).coverImage
                return (
                  <motion.div
                    key={itemKey}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className="bg-bg-card border border-border rounded-xl p-5 flex items-center justify-between group hover:border-accent/30 transition-all"
                  >
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                      {imageUrl && (
                        <Image
                          src={imageUrl}
                          alt={item.title}
                          width={48}
                          height={48}
                          className="w-12 h-12 rounded-lg object-cover shrink-0 bg-bg-primary"
                          onError={(e) => {
                            ;(e.currentTarget as HTMLImageElement).style.display = 'none'
                          }}
                        />
                      )}
                      <div className="min-w-0">
                        <h3 className="font-semibold truncate">{item.title}</h3>
                        <p className="text-sm text-text-muted truncate">
                          {'slug' in item
                            ? item.slug
                            : (item as Project).slug}
                        </p>
                      </div>
                    </div>
                    <div className="flex gap-2 ml-4 shrink-0">
                      <button
                        onClick={() => {
                          setEditing(item)
                          setShowForm(true)
                        }}
                        className="w-9 h-9 rounded-lg bg-accent/20 text-accent-light hover:bg-accent/30 transition-all cursor-pointer flex items-center justify-center"
                        title="Edit"
                      >
                        <i className="fas fa-edit text-sm" />
                      </button>
                      <button
                        onClick={() => {
                          const deleteKey =
                            'id' in item
                              ? (item as Project).id
                              : (item as BlogPost).slug
                          handleDelete(tab, deleteKey, item.title)
                        }}
                        className="w-9 h-9 rounded-lg bg-danger/20 text-danger hover:bg-danger/30 transition-all cursor-pointer flex items-center justify-center"
                        title="Hapus"
                      >
                        <i className="fas fa-trash text-sm" />
                      </button>
                    </div>
                  </motion.div>
                )
              }
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Toast container */}
      <ToastContainer toasts={toasts} />

      {/* Delete confirmation modal */}
      <AnimatePresence>
        {deleteConfirm && (
          <DeleteConfirmModal
            title={deleteConfirm.title}
            onConfirm={confirmDelete}
            onCancel={() => setDeleteConfirm(null)}
          />
        )}
      </AnimatePresence>
    </div>
  )
}

/* ─── Toast container ─── */

function ToastContainer({ toasts }: { toasts: ToastItem[] }) {
  return (
    <div className="fixed top-5 right-5 z-50 flex flex-col gap-2 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, x: 80, scale: 0.95 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 80, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 400, damping: 30 }}
            className={`pointer-events-auto px-4 py-3 rounded-xl shadow-lg text-sm font-medium flex items-center gap-2.5 ${
              toast.type === 'success'
                ? 'bg-green-900/90 text-green-200 border border-green-700/50'
                : 'bg-red-900/90 text-red-200 border border-red-700/50'
            }`}
          >
            {toast.type === 'success' ? (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            ) : (
              <svg className="w-4 h-4 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            )}
            {toast.message}
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

/* ─── Delete confirmation modal ─── */

function DeleteConfirmModal({
  title,
  onConfirm,
  onCancel,
}: {
  title: string
  onConfirm: () => void
  onCancel: () => void
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.15 }}
      className="fixed inset-0 z-40 flex items-center justify-center p-5"
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onCancel}
      />

      {/* Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.92, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.92, y: 20 }}
        transition={{ type: 'spring', stiffness: 400, damping: 30 }}
        className="relative bg-bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-2xl"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-danger/20 flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 text-danger" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
            </svg>
          </div>
          <div>
            <h3 className="font-bold text-lg text-text-primary">
              Konfirmasi Hapus
            </h3>
            <p className="text-sm text-text-muted mt-0.5">
              Yakin ingin menghapus <span className="font-medium text-text-secondary">&ldquo;{title}&rdquo;</span>?
            </p>
          </div>
        </div>

        <div className="flex gap-3 justify-end pt-2">
          <button
            onClick={onCancel}
            className="px-4 py-2 rounded-xl border border-border text-text-secondary text-sm hover:border-accent transition-all cursor-pointer"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="px-4 py-2 rounded-xl bg-danger text-white text-sm font-semibold hover:opacity-90 transition-all cursor-pointer"
          >
            Hapus
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}

/* ─── Form ─── */

function ItemForm({
  tab,
  editing,
  onSave,
  onCancel,
}: {
  tab: Tab
  editing: EditorItem
  onSave: (data: Record<string, unknown>) => Promise<void>
  onCancel: () => void
}) {
  const [form, setForm] = useState(() => {
    if (!editing) {
      return {
        title: '',
        description: '',
        slug: '',
        content: '',
        excerpt: '',
        techStack: '',
        image: '',
        category: '',
        liveUrl: '',
        sourceUrl: '',
        tags: '',
        coverImage: '',
      }
    }
    return {
      title: editing.title,
      description: 'description' in editing ? editing.description : '',
      slug: editing.slug,
      content: 'content' in editing ? editing.content : '',
      excerpt: 'excerpt' in editing ? editing.excerpt : '',
      techStack:
        'techStack' in editing
          ? (editing as Project).techStack.join(', ')
          : '',
      image: 'image' in editing ? (editing as Project).image : '',
      category: 'category' in editing ? editing.category : '',
      liveUrl: 'liveUrl' in editing ? (editing as Project).liveUrl || '' : '',
      sourceUrl:
        'sourceUrl' in editing ? (editing as Project).sourceUrl || '' : '',
      tags: 'tags' in editing ? (editing as BlogPost).tags.join(', ') : '',
      coverImage:
        'coverImage' in editing ? (editing as BlogPost).coverImage : '',
    }
  })
  const [saving, setSaving] = useState(false)

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement
    >
  ) => {
    setForm({ ...form, [e.target.name]: e.target.value })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      if (tab === 'projects') {
        await onSave({
          title: form.title,
          slug: form.slug,
          description: form.description,
          category: form.category,
          image: form.image,
          techStack: form.techStack
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
          liveUrl: form.liveUrl || null,
          sourceUrl: form.sourceUrl || null,
        })
      } else {
        await onSave({
          title: form.title,
          slug: form.slug,
          excerpt: form.excerpt,
          content: form.content,
          category: form.category,
          tags: form.tags
            .split(',')
            .map((t: string) => t.trim())
            .filter(Boolean),
          coverImage: form.coverImage,
        })
      }
    } catch {
      // Error toast already shown by parent
    } finally {
      setSaving(false)
    }
  }

  const isProject = tab === 'projects'
  const isEditing = !!editing

  return (
    <motion.form
      initial={{ opacity: 0, height: 0 }}
      animate={{ opacity: 1, height: 'auto' }}
      exit={{ opacity: 0, height: 0 }}
      onSubmit={handleSubmit}
      className="mb-6 bg-bg-card border border-border rounded-xl p-6 space-y-4 overflow-hidden"
    >
      <h3 className="font-bold text-lg">
        {isEditing ? 'Edit' : 'Tambah'}{' '}
        {isProject ? 'Proyek' : 'Artikel'}
      </h3>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <FormField label="Judul" required>
          <input
            type="text"
            name="title"
            value={form.title}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
            required
          />
        </FormField>
        <FormField label="Slug" required>
          <input
            type="text"
            name="slug"
            value={form.slug}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
            required
          />
        </FormField>
        <FormField label="Kategori">
          <input
            type="text"
            name="category"
            value={form.category}
            onChange={handleChange}
            className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
          />
        </FormField>
        {isProject && (
          <>
            <FormField label="Gambar URL">
              <input
                type="text"
                name="image"
                value={form.image}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
            <FormField label="Tech Stack (pisahkan dengan koma)">
              <input
                type="text"
                name="techStack"
                value={form.techStack}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
            <div />
            <FormField label="Live URL">
              <input
                type="text"
                name="liveUrl"
                value={form.liveUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
            <FormField label="Source URL">
              <input
                type="text"
                name="sourceUrl"
                value={form.sourceUrl}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
          </>
        )}
        {!isProject && (
          <>
            <FormField label="Cover Image URL">
              <input
                type="text"
                name="coverImage"
                value={form.coverImage}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
            <FormField label="Tags (pisahkan dengan koma)">
              <input
                type="text"
                name="tags"
                value={form.tags}
                onChange={handleChange}
                className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm"
              />
            </FormField>
          </>
        )}
      </div>

      {isProject && (
        <FormField label="Deskripsi">
          <textarea
            name="description"
            value={form.description}
            onChange={handleChange}
            rows={3}
            className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm resize-none"
          />
        </FormField>
      )}
      {!isProject && (
        <>
          <FormField label="Excerpt">
            <textarea
              name="excerpt"
              value={form.excerpt}
              onChange={handleChange}
              rows={2}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm resize-none"
            />
          </FormField>
          <FormField label="Konten (HTML)">
            <textarea
              name="content"
              value={form.content}
              onChange={handleChange}
              rows={10}
              className="w-full px-3 py-2.5 rounded-lg bg-bg-primary border border-border text-text-primary focus:outline-none focus:border-accent text-sm font-mono resize-none"
            />
          </FormField>
        </>
      )}

      <div className="flex gap-3 pt-2">
        <button
          type="submit"
          disabled={saving}
          className="px-5 py-2.5 rounded-xl bg-gradient-accent text-white text-sm font-semibold hover:opacity-90 disabled:opacity-60 disabled:cursor-not-allowed transition-all cursor-pointer inline-flex items-center gap-2"
        >
          {saving && (
            <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          )}
          {saving ? 'Menyimpan...' : isEditing ? 'Simpan' : 'Buat'}
        </button>
        <button
          type="button"
          onClick={onCancel}
          disabled={saving}
          className="px-5 py-2.5 rounded-xl border border-border text-text-secondary text-sm hover:border-accent disabled:opacity-40 disabled:cursor-not-allowed transition-all cursor-pointer"
        >
          Batal
        </button>
      </div>
    </motion.form>
  )
}

function FormField({
  label,
  required,
  children,
}: {
  label: string
  required?: boolean
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="block text-sm text-text-secondary mb-1.5">
        {label}
        {required && <span className="text-danger ml-1">*</span>}
      </label>
      {children}
    </div>
  )
}
