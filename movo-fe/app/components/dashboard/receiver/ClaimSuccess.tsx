import { CheckCircle } from "lucide-react";

interface ClaimSuccessProps {
  amount: number;
  claimType: "crypto" | "fiat";
}

export default function ClaimSuccess({ amount, claimType }: ClaimSuccessProps) {
  return (
    <div className="flex-1 flex items-center justify-center p-6">
      <div className="text-center max-w-md mx-auto">
        <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
          <CheckCircle className="w-10 h-10 text-green-400" />
        </div>
        <h3 className="text-2xl font-bold text-white mb-3">Claim Successful!</h3>
        <p className="text-white/60 text-lg">
          {amount.toFixed(4)} USDC has been{" "}
          {claimType === "crypto" ? "transferred to your wallet" : "converted to fiat"}
        </p>
      </div>
    </div>
  );
}
