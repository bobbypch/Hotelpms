import { useState, useRef, useEffect } from "react";

const GST = 0.16;
const HOTEL = { name:"Grand Meridian Hotel", address:"123 Main Boulevard, Karachi, Pakistan", phone:"+92-21-3456-7890", email:"info@grandmeridian.com" };
const WA_NUMBER = "923046310071";
const fmt = n => "PKR " + Number(n).toLocaleString("en-PK");
const TODAY = "2026-04-20";

const ROOM_RATES = {
  Deluxe:    { Single:5000, Twin:5500, Triple:6000 },
  Executive: { Single:5000, Twin:5500, Triple:6000 },
  Standard:  { Single:4000, Twin:4500, Triple:5000 },
};
const BED_TYPES = ["Single","Twin","Triple"];
function getBaseRate(cat,bed){ return ROOM_RATES[cat]?.[bed]||5000; }
const effectiveRate = r => r.customRate||r.baseRate;

function makeRooms(){
  const rooms=[];
  [{floor:1,from:101,to:108,cat:"Deluxe"},{floor:2,from:201,to:210,cat:"Executive"},{floor:3,from:301,to:310,cat:"Standard"}]
    .forEach(({floor,from,to,cat})=>{
      for(let id=from;id<=to;id++){
        const bedType=id%3===0?"Triple":id%2===0?"Twin":"Single";
        rooms.push({id,category:cat,floor,bedType,baseRate:getBaseRate(cat,bedType),customRate:null,status:"available",guest:null,checkIn:null,checkOut:null,guestId:null,bkId:null});
      }
    });
  [{id:102,status:"occupied",guest:"Ahmed Khan",guestId:"G-001",bkId:"BK-001",checkIn:"2026-04-18",checkOut:"2026-04-22"},
   {id:205,status:"occupied",guest:"Fatima Malik",guestId:"G-002",bkId:"BK-002",checkIn:"2026-04-19",checkOut:"2026-04-21"},
   {id:302,status:"occupied",guest:"Omar Farooq",guestId:"G-004",bkId:"BK-004",checkIn:"2026-04-17",checkOut:"2026-04-23"},
   {id:103,status:"cleaning"},{id:208,status:"maintenance"},
   {id:307,status:"reserved",guest:"Sara Siddiqui",guestId:"G-003",bkId:"BK-003",checkIn:"2026-04-21",checkOut:"2026-04-24"},
  ].forEach(s=>{ const r=rooms.find(x=>x.id===s.id); if(r) Object.assign(r,s); });
  return rooms;
}

const ALL_PERMS=["dashboard","rooms","bookings","guests","kitchen","employees","accounts","reports","settings","users","checkin","checkout","rates"];
const INIT_USERS=[{id:"U-001",username:"bobby",password:"admin123",name:"Bobby (Admin)",role:"admin",isAdmin:true,permissions:ALL_PERMS,active:true,createdBy:"system"}];

const MENU_ITEMS=[
  {id:"M1",name:"Club Sandwich",price:350,cat:"Snacks"},{id:"M2",name:"Grilled Chicken",price:650,cat:"Main"},
  {id:"M3",name:"Caesar Salad",price:400,cat:"Salads"},{id:"M4",name:"Beef Burger",price:600,cat:"Main"},
  {id:"M5",name:"French Fries",price:250,cat:"Snacks"},{id:"M6",name:"Pasta Alfredo",price:550,cat:"Main"},
  {id:"M7",name:"Mineral Water",price:100,cat:"Beverages"},{id:"M8",name:"Fresh Juice",price:200,cat:"Beverages"},
  {id:"M9",name:"Tea / Coffee",price:150,cat:"Beverages"},{id:"M10",name:"Chocolate Cake",price:350,cat:"Desserts"},
  {id:"M11",name:"Chapli Kabab",price:500,cat:"Main"},{id:"M12",name:"Biryani",price:450,cat:"Main"},
];

