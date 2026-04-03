import { useState, useEffect, useRef } from 'react'
import { categoriesAPI } from '../api'
import { useToast } from '../context/ToastContext'
import { optimizeImage } from '../utils/optimizeImage'



export default function Categories() {
  const fileRef = useRef()
  const toast = useToast()
  const [categories, setCategories] = useState([])
  const [bridalCategories, setBridalCategories] = useState([])
  const [otherCategories, setOtherCategories] = useState([])
  const [engagementCats, setEngagementCats] = useState([])
  const [loading, setLoading]       = useState(true)
  const [saving, setSaving]         = useState(false)
  const [modal, setModal]           = useState(null)   // null | 'add' | 'edit'
  const [form, setForm]             = useState({})
  const [editId, setEditId]         = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [deleting, setDeleting]     = useState(false)
  const [viewImg, setViewImg]       = useState(null)
  const [dragOver, setDragOver]     = useState(false)
  const [filter, setFilter]         = useState('all')
  const [preview, setPreview]       = useState(null)
  const [file, setFile]             = useState(null)
  const [categoryId, setCategoryId] = useState([]);
  const [currentCat, setCurrentCat] = useState(null);
  const [openDetailModal, setOpenDetailMenu] = useState(false);

  const commonCats = ["Poruwa", "Setty Back", "Table", "Entrance", "Oil lamp", ["Car"]];
  const otherCats = ["Birthday", "Openings", "Concerts", "Baloons", "Other"]
  const engageCats = ["Engagement"]
  const bridals = ["Kandyan", "Rounded"]
  const fetchAll = async () => {
    try {
      const res = await categoriesAPI.getAllMainCats()
      const sorted = res.data.data.sort((a, b)=> a.order - b.order)
      setCategories(sorted)
    } catch(error) { 
      console.log(error)
      toast.error('Failed to load categories')
     }
    finally  { setLoading(false) }
  }

  const fetchEngagementCat = async()=>{
      const result = await categoriesAPI.getEngagementCat();
      setEngagementCats(result.data.data)
      
  }

  const fetchBridalCats = async()=>{
 const result = await categoriesAPI.getBridalCats();
      setBridalCategories(result.data.data)
  }

  const fetchOtherCats = async()=>{
    const result = await categoriesAPI.getOtherCats()
    setOtherCategories(result.data.data)
  }
  useEffect(() => { 
    fetchAll() 
    fetchOtherCats()
    fetchBridalCats()
    fetchEngagementCat()
  }, [])

  const openAdd = () => { setForm({}); setEditId(null); setModal('add') }
  const openEdit = (cat) => {
    
    setForm({ name:cat.name, label:cat.label, thumbnail:cat.thumbnail,  description:cat.description, order:cat.order||0 })
    setEditId(cat._id); setModal('edit')
  }
  const closeModal = () => { setModal(null); setEditId(null); setDeleteId(null) }
  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false)
    handleFileSelect(e.dataTransfer.files[0])
  }

  
  const handleFileSelect = (f) => {
    if (!f) return
    if (!f.type.startsWith('image/')) { toast.error('Please select an image file'); return }
    if (f.size > 10 * 1024 * 1024) { toast.error('File too large. Max 10MB'); return }
    setFile(f)
    
    setPreview(URL.createObjectURL(f))
  }
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.name || !form.label || !form.order || !form.description) { toast.error('Please fill all required fields'); return }
    setSaving(true)
    const fd = new FormData();
    try {
      if (modal === 'add') {
        fd.append('image', file)
        fd.append('name', form.name)
        fd.append('label', form.label)
        fd.append('order', form.order)
        fd.append('description', form.description)
        console.log(fd);
        console.log(file);
        
       
        
        const res = await categoriesAPI.create(fd)
        
        
        toast.success('Category created!')
        setFile(null)
      } else {
        console.log("Editing mode");
        
       
        
        fd.append('image', file);
        fd.append('name', form.name)
        fd.append('label', form.label)
        fd.append('order', form.order)
        fd.append('description', form.description)
        fd.append('thumbnailId', categoryId)
        
        
        
        const res = await categoriesAPI.update(editId, fd)
        
        // setCategories(prev => prev.map(c => c._id === editId ? res.data.data : c))
         if(file === null) {
          toast.success("Category updated without thumbnail!")
         } else{
           toast.success('Category updated!')
         }
      }
      if(commonCats.includes(form.name)){
        fetchAll()
      } else if(otherCats.includes(form.name)){
        fetchOtherCats()
      } else if(engageCats.includes(form.name)){
        fetchEngagementCat()
      } else if(bridals.includes(form.name)){
        fetchBridalCats()
      } else{
        console.log("Nothing matched with");
        console.log(form.name);
        
      }
      closeModal()
      setFile(null)
    } catch (err) {
      
      console.log(err);
      
      toast.error(err.response?.data?.message || 'Failed to save category')
    } finally { setSaving(false) }
  }

  const handleDelete = async () => {
    setDeleting(true)
    try {
      const encodedId = encodeURIComponent(deleteId);

      await categoriesAPI.delete(encodedId)
      setCategories(prev => prev.filter(c => c._id !== deleteId))
      toast.success('Category deleted')
      setDeleteId(null)
    } catch { toast.error('Failed to delete category') }
    finally { setDeleting(false) }
  }

  return (
    <div style={{ animation:'fadeUp .4s ease' }}>

      {/* Header */}
      <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, flexWrap:'wrap', gap:16 }}>
        <div>
          <span style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--purple-lt)' }}>Manage</span>
          <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.1 }}>
            Wedding Categories
          </h1>
        </div>
        <button className="adm-btn adm-btn-primary" onClick={openAdd}>
          <span>+</span> Add Category
        </button>
      </div>

      {/* Table */}
      <div className="adm-card" style={{ padding:0, overflow:'hidden' }}>
        {loading ? (
          <div style={{ padding:40, textAlign:'center' }}>
            <div className="adm-spinner" style={{ margin:'0 auto' }} />
          </div>
        ) : categories.length === 0 ? (
          
          <div className="adm-empty">
            <div className="adm-empty-icon">❋</div>
            <div className="adm-empty-text">No categories yet. Add your first one!</div>
          </div>
      
        ) : (
          <>
          <div className="adm-table-wrap">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th className='hide-on-mobile'>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
               <tbody>
                {categories.sort((a,b) => (a.order||0)-(b.order||0)).map(cat => (
                  <tr onClick={()=>{
                    setCurrentCat(cat)
                    setOpenDetailMenu(true);
                    console.log(cat);
                    
                  }} key={cat._id}>
                    <td><span style={{ fontSize:'1.4rem' }}>
                      <img style={{
                        width:"40px",
                        height:"40px"
                      }} src={optimizeImage(cat?.thumbnail, 100)} loading='lazy' alt={cat.title} />
                      </span></td>
                    <td>
                      <div style={{ fontWeight:400, color:'var(--cream)' }}>{cat.name}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{cat.label}</div>
                    </td>
                  
                    <td className='hide-on-mobile' style={{ maxWidth:200 }}>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cat.description}
                      </div>
                    </td>
                    <td style={{ color:'var(--muted)' }}>{cat.order ?? '—'}</td>
                    <td>
                      <div style={{ display:'flex',flexDirection:"column", gap:8 }}>
                        <button className="adm-btn adm-btn-outline" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) => {
                          openEdit(cat)
                          e.stopPropagation()
                          setCategoryId(cat.thumbnailId)
                          console.log(cat);
                          
                        }}>
                          Edit
                        </button>
                        <button className="adm-btn adm-btn-danger" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) =>{
                          e.stopPropagation();
                           setDeleteId(cat._id)
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>  
            </table>
          </div>

<hr />

{/* Bridal Categories */}

<div className="adm-table-wrap" style={{marginTop:"2rem"}}> 
   <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.1 }}>
            Bridal Bouquets
          </h1>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th className='hide-on-mobile'>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
               <tbody>
                {bridalCategories.sort((a,b) => (a.order||0)-(b.order||0)).map(cat => (
                  <tr onClick={()=>{
                    setCurrentCat(cat)
                    setOpenDetailMenu(true);
                    console.log(cat);
                    
                  }} key={cat._id}>
                    <td><span style={{ fontSize:'1.4rem' }}>
                      <img style={{
                        width:"40px",
                        height:"40px"
                      }} src={cat?.thumbnail} loading='lazy' alt={cat.title} />
                      </span></td>
                    <td>
                      <div style={{ fontWeight:400, color:'var(--cream)' }}>{cat.name}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{cat.label}</div>
                    </td>
                  
                    <td className='hide-on-mobile' style={{ maxWidth:200 }}>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cat.description}
                      </div>
                    </td>
                    <td style={{ color:'var(--muted)' }}>{cat.order ?? '—'}</td>
                    <td>
                      <div style={{ display:'flex',flexDirection:"column", gap:8 }}>
                        <button className="adm-btn adm-btn-outline" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) => {
                          openEdit(cat)
                          e.stopPropagation()
                          setCategoryId(cat.thumbnailId)
                          console.log(cat);
                          
                        }}>
                          Edit
                        </button>
                        <button className="adm-btn adm-btn-danger" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) =>{
                          e.stopPropagation();
                           setDeleteId(cat._id)
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>  
            </table>
          </div>





<hr />

{/* engagement Categories */}
<div className="adm-table-wrap" style={{marginTop:"2rem"}}> 
   <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.1 }}>
            Engagement categories
          </h1>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th className='hide-on-mobile'>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
               <tbody>
                {engagementCats.sort((a,b) => (a.order||0)-(b.order||0)).map(cat => (
                  <tr onClick={()=>{
                    setCurrentCat(cat)
                    setOpenDetailMenu(true);
                    console.log(cat);
                    
                  }} key={cat._id}>
                    <td><span style={{ fontSize:'1.4rem' }}>
                      <img style={{
                        width:"40px",
                        height:"40px"
                      }} src={cat?.thumbnail} loading='lazy' alt={cat.title} />
                      </span></td>
                    <td>
                      <div style={{ fontWeight:400, color:'var(--cream)' }}>{cat.name}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{cat.label}</div>
                    </td>
                  
                    <td className='hide-on-mobile' style={{ maxWidth:200 }}>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cat.description}
                      </div>
                    </td>
                    <td style={{ color:'var(--muted)' }}>{cat.order ?? '—'}</td>
                    <td>
                      <div style={{ display:'flex',flexDirection:"column", gap:8 }}>
                        <button className="adm-btn adm-btn-outline" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) => {
                          openEdit(cat)
                          e.stopPropagation()
                          setCategoryId(cat.thumbnailId)
                          console.log(cat);
                          
                        }}>
                          Edit
                        </button>
                        <button className="adm-btn adm-btn-danger" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) =>{
                          e.stopPropagation();
                           setDeleteId(cat._id)
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>  
            </table>
          </div>



<hr />

{/* other Categories */}

<div className="adm-table-wrap" style={{marginTop:"2rem"}}> 
   <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.1 }}>
            Other
          </h1>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Thumbnail</th>
                  <th>Name</th>
                  <th className='hide-on-mobile'>Description</th>
                  <th>Order</th>
                  <th>Actions</th>
                </tr>
              </thead>
               <tbody>
                {otherCategories.sort((a,b) => (a.order||0)-(b.order||0)).map(cat => (
                  <tr onClick={()=>{
                    setCurrentCat(cat)
                    setOpenDetailMenu(true);
                    console.log(cat);
                    
                  }} key={cat._id}>
                    <td><span style={{ fontSize:'1.4rem' }}>
                      <img style={{
                        width:"40px",
                        height:"40px"
                      }} src={cat?.thumbnail} loading='lazy' alt={cat.title} />
                      </span></td>
                    <td>
                      <div style={{ fontWeight:400, color:'var(--cream)' }}>{cat.name}</div>
                      <div style={{ fontSize:'.72rem', color:'var(--muted)', marginTop:2 }}>{cat.label}</div>
                    </td>
                  
                    <td className='hide-on-mobile' style={{ maxWidth:200 }}>
                      <div style={{ fontSize:'.78rem', color:'var(--muted)', overflow:'hidden', textOverflow:'ellipsis', whiteSpace:'nowrap' }}>
                        {cat.description}
                      </div>
                    </td>
                    <td style={{ color:'var(--muted)' }}>{cat.order ?? '—'}</td>
                    <td>
                      <div style={{ display:'flex',flexDirection:"column", gap:8 }}>
                        <button className="adm-btn adm-btn-outline" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) => {
                          openEdit(cat)
                          e.stopPropagation()
                          setCategoryId(cat.thumbnailId)
                          console.log(cat);
                          
                        }}>
                          Edit
                        </button>
                        <button className="adm-btn adm-btn-danger" style={{ padding:'6px 12px', fontSize:'.72rem' }} onClick={(e) =>{
                          e.stopPropagation();
                           setDeleteId(cat._id)
                        }}>
                          Delete
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>  
            </table>
          </div>





<hr />


          </>
        )}
      </div>







      {/* info modal */}
{openDetailModal && (
        <div className="adm-modal-backdrop info-modal" onClick={e => e.target === e.currentTarget && setOpenDetailMenu(false)}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Info</h2>
              <button className="adm-modal-close" onClick={()=> setOpenDetailMenu(false)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <form>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Name </label>
                    <input disabled className="adm-input" placeholder="e.g. Poruwa" value={currentCat.name} required />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Label</label>
                    <input disabled className="adm-input" placeholder="e.g. Decoration" value={currentCat.label} />
                  </div>
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Display Order</label>
                    <input disabled className="adm-input" type="number" min={0} value={currentCat.order} required />
                  </div>
                </div>
                <div style={{ maxWidth: 500, width: '100%', height:"220px", animation: 'fadeUp .3s ease' }} onClick={e => e.stopPropagation()}>

                 <img src={optimizeImage(currentCat.thumbnail, 700)} loading='lazy' alt={currentCat.title} style={{ width: '100%', height:"100%", objectFit:"contain", borderRadius: 'var(--radius)', border: '1px solid var(--border)' }} />
                </div>

                {/* Description */}
                <div className="adm-form-group">
                  <label className="adm-label">Description</label>
                  <textarea className="adm-textarea" placeholder="Describe this category..." value={currentCat.description} disabled required />
                </div>
              </form>
            </div>
          </div>
        </div>
      )}


      {/* Add / Edit Modal */}
      {(modal === 'add' || modal === 'edit') && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && closeModal()}>
          <div className="adm-modal">
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">{modal === 'add' ? 'Add Category' : 'Edit Category'}</h2>
              <button className="adm-modal-close" onClick={closeModal}>✕</button>
            </div>
            <div className="adm-modal-body">
              <form onSubmit={handleSave}>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Name <span style={{color:'var(--error)'}}>*</span></label>
                    <input className="adm-input" placeholder="e.g. Poruwa" value={form.name} onChange={e => setForm(p=>({...p,name:e.target.value}))} required />
                  </div>
                  <div className="adm-form-group">
                    <label className="adm-label">Label</label>
                    <input className="adm-input" placeholder="e.g. Decoration" value={form.label} onChange={e => setForm(p=>({...p,label:e.target.value}))} />
                  </div>
                </div>
                <div className="adm-form-row">
                  <div className="adm-form-group">
                    <label className="adm-label">Display Order<span style={{color:'var(--error)'}}>*</span></label>
                    <input className="adm-input" type="number" min={0} value={form.order} onChange={e => setForm(p=>({...p,order:+e.target.value}))} required />
                  </div>

    
                </div>
                <div>
                  {modal === "edit" && "If you don't want to update thumbnail, ignore this"}
                </div>
                <div
                  className={`adm-dropzone${dragOver ? ' drag-over' : ''}`}
                  onClick={() => fileRef.current?.click()}
                  onDragOver={e => { e.preventDefault(); setDragOver(true) }}
                  onDragLeave={() => setDragOver(false)}
                  onDrop={handleDrop}
                >
                  {preview ? (
                    <img src={preview} loading='lazy' alt="preview" className="adm-img-preview" style={{ marginTop:0 }} />
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
                <input ref={fileRef} type="file" accept="image/*" style={{ display:'none' }} onChange={e => handleFileSelect(e.target.files[0])} />
                {file && <div style={{ fontSize:'.72rem', color:'var(--success)', marginTop:6 }}>✓ {file.name} ({(file.size/1024/1024).toFixed(2)} MB)</div>}

               
                

                {/* Description */}
                <div className="adm-form-group">
                  <label className="adm-label">Description <span style={{color:'var(--error)'}}>*</span></label>
                  <textarea className="adm-textarea" placeholder="Describe this category..." value={form.description} onChange={e => setForm(p=>({...p,description:e.target.value}))} required />
                </div>

                <div style={{ display:'flex', gap:12, justifyContent:'flex-end', marginTop:8 }}>
                  <button type="button" className="adm-btn adm-btn-outline" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="adm-btn adm-btn-primary" disabled={saving}>
                    {saving ? <><div className="adm-spinner" />{modal==='add'?'Creating...':'Saving...'}</> : modal==='add'?'Create Category':'Save Changes'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirm Modal */}
      {deleteId && (
        <div className="adm-modal-backdrop" onClick={e => e.target === e.currentTarget && setDeleteId(null)}>
          <div className="adm-modal" style={{ maxWidth:400 }}>
            <div className="adm-modal-header">
              <h2 className="adm-modal-title">Delete Category</h2>
              <button className="adm-modal-close" onClick={() => setDeleteId(null)}>✕</button>
            </div>
            <div className="adm-modal-body">
              <p style={{ fontSize:'.85rem', color:'var(--text)', lineHeight:1.7, marginBottom:20 }}>
                Are you sure you want to delete this category? This action <strong style={{color:'var(--error)'}}>cannot be undone. </strong>.
              </p>
              <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
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
