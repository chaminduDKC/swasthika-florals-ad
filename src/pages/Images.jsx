import { useState, useEffect, useRef } from 'react'
import { imagesAPI, categoriesAPI } from '../api'
import { useToast } from '../context/ToastContext'
import { optimizeImage } from '../utils/optimizeImage'

const emptyForm = { title: '', description: '', type: '', categoryId: '' }

export default function Images() {
  const toast = useToast()
  const fileRef = useRef()

  const [images, setImages] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [modal, setModal] = useState(null)   // null | 'upload' | 'edit' | 'view'
  const [form, setForm] = useState(emptyForm)
  const [file, setFile] = useState(null)
  const [preview, setPreview] = useState(null)
  const [uploading, setUploading] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editId, setEditId] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [deleting, setDeleting] = useState(false)
  const [viewImg, setViewImg] = useState(null)
  const [dragOver, setDragOver] = useState(false)
  const [filter, setFilter] = useState('all')

  const [filters, setFilters] = useState([]);

  useEffect(() => {
    getAllCategories();
  }, [])

  const getAllCategories = async () => {
    const res = await categoriesAPI.getAllCats();
    console.log("Category list");
    
    console.log(res.data.data);
setCategories(res.data.data)
    setFilters(res.data.data);
  }

  const TYPE_OPTIONS = [
    filters.map(c => ({ value: c._id, label: c.name })),
  ]
  useEffect(() => {
    console.log("Started");

    Promise.all([
      imagesAPI.getAll(),
      categoriesAPI.getAllMainCats(),
      console.log("Started")

    ]).then(([imgs, cats]) => {
      console.log(imgs);
      setImages(imgs.data.data || imgs.data)
      // setCategories(cats.data.data)
      console.log("selections");
      console.log(cats.data.data);
      
    }).catch(() => toast.error('Failed to load data'))
      .finally(() => setLoading(false))
  }, [])

  const getAllImages = async (req, res) => {
    imagesAPI.getAll()
  }

  const handleFileSelect = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB'); return }
    setFile(f)
    setPreview(URL.createObjectURL(f))
  }

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  const openUpload = () => { setForm(emptyForm); setFile(null); setPreview(null); setEditId(null); setModal('upload') }
  const openEdit = (img) => {
    setForm({ title: img.title, description: img.description, type: img.type, categoryId: img.categoryId || '' })
    setEditId(img.cloudinary_id); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setDeleteId(null); setViewImg(null) }

  const handleUpload = async (e) => {
    e.preventDefault()
    if (!file) { toast.error('Please select an image'); return }
    if (!form.title) { toast.error('Please enter a title'); return }
    if (!form.type) { toast.error('Please select a type'); return }
    setUploading(true)
    try {
      const fd = new FormData()
      fd.append('image', file)
      fd.append('title', form.title)
      fd.append('description', form.description)
      fd.append('type', form.type)
      fd.append('categoryId',   form.categoryId)  
  
      console.log(fd);
      console.log(form);


        const res = await imagesAPI.upload(fd)
      console.log("form.type");
      console.log(form.type);

        setImages(prev => [res.data.data, ...prev])
        toast.success('Image uploaded successfully!')
        closeModal()
    } catch (err) {
      toast.error(err.response?.data?.message || 'Upload failed')
    } finally { setUploading(false) }
  }

  const handleUpdate = async (e) => {
    e.preventDefault()
    if (!form.title) { toast.error('Title is required'); return }
    setSaving(true)
    try {
      const encodedId = encodeURIComponent(editId);
      const res = await imagesAPI.update(encodedId, form)
      console.log("AFter UPdate");

      console.log(res.data.data);

      setImages(prev => prev.map(i => i.cloudinary_id === editId ? res.data.data : i))
      toast.success('Image updated!')
      closeModal()
    } catch { toast.error('Failed to update image') }
    finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const encodedId = encodeURIComponent(deleteId);
      await imagesAPI.delete(encodedId)
      setImages(prev => prev.filter(i => i.cloudinary_id !== deleteId))
      toast.success('Image deleted')
      setDeleteId(null)


    } catch { toast.error('Failed to delete image') }
    finally { setDeleting(false) }
  }

  let filtered = filter === 'all' ? images : images.filter(i => i.type.toLowerCase() === filter.toLowerCase())

  return (
    <div style={{ animation: 'fadeUp .4s ease' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '.65rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purple-lt)' }}>Manage</span>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, color: 'var(--cream)', lineHeight: 1.1 }}>
            Images
          </h1>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openUpload}>
          <span>↑</span> Upload Image
        </button>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {['all', ...filters.map(t => t.name)].map(t => (
          <button key={t} onClick={() => {
            setFilter(t)
            filtered = t === 'all' ? images : images.filter(i => {
              i.type.toLowerCase() === t.toLowerCase()
            })
            console.log("Filtered")
            console.log(filtered.length);
            console.log(images);

          }} style={{
            padding: '6px 14px', borderRadius: 20, fontSize: '.72rem', letterSpacing: '.1em', textTransform: 'uppercase',
            border: `1px solid ${filter === t ? 'var(--purple)' : 'var(--border)'}`,
            background: filter === t ? 'rgba(139,92,246,.15)' : 'transparent',
            color: filter === t ? 'var(--purple-lt)' : 'var(--muted)',
            cursor: 'pointer', transition: 'all .2s',
          }}>
            {t === 'all' ? `All (${images.length})` : filters.find(o => o.name === t)?.name || t}
          </button>
        ))}
      </div>

      {/* Grid */}
      {loading ? (
        <div style={{ padding: 60, textAlign: 'center' }}><div className="adm-spinner" style={{ margin: '0 auto' }} /></div>
      ) : filtered.length === 0 ? (
        <div className="adm-card"><div className="adm-empty"><div className="adm-empty-icon">🖼️</div><div className="adm-empty-text">No images yet. Upload your first one!</div></div></div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px,1fr))', gap: 12 }}>
          {filtered.map(img => (
            <div key={img._id} className="adm-card" style={{ padding: 0, overflow: 'hidden', cursor: 'pointer' }}
              onMouseEnter={e => e.currentTarget.style.borderColor = 'var(--border-lt)'}
              onMouseLeave={e => e.currentTarget.style.borderColor = ''}
            >
              {/* Image */}
              <div style={{ position: 'relative', height: 180, background: 'var(--dark)', overflow: 'hidden' }} onClick={() => { setViewImg(img); setModal('view') }}>
                {img.secure_url ? (
                  <img src={optimizeImage(img.secure_url, 1200)} loading='lazy' alt={img.title} style={{ width: '100%', height: '100%', objectFit: 'cover', transition: 'transform .4s' }}
                    onMouseEnter={e => e.target.style.transform = 'scale(1.05)'}
                    onMouseLeave={e => e.target.style.transform = 'scale(1)'}
                  />
                ) : (
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', fontSize: '2rem', opacity: .2 }}>🖼️</div>
                )}
                <div style={{ position: 'absolute', top: 8, right: 8 }}>
                  <span className="adm-badge adm-badge-purple" style={{ fontSize: '.6rem' }}>
                    {TYPE_OPTIONS.find(t => t.value === img.type)?.label || img.type}
                  </span>
                </div>
              </div>
              {/* Info */}
              <div style={{ padding: '12px 14px' }}>
                <div style={{ fontSize: '.85rem', color: 'var(--cream)', fontWeight: 400, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                  {img.title}
                </div>
                <div style={{ fontSize: '.72rem', color: 'var(--muted)', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', marginBottom: 12 }}>
                  {img.description || 'No description'}
                </div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <button className="adm-btn adm-btn-outline" style={{ padding: '5px 10px', fontSize: '.7rem', flex: 1, justifyContent: 'center' }} onClick={() => openEdit(img)}>Edit</button>
                  <button className="adm-btn adm-btn-danger" style={{ padding: '5px 10px', fontSize: '.7rem', flex: 1, justifyContent: 'center' }} onClick={() => setDeleteId(img.cloudinary_id)}>Delete</button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {modal === 'upload' && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Upload Image</h2>
              <button className="adm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={handleUpload}>
                {/* Dropzone */}
                <div
                  className={`adm-dropzone${dragOver ? ' drag-over' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {preview ? (
                    <img src={preview} alt="preview" className="adm-img-preview" style={{ marginTop: 0 }} />
                  ) : (
                    <>
                      <div className="adm-dropzone-icon">📷</div>
                      <div className="adm-dropzone-text">
                        <span>Click to browse</span> or drag & drop<br />
                        JPG, PNG, WEBP · Max 10MB
                      </div>
                    </>
                  )}
                </div>
                <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                {file && <div style={{ fontSize: '.72rem', color: 'var(--success)', marginTop: 6 }}>✓ {file.name} ({(file.size / 1024 / 1024).toFixed(2)} MB)</div>}

                <div style={{ marginTop: 16 }}>
                  <div className="adm-form-group">
                    <label className="adm-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
                    <input className="adm-input" placeholder="e.g. White Rose Poruwa Setup" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                  </div>

                  <div className="adm-form-group">
                    <label className="adm-label">Type <span style={{ color: 'var(--error)' }}>*</span></label>
                    <select
                      className="adm-select"
                      value={form.categoryId}
                      onChange={e => {
                        const selected = categories.find(c => c._id === e.target.value)
                        setForm(p => ({
                          ...p,
                          categoryId: selected ? selected._id : '',  // ← save _id
                          type: selected ? selected.name : '',  // ← save name
                        }))
                      }}
                    >
                      <option value="">Select a Category</option>
                      {categories.map(c => (
                        <option key={c._id} value={c._id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </div>


                  <div className="adm-form-group">
                    <label className="adm-label">Description</label>
                    <textarea className="adm-textarea" placeholder="Describe this image..." value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                  </div>
                </div>

                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="adm-btn adm-btn-outline" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={uploading}>
                    {uploading ? <><div className="adm-spinner" />Uploading...</> : '↑ Upload to Cloudinary'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Modal */}
      {modal === 'edit' && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Edit Image</h2>
              <button className="adm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={handleUpdate}>
                <div className="adm-form-group">
                  <label className="adm-label">Title <span style={{ color: 'var(--error)' }}>*</span></label>
                  <input className="adm-input" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} required />
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Type</label>

                    <select className="adm-select" value={form.type} onChange={e => setForm(p => ({ ...p, type: e.target.value }))}>
                      {filters.map(o => <option key={o.value} value={o.value}>{o.name}</option>)}
                    </select>
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Category</label>
                    <select disabled className="adm-select" value={form.categoryId} onChange={e => setForm(p => ({ ...p, categoryId: e.target.value }))}>
                      <option value="">None</option>
                      {categories.map(c => <option key={c._id} value={c._id}>{c.name} {c.em}</option>)}
                    </select>
                  </div>
                </div>
                <div className="adm-form-group">
                  <label className="adm-label">Description</label>
                  <textarea className="adm-textarea" value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                </div>
                <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                  <button type="button" className="adm-btn adm-btn-outline" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    {saving ? <><div className="adm-spinner" />Saving...</> : 'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* View Modal */}
      {modal === 'view' && viewImg && (
        <div className="adm-modal-backdrop" onClick={closeModal}>
          <div style={{ maxWidth: 500, width: '100%', animation: 'fadeUp .3s ease' }} onClick={e => e.stopPropagation()}>
            <img src={optimizeImage(viewImg.secure_url, 700)} loading='lazy' alt={viewImg.title} style={{ width: '100%', borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
            <div style={{ background: 'var(--card)', border: '1px solid var(--border)', borderTop: 'none', borderRadius: '0 0 var(--radius) var(--radius)', padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 12 }}>
              <div>
                <div style={{ color: 'var(--cream)', fontWeight: 400 }}>{viewImg.title}</div>
                <div style={{ fontSize: '.75rem', color: 'var(--muted)', marginTop: 3 }}>{viewImg.description}</div>
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <span className="adm-badge adm-badge-purple" style={{ display: 'flex', alignItems: "center", justifyContent: 'center' }}>{viewImg.type}</span>
                <button className="adm-modal-close" style={{ position: 'static', color: 'var(--muted)' }} onClick={closeModal}>✕</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm */}
      {deleteId && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="adm-modal" style={{ maxWidth: 400 }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Delete Image</h2>
              <button className="adm-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize: '.85rem', color: 'var(--text)', lineHeight: 1.7, marginBottom: 20 }}>
                This will permanently delete the image from Cloudinary. This action <strong style={{ color: 'var(--error)' }}>cannot be undone</strong>.
              </p>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'flex-end' }}>
                <button className="adm-btn adm-btn-outline" onClick={() => setDeleteId(null)}>Cancel</button>
                <button className="adm-btn adm-btn-danger" onClick={handleDelete} disabled={deleting}>
                  {deleting ? <><div className="adm-spinner" />Deleting...</> : 'Yes, Delete'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
