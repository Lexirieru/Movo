import { ChevronDown, Building2, CreditCard, Mail, ArrowRight, AlertTriangle } from "lucide-react";
import { DollarSign } from "lucide-react";
import { bankDictionary } from "@/lib/dictionary";
import FormInput from "@/app/auth/components/FormInput";

interface BankFormProps {
  bankForm: { bankName: string; bankAccountNumber: string; accountHolderName: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectBank: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function BankForm({ bankForm, onChange, onSelectBank, onConfirm, isProcessing }: BankFormProps) {
  const isFormValid = bankForm.bankName && bankForm.bankAccountNumber;
  const estimatedTime = "1-3 business days";

  return (
    <div className="space-y-6">
      {/* Bank Account Form */}
      <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
        <div className="flex items-center space-x-3 mb-6">
          <Building2 className="w-6 h-6 text-green-400" />
          <h4 className="text-white font-medium">Bank Account Details</h4>
        </div>

        <div className="space-y-4">
          {/* Bank Dropdown */}
          <div>
            <label className="text-white/80 text-sm mb-2 block">Bank Name</label>
            <button
              onClick={onSelectBank}
              className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center justify-between group"
            >
              {bankForm.bankName ? (
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-gradient-to-r from-blue-500 to-purple-600 rounded-full flex items-center justify-center">
                    <Building2 className="w-4 h-4 text-white" />
                  </div>
                  <div>
                    <div className="text-white font-medium">{bankForm.bankName}</div>
                    <div className="text-gray-400 text-sm">Code: {bankDictionary[bankForm.bankName]}</div>
                  </div>
                </div>
              ) : (
                <span className="text-gray-400">Select your bank</span>
              )}
              <ChevronDown className="w-5 h-5 text-gray-400 group-hover:text-white transition-colors" />
            </button>
          </div>

          <FormInput
            type="text"
            name="bankAccountNumber"
            placeholder="Bank Account Number"
            value={bankForm.bankAccountNumber}
            onChange={onChange}
            icon={CreditCard}
            required
          />

          <FormInput
            type="text"
            name="accountHolderName"
            placeholder="Account Holder Name (Optional)"
            value={bankForm.accountHolderName}
            onChange={onChange}
            icon={Mail}
          />
        </div>
      </div>

      {/* Fiat Conversion Info */}
      <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-xl p-4">
        <div className="flex items-start space-x-3">
          <AlertTriangle className="w-5 h-5 text-yellow-400 mt-0.5 flex-shrink-0" />
          <div>
            <div className="text-yellow-400 font-medium text-sm">Fiat Conversion Notice</div>
            <div className="text-white/60 text-sm mt-1">
              USDC will be converted to IDR at current market rate. Transfer to your bank account may take {estimatedTime}.
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => window.history.back()} // Or pass onCancel prop
          className="flex-1 bg-white/10 text-white py-3 rounded-xl hover:bg-white/20 transition-colors font-medium"
          disabled={isProcessing}
        >
          Cancel
        </button>
        
        <button
          onClick={onConfirm}
          disabled={!isFormValid || isProcessing}
          className="flex-1 bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100 flex items-center justify-center space-x-2"
        >
          {isProcessing ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Processing...</span>
            </>
          ) : (
            <>
              <DollarSign className="w-5 h-5" />
              <span>Claim as Fiat</span>
              <ArrowRight className="w-4 h-4" />
            </>
          )}
        </button>
      </div>

      {/* Preview Summary */}
      {isFormValid && (
        <div className="bg-white/5 rounded-xl p-4 border border-white/10">
          <div className="flex items-center justify-between text-sm">
            <span className="text-white/60">Transfer to:</span>
            <div className="text-right">
              <div className="text-white font-medium">{bankForm.bankName}</div>
              <div className="text-white/60 font-mono">{bankForm.bankAccountNumber}</div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}