import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { SubscriptionPlan } from '../types';
import { SubscriptionPlans } from '../components/SubscriptionPlans';
import { PaymentModal } from '../components/PaymentModal';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';

export const PaymentPage: React.FC = () => {
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentComplete, setPaymentComplete] = useState(false);
  const navigate = useNavigate();

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setShowPaymentModal(true);
  };

  const handleCloseModal = () => {
    setShowPaymentModal(false);
  };

  const handlePaymentComplete = () => {
    setPaymentComplete(true);
    setShowPaymentModal(false);
    
    // Redirect to success page or dashboard after a short delay
    setTimeout(() => {
      navigate('/dashboard');
    }, 3000);
  };

  return (
    <div className="min-h-screen bg-manuflix-black text-white flex flex-col">
      <Header />
      
      <main className="flex-grow">
        {paymentComplete ? (
          <div className="container mx-auto py-16 px-4 text-center">
            <div className="bg-manuflix-dark p-8 rounded-lg max-w-md mx-auto">
              <h2 className="text-2xl font-bold mb-4">Pagamento Confirmado!</h2>
              <p className="mb-6">Seu acesso foi liberado com sucesso.</p>
              <p className="text-manuflix-gray mb-8">Você será redirecionado para a área de conteúdo em instantes...</p>
              <div className="w-16 h-16 border-4 border-manuflix-red border-t-transparent rounded-full animate-spin mx-auto"></div>
            </div>
          </div>
        ) : (
          <SubscriptionPlans onSelectPlan={handleSelectPlan} />
        )}
      </main>
      
      {selectedPlan && showPaymentModal && (
        <PaymentModal 
          plan={selectedPlan}
          onClose={handleCloseModal}
          onPaymentComplete={handlePaymentComplete}
        />
      )}
      
      <Footer />
    </div>
  );
};
