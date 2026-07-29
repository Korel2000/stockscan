/* =========================================
   Modern Settings UI - Buttons & Layout
========================================= */

.modern-settings {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
  direction: rtl;
  font-family: system-ui, -apple-system, sans-serif;
  color: #1e293b;
}

/* כותרות ראשיות */
.page-head h1 { font-size: 28px; font-weight: 800; margin-bottom: 5px; }
.page-head p { color: #64748b; margin-top: 0; }
.panel h2 { font-size: 20px; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px; margin-bottom: 5px; }
.hint { color: #64748b; font-size: 14px; margin-bottom: 20px; }

/* פאנלים / כרטיסיות */
.panel {
  background: #ffffff;
  border: 1px solid #e2e8f0;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 24px;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.05);
  transition: box-shadow 0.2s ease;
}
.panel:hover { box-shadow: 0 10px 15px -3px rgba(0, 0, 0, 0.05); }

/* מערכת כפתורים בולטים ומסודרים */
.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  padding: 10px 20px;
  font-size: 15px;
  font-weight: 600;
  border-radius: 10px;
  cursor: pointer;
  border: none;
  transition: all 0.2s ease;
  text-decoration: none;
}
.btn:active { transform: scale(0.97); }
.btn:disabled { opacity: 0.6; cursor: not-allowed; }

.btn-primary {
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  box-shadow: 0 4px 12px rgba(37, 99, 235, 0.25);
}
.btn-primary:hover:not(:disabled) { box-shadow: 0 6px 16px rgba(37, 99, 235, 0.4); transform: translateY(-1px); }

.btn-secondary {
  background: #f1f5f9;
  color: #334155;
}
.btn-secondary:hover { background: #e2e8f0; }

.btn-outline {
  background: transparent;
  border: 2px solid #cbd5e1;
  color: #475569;
}
.btn-outline:hover { border-color: #94a3b8; color: #1e293b; }

.btn-ghost {
  background: transparent;
  color: #64748b;
}
.btn-ghost:hover { background: #f8fafc; color: #0f172a; }

.btn-reset {
  background: none; border: none; padding: 0; font: inherit; cursor: pointer; text-align: inherit;
}

.large { padding: 14px 28px; font-size: 16px; }
.full-width { width: 100%; }

/* ארגון כפתורים ברחבי המסך */
.panel-actions { display: flex; gap: 12px; align-items: center; margin-top: 24px; }
.panel-actions.left { justify-content: flex-end; /* מכיוון שזה RTL, זה יצמיד לשמאל */ }
.modal-actions { display: flex; gap: 12px; justify-content: flex-end; margin-top: 24px; }

/* גריד בחירות (Live/Demo/Alpaca) */
.provider-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
  gap: 12px;
  margin-top: 10px;
}
.provider-opt {
  padding: 14px;
  border: 2px solid #e2e8f0;
  border-radius: 12px;
  background: #ffffff;
  color: #64748b;
  font-weight: 600;
  text-align: center;
  cursor: pointer;
  transition: all 0.2s;
}
.provider-opt:hover { border-color: #cbd5e1; }
.provider-opt.selected {
  border-color: #3b82f6; background: #eff6ff; color: #1d4ed8;
}
.provider-opt.live-opt.selected {
  border-color: #10b981; background: #ecfdf5; color: #047857;
}

/* שדות קלט (Inputs) */
.field { margin-bottom: 16px; }
.field label { display: block; font-size: 14px; font-weight: 600; color: #475569; margin-bottom: 6px; }
.field input {
  width: 100%;
  padding: 12px 16px;
  border: 1px solid #cbd5e1;
  border-radius: 10px;
  font-size: 15px;
  transition: border-color 0.2s, box-shadow 0.2s;
}
.field input:focus {
  outline: none; border-color: #3b82f6; box-shadow: 0 0 0 3px rgba(59, 130, 246, 0.1);
}

/* רשימת תפריטים (Menu List) */
.menu-list {
  background: #ffffff; border-radius: 16px; padding: 8px; border: 1px solid #e2e8f0; margin-bottom: 30px;
}
.menu-row {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px 20px; text-decoration: none; color: #1e293b; font-weight: 600;
  border-radius: 10px; transition: background 0.2s; width: 100%;
}
.menu-row:hover { background: #f8fafc; }
.menu-row.danger { color: #ef4444; }
.menu-row.danger:hover { background: #fef2f2; }
.menu-icon { font-size: 18px; margin-right: auto; } /* צד שמאל ב-RTL */

/* חשבונות ומחיקה */
.account-card {
  display: flex; justify-content: space-between; align-items: center;
  padding: 16px; background: #f8fafc; border: 1px solid #e2e8f0;
  border-radius: 12px; margin-bottom: 12px;
}
.account-info { display: flex; flex-direction: column; gap: 4px; }
.atype { font-size: 12px; font-weight: 700; padding: 4px 8px; border-radius: 6px; display: inline-block; width: max-content; }
.atype.live { background: #d1fae5; color: #065f46; }
.atype.demo { background: #e0e7ff; color: #3730a3; }
.aname { font-size: 16px; font-weight: 600; color: #0f172a; }
.btn-icon {
  background: white; border: 1px solid #e2e8f0; width: 36px; height: 36px;
  border-radius: 50%; display: flex; align-items: center; justify-content: center;
  cursor: pointer; color: #94a3b8; transition: all 0.2s;
}
.btn-icon.danger:hover { background: #fef2f2; color: #ef4444; border-color: #fca5a5; }

/* Sliders */
.slider-wrapper { margin-bottom: 20px; }
.slider-header { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; }
.slider-header label { font-weight: 600; font-size: 15px; color: #334155; }
.slider-val { background: #eff6ff; color: #2563eb; padding: 2px 10px; border-radius: 20px; font-weight: 700; font-size: 14px; }
.slider-input { width: 100%; cursor: pointer; accent-color: #3b82f6; }
.slider-desc { font-size: 13px; color: #64748b; margin-top: 6px; }

/* מרווחים פשוטים */
.mt-10 { margin-top: 10px; }
.mt-15 { margin-top: 15px; }

/* Modal */
.modal-backdrop {
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(15, 23, 42, 0.6); backdrop-filter: blur(4px);
  display: flex; align-items: center; justify-content: center; z-index: 1000;
}
.modal {
  background: white; width: 100%; max-width: 420px; border-radius: 20px;
  padding: 30px; box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
}
.modal h2 { margin-top: 0; margin-bottom: 24px; font-size: 22px; }
