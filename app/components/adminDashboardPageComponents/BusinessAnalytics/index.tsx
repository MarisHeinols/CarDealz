import React, { useEffect, useState } from "react";
import { Box, Typography, Grid, Paper, CircularProgress } from "@mui/material";
import { useTranslation } from "react-i18next";
import ReactECharts from "echarts-for-react";
import { useAuth } from "~/hooks/userStore/useAuth";
import { getListingsByOwner } from "~/services/listingsService";
import { getLeadsByDealer } from "~/services/leadsService";
import type { CarListingSummary, LeadDoc } from "~/types/types";
import { useTheme } from "@mui/material/styles";

export default function BusinessAnalytics() {
  const { t } = useTranslation();
  const { user } = useAuth();
  const theme = useTheme();
  const [loading, setLoading] = useState(true);
  const [listings, setListings] = useState<CarListingSummary[]>([]);
  const [leads, setLeads] = useState<LeadDoc[]>([]);

  useEffect(() => {
    if (!user) return;
    Promise.all([
      getListingsByOwner(user.uid, { includeSold: true }),
      getLeadsByDealer(user.uid)
    ])
      .then(([dataLists, dataLeads]) => {
        setListings(dataLists);
        setLeads(dataLeads);
      })
      .finally(() => {
        setLoading(false);
      });
  }, [user]);

  if (loading) {
    return (
      <Box p={4} display="flex" justifyContent="center">
        <CircularProgress />
      </Box>
    );
  }

  // Active listings vs Sold listings
  const activeListings = listings.filter((l) => !l.isSold);
  const soldListings = listings.filter((l) => l.isSold);

  // Calc top metrics
  const totalListings = activeListings.length;
  const totalViews = listings.reduce((sum, l) => sum + (l.viewCount || 0), 0);

  // Pie chart data: Active listings Brand distribution
  const makeCounts: Record<string, number> = {};
  activeListings.forEach((l) => {
    makeCounts[l.make] = (makeCounts[l.make] || 0) + 1;
  });
  const pieData = Object.entries(makeCounts)
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);

  // Bar chart data: Active Condition distribution
  const conditionCounts: Record<string, number> = {};
  activeListings.forEach((l) => {
    const cond = l.conditionTier 
      ? t(`carValues.condition_${l.conditionTier}`, { defaultValue: l.conditionTier })
      : t("common.no_data");
    conditionCounts[cond] = (conditionCounts[cond] || 0) + 1;
  });

  // Line chart data: Active Listings Growth Over Time
  const timeData: Record<string, number> = {};
  activeListings.forEach((l) => {
    if (l.createdAt) {
      const date = new Date(l.createdAt);
      if (!isNaN(date.getTime())) {
        const monthYear = `${date.getFullYear()}-${String(
          date.getMonth() + 1,
        ).padStart(2, "0")}`;
        timeData[monthYear] = (timeData[monthYear] || 0) + 1;
      }
    }
  });
  const sortedMonths = Object.keys(timeData).sort();
  const lineValues = sortedMonths.map((m) => timeData[m]);

  // Scatter data: Price vs Mileage
  const scatterData = activeListings.map((l) => [l.mileage, l.price]);

  // Heatmap: Months Cars Sold
  const monthsStr = [
    t("months.jan"),
    t("months.feb"),
    t("months.mar"),
    t("months.apr"),
    t("months.may"),
    t("months.jun"),
    t("months.jul"),
    t("months.aug"),
    t("months.sep"),
    t("months.oct"),
    t("months.nov"),
    t("months.dec"),
  ];
  const yearsSet = new Set<string>();
  soldListings.forEach((l) => {
    if (l.soldAt) {
      const d = new Date(l.soldAt);
      if (!isNaN(d.getTime())) {
        yearsSet.add(d.getFullYear().toString());
      }
    }
  });
  const yearsStr = Array.from(yearsSet).sort();
  if (yearsStr.length === 0) yearsStr.push(new Date().getFullYear().toString());

  const heatmapData: [number, number, number][] = [];
  let maxSalesInMonth = 0;
  yearsStr.forEach((y, yIdx) => {
    monthsStr.forEach((m, mIdx) => {
      const count = soldListings.filter((l) => {
        if (!l.soldAt) return false;
        const d = new Date(l.soldAt);
        return d.getFullYear().toString() === y && d.getMonth() === mIdx;
      }).length;
      if (count > maxSalesInMonth) maxSalesInMonth = count;
      heatmapData.push([mIdx, yIdx, count]);
    });
  });

  // What Brands have most cells (sells):
  const soldBrands: Record<string, number> = {};
  soldListings.forEach((l) => {
    soldBrands[l.make] = (soldBrands[l.make] || 0) + 1;
  });
  const topSoldBrands = Object.entries(soldBrands)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10); // Top 10

  // What Models have most clicks (views):
  const viewsByModel: Record<string, number> = {};
  listings.forEach((l) => {
    const key = `${l.make} ${l.model}`;
    viewsByModel[key] = (viewsByModel[key] || 0) + (l.viewCount || 0);
  });
  const topViewedModels = Object.entries(viewsByModel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // --- LEADS INTELLIGENCE METRICS ---
  const listingsMap = new Map<string, CarListingSummary>();
  listings.forEach((l) => listingsMap.set(l.id, l));

  // 1. Leads Growth Over Time
  const leadsTime: Record<string, number> = {};
  leads.forEach((ld) => {
    if (!ld.createdAt) return;
    const d = new Date(ld.createdAt);
    if (isNaN(d.getTime())) return;
    const monthYear = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(
      2,
      "0",
    )}`;
    leadsTime[monthYear] = (leadsTime[monthYear] || 0) + 1;
  });
  const sortedLeadMonths = Object.keys(leadsTime).sort();
  const leadsLineValues = sortedLeadMonths.map((m) => leadsTime[m]);

  // 2. Leads by Make/Model
  const leadsByModel: Record<string, number> = {};
  leads.forEach((ld) => {
    const listing = listingsMap.get(ld.listingId);
    if (listing) {
      const key = `${listing.make} ${listing.model}`;
      leadsByModel[key] = (leadsByModel[key] || 0) + 1;
    }
  });
  const topLeadModels = Object.entries(leadsByModel)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10);

  // 3. Leads vs Price Correlation
  const leadsAggByListing: Record<
    string,
    { price: number; leads: number; name: string }
  > = {};

  leads.forEach((ld) => {
    const listing = listingsMap.get(ld.listingId);
    if (listing && typeof listing.price === "number") {
      if (!leadsAggByListing[ld.listingId]) {
        leadsAggByListing[ld.listingId] = {
          price: listing.price,
          leads: 0,
          name: `${listing.make} ${listing.model}`,
        };
      }
      leadsAggByListing[ld.listingId].leads += 1;
    }
  });
  const priceVsLeadsScatter = Object.values(leadsAggByListing).map((v) => [
    v.price,
    v.leads,
    v.name,
  ]);

  // Styling helpers
  const textColor = theme.palette.text.primary;
  const axisLineColor = theme.palette.divider;

  const renderNoData = (height: number = 320) => (
    <Box
      sx={{
        height,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        backgroundColor: theme.palette.mode === "dark" ? "rgba(255,255,255,0.02)" : "rgba(0,0,0,0.02)",
        borderRadius: 2,
        mt: 2,
      }}
    >
      <Typography variant="body1" color="text.secondary" fontWeight={500}>
        {t("common.no_data")}
      </Typography>
    </Box>
  );

  return (
    <Box>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {t("dashboard.analytics.total_active")}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="primary" mt={1}>
              {totalListings}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {t("dashboard.analytics.total_views")}
            </Typography>
            <Typography variant="h3" fontWeight={800} color="primary" mt={1}>
              {totalViews}
            </Typography>
          </Paper>
        </Grid>
        <Grid size={{ xs: 12, sm: 4 }}>
          <Paper
            sx={{
              p: 3,
              textAlign: "center",
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="body1" color="text.secondary" fontWeight={500}>
              {t("dashboard.analytics.total_leads")}
            </Typography>
            <Typography
              variant="h3"
              fontWeight={800}
              color="warning.main"
              mt={1}
            >
              {leads.length}
            </Typography>
          </Paper>
        </Grid>
      </Grid>

      {/* Overview Charts (from before) */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("dashboard.analytics.overview")}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.brand_dist")}
            </Typography>
            {pieData.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "item" },
                legend: { top: "bottom", textStyle: { color: textColor } },
                series: [
                  {
                    name: t("table.make"),
                    type: "pie",
                    radius: ["40%", "70%"],
                    avoidLabelOverlap: false,
                    itemStyle: {
                      borderRadius: 10,
                      borderColor: theme.palette.background.paper,
                      borderWidth: 2,
                    },
                    label: { show: false, position: "center" },
                    emphasis: {
                      label: { show: true, fontSize: 20, fontWeight: "bold" },
                    },
                    labelLine: { show: false },
                    data:
                      pieData.length > 0
                        ? pieData
                        : [{ name: t("common.no_data"), value: 0 }],
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.cond_dist")}
            </Typography>
            {Object.keys(conditionCounts).length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "category",
                  data: Object.keys(conditionCounts),
                  axisLabel: { color: textColor },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    data: Object.values(conditionCounts),
                    type: "bar",
                    barWidth: "40%",
                    itemStyle: {
                      color: theme.palette.primary.main,
                      borderRadius: [4, 4, 0, 0],
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.growth")}
            </Typography>
            {sortedMonths.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis" },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "category",
                  boundaryGap: false,
                  data: sortedMonths,
                  axisLabel: { color: textColor },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    name: t("dashboard.tabs.leads", { defaultValue: "Leads" }),
                    type: "line",
                    data: lineValues,
                    smooth: true,
                    lineStyle: {
                      width: 3,
                      color: theme.palette.secondary.main,
                    },
                    itemStyle: { color: theme.palette.secondary.main },
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: theme.palette.secondary.light },
                          { offset: 1, color: "rgba(255,255,255,0)" },
                        ],
                      },
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.price_mileage")}
            </Typography>
            {scatterData.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "item",
                  formatter: (params: any) =>
                    `${t("table.mileage")}: ${params.data[0]} km<br/>${t("table.price")}: €${params.data[1]}`,
                },
                grid: {
                  left: "3%",
                  right: "8%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "value",
                  name: `${t("table.mileage")} (km)`,
                  nameLocation: "middle",
                  nameGap: 30,
                  axisLabel: { color: textColor },
                  splitLine: { show: false },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  name: `${t("table.price")} (€)`,
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    type: "scatter",
                    symbolSize: 10,
                    data: scatterData,
                    itemStyle: {
                      color: theme.palette.info.main,
                      opacity: 0.7,
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* New Requested Charts for Sales & Viewers */}
      <Typography variant="h5" sx={{ mb: 2, fontWeight: 700 }}>
        {t("dashboard.analytics.sales_insights")}
      </Typography>
      <Grid container spacing={3} sx={{ mb: 4 }}>
        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 4,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.heatmap")}
            </Typography>
            { heatmapData.length === 0 ? renderNoData(350) : (
            <ReactECharts
              option={{
                tooltip: { position: "top" },
                grid: { height: "60%", top: "10%" },
                xAxis: {
                  type: "category",
                  data: monthsStr,
                  splitArea: { show: true },
                  axisLabel: { color: textColor },
                },
                yAxis: {
                  type: "category",
                  data: yearsStr,
                  splitArea: { show: true },
                  axisLabel: { color: textColor },
                },
                visualMap: {
                  min: 0,
                  max: Math.max(maxSalesInMonth, 5),
                  calculable: true,
                  orient: "horizontal",
                  left: "center",
                  bottom: "0%",
                  inRange: {
                    color: ["#f2f8ff", theme.palette.success.main],
                  },
                },
                series: [
                  {
                    name: t("dashboard.analytics.vehicles_sold"),
                    type: "heatmap",
                    data: heatmapData,
                    label: { show: true, color: "#fff", fontWeight: "bold" },
                    emphasis: {
                      itemStyle: {
                        shadowBlur: 10,
                        shadowColor: "rgba(0, 0, 0, 0.5)",
                      },
                    },
                  },
                ],
              }}
              style={{ height: "350px", width: "100%" }}
            />
            )}
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.top_sold_brands")}
            </Typography>
            {topSoldBrands.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "category",
                  data: topSoldBrands.map((b) => b[0]),
                  axisLabel: { color: textColor, rotate: 45 },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    name: t("dashboard.analytics.vehicles_sold"),
                    data: topSoldBrands.map((b) => b[1]),
                    type: "bar",
                    barWidth: "50%",
                    itemStyle: {
                      color: theme.palette.success.light,
                      borderRadius: [4, 4, 0, 0],
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.top_viewed_models")}
            </Typography>
            {topViewedModels.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
                grid: {
                  left: "3%",
                  right: "8%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                yAxis: {
                  type: "category",
                  data: topViewedModels.map((m) => m[0]).reverse(), // Reverse for top-down display
                  axisLabel: {
                    color: textColor,
                    width: 120,
                    overflow: "truncate",
                  },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                series: [
                  {
                    name: t("businesses.table.views"),
                    data: topViewedModels.map((m) => m[1]).reverse(),
                    type: "bar",
                    itemStyle: {
                      color: theme.palette.secondary.main,
                      borderRadius: [0, 4, 4, 0],
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>
      </Grid>

      {/* INTELLIGENCE ROW: Leads & Inquiries */}
      <Grid container spacing={3} sx={{ mt: 1, mb: 1 }}>
        <Grid size={{ xs: 12 }}>
          <Typography variant="h5" sx={{ fontWeight: 700 }}>
            {t("dashboard.analytics.leads_intelligence", { defaultValue: "Leads Intelligence" })}
          </Typography>
        </Grid>
        
        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.leads_time", { defaultValue: "Leads Over Time" })}
            </Typography>
            {sortedLeadMonths.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis" },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "category",
                  boundaryGap: false,
                  data: sortedLeadMonths,
                  axisLabel: { color: textColor },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    name: t("dashboard.tabs.leads", { defaultValue: "Leads" }),
                    type: "line",
                    data: leadsLineValues,
                    smooth: true,
                    lineStyle: {
                      width: 3,
                      color: theme.palette.warning.main,
                    },
                    itemStyle: { color: theme.palette.warning.main },
                    areaStyle: {
                      color: {
                        type: "linear",
                        x: 0,
                        y: 0,
                        x2: 0,
                        y2: 1,
                        colorStops: [
                          { offset: 0, color: theme.palette.warning.light },
                          { offset: 1, color: "rgba(255,255,255,0)" },
                        ],
                      },
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12, md: 6 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.leads_by_model", { defaultValue: "Most Inquired Models" })}
            </Typography>
            {topLeadModels.length === 0 ? renderNoData() : (
            <ReactECharts
              option={{
                tooltip: { trigger: "axis", axisPointer: { type: "shadow" } },
                grid: {
                  left: "3%",
                  right: "4%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "value",
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                yAxis: {
                  type: "category",
                  data: topLeadModels.map((m) => m[0]).reverse(),
                  axisLabel: {
                    color: textColor,
                    width: 120,
                    overflow: "truncate",
                  },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                  series: [
                    {
                      name: t("dashboard.analytics.leads"),
                      data: topLeadModels.map((m) => m[1]).reverse(),
                    type: "bar",
                    itemStyle: {
                      color: theme.palette.warning.main,
                      borderRadius: [0, 4, 4, 0],
                    },
                  },
                ],
              }}
              style={{ height: "320px" }}
            />
            )}
          </Paper>
        </Grid>

        <Grid size={{ xs: 12 }}>
          <Paper
            sx={{
              p: 3,
              borderRadius: 3,
              boxShadow: "0 4px 20px rgba(0,0,0,0.05)",
            }}
          >
            <Typography variant="h6" fontWeight={700} gutterBottom>
              {t("dashboard.analytics.price_leads_scatter", { defaultValue: "Vehicle Price vs. Lead Volume" })}
            </Typography>
            {priceVsLeadsScatter.length === 0 ? renderNoData(350) : (
            <ReactECharts
              option={{
                tooltip: {
                  trigger: "item",
                  formatter: (params: any) =>
                    `<strong>${params.data[2]}</strong><br/>${t("table.price")}: €${params.data[0]}<br/>${t("dashboard.analytics.leads")}: ${params.data[1]}`,
                },
                grid: {
                  left: "3%",
                  right: "8%",
                  bottom: "3%",
                  containLabel: true,
                },
                xAxis: {
                  type: "value",
                  name: `${t("table.price")} (€)`,
                  nameLocation: "middle",
                  nameGap: 30,
                  axisLabel: { color: textColor },
                  splitLine: { show: false },
                  axisLine: { lineStyle: { color: axisLineColor } },
                },
                yAxis: {
                  type: "value",
                  name: t("dashboard.analytics.total_leads"),
                  axisLabel: { color: textColor },
                  splitLine: {
                    lineStyle: { color: axisLineColor, type: "dashed" },
                  },
                },
                series: [
                  {
                    type: "scatter",
                    symbolSize: (data: any) => Math.min(Math.max(data[1] * 8, 12), 40),
                    data: priceVsLeadsScatter,
                    itemStyle: {
                      color: theme.palette.warning.dark,
                      opacity: 0.7,
                    },
                  },
                ],
              }}
              style={{ height: "350px", width: "100%" }}
            />
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
}
