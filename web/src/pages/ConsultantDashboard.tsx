import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Users, Wallet, Star, Calendar, Clock, Video, BookOpen, LogOut, ShieldAlert, Award } from "lucide-react";
import { AuthService, ConsultantService, WalletService } from "../services/api";
import logo from "../assets/logo.png";

const WEEKDAYS = [
  { label: "S", value: 0 },
  { label: "M", value: 1 },
  { label: "T", value: 2 },
  { label: "W", value: 3 },
  { label: "T", value: 4 },
  { label: "F", value: 5 },
  { label: "S", value: 6 },
];

export default function ConsultantDashboard() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [dbUser, setDbUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"dashboard" | "earnings">("dashboard");
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loadingTransactions, setLoadingTransactions] = useState(false);

  // Profile Modal State (if profile is incomplete)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [completeName, setCompleteName] = useState("");
  const [completePhone, setCompletePhone] = useState("");
  const [modalErr, setModalErr] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

  // Consultant Registration form state (for cases where role=CONSULTANT but no profile exists)
  const [specialty, setSpecialty] = useState("");
  const [experience, setExperience] = useState("");
  const [price, setPrice] = useState("");
  const [bio, setBio] = useState("");
  const [portfolioUrl, setPortfolioUrl] = useState("");
  const [regErr, setRegErr] = useState("");
  const [regLoading, setRegLoading] = useState(false);

  // Scheduler Form State
  const formatDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const today = new Date();
  const fortnightLater = new Date();
  fortnightLater.setDate(today.getDate() + 14);

  const [startDate, setStartDate] = useState(formatDate(today));
  const [endDate, setEndDate] = useState(formatDate(fortnightLater));
  const [selectedDays, setSelectedDays] = useState<number[]>([1, 2, 3, 4, 5]); // default Mon-Fri
  const [slotTime, setSlotTime] = useState("");
  const [scheduleErr, setScheduleErr] = useState("");
  const [scheduleSuccess, setScheduleSuccess] = useState("");
  const [scheduleLoading, setScheduleLoading] = useState(false);

  // Notes Form State
  const [activeNotesBookingId, setActiveNotesBookingId] = useState<string | null>(null);
  const [sessionNotes, setSessionNotes] = useState("");
  const [notesErr, setNotesErr] = useState("");
  const [notesLoading, setNotesLoading] = useState(false);

  // Load dashboard data
  const loadData = async () => {
    try {
      setLoading(true);
      const meRes = await AuthService.getMe();
      setDbUser(meRes.user);

      // Check if profile needs completing
      const needsName = !meRes.user.fullName || meRes.user.fullName === "User" || meRes.user.fullName.trim() === "";
      const needsPhone = !meRes.user.phone || !meRes.user.isPhoneVerified;
      
      if (needsName || needsPhone) {
        setShowProfileModal(true);
        if (!needsName) setCompleteName(meRes.user.fullName);
        if (!needsPhone) setCompletePhone(meRes.user.phone?.replace("+91", "") || "");
      } else {
        setShowProfileModal(false);
      }

      // Fetch sessions/bookings if profile exists
      if (meRes.user.consultantProfile) {
        const bookingsRes = await ConsultantService.listBookings();
        setBookings(bookingsRes.bookings || []);
      } else {
        setBookings([]);
      }
    } catch (err: any) {
      console.error("Failed to load consultant dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  const loadTransactions = async () => {
    try {
      setLoadingTransactions(true);
      const res = await WalletService.getHistory();
      setTransactions(res.transactions || []);
    } catch (err) {
      console.error("Failed to load transactions:", err);
    } finally {
      setLoadingTransactions(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  useEffect(() => {
    if (dbUser?.consultantProfile && activeTab === "earnings") {
      loadTransactions();
    }
  }, [activeTab, dbUser?.consultantProfile]);

  const handleSignOut = async () => {
    await signOut();
    navigate("/");
  };

  // Complete Profile Submission
  const handleCompleteProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (completeName.trim().length < 2) {
      setModalErr("Please enter your full name.");
      return;
    }
    const cleanPhone = completePhone.trim().replace(/\D/g, "");
    if (cleanPhone.length !== 10) {
      setModalErr("Please enter a valid 10-digit phone number.");
      return;
    }

    setModalErr("");
    setModalLoading(true);
    try {
      const formattedPhone = `+91${cleanPhone}`;
      const res = await AuthService.updateProfile({
        fullName: completeName.trim(),
        phone: formattedPhone,
      });

      if (res && res.user) {
        setDbUser(res.user);
        setShowProfileModal(false);
        alert("Profile completed successfully!");
      }
    } catch (err: any) {
      setModalErr(err.response?.data?.message || "Failed to update profile. Try again.");
    } finally {
      setModalLoading(false);
    }
  };

  // Submit Consultant Application Profile
  const handleRegisterProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!specialty.trim() || !experience || !price || !bio.trim()) {
      setRegErr("Please fill out all consultant profile fields.");
      return;
    }

    if (specialty.trim().length < 2) {
      setRegErr("Specialty description must be at least 2 characters.");
      return;
    }

    const expVal = parseInt(experience);
    if (isNaN(expVal) || !/^\d+$/.test(experience) || expVal < 0) {
      setRegErr("Experience must be a valid non-negative integer number of years.");
      return;
    }

    const priceVal = parseFloat(price);
    if (isNaN(priceVal) || priceVal <= 0) {
      setRegErr("Consultation fee must be a valid positive number.");
      return;
    }

    if (bio.trim().length < 10) {
      setRegErr("Bio/Cover Letter must be at least 10 characters.");
      return;
    }

    let finalUrls: string[] = [];
    if (portfolioUrl.trim()) {
      let url = portfolioUrl.trim();
      if (!/^https?:\/\//i.test(url)) {
        url = `https://${url}`;
      }
      finalUrls = [url];
    }

    setRegErr("");
    setRegLoading(true);
    try {
      await ConsultantService.register({
        specialty: specialty.trim(),
        experience: expVal,
        bio: bio.trim(),
        price: priceVal,
        portfolioUrls: finalUrls,
      });

      alert("Consultant profile submitted successfully! It is pending admin approval.");
      await loadData();
    } catch (err: any) {
      const serverMsg = err.response?.data?.message;
      const details = err.response?.data?.errors
        ?.map((e: any) => `${e.field}: ${e.message}`)
        .join(", ");
      setRegErr(details ? `Validation failed: ${details}` : (serverMsg || "Failed to register consultant profile. Try again."));
    } finally {
      setRegLoading(false);
    }
  };

  // Add availability slots
  const handleAddSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleErr("");
    setScheduleSuccess("");

    if (!startDate.trim() || !endDate.trim() || !slotTime.trim()) {
      setScheduleErr("Please fill out the start date, end date, and time slot.");
      return;
    }

    setScheduleLoading(true);
    try {
      // Loop over dates from start to end, checking if day is selected
      const start = new Date(startDate);
      const end = new Date(endDate);
      const slots: { date: string; timeSlot: string }[] = [];

      for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
        if (selectedDays.includes(d.getDay())) {
          // Format date as local ISO string yyyy-mm-dd
          const yr = d.getFullYear();
          const mo = String(d.getMonth() + 1).padStart(2, "0");
          const dy = String(d.getDate()).padStart(2, "0");
          slots.push({
            date: `${yr}-${mo}-${dy}`,
            timeSlot: slotTime.trim(),
          });
        }
      }

      if (slots.length === 0) {
        setScheduleErr("No matching days found in selected range.");
        setScheduleLoading(false);
        return;
      }

      await ConsultantService.addAvailabilitySlots(slots);
      setScheduleSuccess(`Successfully added ${slots.length} availability slots!`);
      setSlotTime("");
      await loadData();
    } catch (err: any) {
      setScheduleErr(err.response?.data?.message || "Failed to add slots. Try again.");
    } finally {
      setScheduleLoading(false);
    }
  };

  // Save session notes
  const handleSaveNotes = async (bookingId: string) => {
    if (!sessionNotes.trim()) {
      setNotesErr("Session notes cannot be empty.");
      return;
    }

    setNotesErr("");
    setNotesLoading(true);
    try {
      await ConsultantService.addSessionNotes(bookingId, sessionNotes.trim());
      
      // Update local state
      setBookings(
        bookings.map((b) =>
          b.id === bookingId ? { ...b, notes: sessionNotes.trim() } : b
        )
      );
      
      setActiveNotesBookingId(null);
      setSessionNotes("");
      alert("Session notes saved successfully!");
    } catch (err: any) {
      setNotesErr(err.response?.data?.message || "Failed to save notes. Try again.");
    } finally {
      setNotesLoading(false);
    }
  };

  const totalEarnings = bookings.reduce((sum, b) => sum + (b.amount || 0), 0);

  if (loading && !dbUser) {
    return (
      <div className="dashboard-loading">
        <div className="spinner" />
        <p>Loading your portal details...</p>
        <style>{`
          .dashboard-loading {
            height: 100vh;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            font-size: 16px;
            color: var(--text-muted);
          }
          .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid rgba(255, 255, 255, 0.1);
            border-top: 4px solid var(--primary);
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin-bottom: 16px;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div className="dashboard-layout">
      {/* Mobile Hamburger Toggle */}
      <button className="mobile-menu-toggle" onClick={() => setSidebarOpen(true)}>
        <div className="hamburger-icon">
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>

      {/* Overlay Backdrop */}
      <div className={`sidebar-overlay ${sidebarOpen ? "active" : ""}`} onClick={() => setSidebarOpen(false)} />

      {/* Sidebar Navigation */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>

        <div className="sidebar-logo">
          <img src={logo} alt="MydesignGhar Logo" style={{ height: "32px", objectFit: "contain", marginRight: "4px" }} />
          <span className="logo-text">MydesignGhar</span>
        </div>

        <div className="consultant-profile-card">
          <div className="profile-avatar">
            {dbUser?.fullName ? dbUser.fullName.charAt(0).toUpperCase() : "C"}
          </div>
          <div className="profile-info">
            <h4 className="profile-name">{dbUser?.fullName || "Consultant"}</h4>
            <span className="profile-role">Design Expert</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "dashboard" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("dashboard");
              setSidebarOpen(false);
            }}
          >
            <Calendar size={18} />
            <span className="nav-label">Dashboard</span>
          </button>
          <button
            className={`nav-item ${activeTab === "earnings" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("earnings");
              setSidebarOpen(false);
            }}
          >
            <Wallet size={18} />
            <span className="nav-label">Earnings</span>
          </button>
        </nav>

        <button onClick={handleSignOut} className="sidebar-logout btn-secondary">
          <LogOut size={16} />
          <span className="nav-label">Sign Out</span>
        </button>
      </aside>

      {/* Main Panel Content */}
      {!dbUser?.consultantProfile ? (
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1>Namaste, {dbUser?.fullName || "Consultant"}! 👋</h1>
              <p className="subtitle">Please complete your professional consultant profile to proceed.</p>
            </div>
            <div className="portal-badge badge-pending">Registration Incomplete</div>
          </header>

          <div className="registration-form-container animate-fade-in" style={{ maxWidth: "600px", marginTop: "24px" }}>
            <div className="glass-card" style={{ padding: "32px" }}>
              <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                <Award color="var(--primary)" /> Professional Details
              </h2>
              <form onSubmit={handleRegisterProfile}>
                {regErr && <div className="schedule-error" style={{ marginBottom: "16px" }}>{regErr}</div>}
                
                <div className="form-group">
                  <label className="form-label">Design Specialty *</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. Luxury & Modern, Rajasthani Heritage, Minimalist"
                    value={specialty}
                    onChange={(e) => setSpecialty(e.target.value)}
                    disabled={regLoading}
                  />
                </div>

                <div className="form-row" style={{ display: "flex", gap: "16px" }}>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Experience (Years) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 5"
                      value={experience}
                      onChange={(e) => setExperience(e.target.value)}
                      disabled={regLoading}
                    />
                  </div>
                  <div className="form-group" style={{ flex: 1 }}>
                    <label className="form-label">Consultation Fee (₹/hr) *</label>
                    <input
                      type="number"
                      className="form-input"
                      placeholder="e.g. 1500"
                      value={price}
                      onChange={(e) => setPrice(e.target.value)}
                      disabled={regLoading}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label className="form-label">Bio / Cover Letter *</label>
                  <textarea
                    className="form-input"
                    style={{ minHeight: "120px", resize: "vertical" }}
                    placeholder="Tell us about your design style, background, and the kind of homes you love building."
                    value={bio}
                    onChange={(e) => setBio(e.target.value)}
                    disabled={regLoading}
                  />
                </div>

                <div className="form-group">
                  <label className="form-label">Portfolio Image URL (Optional)</label>
                  <input
                    type="text"
                    className="form-input"
                    placeholder="e.g. https://images.unsplash.com/photo-..."
                    value={portfolioUrl}
                    onChange={(e) => setPortfolioUrl(e.target.value)}
                    disabled={regLoading}
                  />
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: "100%", marginTop: "12px" }} disabled={regLoading}>
                  {regLoading ? "Submitting Application..." : "Submit Registration Application"}
                </button>
              </form>
            </div>
          </div>
        </main>
      ) : (
        <main className="main-content">
          <header className="dashboard-header">
            <div>
              <h1>Namaste, {dbUser?.fullName || "Consultant"}! 👋</h1>
              <p className="subtitle">Here is your schedule and client booking panel.</p>
            </div>
            <div className="portal-badge">Consultant Portal</div>
          </header>

          {/* Status alert banner */}
          {dbUser.consultantProfile.status !== "APPROVED" && (
            <div className="approval-alert-banner" style={{
              background: dbUser.consultantProfile.status === "PENDING" ? "rgba(245, 158, 11, 0.1)" : "rgba(239, 68, 68, 0.1)",
              border: `1px solid ${dbUser.consultantProfile.status === "PENDING" ? "var(--primary)" : "var(--error)"}`,
              borderRadius: "12px",
              padding: "16px 20px",
              marginBottom: "24px",
              display: "flex",
              alignItems: "flex-start",
              gap: "12px"
            }}>
              <ShieldAlert size={20} color={dbUser.consultantProfile.status === "PENDING" ? "var(--primary)" : "var(--error)"} style={{ marginTop: "2px", flexShrink: 0 }} />
              <div>
                <h4 style={{ margin: 0, fontWeight: "600", color: dbUser.consultantProfile.status === "PENDING" ? "var(--primary)" : "var(--error)" }}>
                  Profile Status: {dbUser.consultantProfile.status}
                </h4>
                <p style={{ margin: "4px 0 0 0", fontSize: "14px", color: "var(--text-muted)", lineHeight: "1.4" }}>
                  {dbUser.consultantProfile.status === "PENDING" && "Your professional application is currently pending admin approval. You can prepare and manage your availability slots below, but they will not be bookable by clients until your application is approved."}
                  {dbUser.consultantProfile.status === "REJECTED" && "Your application has been rejected. Please contact administrator support to revise your details."}
                  {dbUser.consultantProfile.status === "SUSPENDED" && "Your consultant portal privileges have been suspended. Please contact administrator support."}
                </p>
              </div>
            </div>
          )}

          {/* Stats Grid */}
          <section className="stats-grid animate-fade-in">
            <div className="stat-card glass-card">
              <Users size={20} className="stat-icon" />
              <div className="stat-value">{bookings.length}</div>
              <div className="stat-title">Total Bookings</div>
            </div>
            <div className="stat-card glass-card">
              <Wallet size={20} className="stat-icon" />
              <div className="stat-value">₹{totalEarnings.toLocaleString("en-IN")}</div>
              <div className="stat-title">Earnings</div>
            </div>
            <div className="stat-card glass-card">
              <Star size={20} className="stat-icon" />
              <div className="stat-value">{(dbUser?.consultantProfile?.rating || 5.0).toFixed(1)}</div>
              <div className="stat-title">Rating</div>
            </div>
          </section>

          {/* Dashboard Grid */}
          {activeTab === "dashboard" ? (
            <div className="dashboard-main-grid animate-fade-in">
              {/* Availability Scheduler */}
              <section className="dashboard-section glass-card">
                <div className="section-header-box">
                  <Calendar size={20} color="var(--primary)" />
                  <h2>Schedule Availability Slots</h2>
                </div>
                
                <form onSubmit={handleAddSlots} className="scheduler-form">
                  {scheduleErr && <div className="schedule-error">{scheduleErr}</div>}
                  {scheduleSuccess && <div className="schedule-success">{scheduleSuccess}</div>}

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Start Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={startDate}
                        onChange={(e) => setStartDate(e.target.value)}
                        disabled={scheduleLoading}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">End Date *</label>
                      <input
                        type="date"
                        className="form-input"
                        value={endDate}
                        onChange={(e) => setEndDate(e.target.value)}
                        disabled={scheduleLoading}
                      />
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Active Weekdays *</label>
                    <div className="days-row">
                      {WEEKDAYS.map((day) => {
                        const isSelected = selectedDays.includes(day.value);
                        return (
                          <button
                            key={day.value}
                            type="button"
                            className={`day-circle ${isSelected ? "selected" : ""}`}
                            onClick={() => {
                              if (isSelected) {
                                setSelectedDays(selectedDays.filter((d) => d !== day.value));
                              } else {
                                setSelectedDays([...selectedDays, day.value]);
                              }
                            }}
                            disabled={scheduleLoading}
                          >
                            {day.label}
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Time Slot (e.g. 10:00 AM) *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g., 10:00 AM, 02:30 PM"
                      value={slotTime}
                      onChange={(e) => setSlotTime(e.target.value)}
                      disabled={scheduleLoading}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={scheduleLoading}>
                    {scheduleLoading ? "Adding Slots..." : "Add Slots"}
                  </button>
                </form>

                {/* My Availability Slots List */}
                <div style={{ marginTop: "24px", paddingTop: "20px", borderTop: "1px solid var(--border)" }}>
                  <h3 style={{ fontSize: "16px", fontWeight: "700", marginBottom: "16px", display: "flex", alignItems: "center", gap: "8px" }}>
                    <Calendar size={16} color="var(--primary)" />
                    My Availability Slots ({dbUser?.consultantProfile?.availability?.length || 0})
                  </h3>
                  <div className="slots-grid" style={{ 
                    display: "grid", 
                    gridTemplateColumns: "repeat(auto-fill, minmax(130px, 1fr))", 
                    gap: "10px", 
                    maxHeight: "220px", 
                    overflowY: "auto", 
                    paddingRight: "6px" 
                  }}>
                    {!dbUser?.consultantProfile?.availability || dbUser.consultantProfile.availability.length === 0 ? (
                      <div className="empty-state" style={{ gridColumn: "1/-1", padding: "16px", textAlign: "center" }}>
                        <p style={{ fontSize: "13px", color: "var(--text-muted)", margin: 0 }}>No availability slots created yet.</p>
                      </div>
                    ) : (
                      dbUser.consultantProfile.availability.map((slot: any) => {
                        const slotDate = new Date(slot.date).toLocaleDateString("en-IN", {
                          day: "numeric",
                          month: "short"
                        });
                        return (
                          <div key={slot.id} className="slot-card-item" style={{
                            background: slot.isBooked ? "rgba(239, 68, 68, 0.1)" : "rgba(255, 255, 255, 0.02)",
                            border: `1px solid ${slot.isBooked ? "var(--error)" : "var(--border)"}`,
                            borderRadius: "8px",
                            padding: "10px",
                            display: "flex",
                            flexDirection: "column",
                            gap: "4px"
                          }}>
                            <div style={{ fontSize: "13px", fontWeight: "600" }}>{slotDate}</div>
                            <div style={{ fontSize: "11px", color: "var(--text-muted)", display: "flex", alignItems: "center", gap: "4px" }}>
                              <Clock size={10} /> {slot.timeSlot}
                            </div>
                            <span style={{
                              alignSelf: "flex-start",
                              fontSize: "9px",
                              fontWeight: "700",
                              padding: "1px 6px",
                              borderRadius: "3px",
                              background: slot.isBooked ? "rgba(239, 68, 68, 0.15)" : "rgba(16, 185, 129, 0.1)",
                              color: slot.isBooked ? "var(--error)" : "var(--primary)"
                            }}>
                              {slot.isBooked ? "Booked" : "Available"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              </section>

              {/* Schedule Sessions List */}
              <section className="dashboard-section glass-card">
                <div className="section-header-box">
                  <Clock size={20} color="var(--primary)" />
                  <h2>My Schedule ({bookings.length})</h2>
                </div>

                <div className="sessions-list">
                  {bookings.length === 0 ? (
                    <div className="empty-state">
                      <p>No upcoming client bookings scheduled.</p>
                    </div>
                  ) : (
                    bookings.map((booking) => (
                      <div key={booking.id} className="booking-card glass-card">
                        <div className="booking-card-header">
                          <div>
                            <h3>{booking.name || "Client"}</h3>
                            <p className="booking-datetime">
                              {booking.date.split("T")[0]} | {booking.time}
                            </p>
                          </div>
                          <span className={`badge ${booking.status === "CONFIRMED" ? "badge-approved" : "badge-pending"}`}>
                            {booking.status}
                          </span>
                        </div>

                        {booking.notes && (
                          <div className="booking-notes-display">
                            <strong>Session Notes:</strong>
                            <p>{booking.notes}</p>
                          </div>
                        )}

                        <div className="booking-actions">
                          {booking.dailyRoomUrl && (
                            <button
                              className="btn btn-primary btn-sm"
                              onClick={() => {
                                const path = booking.dailyRoomUrl;
                                navigate(path);
                              }}
                            >
                              <Video size={16} /> Join Consultation
                            </button>
                          )}

                          {activeNotesBookingId === booking.id ? (
                            <div className="notes-editor-box">
                              {notesErr && <div className="notes-error">{notesErr}</div>}
                              <textarea
                                className="form-input"
                                rows={3}
                                placeholder="Enter consultation details, budget notes, design ideas..."
                                value={sessionNotes}
                                onChange={(e) => setSessionNotes(e.target.value)}
                                disabled={notesLoading}
                              />
                              <div className="notes-editor-actions">
                                <button
                                  type="button"
                                  className="btn btn-secondary btn-sm"
                                  onClick={() => {
                                    setActiveNotesBookingId(null);
                                    setSessionNotes("");
                                  }}
                                  disabled={notesLoading}
                                >
                                  Cancel
                                </button>
                                <button
                                  type="button"
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleSaveNotes(booking.id)}
                                  disabled={notesLoading}
                                >
                                  {notesLoading ? "Saving..." : "Save Notes"}
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              className="btn btn-secondary btn-sm"
                              onClick={() => {
                                setActiveNotesBookingId(booking.id);
                                setSessionNotes(booking.notes || "");
                              }}
                            >
                              <BookOpen size={16} /> {booking.notes ? "Update Notes" : "Add Note"}
                            </button>
                          )}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </section>
            </div>
          ) : (
            <div className="earnings-container animate-fade-in" style={{ marginTop: "24px" }}>
              <div className="glass-card" style={{ padding: "24px" }}>
                <h2 style={{ marginBottom: "20px", display: "flex", alignItems: "center", gap: "10px" }}>
                  <Wallet color="var(--primary)" /> Earnings & Payout Ledger
                </h2>
                <div className="earnings-summary" style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
                  gap: "20px",
                  marginBottom: "30px"
                }}>
                  <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Total Balance / Earnings</span>
                    <h3 style={{ fontSize: "28px", fontWeight: "900", margin: "8px 0 0 0", color: "var(--primary)" }}>₹{totalEarnings.toLocaleString("en-IN")}</h3>
                  </div>
                  <div className="stat-card" style={{ background: "rgba(255, 255, 255, 0.02)", border: "1px solid var(--border)", borderRadius: "16px", padding: "20px" }}>
                    <span style={{ fontSize: "13px", color: "var(--text-muted)" }}>Consultation Bookings</span>
                    <h3 style={{ fontSize: "28px", fontWeight: "900", margin: "8px 0 0 0", color: "#ffffff" }}>{bookings.length}</h3>
                  </div>
                </div>

                <h3 style={{ fontSize: "18px", fontWeight: "700", marginBottom: "16px" }}>Transaction Ledger</h3>
                {loadingTransactions ? (
                  <div style={{ textAlign: "center", padding: "40px 0" }}>
                    <div className="spinner" style={{ margin: "0 auto 12px auto" }} />
                    <p style={{ color: "var(--text-muted)", fontSize: "14px" }}>Loading transaction history...</p>
                  </div>
                ) : transactions.length === 0 ? (
                  <div style={{ textAlign: "center", padding: "40px", border: "1px dashed var(--border)", borderRadius: "16px" }}>
                    <p style={{ color: "var(--text-muted)", fontSize: "14px", margin: 0 }}>No earnings transactions recorded yet.</p>
                  </div>
                ) : (
                  <div className="transactions-list-box" style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                    {transactions.map((tx) => {
                      const isCredit = tx.type === "CREDIT" || tx.type === "credit";
                      return (
                        <div key={tx.id} style={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          padding: "16px 20px",
                          background: "rgba(255, 255, 255, 0.02)",
                          border: "1px solid var(--border)",
                          borderRadius: "12px"
                        }}>
                          <div>
                            <h4 style={{ margin: 0, fontSize: "15px", fontWeight: "600", color: "#ffffff" }}>{tx.description || tx.title || "Consultation Payout"}</h4>
                            <span style={{ fontSize: "12px", color: "var(--text-muted)" }}>
                              {new Date(tx.createdAt).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric"
                              })}
                            </span>
                          </div>
                          <span style={{
                            fontSize: "16px",
                            fontWeight: "700",
                            color: isCredit ? "#10b981" : "var(--primary)"
                          }}>
                            {isCredit ? "+" : "-"}₹{tx.amount}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>
          )}
        </main>
      )}

      {/* Complete Profile Modal */}
      {showProfileModal && (
        <div className="modal-overlay">
          <div className="modal-card glass-card">
            <div className="modal-header">
              <ShieldAlert size={36} color="var(--primary)" />
              <h2>Complete Profile</h2>
              <p>Please finalize your name and phone details to enable consultation bookings.</p>
            </div>

            {modalErr && <div className="modal-error">{modalErr}</div>}

            <form onSubmit={handleCompleteProfile} className="modal-form">
              <div className="form-group">
                <label className="form-label">Full Name</label>
                <input
                  type="text"
                  className="form-input"
                  placeholder="Enter full name"
                  value={completeName}
                  onChange={(e) => setCompleteName(e.target.value)}
                  disabled={modalLoading}
                />
              </div>

              <div className="form-group">
                <label className="form-label">Phone Number (10-digit)</label>
                <input
                  type="tel"
                  className="form-input"
                  placeholder="9876543210"
                  maxLength={10}
                  value={completePhone}
                  onChange={(e) => setCompletePhone(e.target.value)}
                  disabled={modalLoading}
                />
              </div>

              <button type="submit" className="btn btn-primary" style={{ width: "100%" }} disabled={modalLoading}>
                {modalLoading ? "Saving Details..." : "Save & Continue"}
              </button>
            </form>
          </div>
        </div>
      )}

      <style>{`
        .dashboard-layout {
          display: flex;
          min-height: 100vh;
        }

        .sidebar-logo {
          display: flex;
          align-items: center;
          gap: 10px;
          font-size: 20px;
          font-weight: 800;
          color: var(--text);
          margin-bottom: 40px;
        }

        .consultant-profile-card {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          background: rgba(255, 255, 255, 0.03);
          border: 1px solid var(--border);
          border-radius: 12px;
          margin-bottom: 30px;
        }

        .profile-avatar {
          width: 44px;
          height: 44px;
          border-radius: 50%;
          background: var(--primary);
          color: #12141c;
          display: flex;
          align-items: center;
          justify-content: center;
          font-weight: 800;
          font-size: 18px;
        }

        .profile-info {
          display: flex;
          flex-direction: column;
        }

        .profile-name {
          font-size: 15px;
          font-weight: 700;
          color: var(--text);
        }

        .profile-role {
          font-size: 12px;
          color: var(--text-muted);
        }

        .sidebar-nav {
          display: flex;
          flex-direction: column;
          gap: 10px;
          margin-bottom: auto;
        }

        .nav-item {
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 12px 16px;
          border-radius: 10px;
          background: none;
          border: none;
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 15px;
          cursor: pointer;
          text-align: left;
          width: 100%;
          transition: all 0.2s ease;
        }
        .nav-item:hover, .nav-item.active {
          color: var(--primary);
          background: rgba(205, 162, 80, 0.08);
        }

        .sidebar-logout {
          display: flex;
          align-items: center;
          justify-content: center;
          gap: 8px;
          width: 100%;
          padding: 12px;
          border-radius: 10px;
          cursor: pointer;
          font-family: var(--font-sans);
          font-weight: 600;
          font-size: 14px;
        }

        .dashboard-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 32px;
          border-bottom: 1px solid var(--border);
          padding-bottom: 24px;
        }

        .dashboard-header h1 {
          font-size: 32px;
          font-weight: 800;
        }

        .dashboard-header .subtitle {
          color: var(--text-muted);
          margin-top: 4px;
        }

        .portal-badge {
          background: rgba(205, 162, 80, 0.1);
          color: var(--primary);
          padding: 8px 16px;
          border: 1px solid rgba(205, 162, 80, 0.2);
          border-radius: 8px;
          font-weight: 700;
          font-size: 13px;
        }

        .stats-grid {
          display: grid;
          grid-template-columns: repeat(3, 1fr);
          gap: 20px;
          margin-bottom: 32px;
        }

        .stat-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 8px;
          position: relative;
        }

        .stat-icon {
          color: var(--primary);
          margin-bottom: 4px;
        }

        .stat-value {
          font-size: 28px;
          font-weight: 800;
          color: var(--text);
        }

        .stat-title {
          font-size: 13px;
          font-weight: 700;
          color: var(--text-muted);
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }

        .dashboard-main-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 32px;
          align-items: start;
        }

        .dashboard-section {
          padding: 30px;
        }

        .section-header-box {
          display: flex;
          align-items: center;
          gap: 12px;
          margin-bottom: 24px;
          padding-bottom: 16px;
          border-bottom: 1px solid var(--border);
        }

        .section-header-box h2 {
          font-size: 20px;
          font-weight: 800;
        }

        .scheduler-form {
          display: flex;
          flex-direction: column;
        }

        .form-row {
          display: flex;
          gap: 16px;
        }

        .flex-1 {
          flex: 1;
        }

        .days-row {
          display: flex;
          gap: 8px;
          flex-wrap: wrap;
        }

        .day-circle {
          width: 38px;
          height: 38px;
          border-radius: 50%;
          background: rgba(255, 255, 255, 0.05);
          border: 1px solid var(--border);
          color: var(--text-muted);
          font-family: var(--font-sans);
          font-weight: 700;
          cursor: pointer;
          transition: all 0.2s ease;
        }
        .day-circle:hover {
          border-color: var(--primary);
        }
        .day-circle.selected {
          background: var(--primary);
          color: #12141c;
          border-color: var(--primary);
        }

        .schedule-error {
          background: var(--error-bg);
          color: var(--error);
          border: 1px solid rgba(244, 63, 94, 0.2);
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .schedule-success {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid rgba(16, 185, 129, 0.2);
          padding: 12px;
          border-radius: 8px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 16px;
        }

        .sessions-list {
          display: flex;
          flex-direction: column;
          gap: 16px;
          max-height: 520px;
          overflow-y: auto;
          padding-right: 8px;
        }

        .empty-state {
          text-align: center;
          padding: 40px 20px;
          color: var(--text-muted);
        }

        .booking-card {
          padding: 20px;
          background: rgba(255, 255, 255, 0.02);
        }

        .booking-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          margin-bottom: 16px;
        }

        .booking-card-header h3 {
          font-size: 16px;
          font-weight: 700;
        }

        .booking-datetime {
          font-size: 13px;
          color: var(--text-muted);
          margin-top: 2px;
        }

        .booking-notes-display {
          background: rgba(0, 0, 0, 0.2);
          padding: 12px;
          border-radius: 8px;
          border-left: 3px solid var(--primary);
          font-size: 13px;
          margin-bottom: 16px;
        }
        .booking-notes-display strong {
          color: var(--text-muted);
        }
        .booking-notes-display p {
          margin-top: 4px;
          line-height: 1.4;
        }

        .booking-actions {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .btn-sm {
          padding: 8px 16px;
          font-size: 13px;
          border-radius: 8px;
        }

        .notes-editor-box {
          display: flex;
          flex-direction: column;
          gap: 12px;
          margin-top: 8px;
        }

        .notes-editor-actions {
          display: flex;
          justify-content: flex-end;
          gap: 8px;
        }

        .notes-error {
          color: var(--error);
          font-size: 12px;
          font-weight: 600;
        }

        /* Modal styling */
        .modal-overlay {
          position: fixed;
          top: 0;
          left: 0;
          right: 0;
          bottom: 0;
          background: rgba(0, 0, 0, 0.85);
          z-index: 1000;
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 20px;
        }

        .modal-card {
          width: 100%;
          max-width: 440px;
          padding: 32px;
          text-align: center;
        }

        .modal-header {
          margin-bottom: 24px;
          display: flex;
          flex-direction: column;
          align-items: center;
          gap: 12px;
        }

        .modal-header h2 {
          font-size: 22px;
          font-weight: 800;
        }

        .modal-header p {
          color: var(--text-muted);
          font-size: 14px;
          line-height: 1.5;
        }

        .modal-form {
          text-align: left;
        }

        .modal-error {
          background: var(--error-bg);
          color: var(--error);
          padding: 10px;
          border-radius: 8px;
          font-size: 13px;
          font-weight: 600;
          margin-bottom: 16px;
          text-align: center;
        }

        @media (max-width: 1024px) {
          .stats-grid {
            grid-template-columns: 1fr;
          }
          .dashboard-main-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
