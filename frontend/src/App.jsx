import { useState, useEffect } from 'react';

const API_URL = "http://127.0.0.1:8000/students";

export default function App() {
  const [students, setStudents] = useState([]);
  const [isEdit, setIsEdit] = useState(false);
  const [form, setForm] = useState({ student_id: '', name: '', birth_year: 2000, major: '', gpa: 0 });

  const loadData = async () => {
    try {
      const res = await fetch(API_URL);
      const data = await res.json();
      setStudents(data);
    } catch (err) { console.error("Lỗi tải dữ liệu:", err); }
  };

  useEffect(() => { loadData(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // ÉP KIỂU DỮ LIỆU TRƯỚC KHI GỬI
    const payload = {
      ...form,
      birth_year: parseInt(form.birth_year),
      gpa: parseFloat(form.gpa)
    };

    const method = isEdit ? "PUT" : "POST";
    const url = isEdit ? `${API_URL}/${form.student_id}` : API_URL;

    try {
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        setForm({ student_id: '', name: '', birth_year: 2000, major: '', gpa: 0 });
        setIsEdit(false);
        loadData();
      }
    } catch (err) { console.error("Lỗi khi lưu:", err); }
  };

  const handleEdit = (s) => { setForm(s); setIsEdit(true); };

  const handleDelete = async (id) => {
    await fetch(`${API_URL}/${id}`, { method: "DELETE" });
    loadData();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '900px', margin: 'auto', fontFamily: 'Arial' }}>
      <h1 style={{ textAlign: 'center', color: '#333' }}>QUẢN LÝ SINH VIÊN MVP</h1>
      
      {/* FORM */}
      <form onSubmit={handleSubmit} style={{ background: '#f9f9f9', padding: '20px', borderRadius: '8px', marginBottom: '20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
        <input placeholder="Mã SV" value={form.student_id} onChange={e => setForm({...form, student_id: e.target.value})} disabled={isEdit} required />
        <input placeholder="Họ tên" value={form.name} onChange={e => setForm({...form, name: e.target.value})} required />
        <input type="number" placeholder="Năm sinh" value={form.birth_year} onChange={e => setForm({...form, birth_year: e.target.value})} />
        <input placeholder="Ngành" value={form.major} onChange={e => setForm({...form, major: e.target.value})} />
        <input type="number" step="0.1" placeholder="GPA" value={form.gpa} onChange={e => setForm({...form, gpa: e.target.value})} />
        <button type="submit" style={{ background: isEdit ? '#ff9800' : '#4caf50', color: 'white', border: 'none', cursor: 'pointer' }}>
          {isEdit ? 'Cập nhật' : 'Thêm mới'}
        </button>
      </form>

      {/* TABLE */}
      <table border="1" width="100%" style={{ borderCollapse: 'collapse', textAlign: 'left' }}>
        <thead style={{ background: '#eee' }}>
          <tr><th>ID</th><th>Tên</th><th>Ngành</th><th>GPA</th><th>Thao tác</th></tr>
        </thead>
        <tbody>
          {students.map(s => (
            <tr key={s.student_id}>
              <td>{s.student_id}</td><td>{s.name}</td><td>{s.major}</td><td>{s.gpa}</td>
              <td>
                <button onClick={() => handleEdit(s)}>Sửa</button>
                <button onClick={() => handleDelete(s.student_id)} style={{ color: 'red', marginLeft: '5px' }}>Xóa</button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}