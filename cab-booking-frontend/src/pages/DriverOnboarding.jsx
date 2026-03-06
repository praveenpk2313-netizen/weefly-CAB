import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import LocationAutocomplete from '../components/LocationAutocomplete';
import './DriverOnboarding.css';

const DriverOnboarding = () => {
    const [step, setStep] = useState(1);
    const [formData, setFormData] = useState({
        fullName: "",
        baseCity: "",
        licenseNumber: "",
        vehicleModel: "",
        vehicleNumber: "",
        documents: {
            license: null,
            aadhar: null,
            rc: null
        }
    });
    const nav = useNavigate();

    const handleFileChange = (e, docType) => {
        setFormData({
            ...formData,
            documents: {
                ...formData.documents,
                [docType]: e.target.files[0]
            }
        });
    };

    const nextStep = () => setStep(step + 1);
    const prevStep = () => setStep(step - 1);

    const handleSubmit = (e) => {
        e.preventDefault();
        alert("Onboarding application submitted! KYC verification in progress.");
        nav('/driver');
    };

    return (
        <div className="onboarding-page-wrapper">
            <Navbar />
            <div className="onboarding-container">
                <div className="glass-card onboarding-card">
                    <div className="onboarding-header">
                        <div className="step-indicator">Step {step} of 3</div>
                        <h1 className="login-title">Driver Onboarding</h1>
                        <p className="login-subtitle">Complete your profile to start earning</p>
                    </div>

                    <form onSubmit={handleSubmit}>
                        {step === 1 && (
                            <div className="form-step animate-fade-in">
                                <h3 className="step-title">Personal Details</h3>
                                <div className="input-group">
                                    <label>Full Name</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="Enter your legal name"
                                        required
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Base City / Operating Area</label>
                                    <div className="input-container filter-input" style={{ background: 'rgba(0,0,0,0.2)', borderRadius: '14px', height: '52px', border: '1px solid rgba(255,255,255,0.1)' }}>
                                        <LocationAutocomplete
                                            placeholder="e.g. Erode, Tamil Nadu"
                                            value={formData.baseCity}
                                            onChange={(val) => setFormData({ ...formData, baseCity: val })}
                                            onSelect={(label) => setFormData({ ...formData, baseCity: label })}
                                        />
                                    </div>
                                </div>
                                <div className="input-group">
                                    <label>Driving License Number</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="DL-XXXXXXXXXXXX"
                                        required
                                        value={formData.licenseNumber}
                                        onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                                    />
                                </div>
                                <button type="button" className="premium-cta-btn" onClick={nextStep}>Next <span className="btn-arrow">→</span></button>
                            </div>
                        )}

                        {step === 2 && (
                            <div className="form-step animate-fade-in">
                                <h3 className="step-title">Vehicle Information</h3>
                                <div className="input-group">
                                    <label>Vehicle Model</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="e.g. Maruti Swift"
                                        required
                                        value={formData.vehicleModel}
                                        onChange={(e) => setFormData({ ...formData, vehicleModel: e.target.value })}
                                    />
                                </div>
                                <div className="input-group">
                                    <label>Vehicle Number</label>
                                    <input
                                        type="text"
                                        className="premium-input"
                                        placeholder="TN-01-AB-1234"
                                        required
                                        value={formData.vehicleNumber}
                                        onChange={(e) => setFormData({ ...formData, vehicleNumber: e.target.value })}
                                    />
                                </div>
                                <div className="button-group-row">
                                    <button type="button" className="premium-secondary-btn" onClick={prevStep}>Back</button>
                                    <button type="button" className="premium-cta-btn" onClick={nextStep}>Next <span className="btn-arrow">→</span></button>
                                </div>
                            </div>
                        )}

                        {step === 3 && (
                            <div className="form-step animate-fade-in">
                                <h3 className="step-title">KYC Document Upload</h3>
                                <div className="document-grid">
                                    <div className="doc-upload-box">
                                        <label>Driving License</label>
                                        <input type="file" id="license" hidden onChange={(e) => handleFileChange(e, 'license')} />
                                        <label htmlFor="license" className="file-label">
                                            {formData.documents.license ? "✅ Uploaded" : "📤 Select File"}
                                        </label>
                                    </div>
                                    <div className="doc-upload-box">
                                        <label>Aadhar Card</label>
                                        <input type="file" id="aadhar" hidden onChange={(e) => handleFileChange(e, 'aadhar')} />
                                        <label htmlFor="aadhar" className="file-label">
                                            {formData.documents.aadhar ? "✅ Uploaded" : "📤 Select File"}
                                        </label>
                                    </div>
                                    <div className="doc-upload-box">
                                        <label>RC Book</label>
                                        <input type="file" id="rc" hidden onChange={(e) => handleFileChange(e, 'rc')} />
                                        <label htmlFor="rc" className="file-label">
                                            {formData.documents.rc ? "✅ Uploaded" : "📤 Select File"}
                                        </label>
                                    </div>
                                </div>
                                <div className="button-group-row">
                                    <button type="button" className="premium-secondary-btn" onClick={prevStep}>Back</button>
                                    <button type="submit" className="premium-cta-btn">Submit KYC</button>
                                </div>
                            </div>
                        )}
                    </form>
                </div>
            </div>
        </div>
    );
};

export default DriverOnboarding;
