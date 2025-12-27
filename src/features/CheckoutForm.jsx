import React, { useEffect, useRef, useState } from "react";


// --- Simple Chatbot Popup Component ---
const ChatbotPopup = ({ onClose }) => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMsg]);

    setLoading(true);
    try {
      // --- Gemini API call ---
   const apiKey = import.meta.env.VITE_GOOGLE_API_KEY;

const response = await fetch(
  `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${apiKey}`,
  {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [
        {
          parts: [{ text: input }],
        },
      ],
    }),
  }
);


      const data = await response.json();
      const botText = data?.candidates?.[0]?.content?.parts?.[0]?.text || "Sorry, I couldn't understand that.";

      const botMsg = { sender: "bot", text: botText };
      setMessages((prev) => [...prev, botMsg]);
    } catch (err) {
      setMessages((prev) => [...prev, { sender: "bot", text: "Error contacting API." }]);
    }

    setLoading(false);
    setInput("");
  };

  return (
    <div className="fixed bottom-20 right-6 w-80 bg-white shadow-xl rounded-2xl border border-gray-200 flex flex-col overflow-hidden">
      <div className="bg-blue-600 text-white p-3 font-semibold flex justify-between items-center">
        <span>Need Help?</span>
        <button onClick={onClose}>✕</button>
      </div>

      <div className="p-3 h-64 overflow-y-auto space-y-3">
        {messages.map((m, i) => (
          <div
            key={i}
            className={`p-2 rounded-lg max-w-[90%] text-sm ${
              m.sender === "user"
                ? "bg-blue-100 self-end ml-auto"
                : "bg-gray-100 self-start"
            }`}
          >
            {m.text}
          </div>
        ))}
        {loading && <div className="text-xs text-gray-400">Gemini is typing...</div>}
      </div>

      <div className="flex border-t">
        <input
          className="flex-1 p-2 text-sm outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && sendMessage()}
          placeholder="Ask a question..."
        />
        <button className="px-3 bg-blue-600 text-white" onClick={sendMessage}>Send</button>
      </div>
    </div>
  );
};

// ---------------------------------------
// Main Checkout Form Component
// ---------------------------------------

const CheckoutForm = ({ onZonesReady, confusion }) => {
  const priceRef = useRef(null);
  const termsRef = useRef(null);
  const payRef = useRef(null);

  const [showChatbot, setShowChatbot] = useState(false);

  useEffect(() => {
    const updateZones = () => {
      const zones = [
        { id: "price-summary", ...priceRef.current?.getBoundingClientRect().toJSON() },
        { id: "terms-cond", ...termsRef.current?.getBoundingClientRect().toJSON() },
        { id: "pay-button", ...payRef.current?.getBoundingClientRect().toJSON() },
      ];
      onZonesReady(zones);
    };

    updateZones();
    window.addEventListener("resize", updateZones);
    return () => window.removeEventListener("resize", updateZones);
  }, [onZonesReady]);

  const getHighlightClass = (id) =>
    confusion?.isConfused && confusion.zoneId === id
      ? "ring-4 ring-yellow-400 ring-offset-2 transition-all duration-500 shadow-2xl scale-[1.02]"
      : "transition-all duration-500";

  return (
    <div className="relative">
      {/* Main Checkout Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
        <div className="space-y-6">
          <h2 className="text-xl font-semibold">Payment Details</h2>
          <div className="space-y-4">
            <input type="text" placeholder="Cardholder Name" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <input type="text" placeholder="Card Number" className="w-full p-3 border rounded-lg focus:ring-2 focus:ring-blue-500 outline-none" />
            <div className="flex gap-4">
              <input type="text" placeholder="MM/YY" className="w-1/2 p-3 border rounded-lg outline-none" />
              <input type="text" placeholder="CVC" className="w-1/2 p-3 border rounded-lg outline-none" />
            </div>
          </div>

          {/* Terms Zone */}
          <div ref={termsRef} id="terms-cond" className={`p-4 rounded-xl border bg-gray-50 ${getHighlightClass("terms-cond")}`}>
            <label className="flex items-start gap-3 cursor-pointer">
              <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600" />
              <span className="text-sm text-gray-600">
                I agree to the <span className="text-blue-600 underline">Terms of Service</span>, including the non-refundable processing fee of $12.40.
              </span>
            </label>
          </div>
        </div>

        {/* Summary */}
        <div className="space-y-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
          <h2 className="text-xl font-semibold">Order Summary</h2>

          <div ref={priceRef} id="price-summary" className={`space-y-3 ${getHighlightClass("price-summary")}`}>
            <div className="flex justify-between text-gray-600"><span>Subtotal</span><span>$120.00</span></div>
            <div className="flex justify-between text-gray-600"><span>Service Fee</span><span>$15.50</span></div>
            <div className="flex justify-between text-gray-600"><span>Tax</span><span>$8.40</span></div>
            <hr className="border-blue-200" />
            <div className="flex justify-between text-lg font-bold text-blue-900"><span>Total</span><span>$143.90</span></div>
          </div>

          <button ref={payRef} id="pay-button" className={`w-full py-4 bg-blue-600 text-white font-bold rounded-xl ${getHighlightClass("pay-button")}`}>
            Pay $143.90
          </button>
        </div>
      </div>

      {/* NEED HELP Floating Button */}
      <button
        className="fixed top-6 right-6 bg-blue-600 text-white px-4 py-3 rounded-full shadow-lg hover:bg-blue-700"
        onClick={() => setShowChatbot(true)}
      >
        Need Help?
      </button>

      {showChatbot && <ChatbotPopup onClose={() => setShowChatbot(false)} />}
    </div>
  );
};

export default CheckoutForm;
