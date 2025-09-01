import { ChevronDown, Building2, CreditCard, Mail, ArrowRight, AlertTriangle } from "lucide-react";
import { DollarSign } from "lucide-react";
import { bankDictionary } from "@/lib/dictionary";
import FormInput from "@/app/auth/components/FormInput";
import { useEffect, useState } from "react";
import { useAuth } from "@/lib/userContext";
import { changeBankAccount, getBankAccount, getBankAccountFromDatabase } from "@/app/api/api";
import { BankAccountInformation } from "@/types/receiverInGroupTemplate";

interface BankFormProps {
  bankForm: { bankName: string; bankAccountNumber: string; accountHolderName: string };
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSelectBank: () => void;
  onConfirm: () => void;
  isProcessing?: boolean;
}

export default function BankForm({
  bankForm,
  onChange,
  onSelectBank,
  onConfirm,
  isProcessing,
}: BankFormProps) {
  const { user, loading } = useAuth();
  const [bankAccountData, setBankAccountData] = useState<BankAccountInformation>();
  const [originalData, setOriginalData] = useState<BankAccountInformation>();
  const [hasFetched, setHasFetched] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [isConfirming, setIsConfirming] = useState(false);

  const isFormValid = bankForm.bankName && bankForm.bankAccountNumber;
  const estimatedTime = "1-3 business days";

  // cek apakah ada perubahan
  const isChanged =
    originalData &&
    (bankForm.bankName !== originalData.bankName ||
      bankForm.bankAccountNumber !== originalData.bankAccountNumber ||
      bankForm.accountHolderName !== originalData.bankAccountName);

  useEffect(() => {
    if (loading || !user?._id || !user.email || hasFetched) return;

    const fetchBankAccountData = async () => {
      try {
        setIsFetching(true);
        const data = await getBankAccount(user.email);

        if (!data?.data) {
          setIsFetching(false);
          setHasFetched(true);
          return;
        }

        const initBankAccountInformation: BankAccountInformation = {
          bankId: data.data.bankId,
          bankName: data.data.bankName,
          bankCode: data.data.bankCode,
          bankAccountNumber: data.data.bankAccountNumber,
          bankAccountName: data.data.bankAccountName,
        };

        setBankAccountData(initBankAccountInformation);
        setOriginalData(initBankAccountInformation);

        // isi ke form
        onChange({ target: { name: "bankName", value: initBankAccountInformation.bankName } } as any);
        onChange({ target: { name: "bankAccountNumber", value: initBankAccountInformation.bankAccountNumber } } as any);
        onChange({ target: { name: "accountHolderName", value: initBankAccountInformation.bankAccountName } } as any);

        setHasFetched(true);
      } catch (err) {
        console.error("Failed to fetch bank account data", err);
      } finally {
        setIsFetching(false);
      }
    };

    fetchBankAccountData();
  }, [loading, user, hasFetched, onChange]);

  // 👇 tampilkan loading screen sampai fetch selesai
  if (isFetching) {
    return (
      <div className="flex justify-center items-center h-40">
        <div className="w-8 h-8 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
        <span className="ml-3 text-white/70">Loading bank account...</span>
      </div>
    );
  }

  const handleConfirmChanges = async () => {
  try {
    setIsConfirming(true);
    const bankCode = bankDictionary[bankForm.bankName];

    // update ke backend
    await changeBankAccount(
      user?.email,
      bankForm.bankAccountNumber,
      bankCode
    );

    // setelah sukses, ambil lagi data terbaru dari backend
    const refreshed = await getBankAccount(user?.email);
    if (refreshed?.data) {
      const updated: BankAccountInformation = {
        bankId: refreshed.data.bankId,
        bankName: refreshed.data.bankName,
        bankCode: refreshed.data.bankCode,
        bankAccountNumber: refreshed.data.bankAccountNumber,
        bankAccountName: refreshed.data.bankAccountName,
      };

      setOriginalData(updated);
      setBankAccountData(updated);

      // isi lagi ke form (supaya Account Holder Name ke-update)
      onChange({ target: { name: "bankName", value: updated.bankName } } as any);
      onChange({ target: { name: "bankAccountNumber", value: updated.bankAccountNumber } } as any);
      onChange({ target: { name: "accountHolderName", value: updated.bankAccountName } } as any);
    }
  } catch (err) {
    console.error("Failed to update bank account", err);
  } finally {
    setIsConfirming(false);
  }
};


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
                    <div className="text-gray-400 text-sm">
                      Code: {bankDictionary[bankForm.bankName]}
                    </div>
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
            placeholder="Account Holder Name"
            value={bankForm.accountHolderName}
            onChange={() => {}} // kosongin, supaya nggak bisa diubah
            icon={Mail}
            disabled 
            readOnly
          />

        </div>
      </div>

      {/* Show confirm changes button jika ada perubahan */}
      {isChanged && (
        <button
          onClick={handleConfirmChanges}
          disabled={isConfirming}
          className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-xl transition-all font-medium flex items-center justify-center space-x-2"
        >
          {isConfirming ? (
            <>
              <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
              <span>Confirming...</span>
            </>
          ) : (
            <span>Confirm Changes</span>
          )}
        </button>
      )}

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
          onClick={() => window.history.back()}
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
    </div>
  );
}
