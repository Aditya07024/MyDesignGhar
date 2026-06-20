import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useClerk } from "@clerk/clerk-react";
import { Users, Award, ShoppingBag, ScrollText, LogOut, Ban, CheckCircle, XCircle, Search, PlusCircle } from "lucide-react";
import { AdminService } from "../services/api";
import logo from "../assets/logo.png";

type Tab = "USERS" | "CONSULTANTS" | "AFFILIATES" | "AUDIT_LOGS";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const { signOut } = useClerk();

  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("USERS");
  const [users, setUsers] = useState<any[]>([]);
  const [auditLogs, setAuditLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Search filter
  const [searchTerm, setSearchTerm] = useState("");

  // Affiliate form state
  const [productTitle, setProductTitle] = useState("");
  const [productDesc, setProductDesc] = useState("");
  const [productPrice, setProductPrice] = useState("");
  const [productLink, setProductLink] = useState("");
  const [productImage, setProductImage] = useState("");
  const [productCategory, setProductCategory] = useState("Living Room");
  const [productSuccess, setProductSuccess] = useState("");
  const [productErr, setProductErr] = useState("");
  const [productLoading, setProductLoading] = useState(false);

  const loadData = async () => {
    try {
      setLoading(true);
      // Fetch users (which includes profiles and consultantProfiles)
      const usersRes = await AdminService.listUsers();
      setUsers(usersRes.users || []);

      // Fetch audit logs
      const logsRes = await AdminService.getAuditLogs();
      setAuditLogs(logsRes.auditLogs || []);
    } catch (err: any) {
      console.error("Failed to load admin panel data:", err);
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

  // Ban user action
  const handleBanUser = async (id: string) => {
    if (!window.confirm("Are you sure you want to ban this user? This will set their account to inactive.")) return;
    try {
      await AdminService.banUser(id);
      setUsers(
        users.map((u) => (u.id === id ? { ...u, isActive: false } : u))
      );
      alert("User banned successfully!");
      // Reload audit logs
      const logsRes = await AdminService.getAuditLogs();
      setAuditLogs(logsRes.auditLogs || []);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to ban user.");
    }
  };

  // Approve / Reject / Suspend consultant
  const handleUpdateStatus = async (consultantId: string, status: "APPROVED" | "REJECTED" | "SUSPENDED") => {
    const confirmation = `Are you sure you want to set this consultant's status to ${status}?`;
    if (!window.confirm(confirmation)) return;

    try {
      await AdminService.updateConsultantStatus(consultantId, status);
      
      // Update local state by finding the user who owns this consultant profile
      setUsers(
        users.map((u) => {
          if (u.consultantProfile && u.consultantProfile.id === consultantId) {
            return {
              ...u,
              role: status === "APPROVED" ? "CONSULTANT" : "USER",
              consultantProfile: {
                ...u.consultantProfile,
                status,
                isApproved: status === "APPROVED",
              },
            };
          }
          return u;
        })
      );

      alert(`Consultant status updated to ${status}!`);
      
      // Reload audit logs
      const logsRes = await AdminService.getAuditLogs();
      setAuditLogs(logsRes.auditLogs || []);
    } catch (err: any) {
      alert(err.response?.data?.message || "Failed to update consultant status.");
    }
  };

  // Post new affiliate product
  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    setProductErr("");
    setProductSuccess("");

    if (!productTitle || !productLink) {
      setProductErr("Title and Link are required fields.");
      return;
    }

    setProductLoading(true);
    try {
      await AdminService.createAffiliateProduct({
        title: productTitle.trim(),
        description: productDesc.trim() || undefined as any,
        price: productPrice ? parseFloat(productPrice) : 0,
        link: productLink.trim(),
        imageUrl: productImage.trim() || undefined as any,
        category: productCategory,
      });

      setProductSuccess("Affiliate product posted successfully!");
      setProductTitle("");
      setProductDesc("");
      setProductPrice("");
      setProductLink("");
      setProductImage("");
      
      // Reload audit logs
      const logsRes = await AdminService.getAuditLogs();
      setAuditLogs(logsRes.auditLogs || []);
    } catch (err: any) {
      setProductErr(err.response?.data?.message || "Failed to save product.");
    } finally {
      setProductLoading(false);
    }
  };

  // Filtered lists
  const filteredUsers = users.filter((u) => {
    const term = searchTerm.toLowerCase();
    const name = (u.profile?.fullName || "").toLowerCase();
    const email = (u.email || "").toLowerCase();
    const phone = (u.phone || "").toLowerCase();
    return name.includes(term) || email.includes(term) || phone.includes(term);
  });

  const consultantUsers = users.filter((u) => u.consultantProfile !== null);

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

      {/* Admin Sidebar */}
      <aside className={`sidebar glass-panel ${sidebarOpen ? "open" : ""}`}>
        {/* Close button for mobile */}
        <button className="sidebar-close" onClick={() => setSidebarOpen(false)}>×</button>

        <div className="sidebar-logo">
          <img src={logo} alt="MydesignGhar Logo" style={{ height: "32px", objectFit: "contain", marginRight: "4px" }} />
          <span className="logo-text">MydesignGhar</span>
        </div>

        <div className="consultant-profile-card">
          <div className="profile-avatar">A</div>
          <div className="profile-info">
            <h4 className="profile-name">Administrator</h4>
            <span className="profile-role">Console Manager</span>
          </div>
        </div>

        <nav className="sidebar-nav">
          <button
            className={`nav-item ${activeTab === "USERS" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("USERS");
              setSidebarOpen(false);
            }}
          >
            <Users size={18} />
            <span className="nav-label">User Management</span>
          </button>
          <button
            className={`nav-item ${activeTab === "CONSULTANTS" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("CONSULTANTS");
              setSidebarOpen(false);
            }}
          >
            <Award size={18} />
            <span className="nav-label">Consultant Approvals</span>
          </button>
          <button
            className={`nav-item ${activeTab === "AFFILIATES" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("AFFILIATES");
              setSidebarOpen(false);
            }}
          >
            <ShoppingBag size={18} />
            <span className="nav-label">Affiliate Products</span>
          </button>
          <button
            className={`nav-item ${activeTab === "AUDIT_LOGS" ? "active" : ""}`}
            onClick={() => {
              setActiveTab("AUDIT_LOGS");
              setSidebarOpen(false);
            }}
          >
            <ScrollText size={18} />
            <span className="nav-label">Audit Logs</span>
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
            <h1>Admin Console</h1>
            <p className="subtitle">Manage user records, approve consultants, and track actions.</p>
          </div>
          <div className="portal-badge">
            Admin Portal
          </div>
        </header>

        {loading ? (
          <div className="tab-loading">
            <div className="spinner" />
            <p>Loading database records...</p>
          </div>
        ) : (
          <div className="tab-content animate-fade-in">
            {/* 1. USERS TAB */}
            {activeTab === "USERS" && (
              <section className="tab-section glass-card">
                <div className="tab-section-header">
                  <h2>User Accounts Directory ({filteredUsers.length})</h2>
                  <div className="search-box">
                    <Search size={16} className="search-icon" />
                    <input
                      type="text"
                      placeholder="Search by name, phone, email..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                </div>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Name</th>
                        <th>Phone</th>
                        <th>Email</th>
                        <th>Role</th>
                        <th>Status</th>
                        <th>Joined</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredUsers.map((u) => (
                        <tr key={u.id}>
                          <td>
                            <strong>{u.profile?.fullName || "User"}</strong>
                          </td>
                          <td>{u.phone}</td>
                          <td>{u.email || "-"}</td>
                          <td>
                            <span className="user-role-label">{u.role}</span>
                          </td>
                          <td>
                            <span className={`status-pill ${u.isActive ? "active" : "banned"}`}>
                              {u.isActive ? "Active" : "Banned"}
                            </span>
                          </td>
                          <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                          <td>
                            <button
                              className="btn-action btn-danger"
                              onClick={() => handleBanUser(u.id)}
                              disabled={!u.isActive || u.role === "ADMIN" || u.role === "SUPER_ADMIN"}
                              title="Ban User"
                            >
                              <Ban size={14} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </section>
            )}

            {/* 2. CONSULTANTS APPROVALS TAB */}
            {activeTab === "CONSULTANTS" && (
              <section className="tab-section glass-card">
                <h2>Consultant Application Desk</h2>
                <p className="tab-section-description">Review pending, approved, and suspended designer applications.</p>

                <div className="consultant-grid">
                  {consultantUsers.length === 0 ? (
                    <div className="empty-state">
                      <p>No consultant registration profiles found.</p>
                    </div>
                  ) : (
                    consultantUsers.map((u) => {
                      const cp = u.consultantProfile;
                      return (
                        <div key={cp.id} className="admin-consultant-card glass-card">
                          <div className="consultant-card-header">
                            <div>
                              <h3>{u.profile?.fullName || "Designer"}</h3>
                              <p className="specialty-text">{cp.specialty}</p>
                            </div>
                            <span className={`badge badge-${cp.status.toLowerCase()}`}>
                              {cp.status}
                            </span>
                          </div>

                          <div className="consultant-card-body">
                            <div className="info-row">
                              <span><strong>Exp:</strong> {cp.experience} Years</span>
                              <span><strong>Session price:</strong> ₹{cp.price}</span>
                            </div>
                            <p className="bio-text">"{cp.bio}"</p>

                            {cp.portfolios && cp.portfolios.length > 0 && (
                              <div className="portfolio-gallery">
                                <strong>Portfolio Images:</strong>
                                <div className="portfolio-images">
                                  {cp.portfolios.map((p: any) => (
                                    <img key={p.id} src={p.imageUrl} alt="Portfolio Item" className="portfolio-img" />
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>

                          <div className="consultant-card-footer">
                            {cp.status === "PENDING" && (
                              <>
                                <button
                                  className="btn btn-primary btn-sm"
                                  onClick={() => handleUpdateStatus(cp.id, "APPROVED")}
                                >
                                  <CheckCircle size={14} /> Approve
                                </button>
                                <button
                                  className="btn btn-secondary btn-sm"
                                  style={{ borderColor: "var(--error)", color: "var(--error)" }}
                                  onClick={() => handleUpdateStatus(cp.id, "REJECTED")}
                                >
                                  <XCircle size={14} /> Reject
                                </button>
                              </>
                            )}

                            {cp.status === "APPROVED" && (
                              <button
                                className="btn btn-secondary btn-sm"
                                style={{ color: "var(--warning)", borderColor: "var(--warning)" }}
                                onClick={() => handleUpdateStatus(cp.id, "SUSPENDED")}
                              >
                                <Ban size={14} /> Suspend Portal Access
                              </button>
                            )}

                            {(cp.status === "SUSPENDED" || cp.status === "REJECTED") && (
                              <button
                                className="btn btn-primary btn-sm"
                                onClick={() => handleUpdateStatus(cp.id, "APPROVED")}
                              >
                                <CheckCircle size={14} /> Re-Approve
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    })
                  )}
                </div>
              </section>
            )}

            {/* 3. AFFILIATE PRODUCTS TAB */}
            {activeTab === "AFFILIATES" && (
              <section className="tab-section glass-card" style={{ maxWidth: "680px", margin: "0 auto" }}>
                <div className="section-header-box">
                  <PlusCircle size={20} color="var(--primary)" />
                  <h2>Post Affiliate Product</h2>
                </div>

                <form onSubmit={handleCreateProduct} className="admin-product-form">
                  {productErr && <div className="schedule-error">{productErr}</div>}
                  {productSuccess && <div className="schedule-success">{productSuccess}</div>}

                  <div className="form-group">
                    <label className="form-label">Product Title *</label>
                    <input
                      type="text"
                      className="form-input"
                      placeholder="e.g. Oak Wood Dining Table"
                      value={productTitle}
                      onChange={(e) => setProductTitle(e.target.value)}
                      disabled={productLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Description</label>
                    <textarea
                      className="form-input"
                      placeholder="Product details, wood type, size..."
                      rows={3}
                      value={productDesc}
                      onChange={(e) => setProductDesc(e.target.value)}
                      disabled={productLoading}
                    />
                  </div>

                  <div className="form-row">
                    <div className="form-group flex-1">
                      <label className="form-label">Price (₹)</label>
                      <input
                        type="number"
                        className="form-input"
                        placeholder="e.g. 15999"
                        value={productPrice}
                        onChange={(e) => setProductPrice(e.target.value)}
                        disabled={productLoading}
                      />
                    </div>
                    <div className="form-group flex-1">
                      <label className="form-label">Category</label>
                      <select
                        className="form-input"
                        value={productCategory}
                        onChange={(e) => setProductCategory(e.target.value)}
                        disabled={productLoading}
                      >
                        <option value="Living Room">Living Room</option>
                        <option value="Bedroom">Bedroom</option>
                        <option value="Kitchen">Kitchen</option>
                        <option value="Dining Room">Dining Room</option>
                        <option value="Decor">Decor</option>
                      </select>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label">Affiliate Purchase Link *</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="e.g. https://amazon.in/dp/..."
                      value={productLink}
                      onChange={(e) => setProductLink(e.target.value)}
                      disabled={productLoading}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">Product Image URL</label>
                    <input
                      type="url"
                      className="form-input"
                      placeholder="https://example.com/product-image.jpg"
                      value={productImage}
                      onChange={(e) => setProductImage(e.target.value)}
                      disabled={productLoading}
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" disabled={productLoading} style={{ marginTop: "12px" }}>
                    {productLoading ? "Creating Product..." : "Create Product"}
                  </button>
                </form>
              </section>
            )}

            {/* 4. AUDIT LOGS TAB */}
            {activeTab === "AUDIT_LOGS" && (
              <section className="tab-section glass-card">
                <h2>System Audit Trail</h2>
                <p className="tab-section-description">A secure record of administrative actions taken inside the portal.</p>

                <div className="table-responsive">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Admin User</th>
                        <th>Action</th>
                        <th>Details</th>
                        <th>Timestamp</th>
                      </tr>
                    </thead>
                    <tbody>
                      {auditLogs.length === 0 ? (
                        <tr>
                          <td colSpan={4} className="text-center">No action logs found.</td>
                        </tr>
                      ) : (
                        auditLogs.map((log) => (
                          <tr key={log.id}>
                            <td>
                              <strong>{log.user?.profile?.fullName || "System Administrator"}</strong>
                            </td>
                            <td>
                              <span className="log-action-badge">{log.action}</span>
                            </td>
                            <td className="log-details-cell">{log.details}</td>
                            <td>{new Date(log.createdAt).toLocaleString()}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </section>
            )}
          </div>
        )}
      </main>

      <style>{`
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

        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }

        .tab-loading {
          padding: 80px 20px;
          text-align: center;
          color: var(--text-muted);
          display: flex;
          flex-direction: column;
          align-items: center;
          justify-content: center;
          gap: 16px;
        }

        .spinner {
          width: 40px;
          height: 40px;
          border: 4px solid rgba(255, 255, 255, 0.1);
          border-top: 4px solid var(--primary);
          border-radius: 50%;
          animation: spin 1s linear infinite;
        }

        .tab-section {
          padding: 30px;
        }

        .tab-section-header {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin-bottom: 24px;
          flex-wrap: wrap;
          gap: 16px;
        }

        .tab-section-description {
          color: var(--text-muted);
          font-size: 14px;
          margin-bottom: 24px;
        }

        .search-box {
          display: flex;
          align-items: center;
          background: rgba(0, 0, 0, 0.02);
          border: 1px solid var(--border);
          border-radius: 10px;
          padding: 8px 16px;
          gap: 8px;
          width: 320px;
        }

        .search-box input {
          background: none;
          border: none;
          outline: none;
          color: var(--text);
          width: 100%;
          font-family: var(--font-sans);
          font-size: 14px;
        }

        .search-icon {
          color: var(--text-muted);
        }

        .table-responsive {
          width: 100%;
          overflow-x: auto;
        }

        .admin-table {
          width: 100%;
          border-collapse: collapse;
          text-align: left;
        }

        .admin-table th, .admin-table td {
          padding: 16px;
          border-bottom: 1px solid var(--border);
          font-size: 14px;
        }

        .admin-table th {
          color: var(--text-muted);
          font-weight: 700;
          text-transform: uppercase;
          font-size: 12px;
          letter-spacing: 0.5px;
        }

        .user-role-label {
          background: rgba(255, 255, 255, 0.05);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 12px;
          font-weight: 600;
        }

        .status-pill {
          display: inline-flex;
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          text-transform: uppercase;
          letter-spacing: 0.5px;
        }
        .status-pill.active {
          background: var(--success-bg);
          color: var(--success);
        }
        .status-pill.banned {
          background: var(--error-bg);
          color: var(--error);
        }

        .btn-action {
          border: none;
          padding: 8px;
          border-radius: 8px;
          cursor: pointer;
          display: flex;
          align-items: center;
          justify-content: center;
          transition: background 0.2s ease;
        }
        .btn-action:disabled {
          opacity: 0.2;
          cursor: not-allowed;
        }

        .consultant-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 24px;
        }

        .admin-consultant-card {
          padding: 24px;
          display: flex;
          flex-direction: column;
          gap: 16px;
        }

        .consultant-card-header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          border-bottom: 1px solid var(--border);
          padding-bottom: 16px;
        }

        .consultant-card-header h3 {
          font-size: 18px;
          font-weight: 800;
        }

        .specialty-text {
          color: var(--primary);
          font-size: 13px;
          font-weight: 600;
          margin-top: 2px;
        }

        .consultant-card-body {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .info-row {
          display: flex;
          justify-content: space-between;
          font-size: 13px;
          color: var(--text-muted);
        }

        .bio-text {
          font-size: 14px;
          line-height: 1.5;
          font-style: italic;
          color: var(--text);
        }

        .portfolio-gallery {
          display: flex;
          flex-direction: column;
          gap: 8px;
        }
        .portfolio-gallery strong {
          font-size: 12px;
          color: var(--text-muted);
        }

        .portfolio-images {
          display: flex;
          gap: 8px;
          overflow-x: auto;
          padding-bottom: 4px;
        }

        .portfolio-img {
          width: 80px;
          height: 80px;
          object-fit: cover;
          border-radius: 8px;
          border: 1px solid var(--border);
        }

        .consultant-card-footer {
          display: flex;
          gap: 12px;
          margin-top: auto;
          border-top: 1px solid var(--border);
          padding-top: 16px;
        }

        .admin-product-form {
          display: flex;
          flex-direction: column;
          gap: 12px;
        }

        .log-action-badge {
          background: rgba(205, 162, 80, 0.15);
          color: var(--primary);
          padding: 4px 8px;
          border-radius: 6px;
          font-size: 11px;
          font-weight: 700;
          letter-spacing: 0.5px;
        }

        .log-details-cell {
          max-width: 320px;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }

        .text-center {
          text-align: center;
        }

        .schedule-error {
          background: var(--error-bg);
          color: var(--error);
          border: 1px solid rgba(225, 29, 72, 0.1);
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        .schedule-success {
          background: var(--success-bg);
          color: var(--success);
          border: 1px solid rgba(5, 150, 105, 0.1);
          padding: 12px;
          border-radius: 10px;
          font-size: 14px;
          font-weight: 600;
          margin-bottom: 20px;
        }

        @media (max-width: 1200px) {
          .consultant-grid {
            grid-template-columns: 1fr;
          }
        }
      `}</style>
    </div>
  );
}
