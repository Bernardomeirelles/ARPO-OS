import { ActivityFeed } from "@/components/dashboard/activity-feed";
import { FunnelChart, PerformanceChart, RevenueChart, SourceChart } from "@/components/dashboard/charts";
import { KpiCard } from "@/components/dashboard/kpi-card";
import type { Activity, KpiCardData } from "@/types/crm";

type OverviewProps = {
  kpis: KpiCardData[];
  activities: Activity[];
  revenueData: Array<{ month: string; receita: number }>;
  sourceData: Array<{ name: string; value: number }>;
  funnelData: Array<{ name: string; value: number }>;
  performanceData: Array<{ name: string; value: number }>;
};

export function Overview({ kpis, activities, revenueData, sourceData, funnelData, performanceData }: OverviewProps) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
        {kpis.map((card) => (
          <KpiCard key={card.title} card={card} />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <div className="grid gap-6 lg:grid-cols-2">
            <RevenueChart data={revenueData} />
            <SourceChart data={sourceData} />
          </div>
          <div className="grid gap-6 lg:grid-cols-2">
            <FunnelChart data={funnelData} />
            <PerformanceChart data={performanceData} />
          </div>
        </div>

        <div className="xl:sticky xl:top-24 xl:h-[calc(100vh-7rem)]">
          <ActivityFeed activities={activities} />
        </div>
      </div>
    </div>
  );
}