function makeInitData(){
  const rooms=makeRooms();
  const r102=rooms.find(r=>r.id===102),r205=rooms.find(r=>r.id===205),r302=rooms.find(r=>r.id===302),r307=rooms.find(r=>r.id===307);
  return {
    rooms,
    bookings:[
      {id:"BK-001",guest:"Ahmed Khan",guestId:"G-001",room:102,category:"Deluxe",bedType:r102.bedType,baseRate:r102.baseRate,customRate:null,nights:4,extraCharges:[],paid:true,status:"checked-in",source:"Direct",notes:"Early check-in",checkIn:"2026-04-18",checkOut:"2026-04-22"},
      {id:"BK-002",guest:"Fatima Malik",guestId:"G-002",room:205,category:"Executive",bedType:r205.bedType,baseRate:r205.baseRate,customRate:null,nights:2,extraCharges:[],paid:true,status:"checked-in",source:"OTA",notes:"",checkIn:"2026-04-19",checkOut:"2026-04-21"},
      {id:"BK-003",guest:"Sara Siddiqui",guestId:"G-003",room:307,category:"Standard",bedType:r307.bedType,baseRate:r307.baseRate,customRate:null,nights:3,extraCharges:[],paid:false,status:"confirmed",source:"Direct",notes:"Anniversary",checkIn:"2026-04-21",checkOut:"2026-04-24"},
      {id:"BK-004",guest:"Omar Farooq",guestId:"G-004",room:302,category:"Standard",bedType:r302.bedType,baseRate:r302.baseRate,customRate:null,nights:6,extraCharges:[{desc:"Laundry",amount:800}],paid:true,status:"checked-in",source:"Corporate",notes:"VIP",checkIn:"2026-04-17",checkOut:"2026-04-23"},
    ],
    guests:[
      // ── Original demo guests ──
      {id:"G-001",name:"Ahmed Khan",email:"",phone:"+92-300-1234567",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:4,totalSpent:88000,notes:"",tags:["Regular"],customRate:null},
      {id:"G-002",name:"Fatima Malik",email:"",phone:"+92-321-9876543",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:2,totalSpent:22000,notes:"Vegetarian",tags:["Regular"],customRate:null},
      {id:"G-003",name:"Sara Siddiqui",email:"",phone:"+92-333-4567890",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:0,notes:"",tags:["Regular"],customRate:null},
      {id:"G-004",name:"Omar Farooq",email:"",phone:"+92-312-2345678",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:true,stays:12,totalSpent:350000,notes:"VIP Corporate",tags:["VIP","Corporate"],customRate:5500},
      // ── Imported from hotel records ──
      {id:"G-005",name:"Sumera Maqsood",email:"",phone:"+923176566589",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4000,notes:"Walk-in | Room 302 | 27 Apr 2026",tags:["Walk-in"],customRate:4000},
      {id:"G-006",name:"Sana Rafi",email:"",phone:"+9203289040414",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4500,notes:"Walk-in | Room 305 | Unpaid",tags:["Walk-in"],customRate:4500},
      {id:"G-007",name:"Saeed Ahmad",email:"",phone:"+923213767786",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4500,notes:"Walk-in | Room 204",tags:["Walk-in"],customRate:4500},
      {id:"G-008",name:"Tanvir Ahmed",email:"",phone:"+9203002588244",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6380,notes:"CPSP | Room 103",tags:["Corporate"],customRate:6380},
      {id:"G-009",name:"Sheikh Sohail",email:"",phone:"+9203006316665",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 106",tags:["Walk-in"],customRate:5500},
      {id:"G-010",name:"Aurangzaib Bloch",email:"",phone:"+923450299458",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 209",tags:["Walk-in"],customRate:5000},
      {id:"G-011",name:"Haseeb Ali",email:"",phone:"+9203046750399",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4500,notes:"Walk-in | Room 105",tags:["Walk-in"],customRate:4500},
      {id:"G-012",name:"M Imran",email:"",phone:"+9203012948773",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 206 | Paid",tags:["Walk-in"],customRate:5500},
      {id:"G-013",name:"Amir Khan",email:"",phone:"+923344468889",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5204,notes:"Walk-in | Room 201 | Partial CheckedOut",tags:["Walk-in"],customRate:5204},
      {id:"G-014",name:"Riaz Ahmed",email:"",phone:"+923003132324",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6000,notes:"Walk-in | Room 205",tags:["Walk-in"],customRate:6000},
      {id:"G-015",name:"Qamer Zaman",email:"",phone:"+923161149570",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 108 | Paid",tags:["Walk-in"],customRate:5500},
      {id:"G-016",name:"Sakhawat Ali",email:"",phone:"+923006878973",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 104 | Paid",tags:["Walk-in"],customRate:5000},
      {id:"G-017",name:"M Ikrash Qureshi",email:"",phone:"+9203088228794",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 303 | PaidCheckedOut",tags:["Walk-in"],customRate:5000},
      {id:"G-018",name:"Farhan Naqi",email:"",phone:"+9203076327426",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4500,notes:"Walk-in | Room 204 | PaidCheckedOut",tags:["Walk-in"],customRate:4500},
      {id:"G-019",name:"Ali Asgher",email:"",phone:"+923012534391",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 305 | CheckedOut",tags:["Walk-in"],customRate:5500},
      {id:"G-020",name:"Muhammad Madni",email:"",phone:"+923014121999",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6000,notes:"Walk-in | Room 102 | PaidCheckedOut",tags:["Walk-in"],customRate:6000},
      {id:"G-021",name:"Shouket Hussain",email:"",phone:"+923342916172",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:2,totalSpent:0,notes:"Walk-in | Room open | 2 bookings",tags:["Regular"],customRate:null},
      {id:"G-022",name:"Babar Moon",email:"",phone:"+923213735050",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 104",tags:["Walk-in"],customRate:5000},
      {id:"G-023",name:"Muhammad Naeem Kashif",email:"",phone:"+923004155601",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 101 | PaidCheckedOut",tags:["Walk-in"],customRate:5000},
      {id:"G-024",name:"Uns Khan",email:"",phone:"+92332257825",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4000,notes:"Walk-in | Room 301",tags:["Walk-in"],customRate:4000},
      {id:"G-025",name:"Syed Hassan Mehtab",email:"",phone:"+923001964102",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 103 | Unpaid CheckedOut",tags:["Walk-in"],customRate:5500},
      {id:"G-026",name:"M Waqas Jawed",email:"",phone:"+9233333333333",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 205",tags:["Walk-in"],customRate:5000},
      {id:"G-027",name:"Minhaj A Khan",email:"",phone:"+9203032101103",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:true,stays:2,totalSpent:16000,notes:"Walk-in | Rooms 207+105 | Multi-stay",tags:["Regular"],customRate:null},
      {id:"G-028",name:"Asad Abbas",email:"",phone:"+9203457766117",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4000,notes:"Walk-in | Room 103 | PaidCheckedOut",tags:["Walk-in"],customRate:4000},
      {id:"G-029",name:"Kashif Jamal",email:"",phone:"+923205699571",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:9000,notes:"Walk-in | Room 107 | PaidCheckedOut",tags:["Walk-in"],customRate:9000},
      {id:"G-030",name:"Dr Nasir",email:"",phone:"+923214503333",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:0,notes:"Walk-in | Room open",tags:["Walk-in"],customRate:null},
      {id:"G-031",name:"Uns Kha",email:"",phone:"+9203322578251",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:0,notes:"Walk-in | Room 102 | Open",tags:["Walk-in"],customRate:null},
      {id:"G-032",name:"Shahbaz Lateef",email:"",phone:"+923087603719",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:0,notes:"Walk-in | Open",tags:["Walk-in"],customRate:null},
      {id:"G-033",name:"M Asad",email:"",phone:"+923131830081",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:0,notes:"Walk-in | Room 205 | Open",tags:["Walk-in"],customRate:null},
      {id:"G-034",name:"Salman Ehsan",email:"",phone:"+923008109100",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 202 | PaidCheckedOut",tags:["Walk-in"],customRate:5000},
      {id:"G-035",name:"M Hammad Zahid",email:"",phone:"+923227388330",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:7900,notes:"Walk-in | Room 204 | PaidCheckedOut",tags:["Walk-in"],customRate:5000},
      {id:"G-036",name:"M Tanveer Hussain Awan",email:"",phone:"+923238556202",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:13500,notes:"Walk-in | Room 203 | PaidCheckedIn",tags:["Walk-in"],customRate:9000},
      {id:"G-037",name:"M Hinza Ajmal",email:"",phone:"+923128721119",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:15000,notes:"Walk-in | Room 201 | PaidCheckedOut",tags:["Walk-in"],customRate:15000},
      {id:"G-038",name:"Muhammad Arshad",email:"",phone:"+9203001125720",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5670,notes:"Walk-in | Rooms 202+205 | PaidCheckedIn",tags:["Walk-in"],customRate:4500},
      {id:"G-039",name:"Rasheed Ahmad",email:"",phone:"+923063695432",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6500,notes:"Walk-in | Room 108 | PaidCheckedIn",tags:["Walk-in"],customRate:6500},
      {id:"G-040",name:"M Shahid Javed",email:"",phone:"+923421114340",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6960,notes:"Macter International | Room 103 | PaidCheckedOut",tags:["Corporate"],customRate:6960},
      {id:"G-041",name:"Waleed Ijaz",email:"",phone:"+923429060006",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5500,notes:"Walk-in | Room 104 | PaidCheckedOut",tags:["Walk-in"],customRate:5500},
      {id:"G-042",name:"N Rafique",email:"",phone:"+923234666872",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4000,notes:"Walk-in | Room 307 | PaidCheckedOut",tags:["Walk-in"],customRate:4000},
      {id:"G-043",name:"Aleem Ahmed",email:"",phone:"+923363168976",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:6000,notes:"Walk-in | Room 204 | PaidCheckedOut",tags:["Walk-in"],customRate:6000},
      {id:"G-044",name:"Salman Mehmood",email:"",phone:"+9203007083502",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:4500,notes:"Walk-in | Room 202 | PaidCheckedOut",tags:["Walk-in"],customRate:4500},
      {id:"G-045",name:"Arslan Muzamil",email:"",phone:"+9203218230187",nationality:"Pakistani",idType:"CNIC",idNo:"",dob:"",vip:false,stays:1,totalSpent:5000,notes:"Walk-in | Room 208 | PaidCheckedOut",tags:["Walk-in"],customRate:5000},
    ],
    employees:[
      {id:"E-001",name:"Sarah Ahmed",role:"Front Desk Manager",dept:"Front Office",phone:"+92-300-2011111",email:"sarah@hotel.com",shift:"Morning",status:"active",since:"2020-03-01",salary:45000},
      {id:"E-002",name:"Raj Patel",role:"Housekeeping Supervisor",dept:"Housekeeping",phone:"+92-300-2022222",email:"raj@hotel.com",shift:"Morning",status:"active",since:"2019-07-15",salary:38000},
      {id:"E-003",name:"Lisa Chen",role:"Concierge",dept:"Front Office",phone:"+92-300-2033333",email:"lisa@hotel.com",shift:"Evening",status:"active",since:"2021-01-10",salary:35000},
      {id:"E-004",name:"Omar Farouk",role:"Chef",dept:"F&B",phone:"+92-300-2044444",email:"omar@hotel.com",shift:"Morning",status:"active",since:"2018-05-20",salary:50000},
    ],
    // Seed kitchen orders WITH correct bkId so they post to bill
    kitchenOrders:[
      {id:"KO-001",room:102,guest:"Ahmed Khan",bkId:"BK-001",items:[{name:"Club Sandwich",qty:1,price:350},{name:"Tea / Coffee",qty:2,price:150}],total:650,date:TODAY,time:"08:30",status:"served",postedToBill:true},
      {id:"KO-002",room:302,guest:"Omar Farooq",bkId:"BK-004",items:[{name:"Biryani",qty:2,price:450},{name:"Mineral Water",qty:2,price:100}],total:1100,date:TODAY,time:"13:15",status:"served",postedToBill:true},
    ],
    accounts:{transactions:[
      {id:"TX-001",date:"2026-04-18",desc:"Room 102 – Ahmed Khan (4n)",type:"income",amount:r102.baseRate*4,category:"Room Revenue",ref:"BK-001"},
      {id:"TX-002",date:"2026-04-19",desc:"Room 205 – Fatima Malik (2n)",type:"income",amount:r205.baseRate*2,category:"Room Revenue",ref:"BK-002"},
      {id:"TX-003",date:"2026-04-17",desc:"Room 302 – Omar Farooq (6n)",type:"income",amount:r302.baseRate*6,category:"Room Revenue",ref:"BK-004"},
      {id:"TX-004",date:"2026-04-18",desc:"Laundry Supplies",type:"expense",amount:5000,category:"Operating Expenses",ref:"EXP-001"},
      {id:"TX-005",date:"2026-04-19",desc:"Staff Payroll",type:"expense",amount:85000,category:"Payroll",ref:"PAY-001"},
      {id:"TX-006",date:TODAY,desc:"Kitchen – Room 102",type:"income",amount:650,category:"F&B Revenue",ref:"KO-001"},
      {id:"TX-007",date:TODAY,desc:"Kitchen – Room 302",type:"income",amount:1100,category:"F&B Revenue",ref:"KO-002"},
    ]},
    users:INIT_USERS,
    settings:{hotelName:"Grand Meridian Hotel",address:"123 Main Boulevard, Karachi",phone:"+92-21-3456-7890",email:"info@grandmeridian.com",waNotifications:true,waNumber:WA_NUMBER,taxRate:16},
  };
}

function loadData(){ try{ const s=sessionStorage.getItem("hpms_v8"); if(s) return JSON.parse(s); }catch{} return makeInitData(); }
function saveData(d){ try{ sessionStorage.setItem("hpms_v8",JSON.stringify(d)); }catch{} }

// ── Bill calc ─────────────────────────────────────────────────────────────────
function calcBill(b, kitchenOrders, taxRate){
  const rate=b.customRate||b.baseRate;
  const roomCharge=rate*b.nights;
  const extras=(b.extraCharges||[]).reduce((s,e)=>s+e.amount,0);
  const kitchen=kitchenOrders.filter(k=>k.bkId===b.id&&k.postedToBill).reduce((s,k)=>s+k.total,0);
  const subtotal=roomCharge+extras+kitchen;
  const tax=subtotal*(taxRate/100);
  return {rate,roomCharge,extras,kitchen,subtotal,tax,grand:Math.round(subtotal+tax)};
}

// ── Print engine ──────────────────────────────────────────────────────────────
const PRINT_CSS=`*{margin:0;padding:0;box-sizing:border-box}body{font-family:Arial,sans-serif;font-size:12px;color:#111;padding:20px}
.hdr{text-align:center;border-bottom:2px solid #111;padding-bottom:12px;margin-bottom:14px}
.hn{font-size:20px;font-weight:900;letter-spacing:2px;margin-bottom:2px}.hs{font-size:10px;color:#555;margin:1px 0}
h2{font-size:13px;text-align:center;margin:10px 0;text-transform:uppercase;letter-spacing:2px;color:#333}
.sec{margin:10px 0;padding:10px 12px;border:1px solid #ddd;border-radius:3px}
.sec-title{font-weight:700;font-size:11px;text-transform:uppercase;letter-spacing:1px;color:#555;margin-bottom:8px;border-bottom:1px solid #eee;padding-bottom:4px}
.row{display:flex;justify-content:space-between;padding:4px 0;border-bottom:1px dashed #eee}
.row:last-child{border-bottom:none}.lbl{color:#666;font-size:11px}.val{font-weight:600;font-size:11px}
table{width:100%;border-collapse:collapse;margin-top:6px}
th{background:#f5f5f5;padding:5px 6px;text-align:left;font-size:10px;text-transform:uppercase;border-bottom:1px solid #ddd}
td{padding:5px 6px;border-bottom:1px solid #f0f0f0;font-size:11px}
.tot-row{display:flex;justify-content:space-between;padding:3px 0;font-size:11px}
.grand{display:flex;justify-content:space-between;padding:8px 0;font-weight:900;font-size:15px;border-top:2px solid #111;margin-top:6px}
.sig{display:flex;justify-content:space-between;margin-top:28px}
.sig-box{border-top:1px solid #111;padding-top:4px;width:40%;text-align:center;font-size:10px;color:#555}
.ftr{text-align:center;margin-top:16px;padding-top:10px;border-top:1px solid #ddd;font-size:10px;color:#999}
.badge{display:inline-block;padding:2px 8px;border:1px solid #ccc;border-radius:10px;font-size:10px;font-weight:700}
@media print{body{padding:0}}`;

// In-app print preview — works inside Claude artifact (no window.open needed)
let _setPrintDoc = null;
function printWindow(html){
  const full = `<!DOCTYPE html><html><head><meta charset="utf-8"/><title>Grand Meridian</title><style>${PRINT_CSS}</style></head><body>${html}</body></html>`;
  if(_setPrintDoc) _setPrintDoc(full);
}

function PrintPreviewModal({doc, onClose}){
  const iframeRef = useRef(null);
  if(!doc) return null;
  const doPrint = () => {
    const iframe = iframeRef.current;
    if(!iframe) return;
    iframe.contentWindow.focus();
    iframe.contentWindow.print();
  };
  return (
    <div style={{position:"fixed",inset:0,background:"#000d",zIndex:800,display:"flex",flexDirection:"column"}}>
      {/* toolbar */}
      <div style={{background:"#111",display:"flex",alignItems:"center",justifyContent:"space-between",padding:"10px 16px",gap:10,flexShrink:0}}>
        <span style={{color:"#fff",fontWeight:700,fontSize:14}}>🖨 Print Preview</span>
        <div style={{display:"flex",gap:10}}>
          <button onClick={doPrint} style={{background:"#4f8ef7",border:"none",borderRadius:8,color:"#fff",padding:"8px 20px",fontWeight:700,fontSize:14,cursor:"pointer"}}>🖨 Print / Save PDF</button>
          <button onClick={onClose} style={{background:"#333",border:"none",borderRadius:8,color:"#aaa",padding:"8px 16px",fontWeight:700,fontSize:13,cursor:"pointer"}}>✕ Close</button>
        </div>
      </div>
      {/* iframe preview */}
      <iframe
        ref={iframeRef}
        srcDoc={doc}
        style={{flex:1,border:"none",background:"#fff"}}
        title="print-preview"
      />
    </div>
  );
}

function hotelHeader(hn){ return `<div class="hdr"><div class="hn">${hn||HOTEL.name}</div><div class="hs">${HOTEL.address}</div><div class="hs">${HOTEL.phone} | ${HOTEL.email}</div></div>`; }

// Check-In Card — opts: { taxable: bool, breakfast: bool }
function printCheckinCardHTML(b,g,hn,opts={}){
  const {taxable=true, breakfast=false} = opts;
  const baseRate = b.customRate||b.baseRate;
  const gstAmt = Math.round(baseRate*0.16);
  const rateWithGst = baseRate + gstAmt;
  const totalRoom = taxable ? rateWithGst*b.nights : baseRate*b.nights;
  return hotelHeader(hn)+`
  <h2>Guest Registration / Check-In Card</h2>
  <div style="display:flex;gap:8px;justify-content:center;margin-bottom:10px">
    <span style="display:inline-block;padding:3px 12px;border:2px solid #333;border-radius:12px;font-size:11px;font-weight:700;background:${taxable?"#111":"#fff"};color:${taxable?"#fff":"#333"}">
      ${taxable?"TAXABLE – GST 16%":"NON-TAXABLE"}
    </span>
    <span style="display:inline-block;padding:3px 12px;border:2px solid ${breakfast?"#2a7a2a":"#ccc"};border-radius:12px;font-size:11px;font-weight:700;color:${breakfast?"#2a7a2a":"#aaa"}">
      ${breakfast?"COMP. BREAKFAST":"NO BREAKFAST"}
    </span>
  </div>
  <div class="sec"><div class="sec-title">Booking Details</div>
    <div class="row"><span class="lbl">Booking Ref</span><span class="val">${b.id}</span></div>
    <div class="row"><span class="lbl">Room No.</span><span class="val">${b.room}</span></div>
    <div class="row"><span class="lbl">Room Category</span><span class="val">${b.category} – ${b.bedType} Bed</span></div>
    <div class="row"><span class="lbl">Check-In Date</span><span class="val">${b.checkIn}</span></div>
    <div class="row"><span class="lbl">Check-Out Date</span><span class="val">${b.checkOut}</span></div>
    <div class="row"><span class="lbl">No. of Nights</span><span class="val">${b.nights}</span></div>
    <div class="row"><span class="lbl">Rate / Night (Base)</span><span class="val">PKR ${baseRate.toLocaleString()}</span></div>
    ${taxable?`
    <div class="row"><span class="lbl">GST 16%</span><span class="val">PKR ${gstAmt.toLocaleString()}</span></div>
    <div class="row"><span class="lbl">Rate / Night (incl. GST)</span><span class="val" style="font-weight:900">PKR ${rateWithGst.toLocaleString()}</span></div>
    `:`<div class="row"><span class="lbl">Tax</span><span class="val">Exempt / Non-Taxable</span></div>`}
    <div class="row" style="border-bottom:2px solid #111"><span class="lbl" style="font-weight:700">Total Room Charges</span><span class="val" style="font-size:13px;font-weight:900">PKR ${totalRoom.toLocaleString()}</span></div>
    ${breakfast?`<div class="row"><span class="lbl">Breakfast</span><span class="val" style="color:#2a7a2a;font-weight:900">Complimentary (Included)</span></div>`:""}
    <div class="row"><span class="lbl">Booking Source</span><span class="val">${b.source||"Direct"}</span></div>
    ${b.notes?`<div class="row"><span class="lbl">Special Request</span><span class="val">${b.notes}</span></div>`:""}
  </div>
  <div class="sec"><div class="sec-title">Guest Information</div>
    <div class="row"><span class="lbl">Full Name</span><span class="val">${g.name}</span></div>
    <div class="row"><span class="lbl">Nationality</span><span class="val">${g.nationality||"—"}</span></div>
    <div class="row"><span class="lbl">ID Type</span><span class="val">${g.idType||"—"}</span></div>
    <div class="row"><span class="lbl">ID Number</span><span class="val">${g.idNo||"—"}</span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${g.phone||"—"}</span></div>
    <div class="row"><span class="lbl">Email</span><span class="val">${g.email||"—"}</span></div>
    ${g.dob?`<div class="row"><span class="lbl">Date of Birth</span><span class="val">${g.dob}</span></div>`:""}
  </div>
  <div class="sec" style="background:#fafafa">
    <div class="sec-title">Meal Plan</div>
    <div style="display:flex;gap:8px;margin-top:6px">
      <div style="flex:1;text-align:center;padding:8px 4px;border:1px solid ${breakfast?"#2a7a2a":"#ddd"};border-radius:4px;background:${breakfast?"#e8f5e9":"#fff"}">
        <div style="font-size:16px">&#x2615;</div>
        <div style="font-size:9px;font-weight:700;color:${breakfast?"#2a7a2a":"#bbb"}">${breakfast?"COMP.":"—"}<br/>BREAKFAST</div>
      </div>
      <div style="flex:1;text-align:center;padding:8px 4px;border:1px solid #ddd;border-radius:4px">
        <div style="font-size:16px">&#x1F37D;</div>
        <div style="font-size:9px;color:#bbb">—<br/>LUNCH</div>
      </div>
      <div style="flex:1;text-align:center;padding:8px 4px;border:1px solid #ddd;border-radius:4px">
        <div style="font-size:16px">&#x1F319;</div>
        <div style="font-size:9px;color:#bbb">—<br/>DINNER</div>
      </div>
    </div>
  </div>
  <div class="sec" style="margin-top:8px">
    <p style="font-size:11px;color:#555;margin-bottom:14px">I confirm the above information is correct and agree to abide by the hotel's terms and conditions. I am responsible for all charges incurred during my stay.</p>
    <div class="sig"><div class="sig-box">Guest Signature</div><div class="sig-box">Date</div><div class="sig-box">Front Desk</div></div>
  </div>
  <div class="ftr">Printed: ${new Date().toLocaleString()} · ${taxable?"Taxable":"Non-Taxable"} · ${hn||HOTEL.name}</div>`;
}

// Checkout Bill (with or without tax)
function printBillHTML(b,g,kitchenOrders,withTax,taxRate,hn){
  const {rate,roomCharge,extras,kitchen,subtotal,tax,grand}=calcBill(b,kitchenOrders,withTax?taxRate:0);
  const bkitchen=kitchenOrders.filter(k=>k.bkId===b.id&&k.postedToBill);
  return hotelHeader(hn)+`
  <h2>${withTax?`Tax Invoice – GST ${taxRate}%`:"Settlement Bill (No Tax)"}</h2>
  <div class="sec"><div class="sec-title">Invoice Details</div>
    <div class="row"><span class="lbl">Invoice No</span><span class="val">${b.id}-${withTax?"TAX":"NOTAX"}</span></div>
    <div class="row"><span class="lbl">Guest Name</span><span class="val">${g.name}</span></div>
    <div class="row"><span class="lbl">ID / CNIC</span><span class="val">${g.idNo||"—"}</span></div>
    <div class="row"><span class="lbl">Room</span><span class="val">${b.room} · ${b.category} ${b.bedType} Bed</span></div>
    <div class="row"><span class="lbl">Check-In</span><span class="val">${b.checkIn}</span></div>
    <div class="row"><span class="lbl">Check-Out</span><span class="val">${b.checkOut}</span></div>
    <div class="row"><span class="lbl">Nights</span><span class="val">${b.nights}</span></div>
  </div>
  <div class="sec"><div class="sec-title">Charges Breakdown</div>
    <table>
      <tr><th>Description</th><th>Qty</th><th style="text-align:right">Rate</th><th style="text-align:right">Amount (PKR)</th></tr>
      <tr><td>Room Charges</td><td>${b.nights} nights</td><td style="text-align:right">${rate.toLocaleString()}</td><td style="text-align:right">${roomCharge.toLocaleString()}</td></tr>
      ${(b.extraCharges||[]).map(e=>`<tr><td>${e.desc}</td><td>1</td><td style="text-align:right">—</td><td style="text-align:right">${e.amount.toLocaleString()}</td></tr>`).join("")}
      ${bkitchen.map(k=>`<tr><td>Room Service (${k.date} ${k.time})<br/><small style="color:#888">${k.items.map(i=>`${i.qty}×${i.name}`).join(", ")}</small></td><td>1</td><td style="text-align:right">—</td><td style="text-align:right">${k.total.toLocaleString()}</td></tr>`).join("")}
    </table>
    <div style="margin-top:10px">
      <div class="tot-row"><span>Room Charges</span><span>PKR ${roomCharge.toLocaleString()}</span></div>
      ${extras>0?`<div class="tot-row"><span>Extra Charges</span><span>PKR ${extras.toLocaleString()}</span></div>`:""}
      ${kitchen>0?`<div class="tot-row"><span>Room Service / F&B</span><span>PKR ${kitchen.toLocaleString()}</span></div>`:""}
      <div class="tot-row"><span>Subtotal</span><span>PKR ${subtotal.toLocaleString()}</span></div>
      ${withTax?`<div class="tot-row"><span>GST ${taxRate}%</span><span>PKR ${Math.round(tax).toLocaleString()}</span></div>`:`<div class="tot-row" style="color:#888"><span>Tax (Exempt)</span><span>—</span></div>`}
      <div class="grand"><span>GRAND TOTAL</span><span>PKR ${grand.toLocaleString()}</span></div>
      <div style="font-size:11px;margin-top:6px;color:#555">Payment Status: <strong>${b.paid?"✓ PAID":"PENDING"}</strong></div>
    </div>
  </div>
  <div class="sig" style="margin-top:20px"><div class="sig-box">Guest Signature</div><div class="sig-box">Cashier</div></div>
  <div class="ftr">Printed: ${new Date().toLocaleString()} · Thank you for staying at ${hn||HOTEL.name}</div>`;
}

// Room Summary print
function printRoomSummaryHTML(b,g,kitchenOrders,taxRate,hn){
  const {rate,roomCharge,extras,kitchen,subtotal,tax,grand}=calcBill(b,kitchenOrders,taxRate);
  const bkitchen=kitchenOrders.filter(k=>k.bkId===b.id&&k.postedToBill);
  const nights=b.nights;
  return hotelHeader(hn)+`
  <h2>Room Account Summary</h2>
  <div style="display:flex;gap:12px;margin-bottom:10px">
    <div class="sec" style="flex:1"><div class="sec-title">Room Info</div>
      <div class="row"><span class="lbl">Room</span><span class="val">${b.room}</span></div>
      <div class="row"><span class="lbl">Category</span><span class="val">${b.category}</span></div>
      <div class="row"><span class="lbl">Bed Type</span><span class="val">${b.bedType}</span></div>
      <div class="row"><span class="lbl">Floor</span><span class="val">${String(b.room)[0]}</span></div>
    </div>
    <div class="sec" style="flex:1"><div class="sec-title">Stay Info</div>
      <div class="row"><span class="lbl">Check-In</span><span class="val">${b.checkIn}</span></div>
      <div class="row"><span class="lbl">Check-Out</span><span class="val">${b.checkOut}</span></div>
      <div class="row"><span class="lbl">Nights</span><span class="val">${nights}</span></div>
      <div class="row"><span class="lbl">Source</span><span class="val">${b.source||"Direct"}</span></div>
    </div>
  </div>
  <div class="sec"><div class="sec-title">Guest Profile</div>
    <div class="row"><span class="lbl">Name</span><span class="val">${g.name}</span></div>
    <div class="row"><span class="lbl">Phone</span><span class="val">${g.phone||"—"}</span></div>
    <div class="row"><span class="lbl">Nationality</span><span class="val">${g.nationality||"—"}</span></div>
    <div class="row"><span class="lbl">${g.idType||"ID"}</span><span class="val">${g.idNo||"—"}</span></div>
    ${g.notes?`<div class="row"><span class="lbl">Notes</span><span class="val">${g.notes}</span></div>`:""}
  </div>
  <div class="sec"><div class="sec-title">Account Statement</div>
    <table>
      <tr><th>Date</th><th>Description</th><th style="text-align:right">Amount (PKR)</th></tr>
      <tr><td>${b.checkIn}</td><td>Room Charges – ${nights} nights × PKR ${rate.toLocaleString()}</td><td style="text-align:right">${roomCharge.toLocaleString()}</td></tr>
      ${(b.extraCharges||[]).map(e=>`<tr><td>${b.checkIn}</td><td>${e.desc}</td><td style="text-align:right">${e.amount.toLocaleString()}</td></tr>`).join("")}
      ${bkitchen.map(k=>`<tr><td>${k.date}</td><td>Room Service ${k.time} – ${k.items.map(i=>`${i.qty}×${i.name}`).join(", ")}</td><td style="text-align:right">${k.total.toLocaleString()}</td></tr>`).join("")}
    </table>
    <div style="margin-top:10px">
      <div class="tot-row"><span>Room Revenue</span><span>PKR ${roomCharge.toLocaleString()}</span></div>
      ${extras>0?`<div class="tot-row"><span>Extras</span><span>PKR ${extras.toLocaleString()}</span></div>`:""}
      ${kitchen>0?`<div class="tot-row"><span>F&B / Room Service</span><span>PKR ${kitchen.toLocaleString()}</span></div>`:""}
      <div class="tot-row"><span>Subtotal</span><span>PKR ${subtotal.toLocaleString()}</span></div>
      <div class="tot-row"><span>GST ${taxRate}%</span><span>PKR ${Math.round(tax).toLocaleString()}</span></div>
      <div class="grand"><span>GRAND TOTAL</span><span>PKR ${grand.toLocaleString()}</span></div>
      <div style="font-size:11px;margin-top:6px">Payment: <strong>${b.paid?"✓ PAID":"PENDING"}</strong></div>
    </div>
  </div>
  ${bkitchen.length>0?`<div class="sec"><div class="sec-title">Kitchen Orders Detail</div>
    <table><tr><th>Order ID</th><th>Time</th><th>Items</th><th style="text-align:right">Total</th></tr>
    ${bkitchen.map(k=>`<tr><td>${k.id}</td><td>${k.date} ${k.time}</td><td>${k.items.map(i=>`${i.qty}×${i.name}@PKR${i.price}`).join(", ")}</td><td style="text-align:right">PKR ${k.total.toLocaleString()}</td></tr>`).join("")}
    </table></div>`:""}
  <div class="ftr">Printed: ${new Date().toLocaleString()} · ${hn||HOTEL.name}</div>`;
}

// Day End
function printDayEndHTML(data,date){
  const bks=data.bookings; const rooms=data.rooms;
  const inhouse=bks.filter(b=>b.status==="checked-in");
  const occ=rooms.filter(r=>r.status==="occupied").length; const tot=rooms.length;
  const roomRev=inhouse.reduce((s,b)=>s+(b.customRate||b.baseRate),0);
  const fbRev=data.kitchenOrders.filter(k=>k.date===date).reduce((s,k)=>s+k.total,0);
  const totalInc=data.accounts.transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const totalExp=data.accounts.transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const hn=data.settings?.hotelName||HOTEL.name;
  return hotelHeader(hn)+`
  <h2>Day End Summary Report</h2>
  <p style="text-align:center;font-size:11px;color:#555;margin-bottom:10px">Date: ${date}</p>
  <div style="display:flex;gap:10px">
    <div class="sec" style="flex:1"><div class="sec-title">Occupancy</div>
      <div class="row"><span class="lbl">Total Rooms</span><span class="val">${tot}</span></div>
      <div class="row"><span class="lbl">Occupied</span><span class="val">${occ} (${Math.round(occ/tot*100)}%)</span></div>
      <div class="row"><span class="lbl">Available</span><span class="val">${rooms.filter(r=>r.status==="available").length}</span></div>
      <div class="row"><span class="lbl">Cleaning</span><span class="val">${rooms.filter(r=>r.status==="cleaning").length}</span></div>
      <div class="row"><span class="lbl">Maintenance</span><span class="val">${rooms.filter(r=>r.status==="maintenance").length}</span></div>
    </div>
    <div class="sec" style="flex:1"><div class="sec-title">Revenue</div>
      <div class="row"><span class="lbl">Room Rev (daily)</span><span class="val">PKR ${roomRev.toLocaleString()}</span></div>
      <div class="row"><span class="lbl">F&B Revenue</span><span class="val">PKR ${fbRev.toLocaleString()}</span></div>
      <div class="row"><span class="lbl">Total Income</span><span class="val">PKR ${totalInc.toLocaleString()}</span></div>
      <div class="row"><span class="lbl">Expenses</span><span class="val">PKR ${totalExp.toLocaleString()}</span></div>
      <div class="row"><span class="lbl">Net Profit</span><span class="val">PKR ${(totalInc-totalExp).toLocaleString()}</span></div>
    </div>
  </div>
  <div class="sec"><div class="sec-title">In-House Guests</div>
    <table><tr><th>Room</th><th>Guest</th><th>Category</th><th>Check-Out</th><th style="text-align:right">Rate/N</th></tr>
    ${inhouse.map(b=>`<tr><td>${b.room}</td><td>${b.guest}</td><td>${b.category}</td><td>${b.checkOut}</td><td style="text-align:right">PKR ${(b.customRate||b.baseRate).toLocaleString()}</td></tr>`).join("")}
    </table>
  </div>
  <div class="sec"><div class="sec-title">Kitchen Orders – ${date}</div>
    <table><tr><th>Order</th><th>Room</th><th>Guest</th><th>Items</th><th style="text-align:right">Total</th></tr>
    ${data.kitchenOrders.filter(k=>k.date===date).map(k=>`<tr><td>${k.id}</td><td>${k.room}</td><td>${k.guest}</td><td>${k.items.map(i=>`${i.qty}×${i.name}`).join(", ")}</td><td style="text-align:right">PKR ${k.total.toLocaleString()}</td></tr>`).join("")}
    </table>
  </div>
  <div class="sig" style="margin-top:20px"><div class="sig-box">Night Auditor</div><div class="sig-box">Manager</div></div>
  <div class="ftr">Generated: ${new Date().toLocaleString()}</div>`;
}

function sendWA(settings,msg){ if(!settings?.waNotifications)return; const num=(settings.waNumber||WA_NUMBER).replace(/\D/g,""); window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`,"_blank"); }

// ── Palette ───────────────────────────────────────────────────────────────────
const T={bg:"#07080a",surface:"#0f1117",card:"#151820",border:"#1e2330",accent:"#4f8ef7",gold:"#f0b429",green:"#2ec27e",red:"#e05c5c",purple:"#9b72f2",muted:"#4a5568",text:"#e8eaf0",sub:"#8892a4"};
const SC={available:T.green,occupied:T.accent,reserved:T.gold,cleaning:T.purple,maintenance:T.red};
const css={
  card:{background:T.card,border:`1px solid ${T.border}`,borderRadius:14,padding:16},
  input:{width:"100%",padding:"10px 12px",background:T.surface,border:`1px solid ${T.border}`,borderRadius:8,color:T.text,fontFamily:"inherit",fontSize:13,outline:"none",boxSizing:"border-box"},
  btn:(bg,c="#fff")=>({padding:"9px 14px",background:bg,border:"none",borderRadius:8,color:c,cursor:"pointer",fontFamily:"inherit",fontSize:12,fontWeight:700}),
  tag:(c)=>({fontSize:9,padding:"2px 8px",borderRadius:12,background:c+"22",color:c,border:`1px solid ${c}44`,fontWeight:700,letterSpacing:"0.08em"}),
};
function Badge({s}){const c=SC[s]||T.muted;return <span style={{...css.tag(c),textTransform:"capitalize"}}>{s}</span>;}
function Lbl({c}){return <div style={{fontSize:10,color:T.muted,letterSpacing:"0.14em",textTransform:"uppercase",marginBottom:5,fontWeight:700}}>{c}</div>;}
function SLbl({c}){return <div style={{fontSize:11,color:T.sub,letterSpacing:"0.1em",textTransform:"uppercase",marginBottom:10,fontWeight:700,borderBottom:`1px solid ${T.border}`,paddingBottom:7}}>{c}</div>;}
function Toast({t}){if(!t)return null;return <div style={{position:"fixed",top:14,left:"50%",transform:"translateX(-50%)",zIndex:9999,background:t.err?"#5c1a1a":"#0d3320",color:t.err?"#fca5a5":"#6ee7b7",padding:"10px 20px",borderRadius:24,fontSize:12,fontWeight:700,boxShadow:"0 4px 30px #0009",whiteSpace:"nowrap",animation:"fIn .2s ease"}}>{t.err?"⚠ ":"✓ "}{t.msg}</div>;}
function KPI({label,value,color,sub}){return <div style={{...css.card,flex:1}}><Lbl c={label}/><div style={{fontSize:19,fontWeight:800,color:color||T.text}}>{value}</div>{sub&&<div style={{fontSize:10,color:T.muted,marginTop:3}}>{sub}</div>}</div>;}
function Sheet({open,onClose,title,children}){
  if(!open)return null;
  return <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000c",zIndex:500,display:"flex",alignItems:"flex-end"}}>
    <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"18px 18px 0 0",padding:"20px 18px 32px",width:"100%",maxWidth:560,margin:"0 auto",maxHeight:"92dvh",overflowY:"auto"}}>
      <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:16}}>
        <div style={{fontSize:15,color:T.text,fontWeight:800}}>{title}</div>
        <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>×</button>
      </div>
      {children}
    </div>
  </div>;
}

// ── Room Detail Modal – FULL SUMMARY ──────────────────────────────────────────
function RoomModal({room,booking,guest,kitchenOrders,taxRate,hotelName,onClose,onCheckin,onCheckout,onMarkClean,onDirectCheckin,hasPerm}){
  // All hooks MUST be at top before any conditional returns
  const [ciOpts,setCiOpts]=useState({taxable:true,breakfast:false});

  if(!room)return null;
  const rate=effectiveRate(room);
  const sc=SC[room.status]||T.muted;

  // Bill for occupied rooms
  let bill=null;
  if(booking&&(room.status==="occupied"||room.status==="reserved")){
    bill=calcBill(booking,kitchenOrders,taxRate);
  }
  const roomKitchen=kitchenOrders.filter(k=>booking&&k.bkId===booking.id&&k.postedToBill);

  const printCI=()=>{ if(!booking||!guest)return; printWindow(printCheckinCardHTML(booking,guest,hotelName,ciOpts)); };
  const printBillFn=(withTax)=>{ if(!booking||!guest)return; printWindow(printBillHTML(booking,guest,kitchenOrders,withTax,taxRate,hotelName)); };
  const printSummary=()=>{ if(!booking||!guest)return; printWindow(printRoomSummaryHTML(booking,guest,kitchenOrders,taxRate,hotelName)); };

  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000e",zIndex:600,display:"flex",alignItems:"center",justifyContent:"center",padding:12}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`2px solid ${sc}44`,borderRadius:20,width:"100%",maxWidth:400,maxHeight:"94dvh",overflowY:"auto",boxShadow:`0 0 60px ${sc}18`}}>

        {/* ── Header ── */}
        <div style={{background:sc+"18",padding:"18px 20px 14px",borderRadius:"18px 18px 0 0",borderBottom:`1px solid ${sc}33`}}>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"flex-start"}}>
            <div>
              <div style={{fontSize:26,fontWeight:900,color:T.text}}>Room {room.id}</div>
              <div style={{fontSize:12,color:T.sub,marginTop:2}}>{room.category} · {room.bedType} Bed · Floor {room.floor}</div>
            </div>
            <div style={{display:"flex",flexDirection:"column",alignItems:"flex-end",gap:6}}>
              <Badge s={room.status}/>
              <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:20,cursor:"pointer"}}>×</button>
            </div>
          </div>
          <div style={{marginTop:12,display:"flex",gap:10}}>
            <div style={{flex:1,background:T.card,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>Base Rate</div>
              <div style={{fontSize:15,fontWeight:800,color:T.gold}}>{fmt(rate)}<span style={{fontSize:9,color:T.muted}}>/n</span></div>
            </div>
            <div style={{flex:1,background:T.card,borderRadius:8,padding:"8px 10px",textAlign:"center"}}>
              <div style={{fontSize:9,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:3}}>With GST 16%</div>
              <div style={{fontSize:15,fontWeight:800,color:T.accent}}>{fmt(Math.round(rate*1.16))}<span style={{fontSize:9,color:T.muted}}>/n</span></div>
            </div>
          </div>
        </div>

        <div style={{padding:"16px 20px 24px"}}>

          {/* ── OCCUPIED: Full Summary ── */}
          {room.status==="occupied"&&booking&&guest&&(<>
            {/* Guest info */}
            <div style={{...css.card,background:T.surface,marginBottom:12}}>
              <SLbl c="Guest"/>
              <div style={{display:"flex",alignItems:"center",gap:10,marginBottom:10}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:guest.vip?T.gold+"22":T.accent+"22",border:`2px solid ${guest.vip?T.gold:T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:guest.vip?T.gold:T.accent,flexShrink:0}}>
                  {guest.name.split(" ").map(n=>n[0]).join("")}
                </div>
                <div>
                  <div style={{fontSize:14,fontWeight:800,marginBottom:1}}>{guest.name}{guest.vip&&<span style={{...css.tag(T.gold),marginLeft:6,fontSize:8}}>VIP</span>}</div>
                  <div style={{fontSize:11,color:T.sub}}>{guest.phone}</div>
                </div>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:5,fontSize:11}}>
                {[["Check-In",booking.checkIn],["Check-Out",booking.checkOut],["Nights",booking.nights],["Booking",booking.id],["ID",guest.idNo||"—"],["Nationality",guest.nationality||"—"]].map(([k,v])=>(
                  <div key={k} style={{padding:"4px 0"}}><span style={{color:T.muted}}>{k}: </span><span style={{fontWeight:600}}>{v}</span></div>
                ))}
              </div>
            </div>

            {/* Bill summary */}
            <div style={{...css.card,background:T.surface,marginBottom:12}}>
              <SLbl c="Room Account"/>
              <div style={{fontSize:11}}>
                {[
                  ["Room Charges",`${booking.nights}n × ${fmt(bill.rate)}`,bill.roomCharge],
                  ...(booking.extraCharges||[]).map(e=>[e.desc,"",e.amount]),
                  ...(bill.kitchen>0?[["Room Service / F&B","",bill.kitchen]]:[]),
                ].map(([k,sub,v],i)=>(
                  <div key={i} style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}>
                    <span style={{color:T.sub}}>{k}{sub?<span style={{color:T.muted,fontSize:9,marginLeft:4}}>{sub}</span>:""}</span>
                    <span style={{fontWeight:600}}>{fmt(v)}</span>
                  </div>
                ))}
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.sub}}>Subtotal</span><span style={{fontWeight:700}}>{fmt(bill.subtotal)}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"5px 0",borderBottom:`1px solid ${T.border}`}}><span style={{color:T.sub}}>GST {taxRate}%</span><span style={{fontWeight:600,color:T.muted}}>{fmt(Math.round(bill.tax))}</span></div>
                <div style={{display:"flex",justifyContent:"space-between",padding:"7px 0",marginTop:2}}>
                  <span style={{fontWeight:800,fontSize:13}}>Grand Total</span>
                  <span style={{fontWeight:900,fontSize:16,color:T.gold}}>{fmt(bill.grand)}</span>
                </div>
                <div style={{fontSize:10,color:booking.paid?T.green:T.red,fontWeight:700,marginTop:2}}>{booking.paid?"✓ PAID":"⚠ PAYMENT PENDING"}</div>
              </div>
            </div>

            {/* Kitchen orders on bill */}
            {roomKitchen.length>0&&(
              <div style={{...css.card,background:T.surface,marginBottom:12}}>
                <SLbl c="Kitchen Orders on Bill"/>
                {roomKitchen.map(k=>(
                  <div key={k.id} style={{padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:2}}>
                      <span style={{fontSize:11,fontWeight:700,color:T.text}}>{k.id} · {k.time}</span>
                      <span style={{fontSize:12,fontWeight:800,color:T.gold}}>{fmt(k.total)}</span>
                    </div>
                    <div style={{fontSize:10,color:T.sub}}>{k.items.map(i=>`${i.qty}×${i.name}`).join(", ")}</div>
                  </div>
                ))}
              </div>
            )}

            {/* Print buttons */}
            <div style={{marginBottom:12}}>
              <div style={{fontSize:10,color:T.muted,marginBottom:8,textTransform:"uppercase",letterSpacing:"0.1em",fontWeight:700}}>🖨 Print Documents</div>
              {/* Check-In Card Options */}
              <div style={{...css.card,background:T.surface,marginBottom:10,padding:12}}>
                <div style={{fontSize:10,color:T.sub,marginBottom:8,fontWeight:700}}>Check-In Card Options</div>
                <div style={{display:"flex",gap:8,marginBottom:8}}>
                  <button onClick={()=>setCiOpts(o=>({...o,taxable:true}))} style={{flex:1,padding:"7px",background:ciOpts.taxable?T.accent+"33":T.surface,border:`1px solid ${ciOpts.taxable?T.accent:T.border}`,borderRadius:7,color:ciOpts.taxable?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>
                    Taxable (GST 16%)
                  </button>
                  <button onClick={()=>setCiOpts(o=>({...o,taxable:false}))} style={{flex:1,padding:"7px",background:!ciOpts.taxable?T.purple+"33":T.surface,border:`1px solid ${!ciOpts.taxable?T.purple:T.border}`,borderRadius:7,color:!ciOpts.taxable?T.purple:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>
                    Non-Taxable
                  </button>
                </div>
                <button onClick={()=>setCiOpts(o=>({...o,breakfast:!o.breakfast}))} style={{width:"100%",padding:"7px",background:ciOpts.breakfast?T.green+"33":T.surface,border:`1px solid ${ciOpts.breakfast?T.green:T.border}`,borderRadius:7,color:ciOpts.breakfast?T.green:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700,marginBottom:8}}>
                  {ciOpts.breakfast?"☕ Complimentary Breakfast: ON":"☕ Complimentary Breakfast: OFF — tap to enable"}
                </button>
                <button onClick={printCI} style={{...css.btn(T.accent),width:"100%",fontSize:12}}>📋 Print Check-In Card</button>
              </div>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                <button onClick={printSummary} style={{...css.btn(T.purple+"22"),color:T.purple,border:`1px solid ${T.purple}44`,fontSize:11}}>📊 Room Summary</button>
                <button onClick={()=>printBillFn(true)} style={{...css.btn(T.gold+"22"),color:T.gold,border:`1px solid ${T.gold}44`,fontSize:11}}>🧾 Bill + GST</button>
                <button onClick={()=>printBillFn(false)} style={{...css.btn(T.green+"22"),color:T.green,border:`1px solid ${T.green}44`,fontSize:11,gridColumn:"span 2"}}>📄 Bill No Tax</button>
              </div>
            </div>

            {/* Action */}
            {hasPerm("checkout")&&(
              <button onClick={onCheckout} style={{...css.btn(T.red+"33"),color:T.red,width:"100%",border:`1px solid ${T.red}44`,padding:"12px",fontSize:13}}>
                ✗ Check Out {guest.name.split(" ")[0]}
              </button>
            )}
          </>)}

          {/* ── RESERVED ── */}
          {room.status==="reserved"&&booking&&(<>
            <div style={{...css.card,background:T.surface,marginBottom:12}}>
              <SLbl c="Reserved For"/>
              <div style={{fontSize:15,fontWeight:800,marginBottom:4}}>{room.guest}</div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>Arrival: {room.checkIn} · Departure: {room.checkOut}</div>
              <div style={{fontSize:11,color:T.sub}}>Booking: {booking.id} · {booking.nights} nights · {fmt(booking.customRate||booking.baseRate)}/n</div>
            </div>
            {guest&&(<div style={{...css.card,background:T.surface,marginBottom:12}}>
              <div style={{fontSize:11,color:T.sub}}>{guest.phone} · {guest.nationality} · {guest.idType}: {guest.idNo}</div>
            </div>)}
            <button onClick={printCI} style={{...css.btn(T.accent+"22"),color:T.accent,border:`1px solid ${T.accent}44`,width:"100%",marginBottom:10,fontSize:12}}>📋 Print Check-In Card</button>
            {hasPerm("checkin")&&<button onClick={onCheckin} style={{...css.btn(T.green+"33"),color:T.green,width:"100%",border:`1px solid ${T.green}44`,padding:"12px"}}>✓ Check In {room.guest?.split(" ")[0]}</button>}
          </>)}

          {/* ── AVAILABLE ── */}
          {room.status==="available"&&(<>
            <div style={{...css.card,background:T.green+"11",border:`1px solid ${T.green}33`,marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:14,color:T.green,fontWeight:800}}>✓ Available</div>
              <div style={{fontSize:11,color:T.sub,marginTop:2}}>Ready for immediate check-in</div>
            </div>
            {hasPerm("checkin")&&<button onClick={onDirectCheckin} style={{...css.btn(T.accent),width:"100%",padding:"12px",fontSize:14,marginBottom:10}}>⚡ Quick Check-In → Room {room.id}</button>}
          </>)}

          {/* ── CLEANING / MAINTENANCE ── */}
          {(room.status==="cleaning"||room.status==="maintenance")&&(<>
            <div style={{...css.card,background:SC[room.status]+"11",border:`1px solid ${SC[room.status]}33`,marginBottom:14,textAlign:"center"}}>
              <div style={{fontSize:14,color:SC[room.status],fontWeight:800}}>{room.status==="cleaning"?"🧹 Being Cleaned":"🔧 Under Maintenance"}</div>
            </div>
            <button onClick={onMarkClean} style={{...css.btn(T.green+"33"),color:T.green,width:"100%",border:`1px solid ${T.green}44`,padding:"12px"}}>
              ✓ {room.status==="cleaning"?"Mark Clean & Available":"Clear Maintenance"}
            </button>
          </>)}

          <button onClick={onClose} style={{...css.btn(T.border),color:T.muted,width:"100%",marginTop:10}}>Close</button>
        </div>
      </div>
    </div>
  );
}

// ── Quick Check-In ─────────────────────────────────────────────────────────────
function QuickCheckinSheet({open,onClose,rooms,guests,onConfirm,preSelectedRoom}){
  const [step,setStep]=useState(1);
  const [search,setSearch]=useState("");
  const [selectedGuest,setSelectedGuest]=useState(null);
  const [selectedRoom,setSelectedRoom]=useState(preSelectedRoom||"");
  const [form,setForm]=useState({checkIn:TODAY,checkOut:"",source:"Direct",notes:"",customRate:""});
  const searchRef=useRef(null);

  useEffect(()=>{ if(open){setStep(1);setSearch("");setSelectedGuest(null);setSelectedRoom(preSelectedRoom||"");setForm({checkIn:TODAY,checkOut:"",source:"Direct",notes:"",customRate:""});} },[open,preSelectedRoom]);
  useEffect(()=>{ if(open&&step===1) setTimeout(()=>searchRef.current?.focus(),200); },[open,step]);

  const filtered=guests.filter(g=>search.length>0&&(
    g.name.toLowerCase().includes(search.toLowerCase())||g.phone.includes(search)||g.idNo.includes(search)||g.email.toLowerCase().includes(search.toLowerCase())
  ));
  const availRooms=rooms.filter(r=>r.status==="available");
  const selRoom=rooms.find(r=>r.id===parseInt(selectedRoom));
  const nights=form.checkIn&&form.checkOut?Math.max(1,Math.round((new Date(form.checkOut)-new Date(form.checkIn))/86400000)):1;
  const rate=form.customRate?parseInt(form.customRate):(selRoom?effectiveRate(selRoom):0);
  const total=rate*nights;

  const doConfirm=()=>{ if(!selectedGuest||!selectedRoom||!form.checkIn||!form.checkOut)return; onConfirm({guest:selectedGuest,room:parseInt(selectedRoom),form}); };

  if(!open)return null;
  return (
    <div onClick={onClose} style={{position:"fixed",inset:0,background:"#000d",zIndex:600,display:"flex",alignItems:"flex-end"}}>
      <div onClick={e=>e.stopPropagation()} style={{background:T.card,border:`1px solid ${T.border}`,borderRadius:"20px 20px 0 0",padding:"20px 18px 32px",width:"100%",maxWidth:560,margin:"0 auto",maxHeight:"94dvh",overflowY:"auto"}}>
        <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:4}}>
          <div style={{fontSize:16,fontWeight:900}}>⚡ Quick Check-In</div>
          <button onClick={onClose} style={{background:"none",border:"none",color:T.muted,fontSize:22,cursor:"pointer"}}>×</button>
        </div>
        <div style={{display:"flex",gap:6,marginBottom:18,marginTop:10}}>
          {["1. Search Guest","2. Booking Details"].map((s,i)=>(
            <div key={s} onClick={()=>i===0&&setStep(1)} style={{flex:1,padding:"6px",borderRadius:8,textAlign:"center",background:step===i+1?T.accent+"22":T.surface,border:`1px solid ${step===i+1?T.accent:T.border}`,fontSize:11,color:step===i+1?T.accent:T.muted,fontWeight:700,cursor:i===0&&step===2?"pointer":"default"}}>{s}</div>
          ))}
        </div>

        {step===1&&(<>
          <div style={{position:"relative",marginBottom:14}}>
            <span style={{position:"absolute",left:12,top:"50%",transform:"translateY(-50%)",color:T.muted}}>🔍</span>
            <input ref={searchRef} value={search} onChange={e=>setSearch(e.target.value)} placeholder="Name, phone, CNIC, email…" style={{...css.input,paddingLeft:36,fontSize:14}} autoComplete="off"/>
          </div>
          {search.length===0&&<div style={{fontSize:11,color:T.muted,textAlign:"center",marginBottom:10}}>Type to search guest portfolio ↑</div>}
          {search.length>0&&filtered.length===0&&(
            <div style={{textAlign:"center",padding:"12px 0"}}>
              <div style={{fontSize:13,color:T.sub,marginBottom:10}}>No guest found for "{search}"</div>
              <button onClick={()=>{setSelectedGuest({id:"__new__",name:search,email:"",phone:"",nationality:"",idType:"CNIC",idNo:"",dob:"",vip:false,customRate:null});setStep(2);}} style={{...css.btn(T.accent),width:"100%"}}>+ Register "{search}" as New Guest</button>
            </div>
          )}
          {filtered.map(g=>(
            <div key={g.id} onClick={()=>{setSelectedGuest(g);if(g.customRate)setForm(f=>({...f,customRate:String(g.customRate)}));setStep(2);}} style={{...css.card,marginBottom:8,cursor:"pointer",display:"flex",gap:10,alignItems:"center"}}>
              <div style={{width:38,height:38,borderRadius:"50%",background:g.vip?T.gold+"22":T.accent+"22",border:`2px solid ${g.vip?T.gold:T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:12,fontWeight:900,color:g.vip?T.gold:T.accent,flexShrink:0}}>
                {g.name.split(" ").map(n=>n[0]).join("")}
              </div>
              <div style={{flex:1}}>
                <div style={{fontSize:13,fontWeight:800,marginBottom:1}}>{g.name}{g.vip&&<span style={{...css.tag(T.gold),marginLeft:5,fontSize:8}}>VIP</span>}</div>
                <div style={{fontSize:11,color:T.sub}}>{g.phone} · {g.idType}: {g.idNo}</div>
                <div style={{fontSize:10,color:T.muted}}>{g.stays} stays{g.customRate?` · Custom: ${fmt(g.customRate)}/n`:""}</div>
              </div>
              <span style={{color:T.accent,fontSize:18}}>›</span>
            </div>
          ))}
        </>)}

        {step===2&&selectedGuest&&(<>
          <div style={{...css.card,background:T.accent+"11",border:`1px solid ${T.accent}33`,marginBottom:12,display:"flex",gap:10,alignItems:"center"}}>
            <div style={{width:34,height:34,borderRadius:"50%",background:T.accent+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:T.accent,flexShrink:0}}>{selectedGuest.name.split(" ").map(n=>n[0]).join("")}</div>
            <div style={{flex:1}}><div style={{fontSize:13,fontWeight:800}}>{selectedGuest.name}</div><div style={{fontSize:11,color:T.sub}}>{selectedGuest.id==="__new__"?"New Guest":"From portfolio"}</div></div>
            <button onClick={()=>setStep(1)} style={{background:"none",border:"none",color:T.accent,fontSize:11,cursor:"pointer",fontWeight:700}}>Change</button>
          </div>
          {selectedGuest.id==="__new__"&&(
            <div style={{...css.card,background:T.surface,marginBottom:12}}>
              <SLbl c="New Guest Details"/>
              {[{l:"Full Name",k:"name"},{l:"Phone",k:"phone"},{l:"CNIC / Passport",k:"idNo"},{l:"Nationality",k:"nationality"}].map(f=>(
                <div key={f.k} style={{marginBottom:10}}><Lbl c={f.l}/><input value={selectedGuest[f.k]||""} onChange={e=>setSelectedGuest(g=>({...g,[f.k]:e.target.value}))} style={css.input}/></div>
              ))}
            </div>
          )}
          <div style={{marginBottom:12}}><Lbl c="Room *"/>
            <select value={selectedRoom} onChange={e=>setSelectedRoom(e.target.value)} style={css.input}>
              <option value="">Select available room</option>
              {availRooms.map(r=><option key={r.id} value={r.id}>Room {r.id} — {r.category} {r.bedType} ({fmt(effectiveRate(r))}/n)</option>)}
            </select>
          </div>
          <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:10,marginBottom:12}}>
            <div><Lbl c="Check-In *"/><input type="date" value={form.checkIn} onChange={e=>setForm(f=>({...f,checkIn:e.target.value}))} style={css.input}/></div>
            <div><Lbl c="Check-Out *"/><input type="date" value={form.checkOut} onChange={e=>setForm(f=>({...f,checkOut:e.target.value}))} style={css.input}/></div>
          </div>
          <div style={{marginBottom:12}}><Lbl c="Custom Rate (PKR/night — blank = standard)"/><input type="number" value={form.customRate} onChange={e=>setForm(f=>({...f,customRate:e.target.value}))} placeholder={selRoom?`Standard: ${fmt(effectiveRate(selRoom))}`:""} style={css.input}/></div>
          <div style={{marginBottom:12}}><Lbl c="Source"/>
            <select value={form.source} onChange={e=>setForm(f=>({...f,source:e.target.value}))} style={css.input}>
              {["Direct","OTA","Corporate","Walk-in","Phone"].map(s=><option key={s}>{s}</option>)}
            </select>
          </div>
          <div style={{marginBottom:12}}><Lbl c="Notes"/><input value={form.notes} onChange={e=>setForm(f=>({...f,notes:e.target.value}))} placeholder="Special requests…" style={css.input}/></div>
          {selRoom&&form.checkOut&&(<div style={{...css.card,background:T.surface,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",marginBottom:4}}><span style={{fontSize:11,color:T.muted}}>Room {selectedRoom} × {nights} nights</span><span style={{fontWeight:700,color:T.gold}}>{fmt(total)}</span></div>
            <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:11,color:T.muted}}>With 16% GST</span><span style={{fontWeight:700,color:T.accent}}>{fmt(Math.round(total*1.16))}</span></div>
          </div>)}
          <div style={{display:"flex",gap:10}}>
            <button onClick={()=>setStep(1)} style={{...css.btn(T.border),flex:1,color:T.muted}}>← Back</button>
            <button onClick={doConfirm} disabled={!selectedRoom||!form.checkOut} style={{...css.btn(!selectedRoom||!form.checkOut?T.border:T.green),flex:2,color:!selectedRoom||!form.checkOut?T.muted:"#fff",padding:"12px"}}>✓ Confirm Check-In</button>
          </div>
        </>)}
      </div>
    </div>
  );
}

// ── Login ──────────────────────────────────────────────────────────────────────
function LoginScreen({users,onLogin}){
  const [u,setU]=useState(""); const [p,setP]=useState(""); const [err,setErr]=useState("");
  const go=()=>{ const user=users.find(x=>x.username===u&&x.password===p&&x.active); if(user)onLogin(user); else setErr("Invalid credentials"); };
  return <div style={{minHeight:"100dvh",background:T.bg,display:"flex",alignItems:"center",justifyContent:"center",padding:20}}>
    <div style={{...css.card,width:"100%",maxWidth:360,padding:32}}>
      <div style={{textAlign:"center",marginBottom:28}}>
        <div style={{width:52,height:52,borderRadius:14,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,fontWeight:900,color:"#fff",margin:"0 auto 12px"}}>G</div>
        <div style={{fontSize:20,fontWeight:900}}>Grand Meridian</div>
        <div style={{fontSize:11,color:T.muted,textTransform:"uppercase",letterSpacing:"0.1em",marginTop:2}}>Hotel PMS</div>
      </div>
      <Lbl c="Username"/><input value={u} onChange={e=>setU(e.target.value)} placeholder="username" style={{...css.input,marginBottom:12}} onKeyDown={e=>e.key==="Enter"&&go()}/>
      <Lbl c="Password"/><input type="password" value={p} onChange={e=>setP(e.target.value)} placeholder="password" style={{...css.input,marginBottom:20}} onKeyDown={e=>e.key==="Enter"&&go()}/>
      {err&&<div style={{fontSize:11,color:T.red,marginBottom:12,textAlign:"center"}}>{err}</div>}
      <button onClick={go} style={{...css.btn(T.accent),width:"100%",padding:"12px",fontSize:14}}>Login</button>
      <div style={{fontSize:10,color:T.muted,textAlign:"center",marginTop:14}}>Default: bobby / admin123</div>
    </div>
  </div>;
}

// ── MAIN ──────────────────────────────────────────────────────────────────────
const ALL_TABS=[
  {id:"dashboard",icon:"⊞",label:"Home",perm:"dashboard"},
  {id:"rooms",icon:"🏨",label:"Rooms",perm:"rooms"},
  {id:"bookings",icon:"📋",label:"Bookings",perm:"bookings"},
  {id:"guests",icon:"👤",label:"Guests",perm:"guests"},
  {id:"kitchen",icon:"🍽",label:"Kitchen",perm:"kitchen"},
  {id:"employees",icon:"👥",label:"Staff",perm:"employees"},
  {id:"accounts",icon:"💰",label:"Accounts",perm:"accounts"},
  {id:"reports",icon:"📊",label:"Reports",perm:"reports"},
  {id:"users",icon:"🔑",label:"Users",perm:"users"},
  {id:"settings",icon:"⚙️",label:"Settings",perm:"settings"},
];

export default function HotelPMS(){
  const [data,setDataRaw]=useState(loadData);
  const setData=d=>{setDataRaw(d);saveData(d);};
  const upd=fn=>{const d=JSON.parse(JSON.stringify(data));fn(d);setData(d);};
  const [currentUser,setCurrentUser]=useState(null);
  const [tab,setTab]=useState("dashboard");
  const [toast,setToast]=useState(null);
  const [sheet,setSheet]=useState(null);
  const [form,setForm]=useState({});
  const [detail,setDetail]=useState(null);
  const [koForm,setKoForm]=useState({room:"",items:{}});
  const [roomModal,setRoomModal]=useState(null);
  const [quickCI,setQuickCI]=useState(false);
  const [quickCIRoom,setQuickCIRoom]=useState(null);
  const [printDoc,setPrintDoc]=useState(null);
  const [globalCiOpts,setGlobalCiOpts]=useState({taxable:true,breakfast:false});
  // wire global setter so printWindow() can reach state
  _setPrintDoc = setPrintDoc;

  const flash=(msg,err=false)=>{setToast({msg,err});setTimeout(()=>setToast(null),3500);};
  const hasPerm=p=>currentUser?.isAdmin||currentUser?.permissions?.includes(p);
  const taxRate=data.settings?.taxRate||16;
  const hn=data.settings?.hotelName||HOTEL.name;

  if(!currentUser) return <LoginScreen users={data.users} onLogin={u=>{setCurrentUser(u);setTab("dashboard");}}/>;

  const occupied=data.rooms.filter(r=>r.status==="occupied").length;
  const revenue=data.accounts.transactions.filter(t=>t.type==="income").reduce((s,t)=>s+t.amount,0);
  const expenses=data.accounts.transactions.filter(t=>t.type==="expense").reduce((s,t)=>s+t.amount,0);
  const profit=revenue-expenses;
  const occRate=Math.round((occupied/data.rooms.length)*100);

  const doCheckin=bId=>upd(d=>{
    const b=d.bookings.find(x=>x.id===bId); if(!b)return;
    const r=d.rooms.find(x=>x.id===b.room); if(!r)return;
    b.status="checked-in"; b.paid=true;
    r.status="occupied"; r.guest=b.guest; r.checkIn=b.checkIn; r.checkOut=b.checkOut; r.guestId=b.guestId; r.bkId=b.id;
    flash(`${b.guest} checked in → Room ${b.room}`); setRoomModal(null);
    if(d.settings?.waNotifications) setTimeout(()=>sendWA(d.settings,`✅ *CHECK-IN*\nGuest: ${b.guest}\nRoom: ${b.room} (${b.category} – ${b.bedType})\n${b.checkIn} → ${b.checkOut}\nRate: ${fmt(b.customRate||b.baseRate)}/night`),500);
  });

  const doCheckout=bId=>upd(d=>{
    const b=d.bookings.find(x=>x.id===bId); if(!b)return;
    const {grand}=calcBill(b,d.kitchenOrders,taxRate);
    b.status="checked-out";
    const r=d.rooms.find(x=>x.id===b.room); if(r){r.status="cleaning";r.guest=null;r.checkIn=null;r.checkOut=null;r.guestId=null;r.bkId=null;}
    const g=d.guests.find(x=>x.id===b.guestId); if(g){g.stays++;g.totalSpent+=grand;}
    flash(`${b.guest} checked out. Room queued for cleaning.`); setRoomModal(null);
    if(d.settings?.waNotifications) setTimeout(()=>sendWA(d.settings,`🔴 *CHECK-OUT*\nGuest: ${b.guest}\nRoom: ${b.room}\nTotal Bill: ${fmt(grand)}`),500);
  });

  const doMarkClean=rId=>upd(d=>{ const r=d.rooms.find(x=>x.id===rId); if(r)r.status="available"; flash(`Room ${rId} available`); setRoomModal(null); });

  // ── FIXED: Kitchen order submission – correctly finds booking by room + status
  const doSubmitKO=()=>{
    if(!koForm.room) return flash("Select a room",true);
    const roomId=parseInt(koForm.room);
    // Find the active booking for this room
    const bk=data.bookings.find(b=>b.room===roomId&&b.status==="checked-in");
    if(!bk) return flash("No checked-in guest in this room",true);
    const items=Object.entries(koForm.items).filter(([,q])=>q>0).map(([id,qty])=>{ const m=MENU_ITEMS.find(x=>x.id===id); return{name:m.name,qty,price:m.price}; });
    if(items.length===0) return flash("Add at least one item",true);
    const total=items.reduce((s,i)=>s+i.qty*i.price,0);
    const id="KO-"+String(data.kitchenOrders.length+1).padStart(3,"0");
    const now=new Date(); const time=`${String(now.getHours()).padStart(2,"0")}:${String(now.getMinutes()).padStart(2,"0")}`;
    upd(d=>{
      // Add order with correct bkId
      d.kitchenOrders.push({id,room:roomId,guest:bk.guest,bkId:bk.id,items,total,date:TODAY,time,status:"preparing",postedToBill:true});
      // Add transaction
      d.accounts.transactions.push({id:`TX-${Date.now()}`,date:TODAY,desc:`Kitchen ${id} – Room ${roomId} (${bk.guest})`,type:"income",amount:total,category:"F&B Revenue",ref:id});
      flash(`✓ ${id} placed & posted to Room ${roomId} bill (${bk.guest})`);
      setKoForm({room:"",items:{}});
      setSheet(null);
    });
  };

  const doQuickCheckin=({guest,room,form:f})=>{
    const r=data.rooms.find(x=>x.id===room); if(!r)return;
    const nights=Math.max(1,Math.round((new Date(f.checkOut)-new Date(f.checkIn))/86400000));
    const cr=f.customRate?parseInt(f.customRate):null;
    const rate=cr||effectiveRate(r);
    const total=rate*nights;
    const bkId="BK-"+String(data.bookings.length+1).padStart(3,"0");
    let guestId=guest.id;
    upd(d=>{
      if(guest.id==="__new__"){
        guestId="G-"+String(d.guests.length+1).padStart(3,"0");
        d.guests.push({id:guestId,name:guest.name,email:guest.email||"",phone:guest.phone||"",nationality:guest.nationality||"",idType:guest.idType||"CNIC",idNo:guest.idNo||"",dob:"",vip:false,stays:0,totalSpent:0,notes:"",tags:["New"],customRate:cr});
      }
      d.bookings.push({id:bkId,guest:guest.name,guestId,room:r.id,category:r.category,bedType:r.bedType,baseRate:r.baseRate,customRate:cr,nights,extraCharges:[],paid:true,status:"checked-in",source:f.source||"Direct",notes:f.notes||"",checkIn:f.checkIn,checkOut:f.checkOut});
      const rr=d.rooms.find(x=>x.id===r.id);
      rr.status="occupied"; rr.guest=guest.name; rr.checkIn=f.checkIn; rr.checkOut=f.checkOut; rr.guestId=guestId; rr.bkId=bkId;
      d.accounts.transactions.push({id:`TX-${Date.now()}`,date:f.checkIn,desc:`Room ${r.id} – ${guest.name} (${nights}n)`,type:"income",amount:total,category:"Room Revenue",ref:bkId});
      flash(`✓ ${guest.name} checked in → Room ${r.id}`);
      if(d.settings?.waNotifications) setTimeout(()=>sendWA(d.settings,`✅ *CHECK-IN*\nGuest: ${guest.name}\nRoom: ${r.id} (${r.category} – ${r.bedType})\n${f.checkIn} → ${f.checkOut}\nRate: ${fmt(rate)}/night`),500);
    });
    setQuickCI(false); setQuickCIRoom(null);
  };

  const doNewBooking=()=>{
    const {guest,room,checkIn,checkOut,source,notes,customRate}=form;
    if(!guest||!room||!checkIn||!checkOut) return flash("Fill all required fields",true);
    const r=data.rooms.find(x=>x.id===parseInt(room)); if(!r) return flash("Room not found",true);
    const nights=Math.max(1,Math.round((new Date(checkOut)-new Date(checkIn))/86400000));
    const cr=customRate?parseInt(customRate):null;
    const id="BK-"+String(data.bookings.length+1).padStart(3,"0");
    upd(d=>{
      d.bookings.push({id,guest,guestId:"",room:r.id,category:r.category,bedType:r.bedType,baseRate:r.baseRate,customRate:cr,nights,extraCharges:[],paid:false,status:"confirmed",source:source||"Direct",notes:notes||"",checkIn,checkOut});
      d.rooms.find(x=>x.id===r.id).status="reserved";
      d.accounts.transactions.push({id:`TX-${Date.now()}`,date:checkIn,desc:`Room ${r.id} – ${guest} (${nights}n)`,type:"income",amount:(cr||r.baseRate)*nights,category:"Room Revenue",ref:id});
      flash(`${id} created`); setSheet(null); setForm({});
    });
  };

  const doAddGuest=()=>{
    const {name,email,phone,nationality,idType,idNo,dob,customRate}=form;
    if(!name||!email) return flash("Name and email required",true);
    const id="G-"+String(data.guests.length+1).padStart(3,"0");
    upd(d=>{ d.guests.push({id,name,email,phone:phone||"",nationality:nationality||"",idType:idType||"CNIC",idNo:idNo||"",dob:dob||"",vip:false,stays:0,totalSpent:0,notes:"",tags:["New"],customRate:customRate?parseInt(customRate):null}); flash(`Guest added: ${name}`); setSheet(null); setForm({}); });
  };

  const doAddTx=()=>{
    const {desc,type,amount,category}=form;
    if(!desc||!type||!amount) return flash("Fill all fields",true);
    upd(d=>{ d.accounts.transactions.push({id:`TX-${Date.now()}`,date:TODAY,desc,type,amount:parseFloat(amount),category:category||"Other",ref:""}); flash("Transaction recorded"); setSheet(null); setForm({}); });
  };

  const doAddEmployee=()=>{
    const {name,role,dept,phone,email,shift,salary}=form;
    if(!name||!role||!dept) return flash("Fill required fields",true);
    const id="E-"+String(data.employees.length+1).padStart(3,"0");
    upd(d=>{ d.employees.push({id,name,role,dept,phone:phone||"",email:email||"",shift:shift||"Morning",status:"active",since:TODAY,salary:parseInt(salary)||0}); flash(`Staff added: ${name}`); setSheet(null); setForm({}); });
  };

  const doAddUser=()=>{
    const {username,password,name,role,permissions}=form;
    if(!username||!password||!name) return flash("Fill all fields",true);
    if(data.users.find(u=>u.username===username)) return flash("Username exists",true);
    const id="U-"+String(data.users.length+1).padStart(3,"0");
    upd(d=>{ d.users.push({id,username,password,name,role:role||"Staff",isAdmin:false,permissions:Array.isArray(permissions)?permissions:[],active:true,createdBy:currentUser.username}); flash(`User created: ${username}`); setSheet(null); setForm({}); });
  };

  const doUpdateRates=()=>{
    const {category,bedType,newRate}=form; if(!category||!bedType||!newRate) return;
    upd(d=>{ d.rooms.filter(r=>r.category===category&&r.bedType===bedType).forEach(r=>r.baseRate=parseInt(newRate)); if(!d.settings.customRates)d.settings.customRates={}; if(!d.settings.customRates[category])d.settings.customRates[category]={}; d.settings.customRates[category][bedType]=parseInt(newRate); flash(`Rate updated`); setSheet(null); setForm({}); });
  };

  const markKOServed=koId=>upd(d=>{ const k=d.kitchenOrders.find(x=>x.id===koId); if(k)k.status="served"; flash("Marked served"); });
  const togglePerm=p=>setForm(f=>({...f,permissions:(f.permissions||[]).includes(p)?(f.permissions||[]).filter(x=>x!==p):[...(f.permissions||[]),p]}));

  // Print helpers (booking-based)
  const pCI=bId=>{ const b=data.bookings.find(x=>x.id===bId); const g=data.guests.find(x=>x.id===b?.guestId)||{name:b?.guest||"",nationality:"",idType:"",idNo:"",phone:"",email:"",dob:""}; printWindow(printCheckinCardHTML(b,g,hn,globalCiOpts)); };
  const pBill=(bId,wt)=>{ const b=data.bookings.find(x=>x.id===bId); const g=data.guests.find(x=>x.id===b?.guestId)||{name:b?.guest||"",idNo:""}; printWindow(printBillHTML(b,g,data.kitchenOrders,wt,taxRate,hn)); };
  const pSummary=bId=>{ const b=data.bookings.find(x=>x.id===bId); const g=data.guests.find(x=>x.id===b?.guestId)||{name:b?.guest||"",nationality:"",idType:"",idNo:"",phone:"",email:"",notes:""}; printWindow(printRoomSummaryHTML(b,g,data.kitchenOrders,taxRate,hn)); };
  const pDayEnd=()=>printWindow(printDayEndHTML(data,TODAY));

  const roomModalBk=roomModal?data.bookings.find(b=>(b.id===roomModal.bkId)||(b.room===roomModal.id&&(b.status==="checked-in"||b.status==="confirmed"))):null;
  const roomModalGuest=roomModal?data.guests.find(g=>g.id===roomModal.guestId):null;

  const visibleTabs=ALL_TABS.filter(t=>hasPerm(t.perm));

  return (
    <div style={{fontFamily:"'DM Sans',system-ui,sans-serif",background:T.bg,minHeight:"100dvh",color:T.text,paddingBottom:60}}>
      <Toast t={toast}/>

      <PrintPreviewModal doc={printDoc} onClose={()=>setPrintDoc(null)}/>
      <RoomModal room={roomModal} booking={roomModalBk} guest={roomModalGuest} kitchenOrders={data.kitchenOrders} taxRate={taxRate} hotelName={hn}
        hasPerm={hasPerm} onClose={()=>setRoomModal(null)}
        onCheckin={()=>roomModalBk&&doCheckin(roomModalBk.id)}
        onCheckout={()=>roomModalBk&&doCheckout(roomModalBk.id)}
        onMarkClean={()=>doMarkClean(roomModal.id)}
        onDirectCheckin={()=>{setQuickCIRoom(roomModal.id);setRoomModal(null);setQuickCI(true);}}
      />

      <QuickCheckinSheet open={quickCI} onClose={()=>{setQuickCI(false);setQuickCIRoom(null);}} rooms={data.rooms} guests={data.guests} onConfirm={doQuickCheckin} preSelectedRoom={quickCIRoom}/>

      {/* Header */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,padding:"11px 14px",display:"flex",alignItems:"center",justifyContent:"space-between",position:"sticky",top:0,zIndex:200}}>
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          <div style={{width:32,height:32,borderRadius:8,background:T.accent,display:"flex",alignItems:"center",justifyContent:"center",fontSize:14,fontWeight:900,color:"#fff"}}>G</div>
          <div><div style={{fontWeight:900,fontSize:14}}>Grand Meridian</div><div style={{fontSize:9,color:T.muted,letterSpacing:"0.16em",textTransform:"uppercase"}}>Cloud PMS</div></div>
        </div>
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <span style={{fontSize:10,color:T.muted}}>{currentUser.name}</span>
          {currentUser.isAdmin&&<span style={{...css.tag(T.gold),fontSize:8}}>ADMIN</span>}
          <button onClick={()=>setCurrentUser(null)} style={{...css.btn(T.border),color:T.muted,padding:"5px 10px",fontSize:11}}>Out</button>
        </div>
      </div>

      {/* Tab bar */}
      <div style={{background:T.surface,borderBottom:`1px solid ${T.border}`,overflowX:"auto",display:"flex",scrollbarWidth:"none"}}>
        {visibleTabs.map(t=>(
          <button key={t.id} onClick={()=>setTab(t.id)} style={{flexShrink:0,display:"flex",flexDirection:"column",alignItems:"center",gap:2,padding:"8px 11px",background:"none",border:"none",cursor:"pointer",color:tab===t.id?T.accent:T.muted,borderBottom:tab===t.id?`2px solid ${T.accent}`:"2px solid transparent",fontSize:9,fontFamily:"inherit",fontWeight:700,letterSpacing:"0.06em",textTransform:"uppercase",marginBottom:-1}}>
            <span style={{fontSize:15}}>{t.icon}</span>{t.label}
          </button>
        ))}
      </div>

      <div style={{padding:14,maxWidth:560,margin:"0 auto"}}>

        {tab==="dashboard"&&hasPerm("dashboard")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div><div style={{fontSize:17,fontWeight:900,marginBottom:2}}>Good morning 👋</div><div style={{fontSize:12,color:T.sub}}>April 20, 2026</div></div>
            {hasPerm("checkin")&&<button onClick={()=>{setQuickCIRoom(null);setQuickCI(true);}} style={{...css.btn(T.green),padding:"10px 18px",borderRadius:12,fontSize:13,boxShadow:`0 4px 20px ${T.green}44`}}>⚡ Check In</button>}
          </div>
          <div style={{display:"flex",gap:10,marginBottom:10}}>
            <KPI label="Occupancy" value={`${occRate}%`} color={T.accent} sub={`${occupied}/${data.rooms.length} rooms`}/>
            <KPI label="Net Profit" value={fmt(profit)} color={profit>=0?T.green:T.red}/>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:14}}>
            <KPI label="Revenue" value={fmt(revenue)} color={T.gold}/>
            <KPI label="Active Bkgs" value={data.bookings.filter(b=>b.status!=="checked-out").length} color={T.purple}/>
          </div>
          <div style={{...css.card,marginBottom:14}}>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:8}}>
              <Lbl c="Live Room Map — tap to view & act"/>
              <span style={{fontSize:11,color:T.accent,fontWeight:700}}>{occRate}% occ.</span>
            </div>
            <div style={{height:4,background:T.border,borderRadius:2,marginBottom:10}}><div style={{height:"100%",width:`${occRate}%`,background:`linear-gradient(90deg,${T.accent},${T.purple})`,borderRadius:2}}/></div>
            <div style={{display:"flex",flexWrap:"wrap",gap:5,marginBottom:8}}>
              {Object.entries(SC).map(([s,c])=><span key={s} style={{fontSize:9,color:T.muted,display:"flex",alignItems:"center",gap:3}}><span style={{width:7,height:7,borderRadius:"50%",background:c,display:"inline-block"}}/>{s}</span>)}
            </div>
            {[{fl:1,label:"F1 · Deluxe"},{fl:2,label:"F2 · Executive"},{fl:3,label:"F3 · Standard"}].map(({fl,label})=>(
              <div key={fl} style={{marginBottom:10}}>
                <div style={{fontSize:9,color:T.muted,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em",marginBottom:5}}>{label}</div>
                <div style={{display:"flex",flexWrap:"wrap",gap:5}}>
                  {data.rooms.filter(r=>r.floor===fl).map(r=>(
                    <button key={r.id} onClick={()=>setRoomModal(r)} style={{width:42,padding:"6px 2px",borderRadius:7,textAlign:"center",background:SC[r.status]+"18",border:`1px solid ${SC[r.status]}44`,cursor:"pointer",outline:"none",WebkitTapHighlightColor:"transparent"}}>
                      <div style={{fontSize:10,fontWeight:800,color:SC[r.status]}}>{r.id}</div>
                      <div style={{fontSize:7,color:T.muted,textTransform:"capitalize",marginTop:1}}>{r.status.slice(0,3)}</div>
                    </button>
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div style={css.card}>
            <SLbl c="Upcoming Check-Ins"/>
            {data.bookings.filter(b=>b.status==="confirmed").length===0
              ?<div style={{fontSize:12,color:T.muted}}>No pending arrivals</div>
              :data.bookings.filter(b=>b.status==="confirmed").map(b=>(
                <div key={b.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"9px 0",borderBottom:`1px solid ${T.border}`}}>
                  <div><div style={{fontSize:13,fontWeight:700}}>{b.guest}</div><div style={{fontSize:11,color:T.sub}}>Rm {b.room} · {b.category} · {b.nights}n · {b.checkIn}</div></div>
                  {hasPerm("checkin")&&<button onClick={()=>doCheckin(b.id)} style={{...css.btn(T.green+"22"),color:T.green,border:`1px solid ${T.green}44`}}>✓ In</button>}
                </div>
              ))
            }
          </div>
        </>)}

        {tab==="rooms"&&hasPerm("rooms")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>Rooms ({data.rooms.length})</div>
            {hasPerm("rates")&&<button onClick={()=>{setForm({category:"Deluxe",bedType:"Single"});setSheet("updateRate");}} style={{...css.btn(T.gold+"22"),color:T.gold,border:`1px solid ${T.gold}44`,fontSize:11}}>✏ Rates</button>}
          </div>
          <div style={{...css.card,marginBottom:14,overflowX:"auto"}}>
            <SLbl c="Rates (before 16% GST)"/>
            <table style={{width:"100%",borderCollapse:"collapse",fontSize:11}}>
              <thead><tr>{["Category","Single","Twin","Triple"].map(h=><th key={h} style={{padding:"5px 6px",textAlign:"left",color:T.muted,fontWeight:700,borderBottom:`1px solid ${T.border}`}}>{h}</th>)}</tr></thead>
              <tbody>{["Deluxe","Executive","Standard"].map(cat=>(
                <tr key={cat}><td style={{padding:"6px",fontWeight:700}}>{cat}</td>
                  {["Single","Twin","Triple"].map(bt=>{ const base=data.settings?.customRates?.[cat]?.[bt]||ROOM_RATES[cat][bt]; return <td key={bt} style={{padding:"6px"}}><div style={{fontWeight:700,color:T.gold,fontSize:11}}>{fmt(base)}</div><div style={{fontSize:9,color:T.muted}}>+GST: {fmt(Math.round(base*1.16))}</div></td>; })}
                </tr>
              ))}</tbody>
            </table>
          </div>
          {[{fl:1,cat:"Deluxe",c:T.accent},{fl:2,cat:"Executive",c:T.gold},{fl:3,cat:"Standard",c:T.purple}].map(({fl,cat,c})=>(
            <div key={fl} style={{marginBottom:18}}>
              <SLbl c={`Floor ${fl} · ${cat}`}/>
              <div style={{display:"grid",gridTemplateColumns:"1fr 1fr",gap:8}}>
                {data.rooms.filter(r=>r.floor===fl).map(r=>(
                  <div key={r.id} onClick={()=>setRoomModal(r)} style={{...css.card,padding:12,borderColor:SC[r.status]+"44",cursor:"pointer"}}>
                    <div style={{display:"flex",justifyContent:"space-between",marginBottom:5}}><div style={{fontSize:16,fontWeight:900}}>#{r.id}</div><Badge s={r.status}/></div>
                    <div style={{fontSize:10,color:T.sub,marginBottom:3}}>{r.bedType} Bed</div>
                    <div style={{fontSize:11,color:c,fontWeight:700}}>{fmt(effectiveRate(r))}<span style={{fontSize:9,color:T.muted}}>/n</span></div>
                    {r.guest&&<div style={{fontSize:10,color:T.accent,marginTop:3}}>👤 {r.guest.split(" ")[0]}</div>}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </>)}

        {tab==="bookings"&&hasPerm("bookings")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:10}}>
            <div style={{fontSize:17,fontWeight:900}}>Reservations</div>
            <button onClick={()=>{setForm({source:"Direct"});setSheet("newBooking");}} style={css.btn(T.accent)}>+ New</button>
          </div>
          {/* Check-In Card global options */}
          <div style={{...css.card,background:T.surface,marginBottom:12,padding:10}}>
            <div style={{fontSize:10,color:T.muted,marginBottom:7,fontWeight:700,textTransform:"uppercase",letterSpacing:"0.1em"}}>📋 Check-In Card Options</div>
            <div style={{display:"flex",gap:8,marginBottom:7}}>
              <button onClick={()=>setGlobalCiOpts(o=>({...o,taxable:true}))} style={{flex:1,padding:"6px",background:globalCiOpts.taxable?T.accent+"33":T.surface,border:`1px solid ${globalCiOpts.taxable?T.accent:T.border}`,borderRadius:7,color:globalCiOpts.taxable?T.accent:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Taxable GST 16%</button>
              <button onClick={()=>setGlobalCiOpts(o=>({...o,taxable:false}))} style={{flex:1,padding:"6px",background:!globalCiOpts.taxable?T.purple+"33":T.surface,border:`1px solid ${!globalCiOpts.taxable?T.purple:T.border}`,borderRadius:7,color:!globalCiOpts.taxable?T.purple:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>Non-Taxable</button>
            </div>
            <button onClick={()=>setGlobalCiOpts(o=>({...o,breakfast:!o.breakfast}))} style={{width:"100%",padding:"6px",background:globalCiOpts.breakfast?T.green+"33":T.surface,border:`1px solid ${globalCiOpts.breakfast?T.green:T.border}`,borderRadius:7,color:globalCiOpts.breakfast?T.green:T.muted,cursor:"pointer",fontFamily:"inherit",fontSize:11,fontWeight:700}}>
              {globalCiOpts.breakfast?"☕ Comp. Breakfast: ON (tap to remove)":"☕ Comp. Breakfast: OFF (tap to add)"}
            </button>
          </div>
          {data.bookings.map(b=>{
            const rate=b.customRate||b.baseRate;
            const kc=data.kitchenOrders.filter(k=>k.bkId===b.id&&k.postedToBill).reduce((s,k)=>s+k.total,0);
            const sub=rate*b.nights+(b.extraCharges||[]).reduce((s,e)=>s+e.amount,0)+kc;
            return <div key={b.id} style={{...css.card,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}><div><div style={{fontSize:14,fontWeight:800}}>{b.guest}</div><div style={{fontSize:11,color:T.sub}}>{b.id} · Rm {b.room} · {b.category}</div></div><Badge s={b.status}/></div>
              <div style={{fontSize:11,color:T.sub,marginBottom:4}}>📅 {b.checkIn} → {b.checkOut} · {b.nights}n</div>
              <div style={{fontSize:11,marginBottom:8}}>
                <span style={{color:T.gold,fontWeight:700}}>{fmt(rate)}/n</span>
                {kc>0&&<span style={{color:T.green,marginLeft:8}}>+F&B {fmt(kc)}</span>}
                <span style={{color:T.muted,marginLeft:8}}>Sub: {fmt(sub)} | +GST: {fmt(Math.round(sub*1.16))}</span>
              </div>
              <div style={{display:"flex",gap:6,flexWrap:"wrap"}}>
                {b.status==="confirmed"&&hasPerm("checkin")&&<button onClick={()=>doCheckin(b.id)} style={{...css.btn(T.green+"22"),color:T.green,border:`1px solid ${T.green}44`}}>✓ Check In</button>}
                {b.status==="confirmed"&&<button onClick={()=>pCI(b.id)} style={{...css.btn(T.border),color:T.sub,fontSize:11}}>📋 Card</button>}
                {b.status==="checked-in"&&hasPerm("checkout")&&<button onClick={()=>doCheckout(b.id)} style={{...css.btn(T.red+"22"),color:T.red,border:`1px solid ${T.red}44`}}>✗ Check Out</button>}
                {(b.status==="checked-in"||b.status==="checked-out")&&<>
                  <button onClick={()=>pCI(b.id)} style={{...css.btn(T.border),color:T.sub,fontSize:11}}>📋 Card</button>
                  <button onClick={()=>pSummary(b.id)} style={{...css.btn(T.purple+"22"),color:T.purple,fontSize:11,border:`1px solid ${T.purple}44`}}>📊 Summary</button>
                  <button onClick={()=>pBill(b.id,true)} style={{...css.btn(T.gold+"22"),color:T.gold,fontSize:11,border:`1px solid ${T.gold}44`}}>🧾 +GST</button>
                  <button onClick={()=>pBill(b.id,false)} style={{...css.btn(T.green+"22"),color:T.green,fontSize:11,border:`1px solid ${T.green}44`}}>📄 No Tax</button>
                </>}
              </div>
            </div>;
          })}
        </>)}

        {tab==="guests"&&hasPerm("guests")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>Guest Portfolios</div>
            <button onClick={()=>{setForm({idType:"CNIC"});setSheet("addGuest");}} style={css.btn(T.accent)}>+ Add</button>
          </div>
          {data.guests.map(g=>(
            <div key={g.id} onClick={()=>setDetail(detail?.id===g.id?null:{type:"guest",id:g.id})} style={{...css.card,marginBottom:10,cursor:"pointer"}}>
              <div style={{display:"flex",gap:12,alignItems:"center"}}>
                <div style={{width:40,height:40,borderRadius:"50%",background:g.vip?T.gold+"22":T.accent+"22",border:`2px solid ${g.vip?T.gold:T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:g.vip?T.gold:T.accent,flexShrink:0}}>{g.name.split(" ").map(n=>n[0]).join("")}</div>
                <div style={{flex:1}}>
                  <div style={{display:"flex",alignItems:"center",gap:5,marginBottom:2}}><span style={{fontSize:13,fontWeight:800}}>{g.name}</span>{g.vip&&<span style={{...css.tag(T.gold),fontSize:8}}>VIP</span>}</div>
                  <div style={{fontSize:11,color:T.sub}}>{g.phone} · {g.idType}: {g.idNo}</div>
                  <div style={{fontSize:10,color:T.muted,marginTop:1}}>{g.stays} stays · {fmt(g.totalSpent)}{g.customRate?` · Rate: ${fmt(g.customRate)}/n`:""}</div>
                </div>
                <span style={{color:T.muted}}>{detail?.id===g.id?"↓":"›"}</span>
              </div>
              {detail?.id===g.id&&<div style={{marginTop:12,paddingTop:12,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:8,fontSize:11}}>
                {[["Email",g.email],["DOB",g.dob],["Nationality",g.nationality],["Notes",g.notes||"—"]].map(([k,v])=><div key={k}><span style={{color:T.muted}}>{k}: </span><span>{v}</span></div>)}
              </div>}
            </div>
          ))}
        </>)}

        {tab==="kitchen"&&hasPerm("kitchen")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>Kitchen Orders</div>
            <button onClick={()=>{setKoForm({room:"",items:{}});setSheet("newKO");}} style={css.btn(T.accent)}>+ Order</button>
          </div>
          {data.kitchenOrders.length===0&&<div style={{fontSize:12,color:T.muted}}>No orders yet.</div>}
          {[...data.kitchenOrders].reverse().map(k=>(
            <div key={k.id} style={{...css.card,marginBottom:10}}>
              <div style={{display:"flex",justifyContent:"space-between",marginBottom:6}}>
                <div><div style={{fontSize:13,fontWeight:800}}>Room {k.room} · {k.guest}</div><div style={{fontSize:10,color:T.sub}}>{k.id} · {k.date} {k.time}</div></div>
                <span style={{...css.tag(k.status==="served"?T.green:T.gold),textTransform:"capitalize"}}>{k.status}</span>
              </div>
              <div style={{fontSize:11,color:T.sub,marginBottom:6}}>{k.items.map(i=>`${i.qty}× ${i.name} (${fmt(i.price)})`).join(" · ")}</div>
              <div style={{display:"flex",justifyContent:"space-between",alignItems:"center"}}>
                <div><span style={{fontSize:15,fontWeight:800,color:T.gold}}>{fmt(k.total)}</span><span style={{fontSize:10,color:k.postedToBill?T.green:T.red,marginLeft:8,fontWeight:700}}>{k.postedToBill?"✓ On Room Bill":"Not on Bill"}</span></div>
                {k.status==="preparing"&&<button onClick={()=>markKOServed(k.id)} style={{...css.btn(T.green+"22"),color:T.green,border:`1px solid ${T.green}44`,fontSize:11}}>Mark Served</button>}
              </div>
            </div>
          ))}
        </>)}

        {tab==="employees"&&hasPerm("employees")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>Staff Directory</div>
            <button onClick={()=>{setForm({dept:"Front Office",shift:"Morning"});setSheet("addEmp");}} style={css.btn(T.accent)}>+ Add</button>
          </div>
          {["Front Office","Housekeeping","F&B","Security"].map(dept=>{
            const emps=data.employees.filter(e=>e.dept===dept); if(!emps.length)return null;
            return <div key={dept} style={{marginBottom:18}}><SLbl c={dept}/>
              {emps.map(e=>(
                <div key={e.id} onClick={()=>setDetail(detail?.id===e.id?null:{type:"emp",id:e.id})} style={{...css.card,marginBottom:8,cursor:"pointer"}}>
                  <div style={{display:"flex",gap:10,alignItems:"center"}}>
                    <div style={{width:36,height:36,borderRadius:"50%",background:T.purple+"22",border:`1px solid ${T.purple}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:11,fontWeight:900,color:T.purple,flexShrink:0}}>{e.name.split(" ").map(n=>n[0]).join("")}</div>
                    <div style={{flex:1}}><div style={{fontSize:13,fontWeight:700}}>{e.name}</div><div style={{fontSize:11,color:T.sub}}>{e.role} · {e.shift}</div></div>
                    <span style={{...css.tag(e.status==="active"?T.green:T.gold),textTransform:"capitalize"}}>{e.status}</span>
                  </div>
                  {detail?.id===e.id&&<div style={{marginTop:10,paddingTop:10,borderTop:`1px solid ${T.border}`,display:"grid",gridTemplateColumns:"1fr 1fr",gap:6,fontSize:11}}>
                    {[["Email",e.email],["Phone",e.phone],["Since",e.since],["Salary",fmt(e.salary)+"/mo"]].map(([k,v])=><div key={k}><span style={{color:T.muted}}>{k}: </span><span>{v}</span></div>)}
                  </div>}
                </div>
              ))}
            </div>;
          })}
        </>)}

        {tab==="accounts"&&hasPerm("accounts")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>Accounts</div>
            <button onClick={()=>{setForm({type:"income",category:"Room Revenue"});setSheet("addTx");}} style={css.btn(T.accent)}>+ Entry</button>
          </div>
          <div style={{display:"flex",gap:10,marginBottom:10}}><KPI label="Income" value={fmt(revenue)} color={T.green}/><KPI label="Expenses" value={fmt(expenses)} color={T.red}/></div>
          <div style={{...css.card,marginBottom:14,textAlign:"center"}}><Lbl c="Net Profit"/><div style={{fontSize:26,fontWeight:900,color:profit>=0?T.green:T.red}}>{profit>=0?"+":""}{fmt(profit)}</div></div>
          <SLbl c="Ledger"/>
          {[...data.accounts.transactions].reverse().map(tx=>(
            <div key={tx.id} style={{...css.card,marginBottom:8,display:"flex",justifyContent:"space-between",alignItems:"center"}}>
              <div><div style={{fontSize:12,fontWeight:600}}>{tx.desc}</div><div style={{fontSize:10,color:T.muted}}>{tx.date} · {tx.category}</div></div>
              <div style={{textAlign:"right"}}><div style={{fontSize:13,fontWeight:800,color:tx.type==="income"?T.green:T.red}}>{tx.type==="income"?"+":"-"}{fmt(tx.amount)}</div><div style={{fontSize:9,color:T.muted}}>{tx.id}</div></div>
            </div>
          ))}
        </>)}

        {tab==="reports"&&hasPerm("reports")&&(<>
          <div style={{fontSize:17,fontWeight:900,marginBottom:14}}>Reports & Print</div>
          {[
            {title:"Day End Summary",icon:"📊",action:pDayEnd,color:T.accent,sub:"Full daily report with occupancy, revenue & orders"},
            {title:"Bookings → Print",icon:"📋",action:()=>setTab("bookings"),color:T.green,sub:"Go to Bookings to print Check-In Card, Summary, Bills"},
          ].map(r=>(
            <div key={r.title} onClick={r.action} style={{...css.card,marginBottom:10,display:"flex",gap:14,alignItems:"center",cursor:"pointer",borderColor:r.color+"44"}}>
              <div style={{width:44,height:44,borderRadius:10,background:r.color+"22",display:"flex",alignItems:"center",justifyContent:"center",fontSize:22,flexShrink:0}}>{r.icon}</div>
              <div><div style={{fontSize:14,fontWeight:800,color:r.color,marginBottom:2}}>{r.title}</div><div style={{fontSize:11,color:T.sub}}>{r.sub}</div></div>
            </div>
          ))}
          <div style={css.card}>
            <SLbl c="Quick Stats"/>
            {[["Rooms Occupied",`${occupied}/${data.rooms.length}`],["Revenue",fmt(revenue)],["Expenses",fmt(expenses)],["Net Profit",fmt(profit)],["Kitchen Orders Today",data.kitchenOrders.filter(k=>k.date===TODAY).length],["F&B Revenue",fmt(data.kitchenOrders.filter(k=>k.date===TODAY).reduce((s,k)=>s+k.total,0))]].map(([k,v])=>(
              <div key={k} style={{display:"flex",justifyContent:"space-between",padding:"7px 0",borderBottom:`1px solid ${T.border}`,fontSize:12}}>
                <span style={{color:T.sub}}>{k}</span><span style={{fontWeight:700}}>{v}</span>
              </div>
            ))}
          </div>
        </>)}

        {tab==="users"&&hasPerm("users")&&(<>
          <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:14}}>
            <div style={{fontSize:17,fontWeight:900}}>User Management</div>
            {currentUser.isAdmin&&<button onClick={()=>{setForm({permissions:[],role:"Staff"});setSheet("addUser");}} style={css.btn(T.accent)}>+ User</button>}
          </div>
          {data.users.map(u=>(
            <div key={u.id} style={{...css.card,marginBottom:10}}>
              <div style={{display:"flex",gap:10,alignItems:"center"}}>
                <div style={{width:38,height:38,borderRadius:"50%",background:u.isAdmin?T.gold+"22":T.accent+"22",border:`2px solid ${u.isAdmin?T.gold:T.accent}44`,display:"flex",alignItems:"center",justifyContent:"center",fontSize:13,fontWeight:900,color:u.isAdmin?T.gold:T.accent,flexShrink:0}}>{u.name.slice(0,2).toUpperCase()}</div>
                <div style={{flex:1}}><div style={{display:"flex",alignItems:"center",gap:6,marginBottom:2}}><span style={{fontSize:13,fontWeight:800}}>{u.name}</span>{u.isAdmin&&<span style={{...css.tag(T.gold),fontSize:8}}>ADMIN</span>}<span style={{...css.tag(u.active?T.green:T.red),fontSize:8}}>{u.active?"Active":"Inactive"}</span></div><div style={{fontSize:11,color:T.sub}}>@{u.username} · {u.role}</div></div>
                {!u.isAdmin&&currentUser.isAdmin&&<button onClick={()=>upd(d=>{const x=d.users.find(y=>y.id===u.id);if(x)x.active=!x.active;flash(`User ${x.active?"on":"off"}`)})} style={{...css.btn(u.active?T.red+"22":T.green+"22"),color:u.active?T.red:T.green,fontSize:10,border:`1px solid ${u.active?T.red:T.green}44`}}>{u.active?"Disable":"Enable"}</button>}
              </div>
              {!u.isAdmin&&<div style={{marginTop:8,paddingTop:8,borderTop:`1px solid ${T.border}`}}><div style={{fontSize:9,color:T.muted,marginBottom:5,textTransform:"uppercase",letterSpacing:"0.1em"}}>Permissions</div><div style={{display:"flex",flexWrap:"wrap",gap:5}}>{ALL_PERMS.map(p=><span key={p} style={{...css.tag(u.permissions?.includes(p)?T.accent:T.muted),fontSize:8,textTransform:"capitalize"}}>{p}</span>)}</div></div>}
            </div>
          ))}
        </>)}

        {tab==="settings"&&hasPerm("settings")&&(<>
          <div style={{fontSize:17,fontWeight:900,marginBottom:14}}>Settings</div>
          <div style={{...css.card,marginBottom:12}}>
            <SLbl c="Hotel Information"/>
            {[{l:"Hotel Name",k:"hotelName"},{l:"Address",k:"address"},{l:"Phone",k:"phone"},{l:"Email",k:"email"}].map(f=>(
              <div key={f.k} style={{marginBottom:10}}><Lbl c={f.l}/><input value={form[f.k]!==undefined?form[f.k]:data.settings?.[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={css.input}/></div>
            ))}
            <div style={{marginBottom:10}}><Lbl c="GST Rate (%)"/><input type="number" value={form.taxRate!==undefined?form.taxRate:data.settings?.taxRate||16} onChange={e=>setForm(p=>({...p,taxRate:parseInt(e.target.value)}))} style={css.input}/></div>
            <button onClick={()=>upd(d=>{Object.assign(d.settings,form);flash("Settings saved");setForm({});})} style={{...css.btn(T.accent),width:"100%"}}>Save</button>
          </div>
          <div style={{...css.card}}>
            <SLbl c="WhatsApp Notifications"/>
            <div style={{display:"flex",justifyContent:"space-between",alignItems:"center",marginBottom:12}}>
              <div><div style={{fontSize:13,fontWeight:700}}>WA Alerts</div><div style={{fontSize:11,color:T.sub}}>Check-in & checkout notifications</div></div>
              <button onClick={()=>upd(d=>{d.settings.waNotifications=!d.settings.waNotifications;flash(`WA ${d.settings.waNotifications?"on":"off"}`)})} style={{...css.btn(data.settings?.waNotifications?T.green:T.border),color:data.settings?.waNotifications?"#fff":T.muted,padding:"7px 14px"}}>{data.settings?.waNotifications?"● ON":"○ OFF"}</button>
            </div>
            <Lbl c="WhatsApp Number"/>
            <input value={form.waNumber!==undefined?form.waNumber:data.settings?.waNumber||WA_NUMBER} onChange={e=>setForm(p=>({...p,waNumber:e.target.value}))} style={{...css.input,marginBottom:10}}/>
            <button onClick={()=>upd(d=>{if(form.waNumber!==undefined)d.settings.waNumber=form.waNumber;flash("Saved")})} style={{...css.btn(T.green+"33"),color:T.green,width:"100%",border:`1px solid ${T.green}44`}}>Save Number</button>
          </div>
        </>)}
      </div>

      {/* ── SHEETS ────────────────────────────────────────────────────── */}
      <Sheet open={sheet==="newBooking"} onClose={()=>setSheet(null)} title="New Reservation">
        {[{l:"Guest Name *",k:"guest",t:"text"},{l:"Check-In *",k:"checkIn",t:"date"},{l:"Check-Out *",k:"checkOut",t:"date"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}><Lbl c={f.l}/><input type={f.t} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={css.input}/></div>
        ))}
        <div style={{marginBottom:12}}><Lbl c="Room *"/><select value={form.room||""} onChange={e=>setForm(p=>({...p,room:e.target.value}))} style={css.input}><option value="">Select available room</option>{data.rooms.filter(r=>r.status==="available").map(r=><option key={r.id} value={r.id}>Room {r.id} — {r.category} {r.bedType} ({fmt(effectiveRate(r))}/n)</option>)}</select></div>
        <div style={{marginBottom:12}}><Lbl c="Custom Rate (PKR/night — optional)"/><input type="number" value={form.customRate||""} onChange={e=>setForm(p=>({...p,customRate:e.target.value}))} placeholder="Leave blank for standard" style={css.input}/></div>
        <div style={{marginBottom:12}}><Lbl c="Source"/><select value={form.source||"Direct"} onChange={e=>setForm(p=>({...p,source:e.target.value}))} style={css.input}>{["Direct","OTA","Corporate","Walk-in","Phone"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{marginBottom:18}}><Lbl c="Notes"/><input value={form.notes||""} onChange={e=>setForm(p=>({...p,notes:e.target.value}))} style={css.input}/></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doNewBooking} style={{...css.btn(T.accent),flex:1}}>Confirm</button></div>
      </Sheet>

      <Sheet open={sheet==="addGuest"} onClose={()=>setSheet(null)} title="Add Guest Profile">
        {[{l:"Full Name *",k:"name",t:"text"},{l:"Email *",k:"email",t:"email"},{l:"Phone",k:"phone",t:"tel"},{l:"Nationality",k:"nationality",t:"text"},{l:"Date of Birth",k:"dob",t:"date"},{l:"ID Number",k:"idNo",t:"text"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}><Lbl c={f.l}/><input type={f.t} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={css.input}/></div>
        ))}
        <div style={{marginBottom:12}}><Lbl c="ID Type"/><select value={form.idType||"CNIC"} onChange={e=>setForm(p=>({...p,idType:e.target.value}))} style={css.input}>{["CNIC","Passport","Driver's License","B-Form"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{marginBottom:18}}><Lbl c="Custom Room Rate (PKR/night — optional)"/><input type="number" value={form.customRate||""} onChange={e=>setForm(p=>({...p,customRate:e.target.value}))} placeholder="Leave blank for standard" style={css.input}/></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doAddGuest} style={{...css.btn(T.accent),flex:1}}>Save Guest</button></div>
      </Sheet>

      <Sheet open={sheet==="updateRate"} onClose={()=>setSheet(null)} title="Update Room Rates">
        <div style={{marginBottom:12}}><Lbl c="Category"/><select value={form.category||"Deluxe"} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={css.input}>{["Deluxe","Executive","Standard"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{marginBottom:12}}><Lbl c="Bed Type"/><select value={form.bedType||"Single"} onChange={e=>setForm(p=>({...p,bedType:e.target.value}))} style={css.input}>{BED_TYPES.map(s=><option key={s}>{s}</option>)}</select></div>
        {form.category&&form.bedType&&<div style={{...css.card,background:T.surface,marginBottom:12,fontSize:12}}>Current: <span style={{color:T.gold,fontWeight:700}}>{fmt(data.settings?.customRates?.[form.category]?.[form.bedType]||ROOM_RATES[form.category]?.[form.bedType]||0)}</span></div>}
        <div style={{marginBottom:18}}><Lbl c="New Rate (PKR, before GST)"/><input type="number" value={form.newRate||""} onChange={e=>setForm(p=>({...p,newRate:e.target.value}))} placeholder="e.g. 5500" style={css.input}/></div>
        {form.newRate&&<div style={{...css.card,background:T.surface,marginBottom:14,textAlign:"center"}}><div style={{fontSize:11,color:T.muted}}>With 16% GST</div><div style={{fontSize:18,fontWeight:900,color:T.gold}}>{fmt(Math.round(parseInt(form.newRate||0)*1.16))}</div></div>}
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doUpdateRates} style={{...css.btn(T.gold),flex:1,color:"#111"}}>Update</button></div>
      </Sheet>

      <Sheet open={sheet==="newKO"} onClose={()=>setSheet(null)} title="Kitchen Order">
        <div style={{marginBottom:12}}><Lbl c="Room *"/><select value={koForm.room} onChange={e=>setKoForm(p=>({...p,room:e.target.value}))} style={css.input}><option value="">Select occupied room</option>{data.rooms.filter(r=>r.status==="occupied").map(r=><option key={r.id} value={r.id}>Room {r.id} — {r.guest}</option>)}</select></div>
        {koForm.room&&!data.bookings.find(b=>b.room===parseInt(koForm.room)&&b.status==="checked-in")&&<div style={{fontSize:11,color:T.red,marginBottom:10}}>⚠ No active booking found for this room</div>}
        {["Snacks","Main","Salads","Beverages","Desserts"].map(cat=>(
          <div key={cat} style={{marginBottom:10}}>
            <div style={{fontSize:10,color:T.muted,fontWeight:700,marginBottom:5,textTransform:"uppercase"}}>{cat}</div>
            {MENU_ITEMS.filter(m=>m.cat===cat).map(m=>(
              <div key={m.id} style={{display:"flex",justifyContent:"space-between",alignItems:"center",padding:"6px 0",borderBottom:`1px solid ${T.border}`}}>
                <div><div style={{fontSize:12,fontWeight:600}}>{m.name}</div><div style={{fontSize:10,color:T.gold}}>{fmt(m.price)}</div></div>
                <div style={{display:"flex",alignItems:"center",gap:8}}>
                  <button onClick={()=>setKoForm(p=>({...p,items:{...p.items,[m.id]:Math.max(0,(p.items[m.id]||0)-1)}}))} style={{width:26,height:26,borderRadius:6,background:T.border,border:"none",color:T.text,cursor:"pointer",fontSize:14,fontWeight:700}}>−</button>
                  <span style={{fontSize:13,fontWeight:700,minWidth:16,textAlign:"center"}}>{koForm.items[m.id]||0}</span>
                  <button onClick={()=>setKoForm(p=>({...p,items:{...p.items,[m.id]:(p.items[m.id]||0)+1}}))} style={{width:26,height:26,borderRadius:6,background:T.accent,border:"none",color:"#fff",cursor:"pointer",fontSize:14,fontWeight:700}}>+</button>
                </div>
              </div>
            ))}
          </div>
        ))}
        <div style={{...css.card,background:T.surface,marginBottom:14}}>
          <div style={{display:"flex",justifyContent:"space-between"}}><span style={{fontSize:12,color:T.sub}}>Order Total</span><span style={{fontSize:18,fontWeight:900,color:T.gold}}>{fmt(Object.entries(koForm.items).filter(([,q])=>q>0).reduce((s,[id,q])=>s+(MENU_ITEMS.find(m=>m.id===id)?.price||0)*q,0))}</span></div>
          <div style={{fontSize:10,color:T.green,marginTop:4}}>✓ Will be posted to room bill automatically</div>
        </div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doSubmitKO} style={{...css.btn(T.accent),flex:1}}>Place Order</button></div>
      </Sheet>

      <Sheet open={sheet==="addEmp"} onClose={()=>setSheet(null)} title="Add Staff Member">
        {[{l:"Full Name *",k:"name",t:"text"},{l:"Role *",k:"role",t:"text",p:"e.g. Receptionist"},{l:"Email",k:"email",t:"email"},{l:"Phone",k:"phone",t:"tel"},{l:"Salary (PKR/mo)",k:"salary",t:"number"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}><Lbl c={f.l}/><input type={f.t} placeholder={f.p||""} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={css.input}/></div>
        ))}
        <div style={{marginBottom:12}}><Lbl c="Department *"/><select value={form.dept||"Front Office"} onChange={e=>setForm(p=>({...p,dept:e.target.value}))} style={css.input}>{["Front Office","Housekeeping","F&B","Security","Maintenance"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{marginBottom:18}}><Lbl c="Shift"/><select value={form.shift||"Morning"} onChange={e=>setForm(p=>({...p,shift:e.target.value}))} style={css.input}>{["Morning","Evening","Night"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doAddEmployee} style={{...css.btn(T.accent),flex:1}}>Add Staff</button></div>
      </Sheet>

      <Sheet open={sheet==="addTx"} onClose={()=>setSheet(null)} title="Record Transaction">
        <div style={{marginBottom:12}}><Lbl c="Type"/><div style={{display:"flex",gap:8}}>{["income","expense"].map(t=><button key={t} onClick={()=>setForm(p=>({...p,type:t}))} style={{flex:1,padding:"10px",background:form.type===t?(t==="income"?T.green:T.red)+"33":T.surface,border:`1px solid ${form.type===t?(t==="income"?T.green:T.red):T.border}`,borderRadius:8,color:form.type===t?(t==="income"?T.green:T.red):T.muted,cursor:"pointer",fontFamily:"inherit",fontWeight:700,fontSize:12,textTransform:"capitalize"}}>{t==="income"?"+ Income":"− Expense"}</button>)}</div></div>
        <div style={{marginBottom:12}}><Lbl c="Description *"/><input value={form.desc||""} onChange={e=>setForm(p=>({...p,desc:e.target.value}))} style={css.input}/></div>
        <div style={{marginBottom:12}}><Lbl c="Amount (PKR) *"/><input type="number" value={form.amount||""} onChange={e=>setForm(p=>({...p,amount:e.target.value}))} style={css.input}/></div>
        <div style={{marginBottom:18}}><Lbl c="Category"/><select value={form.category||"Room Revenue"} onChange={e=>setForm(p=>({...p,category:e.target.value}))} style={css.input}>{["Room Revenue","F&B Revenue","Laundry","Spa","Operating Expenses","Payroll","Maintenance","Other"].map(s=><option key={s}>{s}</option>)}</select></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doAddTx} style={{...css.btn(T.accent),flex:1}}>Save</button></div>
      </Sheet>

      <Sheet open={sheet==="addUser"} onClose={()=>setSheet(null)} title="Create New User">
        {[{l:"Full Name *",k:"name",t:"text"},{l:"Username *",k:"username",t:"text"},{l:"Password *",k:"password",t:"password"},{l:"Role",k:"role",t:"text",p:"e.g. Receptionist"}].map(f=>(
          <div key={f.k} style={{marginBottom:12}}><Lbl c={f.l}/><input type={f.t} placeholder={f.p||""} value={form[f.k]||""} onChange={e=>setForm(p=>({...p,[f.k]:e.target.value}))} style={css.input}/></div>
        ))}
        <div style={{marginBottom:14}}><Lbl c="Grant Permissions"/><div style={{display:"flex",flexWrap:"wrap",gap:8,marginTop:4}}>{ALL_PERMS.map(p=><button key={p} onClick={()=>togglePerm(p)} style={{padding:"5px 11px",background:(form.permissions||[]).includes(p)?T.accent+"33":T.surface,border:`1px solid ${(form.permissions||[]).includes(p)?T.accent:T.border}`,borderRadius:20,color:(form.permissions||[]).includes(p)?T.accent:T.muted,cursor:"pointer",fontSize:11,fontFamily:"inherit",fontWeight:600,textTransform:"capitalize"}}>{p}</button>)}</div><button onClick={()=>setForm(p=>({...p,permissions:ALL_PERMS}))} style={{...css.btn(T.border),color:T.sub,fontSize:10,marginTop:8,width:"100%"}}>Select All</button></div>
        <div style={{display:"flex",gap:10}}><button onClick={()=>setSheet(null)} style={{...css.btn(T.border),flex:1,color:T.muted}}>Cancel</button><button onClick={doAddUser} style={{...css.btn(T.accent),flex:1}}>Create User</button></div>
      </Sheet>

      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600;700;800;900&display=swap');
        @keyframes fIn{from{opacity:0;transform:translateX(-50%) translateY(-8px)}to{opacity:1;transform:translateX(-50%) translateY(0)}}
        *{box-sizing:border-box;-webkit-tap-highlight-color:transparent}
        input,select{color-scheme:dark;-webkit-appearance:none}
        input[type=date]::-webkit-calendar-picker-indicator{filter:invert(.5)}
        ::-webkit-scrollbar{width:3px;height:3px}::-webkit-scrollbar-track{background:transparent}::-webkit-scrollbar-thumb{background:${T.border};border-radius:2px}
      `}</style>
    </div>
  );
}
