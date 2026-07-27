'use client';

import React from 'react';
import {Bar, BarChart, CartesianGrid, XAxis, Pie, PieChart, Cell} from 'recharts';
import {ChartConfig, ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';
import type {DashboardStats} from '@/repositories/types';
import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {format, parseISO} from 'date-fns';

type OverviewChartsProps = {
  bookingsByDay: DashboardStats['bookingsByDay'];
  workoutTypePopularity: DashboardStats['workoutTypePopularity'];
};

const COLORS = [
  'var(--primary)',
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)'
];

export function OverviewCharts({bookingsByDay, workoutTypePopularity}: OverviewChartsProps) {
  const {dict} = useClientDictionary();

  if (!dict) {
    return null; // Or a skeleton
  }

  const chartLabel = dict.admin.overviewPage.bookingsChartLabel;

  const barChartConfig = {
    count: {
      label: chartLabel,
      color: 'var(--primary)'
    }
  } satisfies ChartConfig;

  const pieChartConfig = {
    value: {
      label: chartLabel
    }
  } satisfies ChartConfig;

  // Format dates for display
  const formattedData = bookingsByDay.map(d => {
    let formattedDate = d.date;
    try {
      const parsed = typeof d.date === 'string' ? parseISO(d.date) : new Date(d.date);
      formattedDate = format(parsed, 'MMM dd');
    } catch {
      // keep original if parse fails
    }
    return {
      ...d,
      formattedDate
    };
  });

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Bar Chart - Bookings Volume */}
      <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-sm">
        <h3 className="text-h3 text-foreground mb-4">{dict.admin.overviewPage.bookingsVolume}</h3>
        <div className="h-[300px] w-full">
          <ChartContainer config={barChartConfig} className="h-full w-full">
            <BarChart data={formattedData}>
              <CartesianGrid vertical={false} />
              <XAxis dataKey="formattedDate" tickLine={false} tickMargin={10} axisLine={false} />
              <ChartTooltip content={<ChartTooltipContent />} />
              <Bar dataKey="count" fill="var(--color-count)" radius={4} maxBarSize={50} />
            </BarChart>
          </ChartContainer>
        </div>
      </div>

      {/* Pie Chart - Workout Popularity */}
      <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-sm">
        <h3 className="text-h3 text-foreground mb-4">{dict.admin.overviewPage.popularWorkouts}</h3>
        <div className="h-[300px] w-full">
          <ChartContainer config={pieChartConfig} className="h-full w-full">
            <PieChart>
              <ChartTooltip content={<ChartTooltipContent />} />
              <Pie
                data={workoutTypePopularity}
                dataKey="value"
                nameKey="name"
                cx="50%"
                cy="50%"
                outerRadius={100}
                label>
                {workoutTypePopularity.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
            </PieChart>
          </ChartContainer>
        </div>
      </div>
    </div>
  );
}
