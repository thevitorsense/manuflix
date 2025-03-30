<h4 className="font-bold mb-2">Resumo do pedido</h4>
                    <div className="bg-black bg-opacity-30 p-4 rounded">
                      <div className="flex justify-between mb-2">
                        <span>{plan.name}</span>
                        <span>R$ {plan.price.toFixed(2)}</span>
                      </div>
                      <div className="border-t border-manuflix-gray pt-2 flex justify-between font-bold">
                        <span>Total</span>
                        <span>R$ {plan.price.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mb-6">
                    <p className="mb-4">Escaneie o QR Code abaixo com o app do seu banco</p>
                    <div className="bg-white p-4 rounded-lg inline-block mb-4">
                      <img 
                        src={paymentData.qrcode_image} 
                        alt="QR Code PIX" 
                        className="w-48 h-48 mx-auto"
                      />
                    </div>
                    
                    <div className="relative">
                      <p className="text-sm mb-2">Ou copie o código PIX:</p>
                      <div className="bg-black bg-opacity-30 p-3 rounded flex items-center justify-between mb-2">
                        <span className="text-sm truncate mr-2">{paymentData.copy_paste}</span>
                        <button 
                          onClick={copyPixCode}
                          className="bg-manuflix-gray text-white p-2 rounded hover:bg-opacity-80 transition-colors"
                        >
                          {copied ? <Check size={20} /> : <Copy size={20} />}
                        </button>
                      </div>
                      {copied && (
                        <div className="absolute -bottom-8 left-0 right-0 text-green-500 text-sm">
                          Código copiado com sucesso!
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="text-center text-sm text-manuflix-gray">
                    <p>O pagamento será confirmado automaticamente.</p>
                    {checkingStatus && (
                      <div className="flex items-center justify-center mt-2 text-manuflix-red">
                        <Loader2 size={16} className="animate-spin mr-2" />
                        <span>Verificando pagamento...</span>
                      </div>
                    )}
                    <p className="mt-2">
                      Tempo restante: <span className="font-bold">{formatTimeLeft()}</span>
                    </p>
                  </div>
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
