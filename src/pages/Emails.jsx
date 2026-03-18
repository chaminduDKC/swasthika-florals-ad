import { useState, useEffect } from 'react'
import { enquiryAPI } from '../api/index.js'
import { useToast } from '../context/ToastContext'

const SERVICES = ['all', 'wedding decoration', 'bouquet', 'engagement decoration', 'outdoor', 'birthday', 'concert', 'other']

const serviceColor = (service) => {
  const map = {
    'wedding decoration':    { bg: 'rgba(201,168,76,.1)',  color: '#c9a84c' },
    'bouquet':               { bg: 'rgba(236,72,153,.1)',  color: '#ec4899' },
    'engagement decoration': { bg: 'rgba(139,92,246,.1)',  color: '#8b5cf6' },
    'outdoor':               { bg: 'rgba(16,185,129,.1)',  color: '#10b981' },
    'birthday':              { bg: 'rgba(245,158,11,.1)',  color: '#f59e0b' },
    'concert':               { bg: 'rgba(59,130,246,.1)',  color: '#3b82f6' },
    'other':                 { bg: 'rgba(107,96,128,.1)',  color: '#6b6080' },
  }
  return map[service] || { bg: 'rgba(107,96,128,.1)', color: '#6b6080' }
}

const formatDate = (dateStr) => {
  if (!dateStr) return '—'
  const d = new Date(dateStr)
  return d.toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' })
}

