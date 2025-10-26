import React, { useState, useEffect } from 'react';

const FacultyForm = ({ editing = null, initialData = {}, departments = [], onSaved, onCancel }) => {
    const [form, setForm] = useState({
        faculty_number: '',
        name: '',
        family_name: '',
        given_name: '',
        middle_name: '',
        date_of_birth: '',
        gender: '',
        marital_status: '',
        department: '',
        position: '',
        hire_date: '',
        education: '',
        specialization: '',
        address: '',
        contact: '',
        email: '',
        languages: '',
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

            const url = editing ? `/api/faculties/${editing.id}` : '/api/faculties';
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
                if (onSaved) onSaved(data.faculty || data);
            } else {
                if (data.errors) setErrors(Object.values(data.errors).flat());
                else if (data.message) setErrors([data.message]);
                else setErrors(['Failed to save faculty']);
            }
        } catch (err) {
            console.error(err);
            setErrors(['Network error occurred']);
        }
    };

    return (
        <div>
            {errors.length > 0 && (
                <div className="faculty-errors">
                    <ul>
                        {errors.map((err, i) => <li key={i}>{err}</li>)}
                    </ul>
                </div>
            )}

            <form onSubmit={handleSubmit}>
                <div className="modal-body">
                    <div className="row g-3">
                        <div className="col-md-6">
                            <label>Faculty Number *</label>
                            <input name="faculty_number" value={form.faculty_number} onChange={handleChange} className="form-control" required disabled={!!editing} />
                        </div>
                        <div className="col-md-6">
                            <label>Full Name</label>
                            <input name="name" value={form.name} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-6">
                            <label>Department</label>
                            <select name="department" value={form.department} onChange={handleChange} className="form-select">
                                <option value="">Select Department</option>
                                {departments.map(d => <option key={d} value={d}>{d.replace(' Program','')}</option>)}
                            </select>
                        </div>

                        <div className="col-md-6">
                            <label>Position</label>
                            <input name="position" value={form.position} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-6">
                            <label>Email</label>
                            <input type="email" name="email" value={form.email} onChange={handleChange} className="form-control" />
                        </div>
                        <div className="col-md-6">
                            <label>Contact</label>
                            <input name="contact" value={form.contact} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-12">
                            <label>Address</label>
                            <input name="address" value={form.address} onChange={handleChange} className="form-control" />
                        </div>

                        <div className="col-md-12">
                            <label>Additional Information</label>
                            <textarea name="additional_info" value={form.additional_info} onChange={handleChange} className="form-control" />
                        </div>
                    </div>
                </div>

                <div className="modal-actions d-flex justify-content-end gap-2">
                    <button type="button" className="btn btn-outline-secondary" onClick={onCancel}>Cancel</button>
                    <button type="submit" className="btn btn-primary">{editing ? 'Update Faculty' : 'Add Faculty'}</button>
                </div>
            </form>
        </div>
    );
};

export default FacultyForm;
