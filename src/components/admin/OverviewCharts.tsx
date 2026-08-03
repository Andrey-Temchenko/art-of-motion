'use client';

import React from 'react';

import {parseISO} from 'date-fns';
import {Bar, BarChart, CartesianGrid, XAxis, YAxis, Pie, PieChart, Cell, Label} from 'recharts';

import {DATE_FORMATS} from '@/constants/dateFormats';

import {useClientDictionary} from '@/lib/i18n/useClientDictionary';
import {formatDate} from '@/lib/utils/date';

import type {DashboardStats} from '@/services/types';

import type {ChartConfig} from '@/components/ui/chart';
import {ChartContainer, ChartTooltip, ChartTooltipContent} from '@/components/ui/chart';

interface OverviewChartsProps {
  bookingsByDay: DashboardStats['bookingsByDay'];
  workoutTypePopularity: DashboardStats['workoutTypePopularity'];
}

const COLORS = ['var(--chart-1)', 'var(--chart-2)', 'var(--chart-3)', 'var(--chart-4)', 'var(--chart-5)'];

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
      formattedDate = formatDate(parsed, DATE_FORMATS.MONTH_DAY);
    } catch {
      // keep original if parse fails
    }
    return {
      ...d,
      formattedDate
    };
  });

  const totalWorkouts = workoutTypePopularity.reduce((sum, entry) => sum + entry.value, 0);
  const hasBookingData = bookingsByDay.length > 0;
  const hasWorkoutData = workoutTypePopularity.length > 0;

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Bar Chart - Bookings Volume */}
      <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <h3 className="text-h3 text-foreground mb-6">{dict.admin.overviewPage.bookingsVolume}</h3>
        <div className="h-[300px] w-full">
          {!hasBookingData ? (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
              No booking data yet
            </div>
          ) : bookingsByDay.length === 1 ? (
            <div className="flex h-full w-full flex-col items-center justify-center gap-3">
              <span className="text-foreground text-7xl font-bold tracking-tighter tabular-nums">
                {bookingsByDay[0].count}
              </span>
              <div className="flex flex-col items-center gap-1 text-center">
                <span className="text-foreground text-base font-medium">
                  {dict.admin.overviewPage.bookingsChartLabel}
                </span>
                <span className="text-muted-foreground text-sm">{formattedData[0].formattedDate}</span>
              </div>
            </div>
          ) : (
            <ChartContainer config={barChartConfig} className="h-full w-full">
              <BarChart data={formattedData} margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                <CartesianGrid vertical={false} strokeDasharray="3 3" strokeOpacity={0.4} />
                <XAxis
                  dataKey="formattedDate"
                  tickLine={false}
                  tickMargin={12}
                  axisLine={false}
                  tick={{fill: 'var(--muted-foreground)', fontSize: 12}}
                />
                <YAxis hide />
                <ChartTooltip
                  cursor={{fill: 'var(--muted)', opacity: 0.2}}
                  content={<ChartTooltipContent hideIndicator className="min-w-[120px] shadow-xl" />}
                />
                <Bar
                  dataKey="count"
                  fill="var(--color-count)"
                  radius={[4, 4, 0, 0]}
                  barSize={40}
                  animationDuration={1000}
                />
              </BarChart>
            </ChartContainer>
          )}
        </div>
      </div>

      {/* Donut Chart - Workout Popularity */}
      <div className="border-border bg-card flex flex-col rounded-2xl border p-6 shadow-sm transition-shadow duration-300 hover:shadow-md">
        <h3 className="text-h3 text-foreground mb-6">{dict.admin.overviewPage.popularWorkouts}</h3>
        <div className="h-[300px] w-full">
          {!hasWorkoutData ? (
            <div className="text-muted-foreground flex h-full w-full items-center justify-center text-sm">
              No booking data for the selected period
            </div>
          ) : (
            <div className="flex h-full w-full flex-col items-center justify-center gap-8 sm:flex-row">
              <div className="h-[220px] w-[220px] shrink-0">
                <ChartContainer config={pieChartConfig} className="h-full w-full">
                  <PieChart margin={{top: 0, right: 0, left: 0, bottom: 0}}>
                    <ChartTooltip
                      content={({active, payload}) => {
                        if (active && payload && payload.length) {
                          const data = payload[0].payload;
                          const translatedName = dict.workouts[data.name as keyof typeof dict.workouts] || data.name;
                          const percentage = totalWorkouts > 0 ? Math.round((data.value / totalWorkouts) * 100) : 0;
                          return (
                            <div className="bg-background border-border/50 flex min-w-[140px] flex-col gap-2 rounded-lg border px-4 py-3 text-sm shadow-xl">
                              <span className="text-foreground font-medium">{translatedName}</span>
                              <div className="flex items-center justify-between gap-4">
                                <span className="text-muted-foreground">
                                  {data.value} {chartLabel.toLowerCase()}
                                </span>
                                <span className="text-muted-foreground font-mono">{percentage}%</span>
                              </div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                    <Pie
                      data={workoutTypePopularity}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      innerRadius={70}
                      outerRadius={100}
                      stroke="none"
                      animationDuration={1000}>
                      {workoutTypePopularity.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                      <Label
                        content={({viewBox}) => {
                          if (viewBox && 'cx' in viewBox && 'cy' in viewBox) {
                            return (
                              <text x={viewBox.cx} y={viewBox.cy} textAnchor="middle" dominantBaseline="middle">
                                <tspan
                                  x={viewBox.cx}
                                  y={viewBox.cy}
                                  className="fill-foreground text-3xl font-bold tabular-nums">
                                  {totalWorkouts.toLocaleString()}
                                </tspan>
                                <tspan
                                  x={viewBox.cx}
                                  y={(viewBox.cy || 0) + 24}
                                  className="fill-muted-foreground text-sm">
                                  Total
                                </tspan>
                              </text>
                            );
                          }
                        }}
                      />
                    </Pie>
                  </PieChart>
                </ChartContainer>
              </div>

              {/* Custom Legend */}
              <div className="flex w-full flex-1 flex-col justify-center gap-3 sm:w-auto">
                {workoutTypePopularity.map((entry, index) => {
                  const translatedName = dict.workouts[entry.name as keyof typeof dict.workouts] || entry.name;
                  return (
                    <div key={entry.name} className="flex items-center justify-between gap-4 text-sm">
                      <div className="flex items-center gap-2">
                        <div
                          className="h-3 w-3 shrink-0 rounded-full"
                          style={{backgroundColor: COLORS[index % COLORS.length]}}
                        />
                        <span className="text-foreground font-medium">{translatedName}</span>
                      </div>
                      <div className="border-border/60 mx-1 flex-1 border-b border-dotted"></div>
                      <span className="text-muted-foreground font-mono tabular-nums">{entry.value}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
