import React, { useEffect, useRef, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { addDoc, collection, doc, onSnapshot, orderBy, query, serverTimestamp } from "firebase/firestore";
import { db } from "../../firebase/config.js";
import { useAuth } from "../../contexts/AuthContext.jsx";

export default function Chat() {
  const { orderId } = useParams();
  const { user, role } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [text, setText] = useState("");
  const [order, setOrder] = useState(null);
  const endRef = useRef(null);

  useEffect(() => {
    const unsubOrder = onSnapshot(doc(db, "orders", orderId), (snap) => setOrder(snap.data()));
    const q = query(collection(db, `orders/${orderId}/messages`), orderBy("createdAt", "asc"));
    const unsubMsgs = onSnapshot(q, (snap) => setMessages(snap.docs.map((d) => ({ id: d.id, ...d.data() }))));
    return () => { unsubOrder(); unsubMsgs(); };
  }, [orderId]);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages]);

  async function send() {
    if (!text.trim()) return;
    const value = text.trim();
    setText("");
    await addDoc(collection(db, `orders/${orderId}/messages`), {
      senderId: user.uid, senderRole: role === "driver" ? "driver" : "customer", text: value, createdAt: serverTimestamp(), read: false,
    });
  }

  return (
    <div className="screen" style={{ display: "flex", flexDirection: "column", height: "100vh", paddingBottom: 90 }}>
      <div className="top-bar">
        <button className="back" onClick={() => navigate(-1)}>→</button>
        <h2 className="display" style={{ margin: 0 }}>محادثة الطلب #{order?.orderNumber}</h2>
      </div>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {messages.map((m) => (
          <div key={m.id} className={`chat-bubble ${m.senderId === user.uid ? "chat-mine" : "chat-theirs"}`}>
            {m.text}
            <div className="chat-time">{m.createdAt?.toDate ? m.createdAt.toDate().toLocaleTimeString("ar-IQ", { hour: "2-digit", minute: "2-digit" }) : ""}</div>
          </div>
        ))}
        <div ref={endRef} />
      </div>
      <div className="row-between" style={{ gap: 8, position: "fixed", bottom: 16, left: 16, right: 16, maxWidth: 448, margin: "0 auto" }}>
        <input placeholder="اكتب رسالة..." value={text} onChange={(e) => setText(e.target.value)} onKeyDown={(e) => e.key === "Enter" && send()} />
        <button className="btn-accent" style={{ width: "auto", padding: "12px 18px" }} onClick={send}>إرسال</button>
      </div>
    </div>
  );
}
