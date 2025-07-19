import React, { ReactElement } from 'react';
import { ResponsiveContainer } from 'recharts';

export interface ChartiesProps {
  data: any[] | undefined | null;
  fallbackLabel?: string;
  height?: number;
  children: ReactElement;
}

export default function Charties(props: Readonly<ChartiesProps>) {
  const { data, fallbackLabel = 'No data available', height = 300, children } = props;
  const isEmpty = !data || data.length === 0 || data.filter(data => data.value !== 0).length === 0;

  return (
    <div className="w-full flex items-center justify-center" style={{ height }}>
      {isEmpty ? (
        <p className="text-muted-foreground text-lg">{fallbackLabel}</p>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          {children}
        </ResponsiveContainer>
      )}
    </div>
  );
}
