import { useStock } from "@/context/StockContext";
import PCAPlot from "@/components/PCAPlot";
import VarianceChart from "@/components/VarianceChart";
import PredictionCard from "@/components/PredictionCard";
import ClusterChart from "@/components/ClusterChart";
import { Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";

const StockDetail = () => {
  const { selectedStock } = useStock();
  return (
    <div className="min-h-screen max-w-7xl mx-auto px-4 md:px-8 py-8 space-y-6">
      <Link to="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition">
        <ArrowLeft className="w-4 h-4" /> Back to dashboard
      </Link>
      <h1 className="text-3xl font-bold tracking-tight">{selectedStock} — Detail</h1>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2"><PCAPlot /></div>
        <PredictionCard />
        <div className="lg:col-span-2"><VarianceChart /></div>
        <ClusterChart />
      </div>
    </div>
  );
};

export default StockDetail;
