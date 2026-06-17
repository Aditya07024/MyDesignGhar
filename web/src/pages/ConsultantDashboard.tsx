import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Sparkles, Users, Wallet, Star, Calendar, Clock, Video, BookOpen, LogOut, ShieldAlert } from "lucide-react";
import { AuthService, ConsultantService } from "../services/api";

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

  const [dbUser, setDbUser] = useState<any>(null);
  const [bookings, setBookings] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Profile Modal State (if profile is incomplete)
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [completeName, setCompleteName] = useState("");
  const [completePhone, setCompletePhone] = useState("");
  const [modalErr, setModalErr] = useState("");
  const [modalLoading, setModalLoading] = useState(false);

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

      // Fetch sessions/bookings
      const bookingsRes = await ConsultantService.listBookings();
      setBookings(bookingsRes.bookings || []);
    } catch (err: any) {
      console.error("Failed to load consultant dashboard:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

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

  // Add availability slots
  const handleAddSlots = async (e: React.FormEvent) => {
    e.preventDefault();
    setScheduleErr("");
    setScheduleSuccess("");

    if (!startDate.trim() || !endDate.trim() || !slotTime.trim()) {
      setScheduleErr("Please fill out the start date, end date, and time slot.");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(startDate.trim()) || !dateRegex.test(endDate.trim())) {
      setScheduleErr("Dates must be in YYYY-MM-DD format.");
      return;
    }

    if (selectedDays.length === 0) {
      setScheduleErr("Please select at least one weekday.");
      return;
    }

    const start = new Date(startDate.trim());
    const end = new Date(endDate.trim());
    if (isNaN(start.getTime()) || isNaN(end.getTime()) || start > end) {
      setScheduleErr("Invalid date range selected.");
      return;
    }

    setScheduleLoading(true);
    try {
      const slots: { date: string; timeSlot: string }[] = [];
      const current = new Date(start);
      while (current <= end) {
        const day = current.getDay();
        if (selectedDays.includes(day)) {
          slots.push({
            date: formatDate(current),
            timeSlot: slotTime.trim(),
          });
        }
        current.setDate(current.getDate() + 1);
      }

      if (slots.length === 0) {
        setScheduleErr("No matching weekdays found in the selected range.");
        setScheduleLoading(false);
        return;
      }

      await ConsultantService.addAvailabilitySlots(slots);
      setScheduleSuccess(`Successfully added ${slots.length} availability slots!`);
      
      // Reset time slot input
      setSlotTime("");
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
      {/* Sidebar Navigation */}
      <aside className="sidebar glass-panel">
        <div className="sidebar-logo">
          <Sparkles color="var(--primary)" size={24} />
          <span className="logo-text">MyDesignGhar</span>
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
          <button className="nav-item active">
            <Calendar size={18} />
            <span className="nav-label">Dashboard</span>
          </button>
        </nav>

        <button onClick={handleSignOut} className="sidebar-logout btn-secondary">
          <LogOut size={16} />
          <span className="nav-label">Sign Out</span>
        </button>
      </aside>

      {/* Main Panel Content */}
      <main className="main-content">
        <header className="dashboard-header">
          <div>
            <h1>Namaste, {dbUser?.fullName || "Consultant"}! 👋</h1>
            <p className="subtitle">Here is your schedule and client booking panel.</p>
          </div>
          <div className="portal-badge">Consultant Portal</div>
        </header>

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
            <div className="stat-value">5.0</div>
            <div className="stat-title">Rating</div>
          </div>
        </section>

        {/* Dashboard Grid */}
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
                            // Extract call URL path
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
      </main>

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
