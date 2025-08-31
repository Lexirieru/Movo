import { useEffect, useState } from 'react';
import { X, DollarSign, Coins, CheckCircle, AlertTriangle, ArrowRight, CreditCard, Mail } from 'lucide-react';
import { WithdrawHistory } from '@/types/historyTemplate';
import { getUsdcIdrxRate } from '@/app/api/api';
import FormInput from '@/app/auth/components/FormInput';
import { useAuth } from '@/lib/userContext';


interface Stream {
  id: string;
  token: string;
  funder: string;
  withdrawable: number;
}

interface ClaimModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedStreams: WithdrawHistory[];
  totalAmount: number;
}

export default function ClaimModal({ isOpen, onClose, selectedStreams, totalAmount }: ClaimModalProps) {
  const { user, loading, authenticated } = useAuth(); 
  const [claimType, setClaimType] = useState<'crypto' | 'fiat'>('crypto');
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [rate, setRate] = useState(0);
  const [usdcIdrxRate, setUsdcIdrxRate] = useState<number | null>(null);
  const [editingStream, setEditingStream] = useState<null | any>(null);
  const [bankForm, setBankForm] = useState({ bankName: "", bankAccountNumber: "" });

  const handleOpenModal = (stream: any) => {
    setEditingStream(stream);
    setBankForm({
      bankName: stream.bankName || "",
      bankAccountNumber: stream.bankAccountNumber || "",
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBankForm({ ...bankForm, [e.target.name]: e.target.value });
  };

  const handleConfirm = () => {
    if (editingStream) {
      // update state atau panggil API untuk simpan perubahan
      editingStream.bankName = bankForm.bankName;
      editingStream.bankAccountNumber = bankForm.bankAccountNumber;

      setEditingStream(null); // close modal
    }
  };
  if (!isOpen) return null;

  const handleClaim = async () => {
    setIsProcessing(true);
    
    // Simulate processing time
    setTimeout(() => {
      setIsProcessing(false);
      setIsSuccess(true);
      
      // Auto close after success
      setTimeout(() => {
        setIsSuccess(false);
        onClose();
      }, 2000);
    }, 2000);
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;

    const fetchRate = async () => {
      try {
        const tempRate =  await getUsdcIdrxRate();
        console.log(tempRate.rate);
        
        setUsdcIdrxRate(tempRate.rate);
      } catch (error) {
        console.error("Failed to fetch USDC/IDRX rate:", error);
      }
    };

    // fetch pertama kali saat modal dibuka
    if (isOpen) {
      fetchRate();
      interval = setInterval(fetchRate, 10000); // ulang tiap 10 detik
    }

    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isOpen]);
  
  // const fiatAmount = totalAmount * rate;
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-900/95 backdrop-blur-xl rounded-3xl border border-white/20 w-full max-w-md mx-auto shadow-2xl">
        {isSuccess ? (
          <div className="p-8 text-center">
            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <CheckCircle className="w-8 h-8 text-green-400" />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">Claim Successful!</h3>
            <p className="text-white/60">
              {totalAmount.toFixed(4)} IDRX has been {claimType === 'crypto' ? 'transferred to your wallet' : 'converted to fiat'}
            </p>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-white/10">
              <h2 className="text-xl font-bold text-white">Claim Tokens</h2>
              <button 
                onClick={onClose}
                className="text-white/60 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              {/* Claim Type Switch */}
              <div className="space-y-4">
                <h3 className="text-white font-medium">Claim As:</h3>
                <div className="bg-white/5 rounded-2xl p-2 flex">
                  <button
                    onClick={() => setClaimType('crypto')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      claimType === 'crypto'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Coins className="w-5 h-5" />
                    <span>Cryptocurrency</span>
                  </button>
                  <button
                    onClick={() => setClaimType('fiat')}
                    className={`flex-1 py-3 px-4 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                      claimType === 'fiat'
                        ? 'bg-gradient-to-r from-green-500 to-emerald-600 text-white shadow-lg'
                        : 'text-white/60 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <DollarSign className="w-5 h-5" />
                    <span>Fiat Currency</span>
                  </button>
                </div>
              </div>

              {/* Amount Summary */}
              <div className="bg-white/5 rounded-2xl p-4 border border-white/10">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-white/60">You will receive:</span>
                  <span className="text-white/60 text-sm">{selectedStreams.length} stream(s)</span>
                </div>

                {claimType === 'crypto' ? (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold">I</span>
                    </div>
                    <div>
                      <div className="text-2xl font-bold text-white">
                        {`${totalAmount.toFixed(4)} USDC` } 
                      </div>
                      {usdcIdrxRate !== null && (
                        <div className="text-white/60 text-sm">
                          ≈ {(totalAmount * usdcIdrxRate).toLocaleString('id-ID')} IDR
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-gradient-to-r from-green-500 to-emerald-600 rounded-full flex items-center justify-center">
                      <DollarSign className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      {usdcIdrxRate !== null ? (
                        <>
                          <div className="text-2xl font-bold text-white">
                            Rp {(totalAmount * usdcIdrxRate).toLocaleString('id-ID')}
                          </div>
                          <div className="text-white/60 text-sm">
                            From {totalAmount.toFixed(4)} USDC
                          </div>
                        </>
                      ) : (
                        <div className="text-white/60 text-sm">Fetching rate...</div>
                      )}
                    </div>
                  </div>
                )}
              </div>


              {/* Stream Details */}
              <div className="space-y-3">
                <h4 className="text-white/80 font-medium">Claiming from:</h4>
                <div className="space-y-2 max-h-32 overflow-y-auto">
                  {selectedStreams.map((stream) => (
                    <div key={stream.withdrawId} className="bg-white/5 rounded-lg p-3 flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-gradient-to-r from-green-400 to-emerald-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-xs font-bold">I</span>
                        </div>
                        <div>
                          <div className="text-white text-sm">{stream.originCurrency}</div>
                          {/* <div className="text-white/60 text-xs font-mono">{stream.}</div> */}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              
              <div className="space-y-3">
                {claimType === 'fiat' ? (
                  <div className="space-y-3 max-h-40 overflow-y-auto">
                  <h4 className="text-white/80 font-medium">Transferring to: IDR</h4>
                {selectedStreams.map((stream) => (
                  <div
                    key={stream.withdrawId}
                    className="bg-white/10 backdrop-blur-sm hover:bg-white/20 transition-colors rounded-xl p-4 flex items-center justify-between shadow-sm"
                  >
                    {/* Info Bank */}
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full flex items-center justify-center text-white font-bold">
                        {stream.bankName?.[0] || "B"}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-white font-medium">{user.bankName || "Unknown Bank"}</span>
                        <span className="text-white/60 text-sm">{user.bankAccountNumber || "No Account"}</span>
                      </div>
                    </div>

                    {/* Button Change Bank */}
                    <button
                      className="text-cyan-400 text-sm font-medium underline hover:text-cyan-300 transition-colors"
                      onClick={() => handleOpenModal(stream)}
                    >
                      Change bank
                    </button>
                  </div>
                ))}
              </div>
            ) : null}



                {/* Modal */}
                {editingStream && (
                  <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-slate-900/95 rounded-2xl border border-white/20 p-6 w-full max-w-md">
                      <div className="flex justify-between items-center mb-4">
                        <h3 className="text-white font-bold text-lg">Change Bank</h3>
                        <button onClick={() => setEditingStream(null)} className="text-white/60 hover:text-white">
                          <X className="w-5 h-5" />
                        </button>
                      </div>

                      <FormInput
                        type="text"
                        name="bankName"
                        placeholder="Bank Name"
                        value={bankForm.bankName}
                        onChange={handleChange}
                        icon={Mail}
                        required
                      />
                      <FormInput
                        type="text"
                        name="bankAccountNumber"
                        placeholder="Bank Account Number"
                        value={bankForm.bankAccountNumber}
                        onChange={handleChange}
                        icon={CreditCard}
                        required
                      />

                      <button
                        onClick={handleConfirm}
                        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg"
                      >
                        Confirm
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );

              {/* Warning for Fiat */}
              {claimType === 'fiat' && usdcIdrxRate !== null && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4 flex items-start space-x-3">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-yellow-400 font-medium text-sm">Fiat Conversion</div>
                    <div className="text-white/60 text-sm mt-1">
                      Tokens will be converted to IDR at current market rate (1 IDRX = Rp {usdcIdrxRate.toLocaleString('id-ID')}) and transferred to your bank account.
                    </div>
                  </div>
                </div>
              )}


              {/* Action Buttons */}
              <div className="flex items-center space-x-3 pt-4">
                <button
                  onClick={onClose}
                  className="flex-1 bg-white/10 text-white py-3 rounded-xl font-medium hover:bg-white/20 transition-colors"
                  disabled={isProcessing}
                >
                  Cancel
                </button>
                <button
                  onClick={handleClaim}
                  disabled={isProcessing || totalAmount === 0}
                  className={`flex-1 py-3 rounded-xl font-medium transition-all duration-300 flex items-center justify-center space-x-2 ${
                    claimType === 'crypto'
                      ? 'bg-gradient-to-r from-cyan-500 to-blue-600 hover:shadow-lg hover:shadow-cyan-500/25'
                      : 'bg-gradient-to-r from-green-500 to-emerald-600 hover:shadow-lg hover:shadow-green-500/25'
                  } text-white disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      {claimType === 'crypto' ? <Coins className="w-5 h-5" /> : <DollarSign className="w-5 h-5" />}
                      <span>Claim {claimType === 'crypto' ? 'Crypto' : 'as Fiat'}</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

  
  