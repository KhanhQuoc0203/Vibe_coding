import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:8000";

function App() {
  const [students, setStudents] = useState([]);
  const [stats, setStats] = useState({ total: 0, avg_gpa: 0 });
  const [keyword, setKeyword] = useState(""); 
  const [searchID, setSearchID] = useState("");
  const [form, setForm] = useState({ student_id: '', name: '', birth_year: '', major: '', gpa: '', class_id: '' });

  useEffect(() => {
    fetchData();
    fetchStats();
  }, [searchID]);

  const fetchData = async () => {
    const res = await axios.get(`${API}/students`, { params: { student_id: searchID } });
    setStudents(res.data);
  };

  const fetchStats = async () => {
    const res = await axios.get(`${API}/statistics`);
    setStats(res.data);
  };

  const handleSave = async () => {
    if (!form.student_id || !form.name || !form.class_id) return alert("Vui lòng điền đủ Mã SV, Tên và Lớp!");
    await axios.post(`${API}/students`, form);
    setSearchID(""); // Reset tìm kiếm để hiện bảng đầy đủ
    fetchData();
    fetchStats();
  };

  const handleDelete = async (sid) => {
    if (window.confirm("Xóa sinh viên này?")) {
      await axios.delete(`${API}/students/${sid}`);
      fetchData();
      fetchStats();
    }
  };

  return (
    <div style={{ padding: '30px', maxWidth: '1100px', margin: 'auto', fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif' }}>
      <h1>🎓 Hệ thống Quản lý Sinh viên - V2 Final</h1>

      {/* Dashboard Thống kê */}
      <div style={{ display: 'flex', gap: '20px', marginBottom: '20px' }}>
        <div style={cardStyle}>🚀 <b>Tổng số SV:</b> {stats.total}</div>
        <div style={cardStyle}>📈 <b>GPA Trung bình:</b> {stats.avg_gpa}</div>
      </div>

      {/* Thanh Tìm kiếm MSSV */}
      <div style={{ marginBottom: '20px', display: 'flex', gap: '10px' }}>
        <input 
          placeholder="Nhập Mã số sinh viên cần tìm..." 
          style={{ ...inputStyle, flex: 1 }}
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
        />
        <button onClick={() => setSearchID(keyword)} style={btnSearch}>Tìm kiếm</button>
        <button onClick={() => {setSearchID(""); setKeyword("");}} style={btnReset}>Làm mới</button>
        <button onClick={() => window.open(`${API}/export-csv`)} style={btnExport}>Xuất CSV</button>
      </div>

      {/* Form Nhập liệu trực tiếp */}
      <div style={formBox}>
        <h3 style={{ marginTop: 0 }}>📝 Thêm / Cập nhật sinh viên</h3>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px' }}>
          <input placeholder="Mã SV (Duy nhất)" style={inputStyle} onChange={e => setForm({...form, student_id: e.target.value})} />
          <input placeholder="Họ tên" style={inputStyle} onChange={e => setForm({...form, name: e.target.value})} />
          <input type="number" placeholder="Năm sinh" style={inputStyle} onChange={e => setForm({...form, birth_year: e.target.value})} />
          <input placeholder="Mã Lớp (VD: IT01)" style={inputStyle} onChange={e => setForm({...form, class_id: e.target.value})} />
          <input placeholder="Ngành học" style={inputStyle} onChange={e => setForm({...form, major: e.target.value})} />
          <input type="number" placeholder="GPA" style={inputStyle} onChange={e => setForm({...form, gpa: e.target.value})} />
        </div>
        <button onClick={handleSave} style={{ ...btnSave, marginTop: '15px', width: '100%' }}>Lưu vào Hệ thống</button>
      </div>

      {/* Bảng Dữ liệu */}
      <table border="1" style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'center' }}>
        <thead style={{ background: '#343a40', color: 'white' }}>
          <tr>
            <th style={thStyle}>Mã SV</th><th style={thStyle}>Họ tên</th><th style={thStyle}>Năm sinh</th><th style={thStyle}>Lớp</th><th style={thStyle}>Ngành</th><th style={thStyle}>GPA</th><th style={thStyle}>Thao tác</th>
          </tr>
        </thead>
        <tbody>
          {students.length > 0 ? (
            students.map(s => (
              <tr key={s.student_id}>
                <td style={tdStyle}>{s.student_id}</td>
                <td style={tdStyle}>{s.name}</td>
                <td style={tdStyle}>{s.birth_year}</td>
                <td style={tdStyle}>{s.class_id}</td>
                <td style={tdStyle}>{s.major}</td>
                <td style={tdStyle}>{s.gpa}</td>
                <td style={tdStyle}>
                  <button onClick={() => handleDelete(s.student_id)} style={btnDelete}>Xóa</button>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td colSpan="7" style={{ padding: '30px', color: '#dc3545', fontWeight: 'bold' }}>
                ⚠️ Không tìm thấy sinh viên nào với Mã số vừa nhập!
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}

// --- STYLES ---
const cardStyle = { padding: '20px', border: 'none', borderRadius: '12px', background: '#f0f4f8', flex: 1, textAlign: 'center', boxShadow: '0 4px 6px rgba(0,0,0,0.05)' };
const inputStyle = { padding: '10px', borderRadius: '6px', border: '1px solid #ced4da', outline: 'none' };
const formBox = { background: '#ffffff', padding: '20px', borderRadius: '12px', marginBottom: '30px', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' };
const thStyle = { padding: '12px' };
const tdStyle = { padding: '10px', borderBottom: '1px solid #dee2e6' };
const btnSearch = { padding: '10px 20px', background: '#007bff', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnReset = { padding: '10px 20px', background: '#6c757d', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnSave = { padding: '12px', background: '#28a745', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 'bold' };
const btnExport = { padding: '10px 20px', background: '#17a2b8', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer' };
const btnDelete = { color: '#dc3545', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 'bold' };

export default App;