/* ── Detail Panel ── */
const DetailPanel = ({ enquiry, onClose, onDelete, onToggleRead }) => {
  if (!enquiry) return null
  const svc = serviceColor(enquiry.service)

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 100,
      display: 'flex', alignItems: 'flex-end', justifyContent: 'flex-end',
      background: 'rgba(9,8,15,.6)', backdropFilter: 'blur(4px)',
      animation: 'fadeIn .2s ease',
    }} onClick={onClose}>
      <div
        onClick={e => e.stopPropagation()}
        style={{
          width: '100%', maxWidth: 480, height: '100vh',
          background: 'var(--card)', borderLeft: '1px solid var(--border)',
          display: 'flex', flexDirection: 'column',
          animation: 'slideIn .3s cubic-bezier(.22,1,.36,1)',
          overflow: 'hidden',
        }}
      >
        <style>{`
          @keyframes slideIn { from { transform: translateX(100%); } to { transform: translateX(0); } }
        `}</style>

        {/* Panel header */}
        <div style={{
          padding: '20px 24px', borderBottom: '1px solid var(--border)',
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{
              width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
              background: enquiry.read ? 'var(--muted)' : 'var(--purple)',
              boxShadow: enquiry.read ? 'none' : '0 0 6px var(--purple)',
            }} />
            <span style={{ fontSize: '.65rem', letterSpacing: '.25em', textTransform: 'uppercase', color: 'var(--muted)' }}>
              Enquiry Detail
            </span>
          </div>
          <button onClick={onClose} style={{
            background: 'none', border: 'none', color: 'var(--muted)',
            fontSize: '1.2rem', lineHeight: 1, padding: 4,
            transition: 'color var(--tr)',
          }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--cream)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >✕</button>
        </div>

        {/* Panel body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 24, display: 'flex', flexDirection: 'column', gap: 20 }}>

          {/* Sender info */}
          <div style={{
            background: 'rgba(139,92,246,.05)', border: '1px solid var(--border)',
            borderRadius: 'var(--radius)', padding: 16,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', flexShrink: 0,
              background: 'rgba(139,92,246,.15)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontFamily: 'var(--ff-display)', fontSize: '1.2rem', color: 'var(--purple-lt)',
            }}>
              {enquiry.from?.[0]?.toUpperCase() || '?'}
            </div>
            <div>
              <div style={{ fontWeight: 400, color: 'var(--cream)', fontSize: '.95rem' }}>{enquiry.from}</div>
              <a href={`mailto:${enquiry.email}`} style={{ fontSize: '.78rem', color: 'var(--purple-lt)' }}>
                {enquiry.email}
              </a>
            </div>
          </div>

          {/* Meta row */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            <span style={{
              fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase',
              padding: '4px 10px', borderRadius: 20,
              background: svc.bg, color: svc.color, border: `1px solid ${svc.color}33`,
            }}>
              {enquiry.subject || 'No service'}
            </span>
            {enquiry.event_date && (
              <span style={{
                fontSize: '.68rem', letterSpacing: '.1em',
                padding: '4px 10px', borderRadius: 20,
                background: 'rgba(16,185,129,.08)', color: '#10b981',
                border: '1px solid rgba(16,185,129,.2)',
              }}>
                📅 {formatDate(enquiry.event_date)}
              </span>
            )}
            <span style={{
              fontSize: '.68rem', letterSpacing: '.1em',
              padding: '4px 10px', borderRadius: 20,
              background: 'rgba(107,96,128,.1)', color: 'var(--muted)',
              border: '1px solid rgba(107,96,128,.2)',
            }}>
              {formatDate(enquiry.createdAt)}
            </span>
          </div>

          {/* Phone */}
          {enquiry.phone && (
            <div>
              <div style={{ fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 6 }}>Phone</div>
              <a href={`tel:${enquiry.phone}`} style={{ fontSize: '.88rem', color: 'var(--text)' }}>
                {enquiry.phone}
              </a>
            </div>
          )}

          {/* Message */}
          <div>
            <div style={{ fontSize: '.6rem', letterSpacing: '.2em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: 8 }}>Message</div>
            <div style={{
              fontSize: '.85rem', color: 'var(--text)', lineHeight: 1.8,
              background: 'rgba(139,92,246,.03)', border: '1px solid var(--border)',
              borderRadius: 'var(--radius)', padding: 14,
              whiteSpace: 'pre-wrap',
            }}>
              {enquiry.body || '—'}
            </div>
          </div>

        </div>

        {/* Panel actions */}
        <div style={{
          padding: '16px 24px', borderTop: '1px solid var(--border)',
          display: 'flex', gap: 10, flexShrink: 0,
        }}>
          <button
            className="adm-btn"
            onClick={() => onToggleRead(enquiry)}
            style={{
              flex: 1, background: 'rgba(139,92,246,.1)',
              border: '1px solid rgba(139,92,246,.2)', color: 'var(--purple-lt)',
              justifyContent: 'center',
            }}
          >
            {enquiry.read ? '○ Mark Unread' : '✓ Mark Read'}
          </button>
          <button
            className="adm-btn adm-btn-danger"
            onClick={() => onDelete(enquiry._id)}
            style={{ flex: 1, justifyContent: 'center' }}
          >
            🗑 Delete
          </button>
        </div>
      </div>
    </div>
  )
}

/* ── Main Component ── */
export default function Emails() {
  const toast = useToast()
  const [enquiries, setEnquiries]   = useState([])
  const [loading, setLoading]       = useState(true)
  const [filter, setFilter]         = useState('all')
  const [selected, setSelected]     = useState(null)
  const [deleteId, setDeleteId]     = useState(null)
  const [bulkSelected, setBulkSelected] = useState([])
  const [confirmBulk, setConfirmBulk]   = useState(false)
  const [deleting, setDeleting]     = useState(false)

  const fetchAll = async () => {
    try {
      const res = await enquiryAPI.getAll()
      setEnquiries(res.data.data || res.data || [])
    } catch {
      toast.error('Failed to load enquiries')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => { fetchAll() }, [])

  // Filter by service
  const filtered = filter === 'all'
    ? enquiries
    : enquiries.filter(e => e.service === filter)

  const unreadCount = enquiries.filter(e => !e.read).length

  // Toggle read
  const handleToggleRead = async (enquiry) => {
    try {
      await enquiryAPI.update(enquiry._id, { read: !enquiry.read })
      setEnquiries(prev => prev.map(e => e._id === enquiry._id ? { ...e, read: !e.read } : e))
      if (selected?._id === enquiry._id) setSelected(prev => ({ ...prev, read: !prev.read }))
    } catch { toast.error('Failed to update') }
  }

  // Delete single
  const handleDelete = async (id) => {
    setDeleting(true)
    try {
      await enquiryAPI.delete(id)
      setEnquiries(prev => prev.filter(e => e._id !== id))
      setDeleteId(null)
      setSelected(null)
      toast.success('Enquiry deleted')
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  // Bulk delete
  const handleBulkDelete = async () => {
    setDeleting(true)
    try {
      await Promise.all(bulkSelected.map(id => enquiryAPI.delete(id)))
      setEnquiries(prev => prev.filter(e => !bulkSelected.includes(e._id)))
      setBulkSelected([])
      setConfirmBulk(false)
      toast.success(`${bulkSelected.length} enquiries deleted`)
    } catch { toast.error('Failed to delete') }
    finally { setDeleting(false) }
  }

  // Toggle bulk select
  const toggleBulk = (id, e) => {
    e.stopPropagation()
    setBulkSelected(prev =>
      prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
    )
  }

  const toggleSelectAll = () => {
    setBulkSelected(prev =>
      prev.length === filtered.length ? [] : filtered.map(e => e._id)
    )
  }

  return (
    <div style={{ animation: 'fadeUp .4s ease' }}>

      {/* ── Header ── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28, flexWrap: 'wrap', gap: 16 }}>
        <div>
          <span style={{ fontSize: '.65rem', letterSpacing: '.3em', textTransform: 'uppercase', color: 'var(--purple-lt)' }}>Manage</span>
          <h1 style={{ fontFamily: 'var(--ff-display)', fontSize: 'clamp(1.8rem,4vw,2.8rem)', fontWeight: 400, color: 'var(--cream)', lineHeight: 1.1 }}>
            Enquiries
          </h1>
          {unreadCount > 0 && (
            <div style={{ marginTop: 6, fontSize: '.75rem', color: 'var(--purple-lt)' }}>
              <span style={{
                background: 'rgba(139,92,246,.15)', border: '1px solid rgba(139,92,246,.3)',
                borderRadius: 20, padding: '2px 10px',
              }}>
                {unreadCount} unread
              </span>
            </div>
          )}
        </div>

        {/* Bulk delete button */}
        {bulkSelected.length > 0 && (
          <button className="adm-btn adm-btn-danger" onClick={() => setConfirmBulk(true)}>
            🗑 Delete {bulkSelected.length} Selected
          </button>
        )}
      </div>

      {/* ── Bulk delete confirm ── */}
      {confirmBulk && (
        <div className="adm-confirm" style={{ marginBottom: 16 }}>
          <div className="adm-confirm-text">
            Delete {bulkSelected.length} enquiries permanently?
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button className="adm-btn adm-btn-danger" onClick={handleBulkDelete} disabled={deleting}>
              {deleting ? <><div className="adm-spinner" /> Deleting...</> : 'Yes, Delete All'}
            </button>
            <button className="adm-btn" onClick={() => setConfirmBulk(false)}
              style={{ background: 'rgba(139,92,246,.08)', border: '1px solid var(--border)', color: 'var(--text)' }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* ── Filter tabs ── */}
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', marginBottom: 20 }}>
        {SERVICES.map(s => {
          const count = s === 'all' ? enquiries.length : enquiries.filter(e => e.service === s).length
          if (count === 0 && s !== 'all') return null
          return (
            <button
              key={s}
              onClick={() => setFilter(s)}
              style={{
                padding: '5px 14px', borderRadius: 20,
                border: `1px solid ${filter === s ? 'rgba(139,92,246,.5)' : 'var(--border)'}`,
                background: filter === s ? 'rgba(139,92,246,.15)' : 'transparent',
                color: filter === s ? 'var(--purple-lt)' : 'var(--muted)',
                fontSize: '.68rem', letterSpacing: '.1em', textTransform: 'uppercase',
                transition: 'all var(--tr)',
              }}
            >
              {s} {count > 0 && <span style={{ opacity: .6 }}>({count})</span>}
            </button>
          )
        })}
      </div>

      {/* ── Inbox list ── */}
      <div className="adm-card" style={{ padding: 0, overflow: 'hidden' }}>
        {loading ? (
          <div style={{ padding: 40, textAlign: 'center' }}>
            <div className="adm-spinner" style={{ margin: '0 auto' }} />
          </div>
        ) : filtered.length === 0 ? (
          <div className="adm-empty">
            <div className="adm-empty-icon">✉</div>
            <div className="adm-empty-text">No enquiries yet</div>
          </div>
        ) : (
          <>
            {/* Select all row */}
            <div style={{
              padding: '10px 20px', borderBottom: '1px solid var(--border)',
              display: 'flex', alignItems: 'center', gap: 12,
              background: 'rgba(139,92,246,.03)',
            }}>
              <input
                type="checkbox"
                checked={bulkSelected.length === filtered.length && filtered.length > 0}
                onChange={toggleSelectAll}
                style={{ accentColor: 'var(--purple)', cursor: 'pointer' }}
              />
              <span style={{ fontSize: '.7rem', color: 'var(--muted)', letterSpacing: '.1em' }}>
                {bulkSelected.length > 0 ? `${bulkSelected.length} selected` : 'Select all'}
              </span>
            </div>

            {/* Enquiry rows */}
            {filtered
              .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
              .map((enquiry) => {
                const svc     = serviceColor(enquiry.service)
                const isSelected = bulkSelected.includes(enquiry._id)

                return (
                  <div
                    key={enquiry._id}
                    onClick={() => { setSelected(enquiry); handleToggleRead({ ...enquiry, read: true }) }}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 14,
                      padding: '14px 20px',
                      borderBottom: '1px solid var(--border)',
                      cursor: 'pointer',
                      background: isSelected
                        ? 'rgba(139,92,246,.08)'
                        : enquiry.read ? 'transparent' : 'rgba(139,92,246,.04)',
                      transition: 'background var(--tr)',
                    }}
                    onMouseEnter={e => { if (!isSelected) e.currentTarget.style.background = 'rgba(139,92,246,.06)' }}
                    onMouseLeave={e => { if (!isSelected) e.currentTarget.style.background = enquiry.read ? 'transparent' : 'rgba(139,92,246,.04)' }}
                  >
                    {/* Checkbox */}
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={(e) => toggleBulk(enquiry._id, e)}
                      onClick={e => e.stopPropagation()}
                      style={{ accentColor: 'var(--purple)', cursor: 'pointer', flexShrink: 0 }}
                    />

                    {/* Unread dot */}
                    <div style={{
                      width: 7, height: 7, borderRadius: '50%', flexShrink: 0,
                      background: enquiry.read ? 'transparent' : 'var(--purple)',
                      boxShadow: enquiry.read ? 'none' : '0 0 6px var(--purple)',
                      border: enquiry.read ? '1px solid var(--border)' : 'none',
                    }} />

                    {/* Avatar */}
                    <div style={{
                      width: 36, height: 36, borderRadius: '50%', flexShrink: 0,
                      background: 'rgba(139,92,246,.12)',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      fontFamily: 'var(--ff-display)', fontSize: '1rem', color: 'var(--purple-lt)',
                    }}>
                      {enquiry.from?.[0]?.toUpperCase() || '?'}
                    </div>

                    {/* Content */}
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                        <span style={{
                          fontWeight: enquiry.read ? 300 : 400,
                          color: enquiry.read ? 'var(--text)' : 'var(--cream)',
                          fontSize: '.88rem', flexShrink: 0,
                        }}>
                          {enquiry.from}
                        </span>
                        <span style={{
                          fontSize: '.65rem', letterSpacing: '.08em', textTransform: 'uppercase',
                          padding: '2px 8px', borderRadius: 20,
                          background: svc.bg, color: svc.color,
                          flexShrink: 0,
                        }}>
                          {enquiry.subject}
                        </span>
                      </div>
                      <div style={{
                        fontSize: '.78rem', color: 'var(--muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                      }}>
                        {enquiry.email} {enquiry.body && `— ${enquiry.body}`}
                      </div>
                    </div>

                    {/* Date + delete */}
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 6, flexShrink: 0 }}>
                      <span style={{ fontSize: '.7rem', color: 'var(--muted)' }}>
                        {formatDate(enquiry.createdAt)}
                      </span>
                      <button
                        className="adm-btn adm-btn-danger"
                        style={{ padding: '3px 10px', fontSize: '.8rem' }}
                        onClick={(e) => { e.stopPropagation(); setDeleteId(enquiry._id) }}
                      >
                        🗑 Delete
                      </button>
                    </div>
                  </div>
                )
              })}
          </>
        )}
      </div>

      {/* ── Single delete confirm ── */}
      {deleteId && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 200,
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          background: 'rgba(9,8,15,.8)', backdropFilter: 'blur(4px)',
          animation: 'fadeIn .2s ease',
        }} onClick={() => setDeleteId(null)}>
          <div onClick={e => e.stopPropagation()} className="adm-card" style={{ maxWidth: 360, width: '90%' }}>
            <div style={{ fontSize: '1.5rem', marginBottom: 12 }}>🗑</div>
            <div style={{ fontFamily: 'var(--ff-display)', fontSize: '1.3rem', color: 'var(--cream)', marginBottom: 8 }}>
              Delete Enquiry?
            </div>
            <div className="adm-confirm-text" style={{ marginBottom: 16 }}>
              This enquiry will be permanently deleted.
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="adm-btn adm-btn-danger" style={{ flex: 1, justifyContent: 'center' }}
                onClick={() => handleDelete(deleteId)} disabled={deleting}>
                {deleting ? <><div className="adm-spinner" />Deleting...</> : 'Delete'}
              </button>
              <button className="adm-btn" style={{ flex: 1, justifyContent: 'center', background: 'rgba(139,92,246,.08)', border: '1px solid var(--border)', color: 'var(--text)' }}
                onClick={() => setDeleteId(null)}>
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Detail panel ── */}
      {selected && (
        <DetailPanel
          enquiry={selected}
          onClose={() => setSelected(null)}
          onDelete={(id) => { setDeleteId(id); setSelected(null) }}
          onToggleRead={handleToggleRead}
        />
      )}

    </div>
  )
}
