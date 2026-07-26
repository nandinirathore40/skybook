import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Layout from '../components/Layout';
import './Dashboard.css';
import './NewBooking.css';
import { useAuth } from '../context/AuthContext';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://127.0.0.1:8000';

const getSavedDraft = () => {
  try {
    const saved = localStorage.getItem('newBookingDraft');
    return saved ? JSON.parse(saved) : null;
  } catch (e) {
    return null;
  }
};

const NewBooking = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const savedDraft = getSavedDraft();
  
  const [activeStep, setActiveStep] = useState(savedDraft?.activeStep || 1);
  const [passengers, setPassengers] = useState(savedDraft?.passengers || [{ name: '', dob: '', gender: '' }]);
  const [flightType, setFlightType] = useState(savedDraft?.flightType || 'one-way');
  
  // FIXED: multiCitySegments holds intermediate steps cleanly
  const [multiCitySegments, setMultiCitySegments] = useState(savedDraft?.multiCitySegments || [
    { intermediateCity: '', depTime: '' }
  ]);

  const [formData, setFormData] = useState(savedDraft?.formData || {
    departureCity: '',
    arrivalCity: '',
    departureTime: '',
    returnTime: '',
    cabinClass: 'Economy Class',
    firstCharge: '',
    secondCharge: '',
    airlineName: '',
    pnr: '',
    cardNumber: '',
    expiry: '',
    cvv: '',
    currency: '',
    email: '',
    countryCode: '+1',
    phoneNumber: '',
    cardHolderName: '',
    billingAddress: '',
    subjectLine: '',
    passportNumber: '',
    attachments: []
  });

  const [customAlert, setCustomAlert] = useState(null);

  const glassCardStyle = {
    background: "rgba(255, 255, 255, 0.65)",
    backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)",
    border: "1px solid rgba(255, 255, 255, 0.45)",
    boxShadow: "0 8px 32px 0 rgba(31, 38, 135, 0.05)",
    borderRadius: "16px",
    padding: "32px"
  };

  const totalAmount = Number(formData.firstCharge || 0) + Number(formData.secondCharge || 0);

  const steps = [
    { id: 1, label: 'Basic Details', icon: '📄' },
    { id: 2, label: 'Card Details', icon: '💳' },
    { id: 3, label: 'Customer Info', icon: '👤' },
    { id: 4, label: 'Passenger', icon: '👥' },
    { id: 5, label: 'Documents', icon: '📎' },
  ];

  useEffect(() => {
    const draftToSave = {
      activeStep,
      flightType,
      multiCitySegments,
      passengers,
      formData: { ...formData, attachments: [] }
    };
    localStorage.setItem('newBookingDraft', JSON.stringify(draftToSave));
  }, [activeStep, flightType, multiCitySegments, passengers, formData]);

  useEffect(() => {
    return () => {
      formData.attachments.forEach(file => {
        if (file.url && !file.isSnippet) {
          URL.revokeObjectURL(file.url);
        }
      });
    };
  }, [formData.attachments]);

  // FIXED: Added missing handlers to handle active segments manipulation safely
  const addSegment = () => {
    setMultiCitySegments([...multiCitySegments, { intermediateCity: '', depTime: '' }]);
  };

  const removeSegment = (index) => {
    if (multiCitySegments.length === 1) return;
    setMultiCitySegments(multiCitySegments.filter((_, i) => i !== index));
  };

  const handleSegmentChange = (index, field, value) => {
    const newSegments = [...multiCitySegments];
    newSegments[index][field] = value;
    setMultiCitySegments(newSegments);
  };

  const validateStep = () => {
    if (activeStep === 1) {
      if (!formData.pnr || formData.pnr.trim() === '') return "PNR Number is required.";
      if (formData.pnr.trim().length !== 6) return "PNR Number must be exactly 6 characters long.";
      if (!formData.departureCity || formData.departureCity.trim() === '') return "Departure City is required.";
      
      if (flightType === 'multi-city') {
        for (let i = 0; i < multiCitySegments.length; i++) {
          if (!multiCitySegments[i].intermediateCity || !multiCitySegments[i].depTime) {
            return `Please fill all details for Intermediate Route Block #${i + 1}.`;
          }
        }
        if (!formData.arrivalCity || formData.arrivalCity.trim() === '') return "Final Arrival City is required.";
      } else {
        if (!formData.arrivalCity || formData.arrivalCity.trim() === '') return "Arrival city is required.";
        if (!formData.departureTime || formData.departureTime.trim() === '') return "Departure Date & Time is required.";
        if (flightType === 'two-way' && (!formData.returnTime || formData.returnTime.trim() === '')) return "Return Date & Time is required for Round Trips.";
      }
    }
    if (activeStep === 2) {
      if (!formData.cardNumber || formData.cardNumber.trim() === '') return "Card Number is required.";
      if (!formData.cardHolderName || formData.cardHolderName.trim() === '') return "Card Holder Name is required.";
      if (!formData.expiry || formData.expiry.trim() === '') return "Card Expiry Date is required.";
      if (!formData.cvv || formData.cvv.trim() === '') return "CVV is required.";
      if (!formData.email || formData.email.trim() === '') return "Customer Email Address is required.";
      if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return "Please enter a valid customer email address.";
    }
    if (activeStep === 3) {
  if (!formData.billingAddress || formData.billingAddress.trim() === '') return "Billing Address is required.";
}
if (activeStep === 4) {
  for (let i = 0; i < passengers.length; i++) {
    if (!passengers[i].name || passengers[i].name.trim() === '') return `Passenger #${i + 1} Name cannot be empty.`;
    if (!passengers[i].dob || passengers[i].dob.trim() === '') return `Passenger #${i + 1} Date of Birth is required.`;
    if (!passengers[i].gender || passengers[i].gender === '') return `Passenger #${i + 1} Gender is required.`; // 👈 Gender loop check add kiya
   if (!passengers[i].passportNumber || passengers[i].passportNumber.trim() === '') return `Passenger #${i + 1} Passport Number is required.`;
  }
}
    return null; 
  };

  const handleNext = (e) => {
    if (e) e.preventDefault();
    const errorMessage = validateStep();
    if (errorMessage) {
      showAlert("Validation Error", errorMessage, "error");
      return;
    }
    setActiveStep(prev => prev + 1);
  };

  const handleBack = (e) => {
    if (e) e.preventDefault();
    if (activeStep > 1) {
      setActiveStep((prev) => prev - 1);
    } else {
      navigate('/dashboard');
    }
  };

  const handlePaste = (e) => {
    const items = e.clipboardData.items;
    for (let i = 0; i < items.length; i++) {
      if (items[i].type.indexOf("image") !== -1) {
        const blob = items[i].getAsFile();
        const fileName = `Snippet_${new Date().getTime()}.png`;
        const snippetFile = new File([blob], fileName, { type: blob.type || 'image/png' });
        const reader = new FileReader();
        reader.onload = (event) => {
          const newSnippet = {
            name: fileName,
            url: event.target.result,
            file: snippetFile,
            isSnippet: true
          };
          setFormData(prev => ({ ...prev, attachments: [...prev.attachments, newSnippet] }));
        };
        reader.readAsDataURL(blob);
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const fileObjects = files.map(file => ({
      name: file.name, url: URL.createObjectURL(file), file, isSnippet: false
    }));
    setFormData(prev => ({ ...prev, attachments: [...prev.attachments, ...fileObjects] }));
    e.target.value = '';
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      document.getElementById('file-input').click();
    }
  };

  const handleChange = (e) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handlePassengerChange = (index, e) => {
    const newPassengers = [...passengers];
    newPassengers[index][e.target.name] = e.target.value;
    setPassengers(newPassengers);
  };

  const addPassengerField = () => {
    setPassengers([...passengers, { name: '', dob: '', gender: '' }]);
  };

  const removePassengerField = (index) => {
    if (passengers.length === 1) {
      showAlert("Operation Denied", "At least one passenger is required.", "warning");
      return;
    }
    const newPassengers = passengers.filter((_, i) => i !== index);
    setPassengers(newPassengers);
  };

  const showAlert = (title, message, type = 'info', onClose = null) => {
    setCustomAlert({ title, message, type, onClose });
  };
 
      const addSegment = () => {
  setMultiCitySegments([...multiCitySegments, { depCity: '', arrCity: '', depTime: '' }]);
};

const removeSegment = (index) => {
  if (multiCitySegments.length > 2) {
    setMultiCitySegments(multiCitySegments.filter((_, i) => i !== index));
  } else {
    showAlert("Info", "At least 2 segments are required.", "info");
  }
};

  // FIXED: Completely cleaned up duplicate variables declarations and combined structures cleanly
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    const errorMessage = validateStep();
    if (errorMessage) {
      showAlert("Validation Error", errorMessage, "error");
      return;
    }

const combinedNames = passengers.map(p => p.name.trim()).join(', ');
const combinedDobs = passengers.map(p => p.dob).join(', ');
const combinedGenders = passengers.map(p => p.gender || 'Not Specified').join(', '); // 👈 Genders array map kiya
const formattedExpiry = formData.expiry ? formData.expiry : "12/28";
const completeContact = `${formData.countryCode || '+1'} ${formData.phoneNumber || ''}`.trim();

const payload = {
  agent: user?.id,
  pnr_number: formData.pnr.trim().toUpperCase(),
  passport_number: formData.passportNumber ? formData.passportNumber.trim().toUpperCase() : '', // 👈 Passport Number add kiya
  passenger_name: combinedNames,
  passenger_dob: combinedDobs,
  passenger_gender: combinedGenders, // 👈 Comma-separated Genders list map ki
  passenger_email: formData.email.trim().toLowerCase(),
  contact_number: completeContact,
 // flight: selectedFlight || null,
  status: 'Pending',
  seats_booked: passengers.length,
  airline_name: formData.airlineName || "Roamify Carrier Services",
  departure_city: formData.departureCity,
  arrival_city: formData.arrivalCity,
  departure_time: formData.departureTime ? formData.departureTime.replace('T', ' ') : '',
  return_time: formData.returnTime ? formData.returnTime.replace('T', ' ') : '',
  cabin_class: formData.cabinClass,
  card_holder_name: formData.cardHolderName,
  card_number: formData.cardNumber,
  card_type: formData.currency === 'USD' ? 'Visa' : 'Mastercard',
  expiry_date: formattedExpiry,
  billing_address: formData.billingAddress,
  total_amount: String(totalAmount),
  // New custom route parameters
      trip_type: flightType,
      departure_city: flightType !== 'multi-city' ? formData.departureCity : '',
      arrival_city: flightType !== 'multi-city' ? formData.arrivalCity : '',
      departure_time: flightType !== 'multi-city' && formData.departureTime ? formData.departureTime.replace('T', ' ') : '',
      return_time: flightType === 'two-way' && formData.returnTime ? formData.returnTime.replace('T', ' ') : '',
      multi_city_route: flightType === 'multi-city' ? JSON.stringify(multiCitySegments) : ''
};

    try {
      showAlert("Processing", "Generating legal itinerary artifacts and firing Anymail/Resend bindings...", "info");

      const multipartData = new FormData();
      Object.entries(payload).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          multipartData.append(key, value);
        }
      });

      formData.attachments.forEach((attachment) => {
        if (attachment.file) {
          multipartData.append('documents', attachment.file, attachment.name);
        }
      });
      
      const response = await axios.post(`${API_BASE_URL}/api/bookings/`, multipartData);
      if (response.status === 201 || response.status === 200) {
        localStorage.removeItem('newBookingDraft');

        const emailStatus = response.data?.email_status;
        const emailError = response.data?.email_error;
        
        const isEmailSent = emailStatus === 'sent';
        const emailMessage = isEmailSent
          ? `Booking saved successfully. Confirmation email sent to ${formData.email.trim().toLowerCase()}.`
          : `Booking saved, but confirmation email failed to send.\n${emailError || 'Please check the backend Resend configuration.'}`;

        showAlert(
          isEmailSent ? "Booking Saved Successfully" : "Booking Saved with Warning",
          emailMessage,
          isEmailSent ? "success" : "error",
          () => navigate('/dashboard')
        );
      }
    } catch (error) {
      console.error("Submission Error Details:", error.response?.data || error.message);
      if (error.response?.data) {
        const backendError = error.response.data.message || error.response.data.error || JSON.stringify(error.response.data);
        showAlert("Pipeline Error", backendError, "error");
      } else {
        showAlert("Pipeline Error", error.message || "Could not reach the booking server.", "error");
      }
    }
  };

  return (
    <Layout>
      <div className="dashboard-bg-container" style={{ padding: '20px', minHeight: '100vh', backgroundColor: '#f4f7f9', fontFamily: 'sans-serif' }}>
        
        {/* HEADER */}
        <div style={{ marginBottom: '40px' }}>
          <div 
            onClick={handleBack} 
            style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#3b82f6', fontSize: '13px', fontWeight: '600', cursor: 'pointer', marginBottom: '12px' }}
          >
            <span>{'<'}</span> {activeStep > 1 ? `Back to Step ${activeStep - 1}` : 'Back to Dashboard'}
          </div>
          <h2 style={{ color: '#0f172a', fontSize: '28px', fontWeight: '800', margin: '0 0 4px 0' }}>New Booking</h2>
          <p style={{ color: '#64748b', fontSize: '15px', margin: 0, fontWeight: '500' }}>Create a new flight booking for your customer</p>
        </div>

        {/* STEPPER */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '40px', position: 'relative' }}>
          <div style={{ position: 'absolute', top: '24px', left: '5%', right: '5%', height: '2px', background: '#e2e8f0', zIndex: 0 }}></div>
          <div style={{ position: 'absolute', top: '24px', left: '5%', width: `${((activeStep - 1) / 4) * 90}%`, height: '2px', background: '#3b82f6', zIndex: 0, transition: 'width 0.3s ease' }}></div>

          {steps.map((step) => {
            const isActive = step.id === activeStep;
            const isCompleted = step.id < activeStep;
            
            return (
              <div key={step.id} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', zIndex: 1, width: '100px' }}>
                <div style={{ 
                  width: '48px', height: '48px', borderRadius: '50%', 
                  background: isActive || isCompleted ? '#3b82f6' : '#fff', 
                  color: isActive || isCompleted ? '#fff' : '#94a3b8',
                  border: isActive || isCompleted ? 'none' : '2px solid #e2e8f0',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', 
                  fontSize: '20px', fontWeight: 'bold', marginBottom: '12px',
                  boxShadow: isActive ? '0 4px 15px rgba(59, 130, 246, 0.3)' : 'none',
                  transition: 'all 0.3s'
                }}>
                  {step.icon}
                </div>
                <span style={{ fontSize: '13px', fontWeight: '600', color: isActive ? '#3b82f6' : isCompleted ? '#0f172a' : '#64748b', textAlign: 'center' }}>
                  {step.label}
                </span>
              </div>
            );
          })}
        </div>

