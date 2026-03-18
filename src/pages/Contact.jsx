import { useState, useEffect } from 'react'
import { contactAPI } from '../api'
import { useToast } from '../context/ToastContext'

const defaultContact = {
  phone: '', email: '', instagram: '', facebook: '',
  address: '', city: '', hours: '', mapUrl: '',
}

 const Field = ({ label, field, type='text', placeholder='', defaultValue, form, set }) => (
    <div className="adm-form-group">
      <label className="adm-label">{label}</label>
      <input
        className="adm-input" type={type} placeholder={placeholder} defaultValue={defaultValue}
        value={form[field]} onChange={e => set(field, e.target.value)}
      />
    </div>
  )

export default function Contact() {
  const toast = useToast()
  const [form, setForm]     = useState(defaultContact)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving]   = useState(false)
  const [dirty, setDirty]     = useState(false)
  const [id, setId] = useState("");

  


  useEffect(() => {
    contactAPI.get()
      .then(res => {
        console.log(res.data.data[0]);
  
        
        setForm({ ...defaultContact, ...res.data.data[0] })
        setId(res.data.data[0]._id)
       
        
      })
      .catch(() => toast.error('Failed to load contact details'))
      .finally(() => setLoading(false))
  }, [])

const set = (field, value) => {
  console.log('set called:', field, value)  // ← how many times does this fire per keystroke?
  setForm(prev => ({ ...prev, [field]: value }))
  setDirty(true)
}

  const handleCreate = async(e)=>{
    console.log("Clicked");
    
      e.preventDefault();
    try{
      console.log("Clicked");
        await contactAPI.create(form);
         toast.success('Contact details saved!')
    } catch(err){
      console.log(err);
        toast.error('Failed to save contact details')
    }
  
  }
  const handleSave = async (e) => {
    e.preventDefault()
    if (!form.phone && !form.email) { toast.error('At least phone or email is required'); return }
    setSaving(true)
    try {
      await contactAPI.update(id, form)
      toast.success('Contact details saved!')
      setDirty(false)
    } catch { toast.error('Failed to save contact details') }
    finally { setSaving(false) }
  }

 
  if (loading) return (
    <div style={{ display:'flex', justifyContent:'center', padding:60 }}>
      <div className="adm-spinner" style={{ width:28, height:28 }} />
    </div>
  )

  return (
    <div style={{ animation:'fadeUp .4s ease', maxWidth:760 }}>

      {/* Header */}
      <div style={{ marginBottom:28 }}>
        <span style={{ fontSize:'.65rem', letterSpacing:'.3em', textTransform:'uppercase', color:'var(--purple-lt)' }}>Manage</span>
        <h1 style={{ fontFamily:'var(--ff-display)', fontSize:'clamp(1.8rem,4vw,2.8rem)', fontWeight:400, color:'var(--cream)', lineHeight:1.1 }}>
          Contact Details
        </h1>
        <p style={{ fontSize:'.8rem', color:'var(--muted)', marginTop:8 }}>
          These details appear on your website's contact section and footer.
        </p>
      </div>

      {dirty && (
        <div style={{ background:'rgba(245,158,11,.06)', border:'1px solid rgba(245,158,11,.2)', borderRadius:'var(--radius)', padding:'10px 16px', marginBottom:20, fontSize:'.78rem', color:'var(--warning)', display:'flex', alignItems:'center', gap:8 }}>
          <span>⚠</span> You have unsaved changes
        </div>
      )}

      <form onSubmit={handleSave}>
        {/* Contact */}
        <div className="adm-card" style={{ marginBottom:16 }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:18 }}>
            📞 Contact Information
          </div>
          <div className="adm-form-row">
            <Field label="Phone Number"   field="phone" type="tel" form={form} set={set} placeholder={form.phone} />
            <Field label="Email Address"  field="email" type="email" form={form} set={set} placeholder="hello@swasthikafloraldecor.com" />
          </div>
          <Field label="Physical Address" field="address" form={form} set={set} placeholder="123 Flower Street, Colombo" />
          <div className="adm-form-row">
            <Field label="City / Region" field="city"  form={form} set={set} placeholder="Colombo, Sri Lanka" />
            <Field label="Business Hours" field="hours" form={form} set={set} placeholder="Mon–Sat: 9am – 6pm" />
          </div>
        </div>

        {/* Social */}
        <div className="adm-card" style={{ marginBottom:16 }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:18 }}>
            📱 Social Media
          </div>
          <div className="adm-form-row">
            <div className="adm-form-group">
              <label className="adm-label">Instagram Handle</label>
              <div style={{ position:'relative' }}>
                <span style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--muted)', fontSize:'.85rem' }}>@</span>
                <input className="adm-input" style={{ paddingLeft:28 }} placeholder="swasthikafloraldecor" value={form.instagram} onChange={e => set('instagram', e.target.value)} />
              </div>
            </div>
            <div className="adm-form-group">
              <label className="adm-label">Facebook Page URL</label>
              <input className="adm-input" placeholder="https://facebook.com/yourpage" value={form.facebook} onChange={e => set('facebook', e.target.value)} />
            </div>
          </div>
        </div>

        {/* Map */}
        <div className="adm-card" style={{ marginBottom:24 }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--muted)', marginBottom:18 }}>
            📍 Google Maps
          </div>
          <div className="adm-form-group">
            <label className="adm-label">Google Maps Embed URL</label>
            <input className="adm-input" placeholder="https://maps.google.com/maps?q=..." value={form.mapUrl} onChange={e => set('mapUrl', e.target.value)} />
            <span style={{ fontSize:'.7rem', color:'var(--muted)', marginTop:4, display:'block' }}>
              Go to Google Maps → Share → Embed a map → Copy the src URL from the iframe code
            </span>
          </div>
          {form.mapUrl && (
            <div style={{ marginTop:8, borderRadius:'var(--radius)', overflow:'hidden', border:'1px solid var(--border)' }}>
              <iframe src={form.mapUrl} width="100%" height="200" style={{ display:'block', border:'none' }} title="Map preview" loading="lazy" />
            </div>
          )}
        </div>

        {/* Preview */}
        <div className="adm-card" style={{ marginBottom:24, background:'rgba(201,168,76,.03)', borderColor:'rgba(201,168,76,.15)' }}>
          <div style={{ fontSize:'.65rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold-dim)', marginBottom:16 }}>
            👁 Website Preview
          </div>
          <div style={{ display:'flex', gap:32, flexWrap:'wrap' }}>
            {[
              { label:'Call Us',   value: form.phone || '—' },
              { label:'Email',     value: form.email || '—' },
              { label:'Instagram', value: form.instagram ? `@${form.instagram}` : '—' },
              { label:'Address',   value: form.address || '—' },
            ].map(item => (
              <div key={item.label}>
                <div style={{ fontSize:'.62rem', letterSpacing:'.2em', textTransform:'uppercase', color:'var(--gold)', marginBottom:4 }}>{item.label}</div>
                <div style={{ fontSize:'.85rem', color:'var(--text)' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display:'flex', gap:12, justifyContent:'flex-end' }}>
          <button type="button" className="adm-btn adm-btn-outline" onClick={() => { contactAPI.get().then(r => { setForm({...defaultContact,...r.data}); setDirty(false) }) }}>
            Discard Changes
          </button>
          <button type="submit" className="adm-btn adm-btn-primary" disabled={saving || !dirty}>
            {saving ? <><div className="adm-spinner" />Saving...</> : '✓ Save Contact Details'}
          </button>
        </div>
      </form>
    </div>
  )
}
