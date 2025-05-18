import React, { useState } from "react";
import { Link } from 'react-router-dom';
import "./landing.css";

const shorten = (a) => (a ? `${a.slice(0, 10)}…` : "");

export default function Landing({
  /* state */
  accounts = [],
  sender, setSender,
  vin, setVin,
  ownerAddr, setOwnerAddr,
  newOwnerAddr, setNewOwnerAddr,
  payload, setPayload,
  history = [],

  roleMap = [],

  /* actions */
  onRegister,
  onTransfer,
  onService,
  onAccident,
  onOdom,
  onLoad,

  msg = "",
  recordLabels = [],
}) {
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeTab, setActiveTab] = useState("search"); // Default to search tab

  /* helper → friendly label OR shortened address */
  const prettyBy = (addr) =>
    roleMap.find(r => r.addr === addr)?.label || shorten(addr);

  const getRecordTypeClass = (type) => {
    switch (Number(type)) {
      case 0: return "record-registration";
      case 1: return "record-transfer";
      case 2: return "record-service";
      case 3: return "record-accident";
      case 4: return "record-odometer";
      default: return "";
    }
  };

  const getRecordTypeIcon = (type) => {
    switch (Number(type)) {
      case 0: return "📝"; // Registration
      case 1: return "🔄"; // Transfer
      case 2: return "🔧"; // Service
      case 3: return "🚨"; // Accident
      case 4: return "🛣️"; // Odometer
      default: return "📄"; // Default
    }
  };

  /* --------------- render --------------- */
    return (
    <div className="car-history-app">
      {/* NAVBAR */}
      <nav className="main-nav">
        <div className="nav-logo">
          <span role="img" aria-label="car icon" className="logo-icon">🚗</span>
          <span className="logo-text">ChainTrack</span>
        </div>
        
        <div className="nav-links"> {/* New container for links */}
          <Link to="/roles" className="btn nav-link-btn">
            <span role="img" aria-label="info icon">ℹ️</span> Learn About Roles
          </Link>
        </div>

        <div className="nav-controls">
          <div className="sender-ctl">
            <label htmlFor="senderSelect">Current Identity</label>
            <select id="senderSelect" value={sender} onChange={e => setSender(e.target.value)}>
              <option value="">Select Role</option>
              {roleMap.map(r => (
                <option key={r.addr} value={r.addr}>{r.label}</option>
              ))}
            </select>
          </div>
        </div>
      </nav>

      {/* HERO / SEARCH */}
      <header className="hero-section">
        <div className="hero-content">
          <h1>Transparent Vehicle History on the Blockchain</h1>
          <p className="hero-subtitle">
            Instantly verify ownership, accidents, service records, and more with tamper-proof blockchain technology.
          </p>
          
          <div className={`search-bar-container ${isSearchFocused ? 'focused' : ''}`}>
            <span role="img" aria-label="search icon" className="search-icon-prefix">🔍</span>
            <input
              className="search-input"
              placeholder="Enter License Plate or VIN"
              value={vin}
              onChange={e => setVin(e.target.value)}
              onFocus={() => setIsSearchFocused(true)}
              onBlur={() => setIsSearchFocused(false)}
              aria-label="Search by VIN or License Plate"
            />
            <button className="btn search-button" onClick={onLoad}>
              View History
            </button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT AREA */}
      <main className="main-content">
        {/* TABS */}
        <div className="tabs-container">
          <button
            className={`tab ${activeTab === 'search' ? 'active' : ''}`}
            onClick={() => setActiveTab('search')}
          >
            <span role="img" aria-label="search icon" className="tab-icon">🔍</span> Search / View
          </button>
          <button
            className={`tab ${activeTab === 'record' ? 'active' : ''}`}
            onClick={() => setActiveTab('record')}
          >
            <span role="img" aria-label="form icon" className="tab-icon">📝</span> Record Data
          </button>
        </div>

        {/* SEARCH RESULTS / HISTORY DISPLAY (conditionally shown with 'search' tab or if vin is present) */}
        {activeTab === 'search' && vin && (
          <section className="vehicle-history-container data-card"> {/* Added data-card */}
            <div className="history-header">
              <h2>Vehicle History</h2>
              <div className="vin-display">
                <span className="vin-label">VIN/License:</span>
                <span className="vin-value">{vin}</span>
              </div>
            </div>

            {history.length === 0 ? (
              <div className="no-history">
                <div role="img" aria-label="magnifying glass" className="no-history-icon">🧐</div>
                <p>No history records found for this vehicle, or VIN not yet searched.</p>
                <button className="btn refresh-button" onClick={onLoad}>Refresh Data</button>
              </div>
            ) : (
              <div className="history-table-wrapper">
                <table className="history-table">
                  <thead>
                    <tr>
                      <th className="record-number">#</th>
                      <th className="record-type">Event Type</th>
                      <th className="record-date">Date & Time</th>
                      <th className="record-by">Recorded By</th>
                      <th className="record-data">Details (IPFS Hash/Payload)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map(r => (
                      <tr key={r.idx} className={getRecordTypeClass(r.type)}>
                        <td className="record-number" data-label="#">{r.idx}</td>
                        <td className="record-type" data-label="Event Type">
                          <span className="record-icon" role="img" aria-label="record type icon">{getRecordTypeIcon(r.type)}</span>
                          <span className="record-label">{recordLabels[r.type]}</span>
                        </td>
                        <td className="record-date" data-label="Date & Time">{new Date(r.ts * 1000).toLocaleString()}</td>
                        <td className="record-by" data-label="Recorded By" title={r.by}>{prettyBy(r.by)}</td>
                        <td className="record-data" data-label="Details">{r.data}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}
        {activeTab === 'search' && !vin && (
             <div className="no-history prompt-search data-card"> {/* Added data-card */}
                <div role="img" aria-label="magnifying glass" className="no-history-icon">👆</div>
                <p>Please enter a VIN or License Plate above and click "View History" to see records.</p>
            </div>
        )}


        {/* RECORD DATA FORM (conditionally shown with 'record' tab) */}
        {activeTab === 'record' && (
          <section className="record-form-container data-card">
            <h2>Add New Vehicle Record</h2>
            <p>Ensure you have selected the correct "Current Identity" above before submitting records.</p>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="payloadInput">Payload / IPFS Hash</label>
                <input
                  id="payloadInput"
                  placeholder="Enter data or IPFS hash (e.g., Qm...)"
                  value={payload}
                  onChange={e => setPayload(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="ownerAddrInput">Owner Address (for Registration)</label>
                <input
                  id="ownerAddrInput"
                  placeholder="ETH Address of the vehicle owner"
                  value={ownerAddr}
                  onChange={e => setOwnerAddr(e.target.value)}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="newOwnerAddrInput">New Owner Address (for Transfer)</label>
                <input
                  id="newOwnerAddrInput"
                  placeholder="ETH Address of the new owner"
                  value={newOwnerAddr}
                  onChange={e => setNewOwnerAddr(e.target.value)}
                />
              </div>
            </div>

            <div className="action-grid">
              <button className="btn action-button register" onClick={onRegister}>
                <span role="img" aria-label="form icon" className="action-icon">📝</span> Register Vehicle
              </button>
              <button className="btn action-button transfer" onClick={onTransfer}>
                <span role="img" aria-label="transfer icon" className="action-icon">🔄</span> Transfer Ownership
              </button>
              <button className="btn action-button service" onClick={onService}>
                <span role="img" aria-label="wrench icon" className="action-icon">🔧</span> Add Service Record
              </button>
              <button className="btn action-button accident" onClick={onAccident}>
                <span role="img" aria-label="alert icon" className="action-icon">🚨</span> Report Accident
              </button>
              <button className="btn action-button odometer" onClick={onOdom}>
                <span role="img" aria-label="road icon" className="action-icon">🛣️</span> Update Odometer
              </button>
            </div>
          </section>
        )}
        {/* Feedback message display - applies to both tabs */}
        {msg && (
            <div className="feedback-container">
                <p className={`feedback ${msg.startsWith("✔") ? "good" : "bad"}`}>{msg}</p>
            </div>
        )}

      </main>

      <footer className="app-footer">
        <p>Vehicle history secured by blockchain technology. All records are immutable and verifiable.</p>        
        <p>&copy; {new Date().getFullYear()} ChainTrack. All rights reserved.</p>
      </footer>
    </div>
  );
}