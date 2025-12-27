import React, { useEffect, useRef } from 'react';

const CheckoutForm = ({ onZonesReady, confusion }) => {
  // We use refs to get the exact pixel positions of the "Confusion Zones"
  const priceRef = useRef(null);
  const termsRef = useRef(null);
  const payRef = useRef(null);

  useEffect(() => {
    const updateZones = () => {
      const zones = [
        { id: 'price-summary', ...priceRef.current?.getBoundingClientRect().toJSON() },
        { id: 'terms-cond', ...termsRef.current?.getBoundingClientRect().toJSON() },
        { id: 'pay-button', ...payRef.current?.getBoundingClientRect().toJSON() },
      ];
      onZonesReady(zones);
    };

    // Update zones on mount and when window resizes
    updateZones();
    window.addEventListener('resize', updateZones);
    return () => window.removeEventListener('resize', updateZones);
  }, [onZonesReady]);

  // Helper to highlight a zone if the logic says it's confusing
  const getHighlightClass = (id) => 
    confusion?.isConfused && confusion.zoneId === id 
      ? "ring-4 ring-yellow-400 ring-offset-2 transition-all duration-500 shadow-2xl scale-[1.02]" 
      : "transition-all duration-500";

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8 bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
      {/* Left Column: Form Fields */}
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

        {/* ZONE: Terms and Conditions */}
        <div ref={termsRef} id="terms-cond" className={`p-4 rounded-xl border bg-gray-50 ${getHighlightClass('terms-cond')}`}>
          <label className="flex items-start gap-3 cursor-pointer">
            <input type="checkbox" className="mt-1 h-4 w-4 text-blue-600" />
            <span className="text-sm text-gray-600">
              I agree to the <span className="text-blue-600 underline">Terms of Service</span>, including the non-refundable processing fee of $12.40 and the automated subscription renewal policy.
            </span>
          </label>
        </div>
      </div>

      {/* Right Column: Summary */}
      <div className="space-y-6 bg-blue-50/50 p-6 rounded-2xl border border-blue-100">
        <h2 className="text-xl font-semibold">Order Summary</h2>
        
        {/* ZONE: Price Summary */}
        <div ref={priceRef} id="price-summary" className={`space-y-3 ${getHighlightClass('price-summary')}`}>
          <div className="flex justify-between text-gray-600">
            <span>Subtotal</span>
            <span>$120.00</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Service Fee (Variable)</span>
            <span>$15.50</span>
          </div>
          <div className="flex justify-between text-gray-600">
            <span>Tax (Estimated)</span>
            <span>$8.40</span>
          </div>
          <hr className="border-blue-200" />
          <div className="flex justify-between text-lg font-bold text-blue-900">
            <span>Total</span>
            <span>$143.90</span>
          </div>
        </div>

        {/* ZONE: Pay Button */}
        <button 
          ref={payRef}
          id="pay-button"
          className={`w-full py-4 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 active:scale-95 ${getHighlightClass('pay-button')}`}
        >
          Pay $143.90
        </button>
      </div>
    </div>
  );
};

export default CheckoutForm;