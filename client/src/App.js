// src/App.js
import React, { useState, useEffect } from "react";
import Web3            from "web3";
import vhAbi           from "./VehicleHistory.json";
import Landing         from "./Landing";

/* nice human labels for the enum values in VehicleHistory.sol */
const RECORD_LABELS = ["Registration", "Transfer", "Service", "Accident", "Odometer"];

export default function App() {
  /* ──────────────── state ──────────────── */
  const [web3,         setWeb3]         = useState();
  const [accounts,     setAccounts]     = useState([]);
  const [sender,       setSender]       = useState("");

  const [contract,     setContract]     = useState();

  const [vin,          setVin]          = useState("");
  const [ownerAddr,    setOwnerAddr]    = useState("");
  const [newOwnerAddr, setNewOwnerAddr] = useState("");
  const [payload,      setPayload]      = useState("");

  const [history,      setHistory]      = useState([]);
  const [msg,          setMsg]          = useState("");

  /* ───────── bootstrap : connect to Ganache & contract ───────── */
  useEffect(() => {
    (async () => {
      try {
        const _web3      = new Web3("http://127.0.0.1:7545");          // Ganache default
        const _accounts  = await _web3.eth.getAccounts();
        const networkId  = await _web3.eth.net.getId();
        const deployInfo = vhAbi.networks[networkId];
        if (!deployInfo) {
          alert("Contract not deployed on this network.");
          return;
        }
        const _contract  = new _web3.eth.Contract(vhAbi.abi, deployInfo.address);

        setWeb3(_web3);
        setAccounts(_accounts);
        setContract(_contract);
        setSender(_accounts[0]);   // pick account-0 by default
      } catch (e) {
        console.error(e);
        alert("Failed to connect to Ganache.");
      }
    })();
  }, []);

  /* ───────── reusable validators ───────── */
  const requireVIN  = () => { if (!vin)  throw new Error("VIN cannot be empty"); };
  const requireAddr = a  => { if (!web3.utils.isAddress(a)) throw new Error("Invalid / empty address"); };

  /* ───────── helpers to show revert strings nicely ───────── */
  const showError = (e) => {
    const m = e.message.match(/reverted(?:.*?:)?\s*(.*?)"}/i);
    setMsg(m ? m[1] : e.message);
  };

  /* ───────── contract-write operations ───────── */
  const opts = { from: sender, gas: 300_000 };

  async function register() {
    try {
      requireVIN(); requireAddr(ownerAddr);
      await contract.methods.registerVehicle(vin, ownerAddr, payload).send(opts);
      setMsg("✔ Vehicle registered");
      loadHistory();
    } catch (e) { showError(e); }
  }

  async function transfer() {
    try {
      requireVIN(); requireAddr(newOwnerAddr);
      await contract.methods.transferOwnership(vin, newOwnerAddr, payload).send(opts);
      setMsg("✔ Ownership transferred");
      loadHistory();
    } catch (e) { showError(e); }
  }

  async function addService()  {
    try {
      requireVIN();
      await contract.methods.addServiceRecord  (vin, payload).send(opts);
      setMsg("✔ Service record added");
      loadHistory();
    } catch (e) { showError(e); }
  }

  async function addAccident() {
    try {
      requireVIN();
      await contract.methods.addAccidentRecord (vin, payload).send(opts);
      setMsg("✔ Accident record added");
      loadHistory();
    } catch (e) { showError(e); }
  }

  async function addOdometer() {
    try {
      requireVIN();
      await contract.methods.addOdometerRecord (vin, payload).send(opts);
      setMsg("✔ Odometer snapshot added");
      loadHistory();
    } catch (e) { showError(e); }
  }

  /* ───────── read history ───────── */
  async function loadHistory() {
    try {
      requireVIN();
      const len   = Number(await contract.methods.historyLength(vin).call());
      const rows  = [];
      for (let i = 0; i < len; i++) {
        const rec = await contract.methods.getRecord(vin, i).call();
        rows.push({
          idx : i,
          type: Number(rec[0]),
          ts  : Number(rec[1]),
          by  : rec[2],
          data: rec[3]
        });
      }
      setHistory(rows);
      if (!len) setMsg("No records for that VIN yet");
    } catch (e) { showError(e); }
  }

  /* ───────── render ───────── */
  if (!contract) return <p style={{padding:40}}>Connecting to blockchain…</p>;

  return (
    <Landing
      /* state & setters */
      accounts={accounts}
      sender={sender}               setSender={setSender}
      vin={vin}                     setVin={setVin}
      ownerAddr={ownerAddr}         setOwnerAddr={setOwnerAddr}
      newOwnerAddr={newOwnerAddr}   setNewOwnerAddr={setNewOwnerAddr}
      payload={payload}             setPayload={setPayload}
      history={history}

      /* actions */
      onRegister={register}
      onTransfer={transfer}
      onService ={addService}
      onAccident={addAccident}
      onOdom    ={addOdometer}
      onLoad    ={loadHistory}

      /* misc */
      msg={msg}
      recordLabels={RECORD_LABELS}
    />
  );
}
