import React, { useState, useEffect } from 'react';
import axios from 'axios';

const API = "http://localhost:8000";

function App() {
    const [students, setStudents] = useState([]);
    const [classes, setClasses] = useState([]);
    const [stats, setStats] = useState({ total: 0, avg_gpa: 0, by_major: {} });
    const [search, setSearch] = useState("");
    const [form, setForm] = useState({ student_id: '', name: '', birth_year: 2000, major: '', gpa: 0, class_id: '' });

    useEffect(() => {
        loadData();
        loadStats();
    }, [search]);

    const loadData = async () => {
        const resS = await axios.get(`${API}/students?name=${search}`);
        setStudents(resS.data);
        const resC = await axios.get(`${API}/classes`);
        setClasses(resC.data);
    };

    const loadStats = async () => {
        const res = await axios.get(`${API}/statistics`);
        setStats(res.data);
    };

    const handleSave = async () => {
        await axios.post(`${API}/students`, form);
        loadData();
        loadStats();
    };

    return (
        <div style={{ padding: '30px', maxWidth: '1000px', margin: 'auto' }}>
            <h2>📊 Dashboard Thống kê</h2>
            <div style={{ display: 'flex', gap: '20px', marginBottom: '30px' }}>
                <div style={cardStyle}><b>Tổng SV:</b> {stats.total}</div>
                <div style={cardStyle}><b>GPA TB:</b> {stats.avg_gpa}</div>
            </div>

            <div style={{ marginBottom: '20px' }}>
                <input 
                    placeholder="🔍 Tìm kiếm tên sinh viên..." 
                    style={inputStyle} 
                    onChange={(e) => setSearch(e.target.value)} 
                />
                <button onClick={() => window.open(`${API}/export-csv`)} style={btnExport}>Xuất CSV</button>
            </div>

            <div style={formBox}>
                <h3>📝 Thêm Sinh Viên</h3>
                <input placeholder="Mã SV" style={inputStyle} onChange={e => setForm({...form, student_id: e.target.value})} />
                <input placeholder="Họ tên" style={inputStyle} onChange={e => setForm({...form, name: e.target.value})} />
                <select style={inputStyle} onChange={e => setForm({...form, class_id: e.target.value})}>
                    <option value="">-- Chọn Lớp --</option>
                    {classes.map(c => <option key={c.class_id} value={c.class_id}>{c.class_name}</option>)}
                </select>
                <button onClick={handleSave} style={btnSave}>Lưu Dữ Liệu</button>
            </div>

            <table border="1" style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead style={{ background: '#f4f4f4' }}>
                    <tr><th>ID</th><th>Họ tên</th><th>Ngành</th><th>GPA</th><th>Lớp</th></tr>
                </thead>
                <tbody>
                    {students.map(s => (
                        <tr key={s.student_id}>
                            <td>{s.student_id}</td><td>{s.name}</td><td>{s.major}</td><td>{s.gpa}</td><td>{s.class_id}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
}

const cardStyle = { padding: '15px', border: '1px solid #ddd', borderRadius: '8px', flex: 1, textAlign: 'center', background: '#e3f2fd' };
const inputStyle = { padding: '8px', marginRight: '10px', borderRadius: '4px', border: '1px solid #ccc' };
const formBox = { background: '#fafafa', padding: '20px', borderRadius: '8px', marginBottom: '20px' };
const btnSave = { padding: '8px 20px', background: '#2196F3', color: 'white', border: 'none', cursor: 'pointer' };
const btnExport = { padding: '8px 20px', background: '#4CAF50', color: 'white', border: 'none', cursor: 'pointer' };

export default App;