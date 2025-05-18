// src/txHelper.js  (add this small file)
export async function signAndSend(web3, tx, contractAddrFallback) {

  const pk = await new Promise(res => {
    const modal     = document.createElement("div");
    modal.className = "pk-modal";
    modal.innerHTML = `
      <div class="pk-card">
        <h3>Paste Private Key</h3>
        <textarea rows="4"></textarea>
        <div class="pk-actions">
          <button id="pk-cancel">Cancel</button>
          <button id="pk-ok">Sign & Send</button>
        </div>
      </div>`;
    document.body.appendChild(modal);

    modal.querySelector("#pk-cancel").onclick = () => { modal.remove(); res(""); };
    modal.querySelector("#pk-ok").onclick     = () => {
      const v = modal.querySelector("textarea").value.trim();
      modal.remove(); res(v);
    };
  });

  if (!pk) throw new Error("Cancelled by user");

  /* ---- derive account ------------------------------------------------ */
  const acct = web3.eth.accounts.privateKeyToAccount(pk);

  /* ---- find the contract address no-matter the web3 version ---------- */
  const parent = tx._parent ?? tx._contract ?? {};
  const toAddr = contractAddrFallback || parent._address ||
                 parent.options?.address;

  if (!toAddr)
    throw new Error("Cannot determine contract address - update txHelper");

  /* ---- sign ---------------------------------------------------------- */
  const raw = {
    from     : acct.address,
    to       : toAddr,
    data     : tx.encodeABI(),
    gas      : 300_000,
    gasPrice : web3.utils.toWei("2", "gwei")
  };

  const signed = await acct.signTransaction(raw);
  return web3.eth.sendSignedTransaction(signed.rawTransaction);
}
