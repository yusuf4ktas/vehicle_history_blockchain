import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import Router components
import RolesExplainedPage from "./RolesExplainedPage";
import Web3           from "web3";
import vhAbi          from "./VehicleHistory.json";
import Landing        from "./Landing";
import { ROLE_MAP }   from "./roles";
import { signAndSend } from "./txHelper";

/* enum → friendly labels (must match VehicleHistory.sol) */
const RECORD_LABELS = [
  "Registration",
  "Transfer",
  "Service",
  "Accident",
  "Odometer",
];

/* ───────────────────────── component ──────────────────────────────── */
export default function App() {
  /* basic state */
  const [web3,     setWeb3]     = useState();
  const [contract, setContract] = useState(null);
  const [accounts, setAccounts] = useState([]);

  /* roles (mutable copy of ROLE_MAP) & selected label */
  const [roleMap,  setRoleMap]  = useState([]);
  const [senderLbl, setSenderLbl] = useState("");

  /* form fields */
  const [vin,      setVin]      = useState("");
  const [owner,    setOwner]    = useState("");
  const [newOwner, setNewOwner] = useState("");
  const [payload,  setPayload]  = useState("");

  /* data shown */
  const [history,  setHistory]  = useState([]);
  const [msg,      setMsg]      = useState("");

  /* ───────── connect Ganache & contract (once) ───────── */
  useEffect(() => {
    (async () => {
      try {
        const _web3     = new Web3("http://127.0.0.1:7545");
        const _accounts = await _web3.eth.getAccounts();
        const netId     = await _web3.eth.net.getId();
        const info      = vhAbi.networks[netId];
        if (!info) { alert("Contract not deployed"); return; }

        setWeb3(_web3);
        setAccounts(_accounts);
        setContract(new _web3.eth.Contract(vhAbi.abi, info.address));

        const rm = structuredClone(ROLE_MAP);
        setRoleMap(rm);
        setSenderLbl(rm[0].label);      // DMV by default
      } catch (e) { console.error(e); alert("Ganache RPC not found"); }
    })();
  }, []);

  /* helpers */
  const labelToAddr = lbl => roleMap.find(r => r.label === lbl)?.addr;
  const needVIN     = () => { if (!vin) throw new Error("VIN cannot be empty"); };
  const needAddr    = a  => { if (!web3.utils.isAddress(a)) throw new Error("Bad address"); };
  const showError   = e  => {
    const m = e.message.match(/reverted(?:.*?:)?\s*(.*?)"}/i);
    setMsg(m ? m[1] : e.message);
  };

  /* ───────── write operations ───────── */
  const register = async () => {
    try {
      needVIN(); needAddr(owner);
      await signAndSend(web3,contract.methods.registerVehicle(vin, owner, payload),contract.options.address);

      setMsg("✔ Vehicle registered"); loadHistory();
    } catch (e) { showError(e); }
  };

  const transfer = async () => {
    try {
      needVIN(); needAddr(newOwner);
      await signAndSend(web3, contract.methods.transferOwnership(vin, newOwner, payload),contract.options.address);

      /* update role labels */
      setRoleMap(prev => prev.map(r =>
        r.addr === owner   ? { ...r, label:"Ex-Owner" } :
        r.addr === newOwner? { ...r, label:"Current Owner" } : r
      ));
      setMsg("✔ Ownership transferred"); loadHistory();
    } catch (e) { showError(e); }
  };

  const addService  = async () => {
    try {
      needVIN();
      await signAndSend(web3, contract.methods.addServiceRecord(vin, payload),contract.options.address);
      setMsg("✔ Service record added"); loadHistory();
    } catch (e) { showError(e); }
  };

  const addAccident = async () => {
    try {
      needVIN();
      await signAndSend(web3, contract.methods.addAccidentRecord(vin, payload),contract.options.address);
      setMsg("✔ Accident record added"); loadHistory();
    } catch (e) { showError(e); }
  };

  const addOdometer = async () => {
    try {
      needVIN();
      await signAndSend(web3, contract.methods.addOdometerRecord(vin, payload),contract.options.address);
      setMsg("✔ Odometer snapshot added"); loadHistory();
    } catch (e) { showError(e); }
  };

  /* ───────── read operation ───────── */
  const loadHistory = async () => {
    try {
      needVIN();
      const len  = Number(await contract.methods.historyLength(vin).call());
      const rows = [];
      for (let i = 0; i < len; i++) {
        const rec = await contract.methods.getRecord(vin, i).call();
        rows.push({
          idx : i,
          type: Number(rec[0]),
          ts  : Number(rec[1].toString()),   // avoid BigInt + number mix
          by  : rec[2],
          data: rec[3],
        });
      }
      setHistory(rows);
      if (!len) setMsg("No records for that VIN yet");
    } catch (e) { showError(e); }
  };

  /* ───────── UI ───────── */
  if (!contract) return <p style={{padding:40}}>Connecting…</p>;

  return (
<Router>
      <Routes>
        <Route 
          path="/" 
          element={
            <Landing
              accounts={accounts}
              roleMap={roleMap}
              recordLabels={RECORD_LABELS}
              sender={senderLbl}            
              setSender={setSenderLbl}
              vin={vin}                     
              setVin={setVin}
              ownerAddr={owner}             
              setOwnerAddr={setOwner}
              newOwnerAddr={newOwner}       
              setNewOwnerAddr={setNewOwner}
              payload={payload}             
              setPayload={setPayload}
              history={history}
              onRegister={register}
              onTransfer={transfer}
              onService={addService}
              onAccident={addAccident}
              onOdom={addOdometer}
              onLoad={loadHistory}
              msg={msg}
            />
          } 
        />
        <Route path="/roles" element={<RolesExplainedPage />} />
      </Routes>
    </Router>
  );
}
