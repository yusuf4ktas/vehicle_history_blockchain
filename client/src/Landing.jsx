// src/Landing.jsx
import React from "react";
import "./landing.css";

/* helper to shorten addresses in dropdown & table */
const shorten = a => (a ? a.slice(0, 10) + "…" : "");

export default function Landing({
  /* props from App.js */
  accounts,
  sender,       setSender,
  vin,          setVin,
  ownerAddr,    setOwnerAddr,
  newOwnerAddr, setNewOwnerAddr,
  payload,      setPayload,
  history,
  onRegister,
  onTransfer,
  onService,
  onAccident,
  onOdom,
  onLoad,
  msg,
  recordLabels
}) {
  return (
    <>
      {/* ───── HERO BAR ───── */}
      <header className="hero">
        <div className="hero__inner">
          <h1>
            Instantly&nbsp;<br/>Learn&nbsp;Vehicle&nbsp;History
          </h1>

          <div className="hero__search">
            <input
              placeholder="License Plate / VIN"
              value={vin}
              onChange={e => setVin(e.target.value)}
            />
            <button onClick={onLoad}>View&nbsp;History</button>
          </div>
        </div>

        {/* sender dropdown */}
        <div className="hero__sender">
          <label>Sender&nbsp;(Ganache)</label>
          <select value={sender} onChange={e => setSender(e.target.value)}>
            {accounts.map(a =>
              <option key={a} value={a}>{shorten(a)}</option>
            )}
          </select>
        </div>
      </header>

      {/* ───── ACTION PANEL (shows only if a VIN is selected) ───── */}
      {vin && (
        <section className="panel">
          {/* payload */}
          <div className="panel__row">
            <input
              placeholder="Payload / IPFS hash"
              value={payload}
              onChange={e => setPayload(e.target.value)}
            />
          </div>

          {/* register */}
          <div className="panel__row">
            <input
              placeholder="Owner address for registration"
              value={ownerAddr}
              onChange={e => setOwnerAddr(e.target.value)}
            />
            <button onClick={onRegister}>Register&nbsp;(DMV)</button>
          </div>

          {/* transfer */}
          <div className="panel__row">
            <input
              placeholder="New owner address (transfer)"
              value={newOwnerAddr}
              onChange={e => setNewOwnerAddr(e.target.value)}
            />
            <button onClick={onTransfer}>Transfer&nbsp;Ownership</button>
          </div>

          {/* service / accident / odometer */}
          <div className="panel__row">
            <button onClick={onService} >Add&nbsp;Service</button>
            <button onClick={onAccident}>Add&nbsp;Accident</button>
            <button onClick={onOdom}>Add&nbsp;Odometer</button>
            <button onClick={onLoad}>Load&nbsp;History</button>
          </div>

          {/* feedback */}
          {msg && (
            <p className={msg.startsWith("✔") ? "msg ok" : "msg err"}>{msg}</p>
          )}

          {/* history table */}
          <h2>History&nbsp;for&nbsp;{vin}</h2>
          <table className="history">
            <thead>
              <tr>
                <th>#</th><th>Type</th><th>Timestamp</th><th>By</th><th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {history.map(r => (
                <tr key={r.idx}>
                  <td>{r.idx}</td>
                  <td>
                    <select value={r.type} disabled>
                      {recordLabels.map((lab, i) =>
                        <option key={i} value={i}>{lab}</option>
                      )}
                    </select>
                  </td>
                  <td>{new Date(r.ts * 1000).toLocaleString()}</td>
                  <td>{shorten(r.by)}</td>
                  <td>{r.data}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      )}
    </>
  );
}
