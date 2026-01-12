'use client';

interface Dataset {
  id: string;
  name: string;
  icon: string;
}

interface Props {
  purchases: string[];
  datasets: Dataset[];
}

export default function PurchaseHistory({ purchases, datasets }: Props) {
  return (
    <div className="glass-card">
      <h3 className="text-2xl font-bold gradient-text mb-6">Your Purchases</h3>
      <div className="space-y-4">
        {purchases.map((purchaseId) => {
          const dataset = datasets.find(d => d.id === purchaseId);
          if (!dataset) return null;

          return (
            <div key={purchaseId} className="flex items-center justify-between p-4 bg-white/5 rounded-xl hover:bg-white/8 transition-all">
              <div className="flex items-center gap-4">
                <div className="text-3xl">{dataset.icon}</div>
                <div>
                  <div className="font-semibold">{dataset.name}</div>
                  <div className="text-sm text-gray-400">Purchased just now</div>
                </div>
              </div>
              <button className="px-4 py-2 btn-secondary text-sm">
                Download
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
