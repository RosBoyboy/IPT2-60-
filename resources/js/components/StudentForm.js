import React, { useState, useEffect } from 'react';

const StudentForm = ({ editing = null, initialData = {}, courses = [], academicYears = [], onSaved, onCancel }) => {
    const [form, setForm] = useState({
        student_number: '',
        family_name: '',
        given_name: '',
        middle_name: '',
        name: '',
        date_of_birth: '',
        place_of_birth: '',
        gender: '',
        blood_type: '',
        height: '',
        civil_status: '',
        religion: '',
        citizenship: '',
        address: '',
        contact_number: '',
        email: '',
        languages: '',
        course: '',
        classification: '',
        year_level: '',
        academic_year: '',
        father_name: '',
        mother_name: '',
        guardian_name: '',
        guardian_contact: '',
        additional_info: '',
        status: 'ACTIVE'
    });

    const [errors, setErrors] = useState([]);

    useEffect(() => {
        if (editing) setForm(prev => ({ ...prev, ...editing }));
        else if (initialData) setForm(prev => ({ ...prev, ...initialData }));
    }, [editing, initialData]);

    const getCsrfToken = () => {
        const metaTag = document.querySelector('meta[name="csrf-token"]');
        if (metaTag) return metaTag.getAttribute('content');
        const cookieValue = document.cookie
            .split('; ')
            .find(row => row.startsWith('XSRF-TOKEN='))
            ?.split('=')[1];
        if (cookieValue) return decodeURIComponent(cookieValue);
        return null;
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        setForm(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors([]);
        try {
            const csrf = getCsrfToken();
            const headers = {
                'Content-Type': 'application/json',
                'Accept': 'application/json',
                'X-Requested-With': 'XMLHttpRequest'
            };
            if (csrf) headers['X-CSRF-TOKEN'] = csrf;

            const url = editing ? `/api/students/${editing.id}` : '/api/students';
            const method = editing ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers,
                body: JSON.stringify(form)
            });

            const contentType = res.headers.get('content-type') || '';
            let data = {};
            if (contentType.includes('application/json')) data = await res.json();
            else data = await res.json().catch(() => ({}));

            if (res.ok) {
                if (onSaved) onSaved(data.student || data);
            } else {
                if (data.errors) setErrors(Object.values(data.errors).flat());
                else if (data.message) setErrors([data.message]);
                else setErrors(['Failed to save student']);
            }
        } catch (err) {
            console.error(err);
            setErrors(['Network error occurred']);
        }
    };

    return (
        <div>
            {errors.length > 0 && (
                <div className="student-errors">
                    <ul>
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label>Student Number *</label>
                            <input name="student_number" value={form.student_number} onChange={handleChange} className="form-control" required disabled={!!editing} />
                        </div>

                        <div className="col-md-6">
                            <label>Full Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-4">
                            <label>Course</label>
                            <select name="course" value={form.course} onChange={handleChange} className="form-select">
                                <option value="">Select Course</option>
                                {courses.map(c => <option key={c} value={c}>{c.replace(' Program','')}</option>)}
                            </select>
                        </div>

                        <div className="col-md-4">
                            <label>Year Level</label>
                            <input name="year_level" value={form.year_level} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-4">
                            <label>Academic Year</label>
                            <select name="academic_year" value={form.academic_year} onChange={handleChange} className="form-select">
                                <option value="">Select Academic Year</option>
                                {academicYears.map(y => <option key={y} value={y}>{y}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label>Contact Number</label>
                            <input name="contact_number" value={form.contact_number} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-12">
                            <label>Address</label>
                            <input name="address" value={form.address} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-6">
                            <label>Father's Name</label>
                            <input name="father_name" value={form.father_name} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label>Mother's Name</label>
                            <input name="mother_name" value={form.mother_name} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-6">
                            <label>Guardian Name</label>
                            <input name="guardian_name" value={form.guardian_name} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label>Guardian Contact</label>
                            <input name="guardian_contact" value={form.guardian_contact} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-12">
                            <label>Additional Information</label>
                            <textarea name="additional_info" value={form.additional_info} onChange={handleChange} className="form-control" />
                        </div>
                    </div>
                </div>

                <div className="modal-actions d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editing ? 'Update Student' : 'Add Student'}</button>
                </div>
            </form>
        </div>
    );
};

export default StudentForm;
