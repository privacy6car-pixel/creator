let config = null;
let editing = null;

window.addEventListener("message", (event) => {
  if(event.data.action === "openCreator") {
    document.getElementById("creatorUI").style.display = "block";
  }
  if(event.data.action === "setConfig") {
    config = event.data.config;
    renderMarkets();
  }
});

document.getElementById("closeBtn").onclick = function() {
  document.getElementById("creatorUI").style.display = "none";
  fetch(`https://${GetParentResourceName()}/closeCreator`, {method:"POST"});
}

function renderMarkets() {
  const div = document.getElementById("markets");
  div.innerHTML = "";
  Object.entries(config.markets).forEach(([id, market]) => {
    let html = `<div class="market">
      <b>${id}</b> - ${market.label} [Job2: ${market.requiredJob}]
      <button onclick="editMarket('${id}')">Éditer</button>
      <button onclick="removeMarket('${id}')">Supprimer</button>
      <br>Items: ${market.items.map(it => it.label).join(", ")}
      <br>Whitelist: ${market.whitelist && market.whitelist.length ? market.whitelist.join(", ") : 'Aucune'}
    </div>`;
    div.innerHTML += html;
  });
}

window.editMarket = function(id) {
  editing = id;
  let m = config.markets[id];
  let html = `<h3>Édition PNJ : <i>${id}</i></h3>
    <label>Label: <input id="em_label" value="${m.label}"></label>
    <label>Job2: <input id="em_job" value="${m.requiredJob}"></label>
    <label>PED: <input id="em_ped" value="${m.ped}"></label>
    <label>Coords: <input id="em_coords" value="${m.coords.x},${m.coords.y},${m.coords.z}"></label>
    <label>Heading: <input id="em_heading" value="${m.heading}"></label>
    <br><b>Items:</b>
    <div id="editItems">`;
  m.items.forEach((it, idx) => {
    html += `<div>
      <input value="${it.name}" id="item_name_${idx}" placeholder="name">
      <input value="${it.label}" id="item_label_${idx}" placeholder="label">
      <input value="${it.price}" id="item_price_${idx}" type="number" placeholder="prix">
      <input value="${it.stock}" id="item_stock_${idx}" type="number" placeholder="stock">
      <input value="${it.minGrade}" id="item_grade_${idx}" type="number" min="0" max="3" placeholder="grade">
      <input value="${it.payment}" id="item_payment_${idx}" placeholder="ressource">
      <button onclick="removeItem(${idx})">Suppr</button>
    </div>`;
  });
  html += `</div>
    <button onclick="addItem()">Ajouter un item</button>
    <br><b>Whitelist PNJ:</b>
    <input id="em_whitelist" value="${m.whitelist ? m.whitelist.join(',') : ''}" placeholder="steam:...,license:...">
    <br>
    <button onclick="saveMarket()">Sauvegarder</button>
    <button onclick="closeEdit()">Annuler</button>
    `;
  document.getElementById("editMarket").style.display = "block";
  document.getElementById("editMarket").innerHTML = html;
}

window.addItem = function() {
  let m = config.markets[editing];
  m.items.push({name:"",label:"",price:0,stock:0,minGrade:0,payment:"cash"});
  editMarket(editing);
}

window.removeItem = function(idx) {
  let m = config.markets[editing];
  m.items.splice(idx,1);
  editMarket(editing);
}

window.saveMarket = function() {
  let m = config.markets[editing];
  m.label = document.getElementById("em_label").value;
  m.requiredJob = document.getElementById("em_job").value;
  m.ped = document.getElementById("em_ped").value;
  let coords = document.getElementById("em_coords").value.split(",");
  m.coords = {x:Number(coords[0]),y:Number(coords[1]),z:Number(coords[2])};
  m.heading = Number(document.getElementById("em_heading").value);
  m.whitelist = document.getElementById("em_whitelist").value ? document.getElementById("em_whitelist").value.split(",") : [];
  m.items = m.items.map((it, idx) => ({
    name: document.getElementById("item_name_"+idx).value,
    label: document.getElementById("item_label_"+idx).value,
    price: Number(document.getElementById("item_price_"+idx).value),
    stock: Number(document.getElementById("item_stock_"+idx).value),
    minGrade: Number(document.getElementById("item_grade_"+idx).value),
    payment: document.getElementById("item_payment_"+idx).value
  }));
  fetch(`https://${GetParentResourceName()}/updateMarket`, {
    method: "POST",
    body: JSON.stringify({id: editing, market: m})
  });
  document.getElementById("editMarket").style.display = "none";
  renderMarkets();
}

window.closeEdit = function() {
  document.getElementById("editMarket").style.display = "none";
}

window.removeMarket = function(id) {
  fetch(`https://${GetParentResourceName()}/removeMarket`, {method:"POST", body: JSON.stringify({marketId: id})});
  delete config.markets[id];
  renderMarkets();
}

document.getElementById("addMarketBtn").onclick = function() {
  let newid = prompt("ID du nouveau PNJ ?");
  if(!newid) return;
  config.markets[newid] = {
    label: "Nouveau PNJ",
    requiredJob: "",
    ped: "",
    coords: {x:0,y:0,z:0},
    heading: 0,
    whitelist: [],
    items: []
  };
  fetch(`https://${GetParentResourceName()}/addMarket`, {
    method: "POST",
    body: JSON.stringify({marketId: newid, market: config.markets[newid]})
  });
  renderMarkets();
}