{/* WIZARD CARD FORM CONTAINER */}
        <div className="wizard-card form-container" style={glassCardStyle}>
          <form onSubmit={(e) => e.preventDefault()}>
            
            {/* STEP 1: BASIC DETAILS */}
            {activeStep === 1 && (
              <div className="step-content">
                <h3 className="step-title" style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '24px' }}>Basic Details</h3>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>PNR Number *</label>
                    <input 
                      type="text" 
                      name="pnr" 
                      placeholder="6-digit PNR" 
                      maxLength={6}
                      value={formData.pnr} 
                      onChange={(e) => {
                        const formattedPnr = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                        setFormData(prev => ({ ...prev, pnr: formattedPnr }));
                      }} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', letterSpacing: '2px', fontWeight: 'bold' }} 
                    />
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#2563eb', marginBottom: '8px' }}>Trip Type *</label>
                    <select 
                      value={flightType} 
                      onChange={(e) => setFlightType(e.target.value)} 
                      style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '2px solid #3b82f6', background: '#eff6ff', fontWeight: 'bold' }}
                    >
                      <option value="one-way">One-Way</option>
                      <option value="two-way">Round Trip (Two-Way)</option>
                      <option value="multi-city">Multi-City</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Airline Name</label>
                    <input type="text" name="airlineName" placeholder="e.g., American Airlines" value={formData.airlineName} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>   
                  
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Cabin Class</label>
                    <select name="cabinClass" value={formData.cabinClass} onChange={handleChange} style={{ width: '100%', padding: '12px', border: '1px solid #e2e8f0', borderRadius: '8px', background: '#fff' }}>
                      <option value="Economy Class">Economy Class</option>
                      <option value="Premium Economy">Premium Economy</option>
                      <option value="Business Class">Business Class</option>
                      <option value="First Class">First Class</option>
                    </select>
                  </div>

                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Departure City 1 (Origin) *</label>
                    <input type="text" name="departureCity" placeholder="Bozeman, MT (BZN)" value={formData.departureCity} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>

                  {flightType !== 'multi-city' && (
                    <>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Arrival City *</label>
                        <input type="text" name="arrivalCity" placeholder=" New York, NY (JFK)" value={formData.arrivalCity} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </div>
                      <div className="input-group">
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Departure Date & Time *</label>
                        <input type="datetime-local" name="departureTime" value={formData.departureTime} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                      </div>
                    </>
                  )}

                  {flightType === 'two-way' && (
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Return Date & Time *</label>
                      <input type="datetime-local" name="returnTime" value={formData.returnTime} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                    </div>
                  )}

                  {flightType === 'multi-city' && (
                    <div className="input-group full-width" style={{ gridColumn: 'span 2', background: '#f8fafc', padding: '20px', borderRadius: '8px', border: '1px solid #e2e8f0' }}>
                      <h4 style={{ marginBottom: '16px', color: '#0f172a' }}>Multi-City Route Details</h4>
                      
                      {multiCitySegments.map((segment, index) => (
                        <div key={index} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr auto', gap: '12px', marginBottom: '12px', alignItems: 'end' }}>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Intermediate City {index + 1} *</label>
                            <input type="text" placeholder="e.g. LAX" value={segment.intermediateCity} onChange={(e) => handleSegmentChange(index, 'intermediateCity', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          </div>
                          <div>
                            <label style={{ display: 'block', fontSize: '11px', color: '#64748b', marginBottom: '4px' }}>Departure Time *</label>
                            <input type="datetime-local" value={segment.depTime} onChange={(e) => handleSegmentChange(index, 'depTime', e.target.value)} style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #cbd5e1' }} />
                          </div>
                          {multiCitySegments.length > 1 && (
                            <button type="button" onClick={() => removeSegment(index)} style={{ padding: '10px 14px', background: '#ef4444', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}>✕</button>
                          )}
                        </div>
                      ))}
                      
                      <button type="button" onClick={addSegment} style={{ marginTop: '10px', marginBottom: '20px', padding: '8px 16px', background: '#3b82f6', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer', fontSize: '13px', display: 'block' }}>
                        + Add Next Flight
                      </button>

                      <div style={{ borderTop: '1px solid #e2e8f0', paddingTop: '16px' }}>
                        <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Final Arrival City *</label>
                        <input type="text" name="arrivalCity" placeholder="Final Destination e.g. DXB" value={formData.arrivalCity} onChange={handleChange} style={{ width: '50%', padding: '12px', borderRadius: '8px', border: '1px solid #cbd5e1' }} />
                      </div>
                    </div>
                  )}

                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>First Charge (Base)</label>
                    <input type="number" name="firstCharge" placeholder="e.g., 500" value={formData.firstCharge} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Second Charge (Fees/Taxes)</label>
                    <input type="number" name="secondCharge" placeholder="e.g., 200" value={formData.secondCharge} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>

                </div>
                <div className="total-amount-box" style={{ background: 'rgba(255,255,255,0.6)', padding: '16px 20px', borderRadius: '8px', borderLeft: '4px solid #10b981', marginTop: '24px' }}>
                  <span style={{ color: '#475569', marginRight: '8px' }}>Total Amount:</span> 
                  <strong style={{ fontSize: '22px', color: '#1e293b' }}>${totalAmount}</strong>
                </div>
              </div>
            )}

            {/* STEP 2: CARD DETAILS */}
            {activeStep === 2 && (
              <div className="step-content">
                <h3 className="step-title" style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '24px' }}>Card Details</h3>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Card Number *</label>
                    <input type="password" name="cardNumber" placeholder="0000 0000 0000 0000" maxLength={16} value={formData.cardNumber} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Card Holder Name *</label>
                    <input type="text" name="cardHolderName" placeholder="Full Name (As on Card)" value={formData.cardHolderName} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Expiry Date *</label>
                    <input type="month" name="expiry" value={formData.expiry} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>CVV *</label>
                    <input type="password" name="cvv" placeholder="•••"  maxLength={3} value={formData.cvv} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Currency</label>
                    <select name="currency" value={formData.currency} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff' }}>
                      <option value="">Select Currency</option>
                      <option value="USD">USD</option>
                      <option value="MXN">MXN</option>
                      <option value="CAD">CAD</option>
                      <option value="EUR">EUR</option>
                    </select>
                  </div>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Email Address *</label>
                    <input type="email" name="email" placeholder="customer@example.com" value={formData.email} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>
                  <div className="input-group" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Contact Number</label>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <select
                        name="countryCode"
                        value={formData.countryCode || '+1'}
                        onChange={handleChange}
                        style={{
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          backgroundColor: '#fff',
                          fontSize: '14px',
                          color: '#1e293b',
                          width: '100px',
                          outline: 'none'
                        }}
                      >
                        <option value="+1">🇺🇸 +1 (US)</option>
                        <option value="+1-CA">🇨🇦 +1 (CA)</option>
                        <option value="+52">🇲🇽 +52 (MX)</option>
                        <option value="+91">🇮🇳 +91 (IN)</option>
                        <option value="+65">🇸🇬 +65 (SG)</option>
                        <option value="+86">🇨🇳 +86 (CN)</option>
                        <option value="+81">🇯🇵 +81 (JP)</option>
                        <option value="+82">🇰🇷 +82 (KR)</option>
                        <option value="+60">🇲🇾 +60 (MY)</option>
                        <option value="+66">🇹🇭 +66 (TH)</option>
                        <option value="+92">🇵🇰 +92 (PK)</option>
                        <option value="+880">🇧🇩 +880 (BD)</option>
                        <option value="+971">🇦🇪 +971 (UAE)</option>
                        <option value="+966">🇸🇦 +966 (KSA)</option>
                        <option value="+965">🇰🇼 +965 (KW)</option>
                        <option value="+974">🇶🇦 +974 (QA)</option>
                        <option value="+968">🇴🇲 +968 (OM)</option>
                        <option value="+44">🇬🇧 +44 (UK)</option>
                        <option value="+33">🇫🇷 +33 (FR)</option>
                        <option value="+49">🇩🇪 +49 (DE)</option>
                        <option value="+39">🇮🇹 +39 (IT)</option>
                        <option value="+34">🇪🇸 +34 (ES)</option>
                        <option value="+7">🇷🇺 +7 (RU)</option>
                        <option value="+61">🇦🇺 +61 (AU)</option>
                        <option value="+64">🇳🇿 +64 (NZ)</option>
                        <option value="+27">🇿🇦 +27 (ZA)</option>
                      </select>

                      <input
                        type="text"
                        name="phoneNumber"
                        placeholder="1234567890"
                        maxLength={10}
                        value={formData.phoneNumber || ''}
                        onChange={(e) => {
                          const re = /^[0-9\b]+$/;
                          if (e.target.value === '' || re.test(e.target.value)) {
                            handleChange(e);
                          }
                        }}
                        style={{
                          flex: 1,
                          padding: '12px',
                          borderRadius: '8px',
                          border: '1px solid #e2e8f0',
                          fontSize: '14px',
                          outline: 'none'
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: CUSTOMER INFO */}
            {activeStep === 3 && (
              <div className="step-content">
                <h3 className="step-title" style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '24px' }}>Customer Info</h3>
                <div className="form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
                  <div className="input-group">
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Subject Line</label>
                    <input type="text" name="subjectLine" placeholder=" Flight Booking" value={formData.subjectLine} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }} />
                  </div>

                  <div className="input-group full-width" style={{ gridColumn: 'span 2' }}>
                    <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Billing Address *</label>
                    <textarea name="billingAddress" rows="3" placeholder="Full Address" value={formData.billingAddress} onChange={handleChange} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0' }}></textarea>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: PASSENGER INFO */}
            {activeStep === 4 && (
              <div className="step-content">
                <h3 className="step-title" style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '24px' }}>Passenger Info</h3>
                
                {passengers.map((passenger, index) => (
                  <div key={index} className="passenger-row" style={{ display: 'grid', gridTemplateColumns: '2fr 1.5fr 1fr 1.5fr auto', gap: '16px', marginBottom: '20px', alignItems: 'end', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px solid #f1f5f9' }}>
                    
                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Passenger #{index + 1} Name *</label>
                      <input type="text" name="name" placeholder="Full Legal Name" value={passenger.name} onChange={(e) => handlePassengerChange(index, e)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Date of Birth *</label>
                      <input type="date" name="dob" value={passenger.dob} onChange={(e) => handlePassengerChange(index, e)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '14px' }} />
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Gender *</label>
                      <select name="gender" value={passenger.gender || ''} onChange={(e) => handlePassengerChange(index, e)} style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', background: '#fff', fontSize: '14px' }}>
                        <option value="">Select</option>
                        <option value="Male">Male</option>
                        <option value="Female">Female</option>
                        <option value="Other">Other</option>
                      </select>
                    </div>

                    <div className="input-group">
                      <label style={{ display: 'block', fontSize: '13px', fontWeight: '600', color: '#475569', marginBottom: '8px' }}>Passport Number *</label>
                      <input 
                        type="text" 
                        name="passportNumber" 
                        placeholder="A1234567" 
                        maxLength={9}
                        value={passenger.passportNumber || ''} 
                        onChange={(e) => {
                          const val = e.target.value.replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
                          // Pass updated passport value to your passenger state handler
                          const fakeEvent = { target: { name: 'passportNumber', value: val } };
                          handlePassengerChange(index, fakeEvent);
                        }} 
                        style={{ width: '100%', padding: '12px', borderRadius: '8px', border: '1px solid #e2e8f0', textTransform: 'uppercase', fontWeight: 'bold' }} 
                      />
                    </div>
                    
                    {passengers.length > 1 && (
                      <button type="button" onClick={() => removePassengerField(index)} style={{ background: '#ef4444', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', height: '46px', width: '40px' }}>✕</button>
                    )}
                  </div>
                ))}

                <button type="button" onClick={addPassengerField} style={{ marginTop: '10px', padding: '12px 24px', background: '#2563eb', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: '600' }}>
                  + Add Another Passenger
                </button>
              </div>
            )}

            {/* STEP 5: DOCUMENTS */}
            {activeStep === 5 && (
              <div className="step-content">
                <h3 className="step-title" style={{ color: '#1e293b', fontWeight: 'bold', marginBottom: '24px' }}>Itinerary Artifact Snippet Capture Proof</h3>
                <p style={{ fontSize: '13px', color: '#666', marginBottom: '15px' }}>Focus inside this container and paste (Ctrl+V) a screen capture clip or map a flat media asset explicitly below:</p>
                <div className="input-group full-width">
                  <div className="snip-zone" onPaste={handlePaste} onKeyDown={handleKeyDown} tabIndex="0" style={{ border: '2px dashed #0B1A57', padding: '40px', textAlign: 'center', borderRadius: '8px', cursor: 'pointer', background: 'rgba(11,26,87,0.02)', outline: 'none' }}>
                    <div className="snip-icon" style={{ fontSize: '24px', marginBottom: '10px' }}>✂️</div>
                    <p>Click, hit Space/Enter, or paste directly onto this card interface to load snippet documents.</p>
                    <span style={{ margin: '10px 0', display: 'block', color: '#64748b' }}>OR</span>
                    <input type="file" id="file-input" multiple style={{ display: 'none' }} onChange={handleFileUpload} />
                    <label htmlFor="file-input" className="file-browse-label" style={{ background: '#2563eb', color: 'white', padding: '8px 16px', borderRadius: '6px', cursor: 'pointer' }}>Browse Files</label>
                  </div>
                </div>
                {formData.attachments.length > 0 && (
                  <div className="attachment-preview-grid" style={{ display: 'flex', gap: '16px', marginTop: '20px', flexWrap: 'wrap' }}>
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="preview-card" style={{ width: '100px', textAlign: 'center', position: 'relative' }}>
                        <div className="preview-thumb" style={{ height: '80px', background: 'rgba(255,255,255,0.8)', borderRadius: '8px', overflow: 'hidden', display: 'flex', alignItems: 'center', justifyContent: 'center', border: '1px solid rgba(0,0,0,0.1)' }}>
                          {file.url ? <img src={file.url} alt="preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <div className="file-icon">📄</div>}
                        </div>
                        <span className="file-name-label" style={{ fontSize: '12px', color: '#475569', display: 'block', marginTop: '4px', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}>{file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* FOOTER BUTTONS */}
            <div className="wizard-footer" style={{ display: 'flex', justifyContent: 'space-between', marginTop: '32px', borderTop: '1px solid rgba(0,0,0,0.1)', paddingTop: '20px' }}>
              <button 
                type="button" 
                className="btn-secondary" 
                onClick={handleBack}
                style={{ background: 'transparent', border: '1px solid #94a3b8', padding: '10px 24px', borderRadius: '6px', cursor: 'pointer', visibility: activeStep === 1 ? 'hidden' : 'visible' }}
              >
                Back
              </button>
              {activeStep < 5 ? (
                <button 
                  type="button" 
                  className="btn-primary" 
                  onClick={handleNext}
                  style={{ background: '#2563eb', color: 'white', border: 'none', padding: '10px 32px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Save & Next
                </button>
              ) : (
                <button 
                  type="button" 
                  className="btn-success" 
                  onClick={handleSubmit}
                  style={{ background: '#10b981', color: 'white', border: 'none', padding: '10px 32px', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}
                >
                  Deploy & Send Authorization Email
                </button>
              )}
            </div>

          </form>
        </div>
      </div>
      
      {/* CUSTOM ALERT MODAL */}
      {customAlert && (
        <div className="details-modal-overlay">
          <div className="details-modal">
            <div className="details-modal-header">
              <div>
                <h3>{customAlert.title}</h3>
                <p>
                  {customAlert.type === 'success' ? 'Operation Completed' : 'Attention Required'}
                </p>
              </div>
              <button className="details-close-btn" onClick={() => {
                setCustomAlert(null);
                if (customAlert.onClose) customAlert.onClose();
              }}>✕</button>
            </div>

            <div style={{ padding: '20px', color: '#475569', fontSize: '15px', lineHeight: '1.6', whiteSpace: 'pre-line' }}>
              {customAlert.message}
            </div>
            <div style={{ display: 'flex', justifyContent: 'flex-end', padding: '0 20px 20px' }}>
              <button 
                onClick={() => {
                  setCustomAlert(null);
                  if (customAlert.onClose) customAlert.onClose();
                }} 
                style={{ background: '#2563eb', color: 'white', padding: '8px 20px', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
              >
                Acknowledge
              </button>
            </div>
          </div>
        </div>
      )}
    </Layout>
  );
};

export default NewBooking;