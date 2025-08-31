import { ChevronDown, Plus, Building2, CreditCard, Mail } from "lucide-react";
import { bankDictionary } from "@/lib/dictionary";
import FormInput from "@/app/auth/components/FormInput";

interface BankFormProps {
  bankForm: { bankName: string; bankAccountNumber: string; accountHolderName: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectBank: () => void;
  onConfirm: () => void;
}

export default function BankForm({ bankForm, onChange, onSelectBank, onConfirm }: BankFormProps) {
  return (
    <div className="bg-white/5 rounded-2xl p-6 border border-white/10">
      <div className="flex items-center space-x-3 mb-4">
        <Plus className="w-6 h-6 text-cyan-400" />
        <h4 className="text-white font-medium">Add New Bank Account</h4>
      </div>

      <div className="space-y-4">
        {/* Bank Dropdown */}
        <div>
          <label className="text-white/80 text-sm mb-2 block">Bank Name</label>
          <button
            onClick={onSelectBank}
            className="w-full p-4 bg-white/5 border border-white/10 rounded-xl text-left hover:bg-white/10 transition-colors flex items-center justify-between"
          >
            {bankForm.bankName ? (
              <div className="flex items-center space-x-3">
                <Building2 className="w-5 h-5 text-blue-400" />
                <div>
                  <div className="text-white font-medium">{bankForm.bankName}</div>
                  <div className="text-gray-400 text-sm">Code: {bankDictionary[bankForm.bankName]}</div>
                </div>
              </div>
            ) : (
              <span className="text-gray-400">Select your bank</span>
            )}
            <ChevronDown className="w-5 h-5 text-gray-400" />
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

      <button
        onClick={onConfirm}
        disabled={!bankForm.bankName || !bankForm.bankAccountNumber}
        className="mt-4 w-full bg-gradient-to-r from-green-500 to-emerald-600 text-white py-3 rounded-xl font-medium hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all hover:scale-105 disabled:hover:scale-100"
      >
        Add & Use This Account
      </button>
    </div>
  );
}
